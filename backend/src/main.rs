use std::thread::{sleep, spawn};
use std::time::Duration;

mod lib;
mod macros;
mod modules;

use modules::{
    allocator::allocated_auto_printer,
    registry::{REG_U32, primitive::PrimVal},
};

use rand::Rng;

struct Test2 {}

struct Test {
    value: u32,
    meta: Test2,
}

lazy_static::lazy_static! {
    static ref VEC: orx_concurrent_vec::ConcurrentVec<u32> = orx_concurrent_vec::ConcurrentVec::new();
}

fn more_than_one_bit_set(x: u32) -> bool {
    x != 0 && (x & (x - 1)) != 0
}

fn main() {
    allocated_auto_printer(std::time::Duration::from_secs(1));

    VEC.extend(0..100);

    for i in 1..32u32 {
        spawn(move || {
            let val = 1 << i;
            loop {
                for i in 0..100u32 {
                    VEC[i as usize].update(|x| *x = val);
                }
                sleep(Duration::from_millis(10));
            }
        });
    }

    loop {
        for i in 0..100 {
            if more_than_one_bit_set(VEC[i as usize].copied()) {
                println!("yoyo {} : {:?}", i, VEC[i as usize].copied());
                break;
            }
        }
        println!("All Clear");
        let mut rng = rand::rng();
        let n: u32 = rng.random_range(0..=99);
        println!("Random {} : {:?}", n, VEC.len());
        println!("Random {} : {:?}", n, VEC[n as usize].copied());
        // for i in 1..100 {
        //     VEC[i as usize].update(|i| *i += 200);
        //     println!("yoyo {} : {:?}", i, VEC[i as usize].copied());

        //     sleep(Duration::from_millis(100));
        // }
        // break;
        sleep(Duration::from_millis(10));
    }
    loop {}
}
