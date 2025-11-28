import { AccessTypes, define_element } from "@libBase";
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
  static element_name() {
    return "button";
  }

  static element_name_space(): string {
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
  on_click(): void {}

  #do_click() {
    try {
      this.on_click();
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
                  this.set_value(!this.buffer);
                  this.#do_click();
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
        this.set_value(!this.buffer);
        this.#do_click();
      };
    } else {
      this.onpointerdown = (e) => {
        e.stopPropagation();
        if (e.pointerType == "touch") {
          e.preventDefault();
        }
        this.setPointerCapture(e.pointerId);
        this.set_value(true);
        this.onpointerup = (ev) => {
          ev.stopPropagation();
          this.focus();
          this.releasePointerCapture(ev.pointerId);
          this.set_value(false);
          this.#do_click();
          this.onpointerup = null;
        };
      };
      this.onkeydown = (e) => {
        switch (e.key) {
          case "Enter":
          case " ": {
            e.stopPropagation();
            this.set_value(true);
            this.onkeyup = (e) => {
              switch (e.key) {
                case "Enter":
                case " ": {
                  e.stopPropagation();
                  this.set_value(false);
                  this.#do_click();
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

  protected on_access(a: AccessTypes) {
    if (a === AccessTypes.READ) return this.setAttribute("tabindex", "-1");
    else if (a === AccessTypes.WRITE) return this.setAttribute("tabindex", "0");
  }

  protected new_value(val: boolean) {
    if (val) this.classList.add("active");
    else this.classList.remove("active");
  }

  protected new_error(_val: string): void {}
}
define_element(Button);

export let form_button = {
  /**Creates a button form element */
  from(toggle: boolean = false, text?: string, icon?: SVGFunc): Button {
    return new Button(toggle, text, icon);
  },
  class: Button,
};
