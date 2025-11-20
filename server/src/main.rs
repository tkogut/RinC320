use anyhow::Result;
use futures::{SinkExt, StreamExt};
use serde::Serialize;
use std::env;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{broadcast, Mutex};
use tokio_tungstenite::tungstenite::Message;

use reqwest::Client;

#[derive(Serialize, Debug, Clone)]
struct ScalePayload {
    weight: f64,
    unit: String,
    status: String,
    raw: String,
}

fn parse_weight_line(line: &str) -> Option<ScalePayload> {
    // Expect something like: "81050026:    426 kg G" or fallback to any leading number
    if let Some(pos) = line.find(':') {
        let rest = line[pos + 1..].trim();
        let parts: Vec<&str> = rest.split_whitespace().collect();
        if parts.len() >= 3 {
            let num_str = parts[0].replace(',', ".");
            if let Ok(w) = num_str.parse::<f64>() {
                let unit = parts[1].to_string();
                let status = parts[2].to_string();
                return Some(ScalePayload {
                    weight: w,
                    unit,
                    status,
                    raw: rest.to_string(),
                });
            }
        } else if parts.len() >= 1 {
            let num_str = parts[0].replace(',', ".");
            if let Ok(w) = num_str.parse::<f64>() {
                return Some(ScalePayload {
                    weight: w,
                    unit: "kg".to_string(),
                    status: "".to_string(),
                    raw: rest.to_string(),
                });
            }
        }
    } else {
        // Try to parse first token
        let parts: Vec<&str> = line.trim().split_whitespace().collect();
        if !parts.is_empty() {
            let num = parts[0].replace(',', ".");
            if let Ok(w) = num.parse::<f64>() {
                return Some(ScalePayload {
                    weight: w,
                    unit: "kg".to_string(),
                    status: "".to_string(),
                    raw: line.to_string(),
                });
            }
        }
    }
    None
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();

    // Address to NP301 converter (modify if needed)
    let scale_addr = env::var("NP301_ADDR").unwrap_or_else(|_| "192.168.1.254:4001".to_string());
    log::info!("NP301 target address: {}", scale_addr);

    // Bridge URL to send commands when NP301 is unavailable
    let bridge_url = env::var("RIN_CMD_BRIDGE_URL").unwrap_or_else(|_| "http://localhost:8080/rincmd".to_string());
    log::info!("Bridge URL: {}", bridge_url);

    // Shared optional TcpStream for writing to NP301
    let shared_tcp: Arc<Mutex<Option<TcpStream>>> = Arc::new(Mutex::new(None));

    // Channel to broadcast JSON strings to websocket clients
    let (tx, _rx) = broadcast::channel::<String>(64);

    // reqwest client for bridge calls
    let http_client = Arc::new(Client::new());

    // Spawn background task that keeps trying to connect to NP301 and reads lines
    {
        let tx = tx.clone();
        let shared_tcp = shared_tcp.clone();
        let scale_addr = scale_addr.to_string();
        tokio::spawn(async move {
            loop {
                log::info!("Próba połączenia z NP301: {}", scale_addr);
                match TcpStream::connect(&scale_addr).await {
                    Ok(stream) => {
                        log::info!("Połączono z NP301");
                        {
                            let mut guard = shared_tcp.lock().await;
                            match stream.try_clone() {
                                Ok(clone) => *guard = Some(clone),
                                Err(e) => {
                                    log::error!("Nieudane clone TcpStream: {}", e);
                                    *guard = None;
                                }
                            }
                        }
                        // Read loop
                        let guard_for_read = shared_tcp.clone();
                        if let Some(ref conn) = *guard_for_read.lock().await {
                            let reader = BufReader::new(conn.try_clone().expect("clone for reader failed"));
                            let mut lines = reader.lines();
                            while let Ok(Some(line)) = lines.next_line().await {
                                log::debug!("Otrzymano z NP301: {}", line);
                                if let Some(payload) = parse_weight_line(&line) {
                                    if let Ok(json) = serde_json::to_string(&payload) {
                                        let _ = tx.send(json);
                                    }
                                } else {
                                    if let Ok(json) = serde_json::to_string(&serde_json::json!({ "raw": line })) {
                                        let _ = tx.send(json);
                                    }
                                }
                            }
                            log::warn!("Czytanie z NP301 zakończone (pętla).");
                        }
                        // Clean up
                        {
                            let mut guard = shared_tcp.lock().await;
                            *guard = None;
                        }
                        // wait a bit before reconnect attempt
                        tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                    }
                    Err(e) => {
                        log::error!("Błąd łączenia do NP301: {}", e);
                        // backoff a bit
                        tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                    }
                }
            }
        });
    }

    // WebSocket server
    let ws_addr = "0.0.0.0:3001";
    let listener = TcpListener::bind(ws_addr).await?;
    log::info!("WebSocket server listening on {}", ws_addr);

    while let Ok((stream, addr)) = listener.accept().await {
        let tx = tx.clone();
        let shared_tcp = shared_tcp.clone();
        let http_client = http_client.clone();
        let bridge_url = bridge_url.clone();
        tokio::spawn(async move {
            if let Err(e) = handle_ws_connection(stream, addr, tx, shared_tcp, http_client, bridge_url).await {
                log::error!("Connection error: {}", e);
            }
        });
    }

    Ok(())
}

async fn handle_ws_connection(
    raw_stream: TcpStream,
    addr: SocketAddr,
    tx: broadcast::Sender<String>,
    shared_tcp: Arc<Mutex<Option<TcpStream>>>,
    http_client: Arc<Client>,
    bridge_url: String,
) -> Result<()> {
    log::info!("Nowe połączenie WS: {}", addr);

    let ws_stream = tokio_tungstenite::accept_async(raw_stream).await?;
    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    // subscribe to broadcast
    let mut rx = tx.subscribe();

    // Forward broadcast -> ws client
    let mut ws_sender_clone = ws_sender.clone();
    let forward_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if ws_sender_clone.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    // Receive messages from ws client
    let shared_for_recv = shared_tcp.clone();
    let tx_for_bridge = tx.clone();
    let bridge_clone = bridge_url.clone();
    let client_clone = http_client.clone();

    let receiver_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_receiver.next().await {
            match msg {
                Message::Text(txt) => {
                    if let Ok(v) = serde_json::from_str::<serde_json::Value>(&txt) {
                        if let Some(cmd) = v.get("cmd").and_then(|c| c.as_str()) {
                            log::info!("Otrzymano komendę od WS: {}", cmd);
                            // Map to NP301 command bytes or sequences — adjust to your device protocol
                            let cmd_bytes = match cmd {
                                "read_gross" => Some(b"READ:GROSS\n".to_vec()),
                                "read_net" => Some(b"READ:NET\n".to_vec()),
                                "tare" => Some(b"TARE\n".to_vec()),
                                "zero" => Some(b"ZERO\n".to_vec()),
                                other => {
                                    log::warn!("Nieznana komenda: {}", other);
                                    None
                                }
                            };
                            if let Some(bytes) = cmd_bytes {
                                let mut guard = shared_for_recv.lock().await;
                                if let Some(ref mut tcp) = *guard {
                                    if let Err(e) = tcp.write_all(&bytes).await {
                                        log::error!("Błąd wysyłania do NP301: {}", e);
                                    } else {
                                        log::info!("Wysłano do NP301: {:?}", String::from_utf8_lossy(&bytes));
                                    }
                                } else {
                                    // NP301 not connected — fallback to bridge
                                    log::warn!("Brak połączenia z NP301 — używam bridge: {}", bridge_clone);
                                    let client = client_clone.clone();
                                    let bridge_url = bridge_clone.clone();
                                    let tx_b = tx_for_bridge.clone();
                                    let cmd_string = String::from_utf8_lossy(&bytes).to_string();
                                    tokio::spawn(async move {
                                        match client
                                            .post(&bridge_url)
                                            .json(&serde_json::json!({ "command": cmd_string }))
                                            .send()
                                            .await
                                        {
                                            Ok(resp) => {
                                                match resp.text().await {
                                                    Ok(text) => {
                                                        log::info!("Bridge response: {}", text);
                                                        // Try to parse a weight line from the returned text and broadcast
                                                        if let Some(payload) = parse_weight_line(&text) {
                                                            if let Ok(json) = serde_json::to_string(&payload) {
                                                                let _ = tx_b.send(json);
                                                            }
                                                        } else {
                                                            // Send raw text as JSON { raw: ... }
                                                            if let Ok(json) = serde_json::to_string(&serde_json::json!({ "raw": text })) {
                                                                let _ = tx_b.send(json);
                                                            }
                                                        }
                                                    }
                                                    Err(e) => {
                                                        log::error!("Bridge responded but reading text failed: {}", e);
                                                    }
                                                }
                                            }
                                            Err(e) => {
                                                log::error!("Błąd wywołania bridge: {}", e);
                                            }
                                        }
                                    });
                                }
                            }
                        } else if v.get("ping").is_some() {
                            // ignore ping
                        } else {
                            log::debug!("Otrzymano inne JSON: {}", txt);
                        }
                    } else {
                        log::debug!("Otrzymano tekst: {}", txt);
                    }
                }
                Message::Binary(_) => {}
                Message::Ping(_) | Message::Pong(_) => {}
                Message::Close(_) => break,
            }
        }
    });

    // Wait until either task ends
    tokio::select! {
        _ = forward_task => {},
        _ = receiver_task => {},
    }

    log::info!("Zamykam połączenie WS: {}", addr);
    Ok(())
}