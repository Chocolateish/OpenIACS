fn zxcv55() -> Result<u32> {
    let mut rng = rand::thread_rng();
    let random_number: u32 = rng.gen_range(1..=100);
    Ok(random_number)
}

fn main() {
    let mut testi32: Vec<RwLock<i32>> = Vec::new();
    let mut testi32Meta: Vec<RwLock<ValueMeta>> = Vec::new();

    fn register_value(index: Option<usize>, _owner: i32) {
        let index = match index {
            Some(index) => index,
            None => testi32.len(),
        };
        while testi32.len() <= index {
            testi32.resize_with(100, || RwLock::new(0));
        }
        return index;
    }

    let mut get_value = |index: usize| {
        return testi32[index].read().unwrap().clone();
    };

    register_value(None, 1);

    println!("Hello, world! {:?}", testi32)
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
