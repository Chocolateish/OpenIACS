import { Base, define_element } from "@libBase";
import "./field.scss";

export abstract class ListField extends Base {
  static element_name() {
    return "@abstract@";
  }
  static element_name_space() {
    return "list";
  }

  constructor() {
    super();
  }
}

export class ListTextField extends ListField {
  static element_name() {
    return "textfield";
  }

  constructor(text?: string) {
    super();
    if (text) this.innerHTML = text;
  }

  set text(value: string) {
    this.innerHTML = value;
  }

  get text(): string {
    return this.innerHTML;
  }
}
define_element(ListTextField);

export function text_field(text?: string) {
  return new ListTextField(text);
}
