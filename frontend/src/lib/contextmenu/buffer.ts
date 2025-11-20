import { defineElement } from "@libBase";
import { Spinner } from "@libSpinners";
import "./buffer.scss";
import { ContextMenuLine } from "./line";

export class Buffer extends ContextMenuLine {
  /**Returns the name used to define the element */
  static elementName() {
    return "buffer";
  }

  constructor() {
    super();
    this.appendChild(new Spinner());
  }

  doFocus(dir: FocusOptions) {
    this.focusNext(dir as any);
  }
}
defineElement(Buffer);
