import "./inputBase.scss";
import { FormBaseRead } from "../base";
import { Value } from "@chocolatelib/value";

/**Base for number elements elements*/
export abstract class InputBase<T> extends FormBaseRead<T> {
  protected _input: HTMLInputElement = this._body.appendChild(
    document.createElement("input")
  );

  /**Called when value is changed */
  protected _valueUpdate(value: T) {
    value;
  }
  /**Called when value cleared */
  protected _valueClear() {}

  /**Called when Value is changed */
  protected _ValueUpdate(value: Value<T>) {
    value;
  }
  /**Called when the form element is set to not use a Value anymore*/
  protected _ValueClear() {}
}
