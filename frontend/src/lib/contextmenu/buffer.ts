import { define_element } from "@libBase";
import { Spinner } from "@libSpinners";
import "./buffer.scss";
import { ContextMenuLine } from "./line";

export class Buffer extends ContextMenuLine {
  /**Returns the name used to define the element */
  static element_name() {
    return "buffer";
  }

  constructor() {
    super();
    this.appendChild(new Spinner());
  }

  do_focus(dir: boolean) {
    this.focus_next(dir);
  }
}
define_element(Buffer);
