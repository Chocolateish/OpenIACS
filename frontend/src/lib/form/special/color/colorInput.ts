import { define_element } from "@libBase";
import { FormValueWrite, type FormValueOptions } from "../../base";
import "./colorInput.scss";

export interface FormColorInputOptions<
  ID extends string | undefined,
  RT = string
> extends FormValueOptions<RT, ID> {
  /**Whether the color input should update live*/
  live?: boolean;
}

class FormColorInput<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "colorinput";
  }
  static element_name_space(): string {
    return "form";
  }

  #live: boolean = false;

  constructor(id?: ID) {
    super(id);
    this._body.appendChild(this.warn_input);
    this.warn_input.type = "color";
    this.warn_input.oninput = () => {
      if (this.#live) this.set_value_check(this.warn_input.value);
    };
    this.warn_input.onchange = () => {
      if (!this.#live) this.set_value_check(this.warn_input.value);
    };
  }

  set live(val: boolean) {
    this.#live = val;
  }
  get live(): boolean {
    return this.#live;
  }

  protected new_value(val: string): void {
    this.warn_input.value = val;
  }

  protected clear_value(): void {
    this.warn_input.value = "#000000";
  }

  protected new_error(_val: string): void {}
}
define_element(FormColorInput);

/**Creates a color input form element */
export function form_color_input<ID extends string | undefined>(
  options?: FormColorInputOptions<ID, string>
): FormColorInput<ID> {
  const input = new FormColorInput<ID>(options?.id);
  if (options) {
    if (options.live) input.live = options.live;
    FormValueWrite.apply_options(input, options);
  }
  return input;
}
