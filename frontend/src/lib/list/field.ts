import { Base, define_element } from "@libBase";
import "./field.scss";

export abstract class ListField<T> extends Base {
  static element_name() {
    return "@abstract@";
  }
  static element_name_space() {
    return "list";
  }

  constructor() {
    super();
  }

  abstract set data(value: T);
}

export class ListTextField extends ListField<string> {
  static element_name() {
    return "textfield";
  }

  set data(value: string) {
    this.innerHTML = value;
  }
}
define_element(ListTextField);

export function text_field() {
  return new ListTextField();
}
