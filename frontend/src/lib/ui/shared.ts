import { theme_init_variable_root } from "@libTheme";

const theme_root = theme_init_variable_root(
  "form",
  "UI Form Elements",
  "Theme variables for UI form Elements"
);

//      _____  ______          _____     ____  _   _ _  __     __
//     |  __ \|  ____|   /\   |  __ \   / __ \| \ | | | \ \   / /
//     | |__) | |__     /  \  | |  | | | |  | |  \| | |  \ \_/ /
//     |  _  /|  __|   / /\ \ | |  | | | |  | | . ` | |   \   /
//     | | \ \| |____ / ____ \| |__| | | |__| | |\  | |____| |
//     |_|  \_\______/_/    \_\_____/   \____/|_| \_|______|_|
const read_only = theme_root.make_sub_group(
  "read",
  "Read Only",
  "Settings for form elements in read only mode"
);
read_only.make_variable(
  "filter",
  "Read Only Filter",
  "Filter applied to form elements in read only mode",
  "opacity(0.6)",
  "opacity(0.6)",
  "Filter",
  undefined
);
