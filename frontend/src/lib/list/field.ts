import { Base, define_element } from "@libBase";

export abstract class Field extends Base {
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

export class TextField extends Field {
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
define_element(TextField);

export function text_field(text?: string) {
  return new TextField(text);
}
