use super::host::HostLink;
use super::registry::Registry;
use arrayvec::ArrayString;

const LINK_AS_STR_MAX_SIZE: usize = 3 + 10 + 39; // "REG|id@IPV4/6"
///A string representation of a link, used for serialization and debugging.
///It is formatted as follows "REG|id@IPV4/6"
///Meaning registry designator | zero-padded 10 digit id @ host address as ipv4 or ipv6
pub type LinkAsStr = ArrayString<LINK_AS_STR_MAX_SIZE>;

///A link is a way to store a reference to a value in a registry.
pub struct Link {
    pub id: u32,
    pub registry: Registry,
    pub host: HostLink,
}

impl Link {
    pub fn new(id: u32, registry: Registry) -> Self {
        Self {
            id,
            registry,
            host: HostLink(0),
        }
    }

    pub fn from_link_as_str(link: &LinkAsStr) -> Option<Self> {
        let parts: Vec<&str> = link.split('@').collect();
        if parts.len() != 2 {
            return None;
        }
        return None;
    }

    // pub fn as_link_as_str(&self) -> LinkAsStr {
    // let mut link = ArrayString::<LinkAsStrMaxSize>::new();
    // link.push_str(&format!(
    //     "{}|{:010}@{}",
    //     self.registry.as_str(),
    //     self.id,
    //     self.host.as_str()
    // ));
    // link
    // }
}
