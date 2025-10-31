import { AccessTypes, defineElement } from "@libBase";
import "./button.scss";
import { ValueComponent, type ValueComponentOptions } from "./common";

/**Defines all possible background colors for the button*/
export const ButtonColors = {
  NONE: "none",
  GREEN: "green",
  RED: "red",
  BLUE: "blue",
  YELLOW: "yellow",
} as const;
export type ButtonColors = (typeof ButtonColors)[keyof typeof ButtonColors];

/**Defines options for button component*/
export type ButtonOptions = {
  symbol?: SVGSVGElement;
  //@ts-ignore
  click?: () => void;
  toggle?: boolean;
  color?: ButtonColors;
} & ValueComponentOptions;

/**Button for clicking*/
export class Button extends ValueComponent<ButtonOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "button";
  }

  __click?: () => void;
  __text?: HTMLDivElement;
  __sym?: SVGSVGElement;

  constructor() {
    super();
    this.setAttribute("tabindex", "0");
  }

  options(options: ButtonOptions): this {
    super.options(options);
    if (options.symbol) this.symbol = options.symbol;

    if (options.click) this.click = options.click;

    this.toggle = options.toggle || false;
    if (typeof options.color !== "undefined") this.color = options.color;
    return this;
  }

  /**Changes the text description of the button*/
  //@ts-expect-error
  set click(func: () => void) {
    this.__click = func;
  }

  /**Changes the text description of the button */
  set text(text: string) {
    if (text === "") {
      if (this.__text) {
        this.removeChild(this.__text);
        delete this.__text;
      }
    } else {
      if (!this.__text) {
        this.__text = document.createElement("div");
        this.appendChild(this.__text);
      }
      this.__text.innerHTML = text;
    }
  }

  /**Changes the symbol of the button*/
  set symbol(sym: SVGSVGElement | undefined) {
    if (sym instanceof SVGElement) {
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

  /**Changes whether the button is maintained or momentary*/
  set toggle(tog: boolean) {
    if (tog) {
      this.onpointerdown = null;
      this.onpointerup = null;
      this.onkeydown = (e) => {
        switch (e.key) {
          case "Enter":
          case " ": {
            e.stopPropagation();
            this.onkeyup = (e) => {
              switch (e.key) {
                case "Enter":
                case " ": {
                  e.stopPropagation();
                  this.__setValue(!this.__valueBuffer);
                  if (this.__click) {
                    this.__click();
                  }
                  break;
                }
              }
              this.onkeyup = null;
            };
            break;
          }
        }
      };
      this.onclick = (e) => {
        e.stopPropagation();
        this.__setValue(!this.__valueBuffer);
        if (this.__click) {
          this.__click();
        }
      };
    } else {
      this.onpointerdown = (e) => {
        e.stopPropagation();
        if (e.pointerType == "touch") {
          e.preventDefault();
        }
        this.setPointerCapture(e.pointerId);
        this.__setValue(true);
        this.onpointerup = (ev) => {
          ev.stopPropagation();
          this.focus();
          this.releasePointerCapture(ev.pointerId);
          this.__setValue(false);
          if (this.__click) {
            this.__click();
          }
          this.onpointerup = null;
        };
      };
      this.onkeydown = (e) => {
        switch (e.key) {
          case "Enter":
          case " ": {
            e.stopPropagation();
            this.__setValue(true);
            this.onkeyup = (e) => {
              switch (e.key) {
                case "Enter":
                case " ": {
                  e.stopPropagation();
                  this.__setValue(false);
                  if (this.__click) {
                    this.__click();
                  }
                  break;
                }
              }
              this.onkeyup = null;
            };
            break;
          }
        }
      };
      this.onclick = null;
    }
  }

  /** Sets the background color of the button*/
  set color(color: ButtonColors) {
    if (color === ButtonColors.NONE) {
      this.removeAttribute("color");
      return;
    }
    this.setAttribute("color", color);
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes) {
    switch (a) {
      case AccessTypes.READ:
        return this.setAttribute("tabindex", "-1");
      case AccessTypes.WRITE:
        return this.setAttribute("tabindex", "0");
    }
  }

  /**Internal value setter*/
  __newValue(val: boolean) {
    if (val) {
      this.classList.add("active");
    } else {
      this.classList.remove("active");
    }
  }
}
defineElement(Button);
