use super::primitive::Prim;

#[derive(Debug, Clone, Copy, PartialEq, Eq, strum::IntoStaticStr)]
pub enum Registry {
    //8≤ Byte Registries
    ///
    BLN = 40,
    U32 = 41,
    I32 = 42,
    F32 = 43,
    I64 = 44,
    U64 = 45,
    F64 = 46,
    ENU = 47,
}

impl Registry {
    pub fn as_prim(&self) -> Prim {
        match self {
            Registry::BLN => Prim::BLN,
            Registry::U32 => Prim::U32,
            Registry::I32 => Prim::I32,
            Registry::F32 => Prim::F32,
            Registry::I64 => Prim::I64,
            Registry::U64 => Prim::U64,
            Registry::F64 => Prim::F64,
            Registry::ENU => Prim::U32,
        }
    }
}
