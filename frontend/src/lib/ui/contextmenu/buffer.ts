import { defineElement } from "@base";
import { Dots } from "@spinners";
import "./buffer.scss";
import { Line } from "./line";

export class Buffer extends Line {
  /**Returns the name used to define the element */
  static elementName() {
    return "buffer";
  }

  constructor() {
    super();
    this.appendChild(new Dots());
  }

  focus(dir: FocusOptions) {
    this.focusNext(dir as any);
  }
}
defineElement(Buffer);
