import { define_element } from "@libBase";
import { FormValue } from "../../base";
import { type FormNumberOptions } from "../numberBase";
import "./progress.scss";

/**Slide Selector, displays all options in a slider*/
export class Progress extends FormValue<number> {
  static element_name() {
    return "progress";
  }
  static element_name_space(): string {
    return "form";
  }

  #min: number = -Infinity;
  #max: number = Infinity;
  #span: number = Infinity;
  #decimals: number = 0;
  #bar: HTMLDivElement = this._body.appendChild(document.createElement("div"));
  #val: HTMLSpanElement = this._body.appendChild(
    document.createElement("span")
  );
  #unit: HTMLSpanElement = this._body.appendChild(
    document.createElement("span")
  );

  /**Set the minimum value*/
  set min(min: number | undefined) {
    // if (typeof min === "number") {
    //   this._minUsr = min;
    // } else {
    //   this._minUsr = -Infinity;
    // }
    // this._updateMinMax();
  }

  /**Set the minimum value*/
  set max(max: number | undefined) {
    // if (typeof max === "number") {
    //   this._maxUsr = max;
    // } else {
    //   this._maxUsr = Infinity;
    // }
    // this._updateMinMax();
  }

  /**Sets the amount of decimals the element can have*/
  set decimals(dec: number | undefined) {
    this.#decimals = Math.max(dec ?? 0, 0);
  }

  /**Sets the unit of the element*/
  set unit(unit: string | undefined) {
    this.#unit.textContent = unit ?? "";
  }

  protected new_value(value: number): void {
    this.#bar.style.width =
      Math.min(Math.max(((value - this.#min) / this.#span) * 100, 0), 100) +
      "%";
    this.#val.innerHTML = value.toFixed(this.#decimals);
  }

  protected new_error(_val: string): void {}
}
define_element(Progress);

export let form_progress = {
  /**Creates a progress form element */
  from(options?: FormNumberOptions): Progress {
    let prog = new Progress(options?.id);
    if (options) {
      prog.decimals = options.decimals;
      prog.min = options.min;
      prog.max = options.max;
      prog.unit = options.unit;
      FormValue.apply_options(prog, options);
    }
    return prog;
  },
};
