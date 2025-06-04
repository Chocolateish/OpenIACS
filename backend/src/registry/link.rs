use super::host::Host;
use super::registry::Registry;
use arrayvec::ArrayString;

const LinkAsStrMaxSize: usize = 3 + 10 + 39; // "REG|id@IPV4/6"
///A string representation of a link, used for serialization and debugging.
///It is formatted as follows "REG|id@IPV4/6"
///Meaning registry designator | zero-padded 10 digit id @ host address as ipv4 or ipv6
pub type LinkAsStr = ArrayString<LinkAsStrMaxSize>;

const size: usize = std::mem::size_of::<LinkAsStr>();

///A link is a way to store a reference to a value in a registry.
pub struct Link {
    pub id: u32,
    pub registry: Registry,
    pub host: Host,
}

impl Link {
    pub fn new(id: u32, registry: Registry, host: Host) -> Self {
        Self { id, registry, host }
    }
}
