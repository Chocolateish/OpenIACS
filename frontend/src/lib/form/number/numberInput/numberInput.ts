import { define_element } from "@libBase";
import { FormNumberWrite, type FormNumberWriteOptions } from "../numberBase";
import "./numberInput.scss";

/**Slide Selector, displays all options in a slider*/
export class FormNumberInput<
  ID extends string | undefined
> extends FormNumberWrite<ID> {
  static element_name() {
    return "numberinput";
  }
  static element_name_space(): string {
    return "form";
  }

  #unit: string = "";
  #min: number = -Infinity;
  #max: number = Infinity;
  #step: number = 0;
  #start: number = 0;
  #decimals: number = 0;

  #value_box = this._body.appendChild(document.createElement("span"));
  #unit_box = this._body.appendChild(document.createElement("span"));
  #legend = this._body.appendChild(document.createElement("div"));
  #min_legend = this.#legend.appendChild(document.createElement("span"));
  #max_legend = this.#legend.appendChild(document.createElement("span"));

  constructor(id?: ID) {
    super(id);
    this.#value_box.contentEditable = "true";
    this.#value_box.onfocus = () => {};
    this.#value_box.onblur = () => {
      setTimeout(() => {
        this.set_value_check(
          parseFloat(this.#value_box.textContent?.replace(",", ".") || "") || 0
        );
      }, 0);
    };
    this._body.onclick = () => {
      this.#value_box.focus();
    };
    this._body.onkeydown = (e) => {
      if (e.key === "Enter") {
        this.#value_box.blur();
      }
    };
    this._body.onbeforeinput = (e) => {
      if (e.inputType === "insertParagraph") {
        e.preventDefault();
      }
      if (e.data) {
        if (!/[\d,.-]/g.test(e.data)) {
          e.preventDefault();
        } else if (/[,.]/g.test(e.data) && this.#decimals === 0) {
          e.preventDefault();
        } else if (this.#min >= 0 && /-/g.test(e.data)) {
          e.preventDefault();
        }
      }
    };
  }

  set unit(unit: string | undefined) {
    this.#unit = unit || "";
    this.#unit_box.textContent = this.#unit;
    this.#update_min_legend();
    this.#update_max_lengend();
  }

  set decimals(dec: number | undefined) {
    this.#decimals = dec || 0;
    this.#update_min_legend();
    this.#update_max_lengend();
  }

  set min(min: number | undefined) {
    this.#min = min ?? -Infinity;
    this.#update_min_legend();
  }
  #update_min_legend() {
    this.#min_legend.textContent =
      this.#min === -Infinity
        ? ""
        : "Min: " + this.#min.toFixed(this.#decimals) + this.#unit;
  }

  set max(max: number | undefined) {
    this.#max = max ?? Infinity;
    this.#update_max_lengend();
  }
  #update_max_lengend() {
    this.#max_legend.textContent =
      this.#max === Infinity
        ? ""
        : "Max: " + this.#max.toFixed(this.#decimals) + this.#unit;
  }

  set step(step: number | undefined) {
    this.#step = step || 0;
  }

  set start(step: number | undefined) {
    this.#start = step || 0;
  }

  protected new_value(val: number): void {
    this.#value_box.textContent = val.toFixed(this.#decimals);
  }

  protected new_error(_val: string): void {}
}
define_element(FormNumberInput);

export const form_number_input = {
  /**Creates a dropdown form element */
  from<ID extends string | undefined>(
    options?: FormNumberWriteOptions<ID>
  ): FormNumberInput<ID> {
    const input = new FormNumberInput<ID>(options?.id);
    if (options) {
      FormNumberWrite.apply_options(input, options);
    }
    return input;
  },
};
