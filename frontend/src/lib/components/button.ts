import { AccessTypes, defineElement } from "@libBase";
import type { SVGFunc } from "@libSVG";
import "./button.scss";
import { ValueComponent } from "./common";

/**Defines all possible background colors for the button*/
export const ButtonColors = {
  NONE: "none",
  GREEN: "green",
  RED: "red",
  BLUE: "blue",
  YELLOW: "yellow",
} as const;
export type ButtonColors = (typeof ButtonColors)[keyof typeof ButtonColors];

/**Button for clicking*/
export class Button extends ValueComponent<boolean> {
  /**Returns the name used to define the element */
  static elementName() {
    return "button";
  }

  __text?: HTMLDivElement;
  #sym?: SVGSVGElement;

  constructor() {
    super();
    this.setAttribute("tabindex", "0");
  }

  /**Overridable click function*/
  onClick(): void {}

  #doClick() {
    try {
      this.onClick();
    } catch (error) {
      console.error("Failed while executing button click", error);
    }
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
  set icon(icon: SVGFunc | undefined) {
    if (icon instanceof SVGElement) {
      if (this.#sym) {
        this.replaceChild(icon, this.#sym);
        this.#sym = icon();
      } else {
        this.#sym = this.insertBefore(icon(), this.firstChild);
      }
    } else if (this.#sym) {
      this.removeChild(this.#sym);
      this.#sym = undefined;
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
                  this.setValue(!this.__valueBuffer);
                  this.#doClick();
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
        this.setValue(!this.__valueBuffer);
        this.#doClick();
      };
    } else {
      this.onpointerdown = (e) => {
        e.stopPropagation();
        if (e.pointerType == "touch") {
          e.preventDefault();
        }
        this.setPointerCapture(e.pointerId);
        this.setValue(true);
        this.onpointerup = (ev) => {
          ev.stopPropagation();
          this.focus();
          this.releasePointerCapture(ev.pointerId);
          this.setValue(false);
          this.#doClick();
          this.onpointerup = null;
        };
      };
      this.onkeydown = (e) => {
        switch (e.key) {
          case "Enter":
          case " ": {
            e.stopPropagation();
            this.setValue(true);
            this.onkeyup = (e) => {
              switch (e.key) {
                case "Enter":
                case " ": {
                  e.stopPropagation();
                  this.setValue(false);
                  this.#doClick();
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
    if (color === ButtonColors.NONE) this.removeAttribute("color");
    else this.setAttribute("color", color);
  }

  /**Internal access call*/
  protected onAccess(a: AccessTypes) {
    if (a === AccessTypes.READ) return this.setAttribute("tabindex", "-1");
    else if (a === AccessTypes.WRITE) return this.setAttribute("tabindex", "0");
  }

  /**Internal value setter*/
  newValue(val: boolean) {
    if (val) this.classList.add("active");
    else this.classList.remove("active");
  }
}
defineElement(Button);
