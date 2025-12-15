import { define_element } from "@libBase";
import { FormValueWrite } from "../../base";
import "./phoneInput.scss";

/**Color selector*/
export class PhoneInput<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "phoneinput";
  }
  static element_name_space(): string {
    return "form";
  }

  constructor(id?: ID) {
    super(id);
    this._body.appendChild(this.warn_input);
    this.warn_input.type = "tel";
    this.warn_input.pattern = "[0-9]{3}-[0-9]{2}-[0-9]{3}";
  }

  protected new_value(val: string): void {
    this.warn_input.value = val;
  }

  protected new_error(_val: string): void {}
}
define_element(PhoneInput);
