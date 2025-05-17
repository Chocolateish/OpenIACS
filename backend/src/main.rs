use dashmap::DashMap;
use std::thread::{sleep, spawn};
use std::time::Duration;

mod allocator;
use allocator::allocated_auto_printer;

mod registry;
use registry::RegPrimVal;

lazy_static::lazy_static! {
    static ref MAP: DashMap<u32, u32> = DashMap::with_capacity(100);
    static ref VEC: orx_concurrent_vec::ConcurrentVec<u32> = {
        let mut vec = orx_concurrent_vec::ConcurrentVec::new();
        vec.reserve_maximum_capacity(100);
        vec
    };
}

/// A WebSocket echo server
fn main() {
    allocated_auto_printer(std::time::Duration::from_secs(1));

    VEC.extend(0..100);

    for i in 1..51u32 {
        VEC[i as usize].set(i + 100);
    }

    let join = spawn(|| {
        for i in 51..101 {
            VEC[i].update(|x| *x = 10);
        }
    });

    join.join().unwrap();

    loop {
        for i in 1..100 {
            // MAP.insert(i, i + 100);
            // match MAP.get(&i) {
            //     Some(entry) => {
            //         println!("yoyo {:?}", entry.value());
            //     }
            //     None => break,
            // }
            VEC[i as usize].update(|i| *i += 200);
            println!("yoyo {:?}", VEC[i as usize].copied());

            sleep(Duration::from_millis(100));
        }
        break;
    }
    loop {}
}
