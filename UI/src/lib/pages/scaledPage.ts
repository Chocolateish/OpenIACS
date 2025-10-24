import { defineElement } from "@libBase";
import { svg } from "@libCommon";
import { InstrumentBase } from "@libInstr";
import { Content, type ContentBaseOptions } from "@libUI";
import "./scaledPage.scss";

/** Defines base options for components with values*/
export type ScaledPageOptions = {
  instruments?: InstrumentBase[];
  width?: number;
  height?: number;
} & ContentBaseOptions;

export class ScaledPage extends Content<ScaledPageOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "ui-scaled-page";
  }

  private __width = 0;
  private __height = 0;
  private __page = this.appendChild(svg(undefined, undefined, "0 0 0 0"));

  /**Options toggeler*/
  options(options: ScaledPageOptions): this {
    super.options(options);
    if (options.instruments)
      for (let i = 0, n = options.instruments.length; i < n; i++)
        this.appendInstrument(options.instruments[i]);
    if (options.width) this.width = options.width;
    if (options.height) this.height = options.height;
    return this;
  }

  /**This sets the width of the grid*/
  set width(w: number) {
    this.__width = w;
    this.__page.setAttribute(
      "viewBox",
      "0 0 " + this.__width + " " + (this.__height || 0)
    );
  }

  /**Returns the width of the grid */
  get width(): number {
    return this.__width;
  }

  /**This sets the height of the grid*/
  set height(h: number) {
    this.__height = h;
    this.__page.setAttribute(
      "viewBox",
      "0 0 " + (this.__width || 0) + " " + this.__height
    );
  }

  /**Returns the height of the grid*/
  get height(): number {
    return this.__height;
  }

  /** Appends instrument to page
   * @param  instr instrument to append
   * @param  below instrument to render instrument below*/
  appendInstrument<I extends InstrumentBase>(
    instr: I,
    below?: InstrumentBase
  ): I {
    if (below) {
      //@ts-expect-error
      this.__page.insertBefore(instr.__container, below.__container);
    } else {
      //@ts-expect-error
      this.__page.append(instr.__container);
    }
    return instr;
  }
}
defineElement(ScaledPage);
