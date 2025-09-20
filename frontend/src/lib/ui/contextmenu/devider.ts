import { defineElement } from "@base";
import "./devider.scss";
import { Line } from "./line";

export class Devider extends Line {
  /**Returns the name used to define the element */
  static elementName() {
    return "devider";
  }

  focus(dir: FocusOptions) {
    this.focusNext(dir as any);
  }
}
defineElement(Devider);
