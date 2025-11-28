

fn zxcv55()-> Result<u32> {
    let mut rng = rand::thread_rng();
    let random_number: u32 = rng.gen_range(1..=100);
    Ok(random_number)
}

fn main() {
    allocated_auto_printer(std::time::Duration::from_secs(1));
    let asdf2 = zxcv55().unwrap();

    let link = Link::new(1, Registry::U32);
    let link = get_reg_prim_by_link(&link);
    println!("Link: {:?}", link);

    loop {}
}
