import { AccessTypes, define_element } from "@libBase";
import type { SVGFunc } from "@libSVG";
import "./button.scss";
import { FormColors, FormValueWrite } from "./common";
import "./shared";

/**Button for clicking*/
export class Button extends FormValueWrite<boolean> {
  static element_name() {
    return "button";
  }
  static element_name_space(): string {
    return "form";
  }

  #text?: HTMLDivElement;
  #icon?: SVGSVGElement;
  #func?: () => void;

  constructor(
    cid?: string,
    label?: string,
    toggle: boolean = false,
    icon?: SVGFunc
  ) {
    super(cid);
    this.appendChild(this.warn_input);
    this.setAttribute("tabindex", "0");
    this.toggle = toggle;
    if (label) this.label = label;
    if (icon) this.icon = icon;
  }

  /**Overridable click function*/
  set on_click(click: () => void) {
    this.#func = click;
  }

  #do_click() {
    if (!this.#func) return;
    try {
      this.#func();
    } catch (error) {
      console.error("Failed while executing button click", error);
    }
  }

  /**Changes the text description of the button */
  set label(text: string) {
    if (text) {
      if (!this.#text)
        this.#text = this.appendChild(document.createElement("div"));
      this.#text.textContent = text;
    } else {
      if (this.#text) {
        this.removeChild(this.#text);
        this.#text = undefined;
      }
    }
  }

  /**Changes the symbol of the button*/
  set icon(icon: SVGFunc | undefined) {
    if (icon) {
      let i = icon();
      if (this.#icon) this.replaceChild(i, this.#icon);
      else this.insertBefore(i, this.firstChild);
      this.#icon = i;
    } else if (this.#icon) {
      this.removeChild(this.#icon);
      this.#icon = undefined;
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
  set color(color: FormColors) {
    if (color === FormColors.None) this.removeAttribute("color");
    else this.setAttribute("color", color);
  }

  protected on_access(a: AccessTypes) {
    if (a === AccessTypes.Read) return this.setAttribute("tabindex", "-1");
    else if (a === AccessTypes.Write) return this.setAttribute("tabindex", "0");
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
  from(toggle?: boolean, label?: string, icon?: SVGFunc, cid?: string): Button {
    return new Button(cid, label, toggle, icon);
  },
};
