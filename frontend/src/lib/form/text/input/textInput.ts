import { define_element } from "@libBase";
import { Err, type Result } from "@libResult";
import { string_byte_length, string_byte_limit } from "@libString";
import { set_cursor_end } from "../../../common/selection";
import { FormValueWrite, type FormValueOptions } from "../../base";
import "./textInput.scss";

export interface FormTextInputOptions<
  ID extends string | undefined,
  RT = string
> extends FormValueOptions<RT, ID> {
  /**Placeholder text when input is empty */
  placeholder?: string;
  /**Maximum length of the input */
  max_length?: number;
  /**Maximum bytes of the input */
  max_bytes?: number;
  /**Allowed characters for the text input */
  filter?: RegExp;
}

class FormTextInput<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "textinput";
  }
  static element_name_space(): string {
    return "form";
  }

  #filter?: RegExp;
  #max_length?: number;
  #max_bytes?: number;

  constructor(id?: ID) {
    super(id);
    this.warn_input.type = "text";
    this._body.appendChild(this.warn_input);
    this.warn_input.onchange = () => this.#set();
    this._body.onbeforeinput = (e) => {
      this.warn("");
      const data = e.data || e.dataTransfer?.getData("text/plain");
      if (data) {
        if (this.#filter && !this.#filter.test(data)) {
          e.preventDefault();
          this.warn("Invalid character entered");
        } else {
          if (
            this.#max_length &&
            this.warn_input.value.length + data.length > this.#max_length
          ) {
            e.preventDefault();
            this.warn(`A maximum of ${this.#max_length} characters is allowed`);
          }
          if (
            this.#max_bytes &&
            string_byte_length(this.warn_input.value) +
              string_byte_length(data) >
              this.#max_bytes
          ) {
            e.preventDefault();
            this.warn(`A maximum of ${this.#max_bytes} bytes is allowed`);
          }
        }
      }
    };
    this._body.onkeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (this.buffer) this.new_value(this.buffer);
        else this.clear_value();
      }
    };
  }

  #set() {
    const buff = this.buffer;
    this.set_value_check(this.warn_input.value || "").map_err(() => {
      this.new_value(buff || "");
      set_cursor_end(this.warn_input);
    });
  }

  set filter(val: RegExp | undefined) {
    this.#filter = val;
  }
  get filter(): RegExp | undefined {
    return this.#filter;
  }

  set placeholder(val: string) {
    this.warn_input.placeholder = val;
  }
  get placeholder(): string {
    return this.warn_input.placeholder;
  }

  set max_length(val: number | undefined) {
    this.#max_length = val;
    this.warn_input.maxLength = val ?? -1;
  }
  get max_length(): number | undefined {
    return this.#max_length;
  }

  set max_bytes(val: number | undefined) {
    this.#max_bytes = val;
  }
  get max_bytes(): number | undefined {
    return this.#max_bytes;
  }

  protected new_value(val: string): void {
    this.warn_input.value = val;
  }

  protected clear_value(): void {
    this.warn_input.value = "";
  }

  protected new_error(_val: string): void {}

  protected limit_value(val: string): Result<string, string> {
    if (this.#max_length && val.length > this.#max_length)
      val = val.slice(0, this.#max_length);
    if (this.#max_bytes) val = string_byte_limit(val, this.#max_bytes);
    return super.limit_value(val);
  }

  protected check_value(val: string): Result<string, string> {
    if (this.#max_length && val.length > this.#max_length)
      return Err(`A maximum of ${this.#max_length} characters is allowed`);
    if (this.#max_bytes && string_byte_length(val) > this.#max_bytes)
      return Err(`A maximum of ${this.#max_bytes} bytes is allowed`);
    return super.check_value(val);
  }
}
define_element(FormTextInput);

export const form_text_input = {
  /**Creates a single line text input form element */
  from<ID extends string | undefined>(
    options?: FormTextInputOptions<ID>
  ): FormTextInput<ID> {
    const input = new FormTextInput<ID>(options?.id);
    if (options) {
      if (options.filter) input.filter = options.filter;
      if (options.placeholder) input.placeholder = options.placeholder;
      if (options.max_length) input.max_length = options.max_length;
      if (options.max_bytes) input.max_bytes = options.max_bytes;
      FormValueWrite.apply_options(input, options);
    }
    return input;
  },
};
