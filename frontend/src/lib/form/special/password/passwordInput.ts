import { define_element } from "@libBase";
import { FormValue, FormValueWrite, type FormValueOptions } from "../../base";
import "./passwordInput.scss";

export interface FormPasswordInputOptions<ID extends string | undefined>
  extends FormValueOptions<string, ID> {
  /**Allowed characters for the password input */
  filter?: RegExp;
}

class FormPasswordInput<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "passwordinput";
  }
  static element_name_space(): string {
    return "form";
  }

  #filter?: RegExp;

  constructor(id?: ID) {
    super(id);
    this._body.appendChild(this.warn_input);
    this.warn_input.type = "password";
    this.warn_input.onchange = () => {
      this.set_value_check(this.warn_input.value);
    };
    this.warn_input.onbeforeinput = (ev) => {
      if (ev.data) {
        if (this.#filter && !this.#filter.test(ev.data)) ev.preventDefault();
      }
    };
  }

  set filter(val: RegExp | undefined) {
    this.#filter = val;
  }

  protected new_value(val: string): void {
    this.warn_input.value = val;
  }

  protected clear_value(): void {
    this.warn_input.value = "";
  }

  protected new_error(_val: string): void {}
}
define_element(FormPasswordInput);

export const form_password_input = {
  /**Creates a dropdown form element */
  from<ID extends string | undefined>(
    options?: FormPasswordInputOptions<ID>
  ): FormPasswordInput<ID> {
    const input = new FormPasswordInput<ID>(options?.id);
    if (options) {
      if (options.filter) input.filter = options.filter;
      FormValue.apply_options(input, options);
    }
    return input;
  },
};
