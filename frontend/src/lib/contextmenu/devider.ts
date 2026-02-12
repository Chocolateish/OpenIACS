import { define_element } from "../base";
import "./devider.scss";
import { ContextMenuLine } from "./line";

export class Devider extends ContextMenuLine {
  /**Returns the name used to define the element */
  static element_name() {
    return "devider";
  }

  do_focus(dir?: boolean) {
    this.focus_next(dir);
  }
}
define_element(Devider);

export function context_devider() {
  return new Devider();
}
