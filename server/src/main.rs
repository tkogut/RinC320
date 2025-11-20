use futures::{SinkExt, StreamExt};
use serde::Serialize;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{broadcast, Mutex};
use tokio_tungstenite::tungstenite::Message;

#[derive(Serialize, Debug, Clone)]
struct ScalePayload {
    weight: f64,
    unit: String,
    status: String,
    raw: String,
}

fn parse_weight_line(line: &str) -> Option<ScalePayload> {
    // Expect something like: "81050026:    426 kg G"
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
            // fallback: try parse first token
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
    }
    None
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::init();

    // Address to NP301 converter (modify if needed)
    let scale_addr = "192.168.1.254:4001";
    log::info!("Łączenie do NP301 pod adresem: {}", scale_addr);

    // Spróbuj połączyć z urządzeniem (będzie w tle)
    let tcp_stream = match TcpStream::connect(scale_addr).await {
        Ok(s) => {
            log::info!("Połączono z NP301.");
            Some(Arc::new(Mutex::new(s)))
        }
        Err(e) => {
            log::error!("Nie udało się połączyć z NP301: {}", e);
            None
        }
    };

    // Channel do broadcastu odczytów do wszystkich WebSocket klientów
    let (tx, _rx) = broadcast::channel::<String>(32);

    // Jeśli istnieje połączenie do skali, uruchom czytanie linii i broadcast
    if let Some(tcp_arc) = tcp_stream.clone() {
        let tx_clone = tx.clone();
        tokio::spawn(async move {
            let guard = tcp_arc.lock().await;
            let reader = guard.try_clone();
            drop(guard);
            // try_clone might fail for some TcpStream impls; instead re-open connection if needed
            match TcpStream::connect(scale_addr).await {
                Ok(stream2) => {
                    let reader = BufReader::new(stream2);
                    let mut lines = reader.lines();
                    while let Ok(Some(line)) = lines.next_line().await {
                        log::debug!("Otrzymano z NP301: {:?}", line);
                        if let Some(payload) = parse_weight_line(&line) {
                            if let Ok(json) = serde_json::to_string(&payload) {
                                let _ = tx_clone.send(json);
                            }
                        } else {
                            // Forward raw line as simple JSON with raw only
                            if let Ok(json) = serde_json::to_string(&serde_json::json!({ "raw": line })) {
                                let _ = tx_clone.send(json);
                            }
                        }
                    }
                    log::warn!("Czytanie z NP301 zakończone.");
                }
                Err(e) => {
                    log::error!("Błąd przy tworzeniu readera do NP301: {}", e);
                }
            }
        });
    } else {
        log::warn!("Brak aktywnego połączenia do NP301 przy starcie; backend może próbować łączyć ponownie.");
    }

    // WebSocket server (dla frontend)
    let ws_addr = "0.0.0.0:3001";
    let try_socket = TcpListener::bind(ws_addr).await?;
    log::info!("WebSocket server nasłuchuje na: {}", ws_addr);

    while let Ok((stream, addr)) = try_socket.accept().await {
        let peer = addr.clone();
        let tx = tx.clone();
        let tcp_for_write = tcp_stream.clone();
        tokio::spawn(handle_connection(stream, peer, tx, tcp_for_write));
    }

    Ok(())
}

async fn handle_connection(
    raw_stream: TcpStream,
    addr: SocketAddr,
    tx: broadcast::Sender<String>,
    tcp_for_write: Option<Arc<Mutex<TcpStream>>>,
) {
    log::info!("Nowe połączenie WebSocket: {}", addr);

    let ws_stream = match tokio_tungstenite::accept_async(raw_stream).await {
        Ok(ws) => ws,
        Err(e) => {
            log::error!("WebSocket accept error: {}", e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    // subscribe do channelu
    let mut rx = tx.subscribe();

    // Task: forward broadcast -> ws client
    let mut forward_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if ws_sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    // Task: read messages od klienta i wykonaj komendy (wysyłaj do NP301)
    let write_task_tcp = tcp_for_write.clone();
    let mut receiver_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_receiver.next().await {
            match msg {
                Message::Text(txt) => {
                    // oczekujemy prostego JSONu { "cmd": "read_gross" } lub plain text
                    if let Ok(v) = serde_json::from_str::<serde_json::Value>(&txt) {
                        if let Some(cmd) = v.get("cmd").and_then(|c| c.as_str()) {
                            log::info!("Otrzymano komendę od WS: {}", cmd);
                            if let Some(tcp_arc) = write_task_tcp.clone() {
                                // Zmapuj komendy na sekwencje bajtów dla C320
                                let cmd_str = match cmd {
                                    "read_gross" => "20050026:",
                                    "read_net" => "20110027:",
                                    "tare" => "20120008:8003",
                                    "zero" => "21120008:0B",
                                    other => {
                                        log::warn!("Nieznana komenda: {}", other);
                                        ""
                                    }
                                };
                                if !cmd_str.is_empty() {
                                    let mut guard = tcp_arc.lock().await;
                                    if let Err(e) = guard.write_all(format!("{}\n", cmd_str).as_bytes()).await {
                                        log::error!("Błąd wysyłania do NP301: {}", e);
                                    } else {
                                        log::info!("Wysłano do NP301: {}", cmd_str);
                                    }
                                }
                            } else {
                                log::warn!("Brak połączenia TCP do NP301 - nie można wysłać komendy");
                            }
                        }
                    } else {
                        log::debug!("Otrzymano tekst z WS: {}", txt);
                    }
                }
                Message::Binary(_) => {}
                Message::Ping(_) | Message::Pong(_) => {}
                Message::Close(_) => break,
            }
        }
    });

    // Czekaj aż jedno z zadań się zakończy (np. klient się rozłączy)
    tokio::select! {
        _ = (&mut forward_task) => {
            log::info!("Forward task dla {} zakończony", addr);
        }
        _ = (&mut receiver_task) => {
            log::info!("Receiver task dla {} zakończony", addr);
        }
    }

    // sprzątnij
    let _ = forward_task.abort();
    let _ = receiver_task.abort();
    log::info!("Zamykam połączenie WebSocket: {}", addr);
}