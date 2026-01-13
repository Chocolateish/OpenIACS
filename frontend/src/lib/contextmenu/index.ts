import { context_devider } from "./devider";
import {
  context_menu_attach,
  context_menu_default,
  context_menu_dettach,
  context_menu_summon,
} from "./engine";
import { context_menu } from "./menu";
import { context_line } from "./option";
import { context_sub } from "./submenu";

export const ctm = {
  attach: context_menu_attach,
  default: context_menu_default,
  dettach: context_menu_dettach,
  summon: context_menu_summon,
  menu: context_menu,
  line: context_line,
  sub: context_sub,
  devider: context_devider,
};
export default ctm;
