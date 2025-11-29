import { define_element } from "@libBase";
import type { SVGFunc } from "@libSVG";
import { FormColors, FormValue } from "./common";
import "./lamp.scss";
import "./shared";

/**Lamp for clicking*/
export class Lamp<T extends boolean | number> extends FormValue<T> {
  static element_name() {
    return "lamp";
  }
  static element_name_space(): string {
    return "form";
  }

  #colors?: FormColors[];
  #text?: HTMLDivElement;
  #icon?: SVGSVGElement;

  constructor(
    colors: FormColors[],
    text?: string,
    icon?: SVGFunc,
    cid?: string
  ) {
    super(cid);
    this.colors = colors;
    if (text) this.label = text;
    if (icon) this.icon = icon;
  }

  /** Sets the background color of the lamp*/
  set colors(colors: FormColors[]) {
    this.#colors = colors;
  }

  /**Changes the text description of the button */
  set label(text: string) {
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
      if (this.#icon) this.replaceChild(i, this.#icon);
      else this.insertBefore(i, this.firstChild);
      this.#icon = i;
    } else if (this.#icon) {
      this.removeChild(this.#icon);
      this.#icon = undefined;
    }
  }

  /**Internal value setter*/
  protected new_value(val: T) {
    if (this.#colors) {
      let color = this.#colors[Number(val)];
      if (color) {
        this.setAttribute("color", color);
      } else {
        this.removeAttribute("color");
      }
    }
  }

  protected new_error(_val: string): void {}
}
define_element(Lamp);

/**Creates a button form element */
function from(
  colors: [FormColors, FormColors, FormColors, ...FormColors[]],
  text?: string,
  icon?: SVGFunc
): Lamp<number>;
function from(
  colors: [FormColors, FormColors],
  text?: string,
  icon?: SVGFunc
): Lamp<boolean>;
function from<T extends boolean | number>(
  colors: FormColors[],
  text?: string,
  icon?: SVGFunc
): Lamp<T> {
  return new Lamp<T>(colors, text, icon);
}

export let form_lamp = {
  from,
};
