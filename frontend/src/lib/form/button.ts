import { AccessTypes, defineElement } from "@libBase";
import type { SVGFunc } from "@libSVG";
import "./button.scss";
import { FormValue } from "./common";
import "./shared";

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
export class Button extends FormValue<boolean> {
  /**Returns the name used to define the element */
  static elementName() {
    return "button";
  }

  static elementNameSpace(): string {
    return "form";
  }

  #text?: HTMLDivElement;
  #sym?: SVGSVGElement;

  constructor(toggle: boolean = false, text?: string, icon?: SVGFunc) {
    super();
    this.setAttribute("tabindex", "0");
    this.toggle = toggle;
    if (text) this.text = text;
    if (icon) this.icon = icon;
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
      if (this.#text) {
        this.removeChild(this.#text);
        this.#text = undefined;
      }
    } else {
      if (!this.#text) {
        this.#text = document.createElement("div");
        this.appendChild(this.#text);
      }
      this.#text.innerHTML = text;
    }
  }

  /**Changes the symbol of the button*/
  set icon(icon: SVGFunc | undefined) {
    if (icon) {
      let i = icon();
      if (this.#sym) this.replaceChild(i, this.#sym);
      else this.insertBefore(i, this.firstChild);
      this.#sym = i;
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
                  this.setValue(!this.buffer);
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
        this.setValue(!this.buffer);
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

  protected onAccess(a: AccessTypes) {
    if (a === AccessTypes.READ) return this.setAttribute("tabindex", "-1");
    else if (a === AccessTypes.WRITE) return this.setAttribute("tabindex", "0");
  }

  protected newValue(val: boolean) {
    if (val) this.classList.add("active");
    else this.classList.remove("active");
  }

  protected newError(_val: string): void {}
}
defineElement(Button);

export let form_button = {
  /**Creates a button form element */
  from(toggle: boolean = false, text?: string, icon?: SVGFunc): Button {
    return new Button(toggle, text, icon);
  },
  class: Button,
};
