import { define_element } from "@libBase";
import { FormValueWrite } from "../../base";
import "./urlInput.scss";

/**Color selector*/
export class URLInput<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "urlinput";
  }
  static element_name_space(): string {
    return "form";
  }

  constructor(id?: ID) {
    super(id);
    this._body.appendChild(this.warn_input);
    this.warn_input.type = "url";
    this.warn_input.onchange = () => {
      this.set_value_check(this.warn_input.value);
    };
  }

  protected new_value(val: string): void {
    this.warn_input.value = val;
  }

  protected new_error(_val: string): void {}
}
define_element(URLInput);
