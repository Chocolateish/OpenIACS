use std::thread::{sleep, spawn};
use std::time::Duration;

mod lib;
mod macros;
mod modules;

use modules::{
    allocator::allocated_auto_printer,
    registry::{get_reg_prim_by_link, link::Link, registry::Registry},
};

use rand::Rng;

fn main() {
    allocated_auto_printer(std::time::Duration::from_secs(1));

    let link = Link::new(1, Registry::U32);

    let link = get_reg_prim_by_link(&link);
    println!("Link: {:?}", link);

    loop {}
}
