#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PrimString {
    length: u32,
    id: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Prim {
    BLN = 1,
    I32 = 2,
    U32 = 3,
    F32 = 4,
    I64 = 5,
    U64 = 6,
    F64 = 7,
    STR = 8,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum PrimVal {
    BLN(bool),
    I32(i32),
    U32(u32),
    F32(f32),
    I64(i64),
    U64(u64),
    F64(f64),
    STR(PrimString),
}

impl PrimVal {
    pub fn as_reg_prim(&self) -> Prim {
        match self {
            PrimVal::BLN(_) => Prim::BLN,
            PrimVal::U32(_) => Prim::U32,
            PrimVal::I32(_) => Prim::I32,
            PrimVal::F32(_) => Prim::F32,
            PrimVal::U64(_) => Prim::U64,
            PrimVal::I64(_) => Prim::I64,
            PrimVal::F64(_) => Prim::F64,
            PrimVal::STR(_) => Prim::STR,
        }
    }
}
