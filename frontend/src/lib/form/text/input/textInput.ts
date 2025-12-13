import { define_element } from "@libBase";
import type { Result } from "@libResult";
import {
  get_cursor_position,
  set_cursor_end,
  set_cursor_position,
} from "../../../common/selection";
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

  #placeholder: string = "";
  #max_length?: number;
  #max_bytes?: number;
  #value_box = this._body.appendChild(document.createElement("span"));

  constructor(id?: ID) {
    super(id);
    this._body.appendChild(this.warn_input);
    this.#value_box.contentEditable = "true";
    this.#value_box.onblur = () => {
      setTimeout(() => {
        this.#set(false);
      }, 0);
    };
    this._body.onkeydown = (e) => {
      if (e.key === "Enter") this.#set(true);
    };
    // this._body.onbeforeinput = (e) => {
    //   if (e.inputType === "insertParagraph") e.preventDefault();
    //   if (e.data) {
    //     if (!/[\d,.-]/g.test(e.data)) e.preventDefault();
    //     else if (/[,.]/g.test(e.data) && this.#decimals === 0)
    //       e.preventDefault();
    //     else if (this.#min >= 0 && /-/g.test(e.data)) e.preventDefault();
    //   }
    // };
  }

  #set(cur: boolean) {
    const sel = get_cursor_position(this.#value_box);
    const buff = this.buffer;
    this.set_value_check(this.#value_box.textContent || "")
      .map_err(() => {
        this.new_value(buff || "");
        set_cursor_end(this.#value_box);
      })
      .map(() => {
        if (!cur) return;
        set_cursor_position(this.#value_box, sel);
      });
  }

  get placeholder(): string {
    return this.#placeholder;
  }
  set placeholder(val: string) {
    this.#placeholder = val;
    this.#value_box.setAttribute("data-placeholder", val);
  }

  get max_length(): number | undefined {
    return this.#max_length;
  }
  set max_length(val: number | undefined) {
    this.#max_length = val;
  }

  get max_bytes(): number | undefined {
    return this.#max_bytes;
  }
  set max_bytes(val: number | undefined) {
    this.#max_bytes = val;
  }

  protected new_value(val: string): void {
    this.#value_box.textContent = val;
  }

  protected new_error(_val: string): void {}

  protected limit_value(val: string): Result<string, string> {
    return super.limit_value(val);
  }

  protected check_value(val: string): Result<string, string> {
    // if (val < this.#min)
    //   return Err(
    //     "Minimum value " + this.#min.toFixed(this.#decimals) + this.#unit
    //   );
    // if (val > this.#max)
    //   return Err(
    //     "Maximum value " + this.#max.toFixed(this.#decimals) + this.#unit
    //   );
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
      if (options.placeholder) input.placeholder = options.placeholder;
      if (options.max_length) input.max_length = options.max_length;
      if (options.max_bytes) input.max_bytes = options.max_bytes;

      FormValueWrite.apply_options(input, options);
    }
    return input;
  },
};
