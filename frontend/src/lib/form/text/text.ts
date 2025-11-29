import "./text.scss";
import { defineElement } from "@chocolatelibui/core";
import { FormBaseRead } from "../base";
import { Value } from "@chocolatelib/value";

/**Component for simple text */
export class TextField extends FormBaseRead<string> {
  /**Returns the name used to define the element*/
  static elementName() {
    return "text";
  }

  constructor() {
    super();
    this.appendChild(this._label);
  }

  /**Called when Value is changed */
  protected _ValueUpdate(value: Value<string>) {
    value;
  }
  /**Called when the form element is set to not use a Value anymore*/
  protected _ValueClear() {}
  /**Called when value is changed */
  protected _valueUpdate(value: string) {
    value;
  }
  /**Called when value cleared */
  protected _valueClear() {}
}
defineElement(TextField);

/**Element for form titles */
export class TitleField extends FormBaseRead<string> {
  /**Returns the name used to define the element*/
  static elementName() {
    return "title";
  }

  constructor() {
    super();
    this.appendChild(this._label);
  }

  /**Called when Value is changed */
  protected _ValueUpdate(value: Value<string>) {
    value;
  }
  /**Called when the form element is set to not use a Value anymore*/
  protected _ValueClear() {}
  /**Called when value is changed */
  protected _valueUpdate(value: string) {
    value;
  }
  /**Called when value cleared */
  protected _valueClear() {}
}
defineElement(TitleField);
