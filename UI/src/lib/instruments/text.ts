import { defineElement } from "@libBase";
import { defineElementValues } from "@libCommon";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./text.scss";

/**Defines options for button component*/
type InstrTextOptions = {
  /**text on the button */
  text?: string;
  /**the size of the text */
  textSize?: number;
} & InstrumentBaseOptions;

export class InstrText extends InstrumentBase<InstrTextOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "text";
  }

  private __textContainer = this.__svg.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
  );
  private __width = 0;
  private __height = 0;
  private ___invalid: boolean = true;

  constructor() {
    super();
    this.__textContainer.setAttribute("x", "0");
    this.__textContainer.setAttribute("y", "0");
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrTextOptions): this {
    super.options(options);
    if (typeof options.textSize !== "undefined")
      this.textSize = options.textSize;
    if (typeof options.text !== "undefined") this.text = options.text;
    return this;
  }

  set width(width: number) {
    this.__width = width;
    this.__textContainer.setAttribute("width", String(width));
    super.width = width;
  }

  set height(height: number) {
    this.__height = height;
    this.__textContainer.setAttribute("height", String(height));
    super.height = height;
  }

  set textSize(size: number) {
    this.__textContainer.style.fontSize = size + "px";
  }

  set text(text: string) {
    text;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return this.__width || 0;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return this.__height || 0;
  }

  protected $vftext(text: string) {
    if (typeof text === "object") {
      //@ts-expect-error
      this.__textContainer.innerHTML = text.reason;
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      //@ts-expect-error
      if (this.$Vbtext) this.$Vbtext.applyText(this.__textContainer);
      else this.__textContainer.innerHTML = text;
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrText);
defineElementValues(InstrText, ["text"]);
