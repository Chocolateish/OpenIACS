use std::net::TcpListener;
use std::sync::{mpsc, Arc, RwLock};
use std::thread::{sleep, spawn};
use tungstenite::accept;

struct ValueMeta {
    owner: i32,
}

/// A WebSocket echo server
fn main() {
    println!("Hello, world! {:?}", 55)
    // let server = TcpListener::bind("127.0.0.1:9001").unwrap();

    // for stream in server.incoming() {
    //     spawn(move || {
    //         let mut websocket = accept(stream.unwrap()).unwrap();
    //         loop {
    //             let msg = websocket.read().unwrap();

    //             // We do not want to send back ping/pong messages.
    //             if msg.is_binary() || msg.is_text() {
    //                 print!("Received: {}", msg);
    //                 websocket.send(msg).unwrap();
    //             }
    //         }
    //     });
    // }
}
