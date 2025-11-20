import { defineElement } from "@libBase";
import { ValueComponent, type ValueComponentOptions } from "./common";
import "./lamp.scss";

/**Defines all possible background colors for the lamp*/
export const LampColors = {
  OFF: "off",
  GREEN: "green",
  RED: "red",
  BLUE: "blue",
  YELLOW: "yellow",
} as const;
export type LampColors = (typeof LampColors)[keyof typeof LampColors];

/**Defines options for lamp component*/
export type LampOptions = {
  /**The color of lamp is the the index color in this array*/
  colors: LampColors[];
  /**The symbol to display in the lamp*/
  symbol?: SVGSVGElement;
} & ValueComponentOptions;

/**Lamp for clicking*/
export class Lamp extends ValueComponent<LampOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "lamp";
  }

  __colors?: LampColors[];
  __text?: HTMLDivElement;
  __sym?: SVGSVGElement;

  options(options: LampOptions): this {
    this.colors = options.colors;
    super.options(options);
    if (typeof options.symbol !== "undefined") this.symbol = options.symbol;
    return this;
  }

  /**Changes the text description of the lamp*/
  set text(text: string) {
    if (typeof text == "string" && text) {
      if (!this.__text) {
        this.__text = document.createElement("div");
        this.appendChild(this.__text);
      }
      this.__text.innerHTML = text;
    } else {
      if (this.__text) {
        this.removeChild(this.__text);
        delete this.__text;
      }
    }
  }

  /**Changes the symbol of the lamp*/
  set symbol(sym: SVGSVGElement | undefined) {
    if (sym) {
      if (this.__sym) {
        this.replaceChild(sym, this.__sym);
        this.__sym = sym;
      } else {
        this.__sym = this.insertBefore(sym, this.firstChild);
      }
    } else if (this.__sym) {
      this.removeChild(this.__sym);
      delete this.__sym;
    }
  }

  /** Sets the background color of the lamp*/
  set colors(colors: LampColors[]) {
    this.__colors = colors;
  }

  /**Internal value setter*/
  protected __newValue(val: boolean) {
    if (this.__colors) {
      let color = this.__colors[Number(val)];
      if (color) {
        this.setAttribute("color", color);
      } else {
        this.removeAttribute("color");
      }
    }
  }
}
defineElement(Lamp);
