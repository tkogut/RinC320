use actix_web::{web, App, HttpServer, Responder, HttpResponse};
use serde::{Deserialize, Serialize};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use log::{info, error};
use std::time::Duration;

#[derive(Deserialize)]
struct ScaleCommandRequest {
    command: String,
    ip_address: String,
    port: u16,
}

#[derive(Serialize)]
struct ScaleCommandResponse {
    response: String,
}

async fn health_check() -> impl Responder {
    info!("Received health check request");
    HttpResponse::Ok().body("Healthy")
}

async fn scale_command(req: web::Json<ScaleCommandRequest>) -> impl Responder {
    info!("Received scale command request: command='{}', ip='{}', port={}", req.command, req.ip_address, req.port);

    let addr = format!("{}:{}", req.ip_address, req.port);
    let mut response_message = String::new();

    match TcpStream::connect(addr.clone()).await {
        Ok(mut stream) => {
            info!("Successfully connected to scale at {}", addr);
            // Set a timeout for the TCP stream operations
            let write_result = tokio::time::timeout(
                Duration::from_secs(5),
                stream.write_all(req.command.as_bytes())
            ).await;

            match write_result {
                Ok(Ok(_)) => {
                    info!("Command '{}' sent to scale.", req.command);
                    let mut buffer = vec![0; 1024];
                    let read_result = tokio::time::timeout(
                        Duration::from_secs(5),
                        stream.read(&mut buffer)
                    ).await;

                    match read_result {
                        Ok(Ok(n)) => {
                            if n > 0 {
                                response_message = String::from_utf8_lossy(&buffer[..n]).trim().to_string();
                                info!("Received response from scale: '{}'", response_message);
                                return HttpResponse::Ok().json(ScaleCommandResponse { response: response_message });
                            } else {
                                error!("No data received from scale.");
                                return HttpResponse::InternalServerError().json(ScaleCommandResponse { response: "No data received from scale.".to_string() });
                            }
                        },
                        Ok(Err(e)) => {
                            error!("Failed to read from scale: {}", e);
                            return HttpResponse::InternalServerError().json(ScaleCommandResponse { response: format!("Failed to read from scale: {}", e) });
                        },
                        Err(_) => {
                            error!("Timeout while reading from scale.");
                            return HttpResponse::InternalServerError().json(ScaleCommandResponse { response: "Timeout while reading from scale.".to_string() });
                        }
                    }
                },
                Ok(Err(e)) => {
                    error!("Failed to write command to scale: {}", e);
                    return HttpResponse::InternalServerError().json(ScaleCommandResponse { response: format!("Failed to write command to scale: {}", e) });
                },
                Err(_) => {
                    error!("Timeout while writing command to scale.");
                    return HttpResponse::InternalServerError().json(ScaleCommandResponse { response: "Timeout while writing command to scale.".to_string() });
                }
            }
        },
        Err(e) => {
            error!("Failed to connect to scale at {}: {}", addr, e);
            return HttpResponse::InternalServerError().json(ScaleCommandResponse { response: format!("Failed to connect to scale: {}", e) });
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    info!("Starting Actix-web server on http://0.0.0.0:8080");

    HttpServer::new(|| {
        App::new()
            .service(web::resource("/health").to(health_check))
            .service(web::resource("/scalecmd").to(scale_command))
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}