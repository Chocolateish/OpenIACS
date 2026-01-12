import { Base, define_element } from "@libBase";
import { some } from "@libResult";
import state from "@libState";
import "./add_row.scss";
import type { ListAddRowOptions } from "./types";

export class ListAddRow extends Base {
  static element_name() {
    return "addrow";
  }
  static element_name_space(): string {
    return "list";
  }

  #button: HTMLSpanElement;

  constructor() {
    super();
    this.appendChild(document.createElement("div"));
    this.#button = this.appendChild(document.createElement("span"));
    this.#button.tabIndex = 0;
  }

  set options(options: ListAddRowOptions) {
    this.#button.onclick = options.on_add;

    if (state.is(options.text))
      this.attach_state_to_prop("text", options.text, (e) => some(e));
    else this.text = options.text;
    if (state.is(options.disabled))
      this.attach_state_to_prop("disabled", options.disabled, () =>
        some(false)
      );
    else if (options.disabled) this.disabled = options.disabled;
  }

  set text(value: string) {
    this.#button.innerHTML = value;
  }

  set disabled(value: boolean) {
    if (value) this.#button.setAttribute("disabled", "true");
    else this.#button.removeAttribute("disabled");
  }
}
define_element(ListAddRow);
