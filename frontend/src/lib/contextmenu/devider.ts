import { defineElement } from "../base";
import "./devider.scss";
import { ContextMenuLine } from "./line";

export class Devider extends ContextMenuLine {
  /**Returns the name used to define the element */
  static elementName() {
    return "devider";
  }

  focus(dir: FocusOptions) {
    this.focusNext(dir as any);
  }
}
defineElement(Devider);

export function contextDevider() {
  return new Devider();
}
