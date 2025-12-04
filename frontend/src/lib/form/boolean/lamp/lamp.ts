import { define_element } from "@libBase";
import type { SVGFunc } from "@libSVG";
import { FormValue, type FormColors, type FormValueOptions } from "../../base";
import "./lamp.scss";

interface FormLampOptions<T extends boolean | number, C extends FormColors[]>
  extends FormValueOptions<T> {
  /**Sets the lamp colors */
  colors: C;
  /**Lamp text */
  text?: string;
  /**Icon for lamp */
  icon?: SVGFunc;
}

class Lamp<
  T extends boolean | number,
  C extends FormColors[]
> extends FormValue<T> {
  static element_name() {
    return "lamp";
  }
  static element_name_space(): string {
    return "form";
  }

  #text: HTMLSpanElement = this._body.appendChild(
    document.createElement("span")
  );
  #icon: SVGSVGElement | undefined;
  #colors: FormColors[] = [];

  /**Sets the current text of the lamp*/
  set text(label: string) {
    this.#text.textContent = label;
  }
  get text() {
    return this.#text.textContent;
  }

  /**Changes the icon of the lamp*/
  set icon(icon: SVGFunc | undefined) {
    if (icon) this.#icon = this._body.insertBefore(icon(), this.#text);
    else if (this.#icon) {
      this._body.removeChild(this.#icon);
      this.#icon = undefined;
    }
  }

  /** Sets the background color of the lamp*/
  set colors(colors: C) {
    this.#colors = colors;
    this.new_value(this.buffer!);
  }

  /**Called when value is changed */
  protected new_value(value: number | boolean) {
    let color = this.#colors[Number(value)];
    if (color) this._body.setAttribute("color", color);
    else this._body.removeAttribute("color");
  }

  protected new_error(_val: string): void {}
}
define_element(Lamp);

/**Creates a button form element */
function from(
  options?: FormLampOptions<
    number,
    [FormColors, FormColors, FormColors, ...FormColors[]]
  >
): Lamp<number, [FormColors, FormColors, FormColors, ...FormColors[]]>;
function from(
  options?: FormLampOptions<boolean, [FormColors, FormColors]>
): Lamp<boolean, [FormColors, FormColors]>;
function from<T extends boolean | number, C extends FormColors[]>(
  options?: FormLampOptions<T, C>
): Lamp<T, C> {
  let lamp = new Lamp<T, C>(options?.id);
  if (options) {
    lamp.colors = options.colors;
    if (options.text) lamp.text = options.text;
    if (options.icon) lamp.icon = options.icon;
    FormValue.apply_options(lamp, options);
  }
  return lamp;
}

export let form_lamp = {
  /**Creates a button form element */
  from,
};
