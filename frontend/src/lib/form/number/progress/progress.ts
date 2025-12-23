import { define_element } from "@libBase";
import { FormValue } from "../../base";
import { type FormNumberOptions } from "../numberBase";
import "./progress.scss";

export class FormProgress<ID extends string | undefined> extends FormValue<
  number,
  ID
> {
  static element_name() {
    return "progress";
  }
  static element_name_space(): string {
    return "form";
  }

  #min: number = 0;
  #max: number = 100;
  #span: number = 100;
  #decimals: number = 0;
  #bar: HTMLDivElement = this._body.appendChild(document.createElement("div"));
  #val: HTMLSpanElement = this._body.appendChild(
    document.createElement("span")
  );
  #unit: HTMLSpanElement = this._body.appendChild(
    document.createElement("span")
  );

  /**Set the minimum value*/
  set min(min: number) {
    this.#min = min;
    this.#span = this.#max - this.#min;
  }

  /**Set the minimum value*/
  set max(max: number) {
    this.#max = max;
    this.#span = this.#max - this.#min;
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
    this.#val.textContent = value.toFixed(this.#decimals);
  }

  protected clear_value(): void {
    this.#bar.style.width = "0%";
    this.#val.textContent = "";
  }

  protected new_error(err: string): void {
    console.error(err);
  }
}
define_element(FormProgress);

export const form_progress = {
  /**Creates a progress form element */
  from<ID extends string | undefined>(
    options?: FormNumberOptions<ID>
  ): FormProgress<ID> {
    const prog = new FormProgress<ID>(options?.id);
    if (options) {
      if (typeof options.min !== "undefined") prog.min = options.min;
      if (typeof options.max !== "undefined") prog.max = options.max;
      prog.decimals = options.decimals;
      prog.unit = options.unit;
      FormValue.apply_options(prog, options);
    }
    return prog;
  },
};
