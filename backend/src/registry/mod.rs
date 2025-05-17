pub enum RegPrim {
    BLN = 1,
    I32 = 2,
    U32 = 3,
    F32 = 4,
    I64 = 5,
    U64 = 6,
    F64 = 7,
    STR = 8,
}
pub enum RegPrimVal {
    BLN(bool),
    I32(i32),
    U32(u32),
    F32(f32),
    I64(i64),
    U64(u64),
    F64(f64),
    STR,
}

impl RegPrimVal {
    pub fn as_reg_prim(&self) -> RegPrim {
        match self {
            RegPrimVal::BLN(_) => RegPrim::BLN,
            RegPrimVal::U32(_) => RegPrim::U32,
            RegPrimVal::I32(_) => RegPrim::I32,
            RegPrimVal::F32(_) => RegPrim::F32,
            RegPrimVal::U64(_) => RegPrim::U64,
            RegPrimVal::I64(_) => RegPrim::I64,
            RegPrimVal::F64(_) => RegPrim::F64,
            RegPrimVal::STR => RegPrim::STR,
        }
    }
}

pub enum RegInv {
    /// Not existent
    NOEX = 0,
    /// Not ready
    NORE = 1,
    /// Valid
    VALI = 10,
    /// Generic invalid
    INVA = 20,
    /// Hardware overrange
    HAOR = 21,
    /// Hardware underrange
    HAUR = 22,
    /// Hardware out of range
    HOOR = 23,
    /// Hardware wire break
    HAWB = 24,
    /// Hardware short circuit
    HASC = 25,
    /// Software overrange
    SOOR = 26,
    /// Software underrange
    SOUR = 27,
    ///Source lost
    SCOL = 28,
    ///Source configured wrong
    SCCW = 29,
}

///
pub enum RegInvVal<T: Copy> {
    /// Not existent
    NOEX,
    /// Not ready
    NORE,
    /// Valid
    VALI(T),
    /// Generic invalid
    INVA(T),
    /// Hardware overrange
    HAOR(T),
    /// Hardware underrange
    HAUR(T),
    /// Hardware out of range
    HOOR(T),
    /// Hardware wire break
    HAWB(T),
    /// Hardware short circuit
    HASC(T),
    /// Software overrange
    SOOR(T),
    /// Software underrange
    SOUR(T),
    ///Source lost
    SCOL(T),
    ///Source configured wrong
    SCCW(T),
}
impl<T: Copy> RegInvVal<T> {
    pub fn value(self) -> Option<T> {
        match self {
            RegInvVal::NOEX | RegInvVal::NORE => None,
            RegInvVal::VALI(v)
            | RegInvVal::INVA(v)
            | RegInvVal::HAOR(v)
            | RegInvVal::HAUR(v)
            | RegInvVal::HOOR(v)
            | RegInvVal::HAWB(v)
            | RegInvVal::HASC(v)
            | RegInvVal::SOOR(v)
            | RegInvVal::SOUR(v)
            | RegInvVal::SCOL(v)
            | RegInvVal::SCCW(v) => Some(v),
        }
    }
    pub fn as_reg_inv(&self) -> RegInv {
        match self {
            RegInvVal::NOEX => RegInv::NOEX,
            RegInvVal::NORE => RegInv::NORE,
            RegInvVal::VALI(_) => RegInv::VALI,
            RegInvVal::INVA(_) => RegInv::INVA,
            RegInvVal::HAOR(_) => RegInv::HAOR,
            RegInvVal::HAUR(_) => RegInv::HAUR,
            RegInvVal::HOOR(_) => RegInv::HOOR,
            RegInvVal::HAWB(_) => RegInv::HAWB,
            RegInvVal::HASC(_) => RegInv::HASC,
            RegInvVal::SOOR(_) => RegInv::SOOR,
            RegInvVal::SOUR(_) => RegInv::SOUR,
            RegInvVal::SCOL(_) => RegInv::SCOL,
            RegInvVal::SCCW(_) => RegInv::SCCW,
        }
    }
}
