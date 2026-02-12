use super::primitive::PrimVal;

#[derive(Debug, Clone, Copy, PartialEq, Eq, strum::IntoStaticStr)]
pub enum Inva {
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

impl Inva {
    pub fn to_inva_val<T: Copy>(&self, val: T) -> InvaVal<T> {
        return InvaVal::from_inva_and_val(self, val);
    }
}

///
///
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum InvaVal<T: Copy> {
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
impl InvaVal<()> {
    pub fn from_inva_and_val<G: Copy>(inva: &Inva, val: G) -> InvaVal<G> {
        return match inva {
            Inva::NOEX => InvaVal::NOEX,
            Inva::NORE => InvaVal::NORE,
            Inva::VALI => InvaVal::VALI(val),
            Inva::INVA => InvaVal::INVA(val),
            Inva::HAOR => InvaVal::HAOR(val),
            Inva::HAUR => InvaVal::HAUR(val),
            Inva::HOOR => InvaVal::HOOR(val),
            Inva::HAWB => InvaVal::HAWB(val),
            Inva::HASC => InvaVal::HASC(val),
            Inva::SOOR => InvaVal::SOOR(val),
            Inva::SOUR => InvaVal::SOUR(val),
            Inva::SCOL => InvaVal::SCOL(val),
            Inva::SCCW => InvaVal::SCCW(val),
        };
    }
}

impl<T: Copy> InvaVal<T> {
    pub fn value(self) -> Option<T> {
        match self {
            InvaVal::NOEX | InvaVal::NORE => None,
            InvaVal::VALI(v)
            | InvaVal::INVA(v)
            | InvaVal::HAOR(v)
            | InvaVal::HAUR(v)
            | InvaVal::HOOR(v)
            | InvaVal::HAWB(v)
            | InvaVal::HASC(v)
            | InvaVal::SOOR(v)
            | InvaVal::SOUR(v)
            | InvaVal::SCOL(v)
            | InvaVal::SCCW(v) => Some(v),
        }
    }

    pub fn as_reg_inv(&self) -> Inva {
        match self {
            InvaVal::NOEX => Inva::NOEX,
            InvaVal::NORE => Inva::NORE,
            InvaVal::VALI(_) => Inva::VALI,
            InvaVal::INVA(_) => Inva::INVA,
            InvaVal::HAOR(_) => Inva::HAOR,
            InvaVal::HAUR(_) => Inva::HAUR,
            InvaVal::HOOR(_) => Inva::HOOR,
            InvaVal::HAWB(_) => Inva::HAWB,
            InvaVal::HASC(_) => Inva::HASC,
            InvaVal::SOOR(_) => Inva::SOOR,
            InvaVal::SOUR(_) => Inva::SOUR,
            InvaVal::SCOL(_) => Inva::SCOL,
            InvaVal::SCCW(_) => Inva::SCCW,
        }
    }
}

pub type InvaPrimVal = InvaVal<PrimVal>;
