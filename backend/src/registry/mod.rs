lazy_static::lazy_static! {
    pub static ref REG_U32: orx_concurrent_vec::ConcurrentVec<u32> = orx_concurrent_vec::ConcurrentVec::new();
}

pub mod invalid;
pub mod primitive;
