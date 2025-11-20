import { defineElement } from "../base";
import "./devider.scss";
import { ContextMenuLine } from "./line";

export class Devider extends ContextMenuLine {
  /**Returns the name used to define the element */
  static elementName() {
    return "devider";
  }

  doFocus(dir?: boolean) {
    this.focusNext(dir);
  }
}
defineElement(Devider);

export function contextDevider() {
  return new Devider();
}
