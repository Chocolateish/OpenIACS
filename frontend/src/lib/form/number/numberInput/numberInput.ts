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

  private _valueBox: HTMLSpanElement;
  private _legend: HTMLSpanElement;

  constructor(id: ID) {
    super(id);
    this._valueBox = this._body.appendChild(document.createElement("span"));
    this._valueBox.contentEditable = "true";
    this._body.appendChild(this._unit);
    this._legend = this._body.appendChild(document.createElement("span"));
    this._legend.append(this._minLegend, this._maxLegend);
    this._valueBox.onfocus = () => {
      if (this._valueBox.textContent === NoValueText) {
        this._valueBox.textContent = "";
      }
    };
    this._valueBox.onblur = async () => {
      setTimeout(() => {
        this._setValueValidate(
          parseFloat(this._valueBox.textContent?.replace(",", ".") || "") || 0,
          true
        );
      }, 0);
    };
    this._body.onclick = () => {
      this._valueBox.focus();
    };
    this._body.onkeydown = (e) => {
      if (e.key === "Enter") {
        this._valueBox.blur();
      }
    };
    this._body.onbeforeinput = (e) => {
      switch (e.inputType) {
        case "insertParagraph":
          e.preventDefault();
          break;
      }
      if (e.data) {
        if (!/[\d,.-]/g.test(e.data)) {
          e.preventDefault();
        } else if (/[,.]/g.test(e.data) && this._decimals === 0) {
          e.preventDefault();
        } else if (this._minUsr >= 0 && /-/g.test(e.data)) {
          e.preventDefault();
        }
      }
    };
  }

  /**Called when value is changed */
  protected _valueUpdate(value: number) {
    this._valueBox.textContent = value.toFixed(this._decimals);
  }
}
define_element(FormNumberInput);

export const form_number_input = {
  /**Creates a dropdown form element */
  from<ID extends string | undefined>(
    options?: FormNumberWriteOptions<ID>
  ): FormNumberInput<ID> {
    const slide = new FormNumberInput(options?.id);
    if (options) {
      FormNumberWrite.apply_options(slide, options);
    }
    return slide;
  },
};
