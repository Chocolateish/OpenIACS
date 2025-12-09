import { define_element } from "@libBase";
import { FormValueWrite } from "../../base";
import "./textInput.scss";

/**Color selector*/
export class TextInput extends FormValueWrite<string> {
  /**Returns the name used to define the element*/
  static elementName() {
    return "textinput";
  }

  constructor(id: string | undefined) {
    super(id);
    this._input.type = "url";
  }

  protected new_value(val: string): void {}

  protected new_error(_val: string): void {}
}
define_element(TextInput);
