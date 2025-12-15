import { define_element } from "@libBase";
import { material_editor_drag_handle_rounded } from "@libIcons";
import { Err, type Result } from "@libResult";
import { string_byte_length, string_byte_limit } from "@libString";
import { set_cursor_end } from "../../../common/selection";
import { FormValueWrite, type FormValueOptions } from "../../base";
import "./textMultiLine.scss";

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

class FormTextMultiline<ID extends string | undefined> extends FormValueWrite<
  string,
  ID
> {
  static element_name() {
    return "textmultiline";
  }
  static element_name_space(): string {
    return "form";
  }
  #max_length?: number;
  #max_bytes?: number;
  #value_box: HTMLTextAreaElement = this._body.appendChild(
    document.createElement("textarea")
  );
  #resizer: HTMLDivElement = this._body.appendChild(
    document.createElement("div")
  );

  constructor(id?: ID) {
    super(id);
    this._body.appendChild(this.warn_input);
    this.#resizer.appendChild(material_editor_drag_handle_rounded());
    this.#resizer.onpointerdown = (e) => {
      this.#resizer.setPointerCapture(e.pointerId);

      this.#resizer.onpointermove = (ev) => {
        const new_height =
          ev.clientY -
          this.#value_box.getBoundingClientRect().top -
          8; /* 8 for padding */
        this.#value_box.style.height = `${new_height}px`;
      };
      this.#resizer.onpointerup = (_ev) => {
        this.#resizer.releasePointerCapture(e.pointerId);
        this.#resizer.onpointermove = null;
        this.#resizer.onpointerup = null;
      };
    };
    this.#value_box.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.stopPropagation();
      }
    };
    this.#value_box.onchange = () => this.#set();
    this.#value_box.onbeforeinput = (e) => {
      this.warn("");
      const data = e.data || e.dataTransfer?.getData("text/plain");
      if (data) {
        if (
          this.#max_length &&
          this.#value_box.value.length + data.length > this.#max_length
        ) {
          e.preventDefault();
          this.warn(`A maximum of ${this.#max_length} characters is allowed`);
        }
        if (
          this.#max_bytes &&
          string_byte_length(this.#value_box.value) + string_byte_length(data) >
            this.#max_bytes
        ) {
          e.preventDefault();
          this.warn(`A maximum of ${this.#max_bytes} bytes is allowed`);
        }
      }
    };
  }

  #set() {
    const buff = this.buffer;
    this.set_value_check(this.#value_box.value || "").map_err(() => {
      this.new_value(buff || "");
      set_cursor_end(this.#value_box);
    });
  }

  set placeholder(val: string) {
    this.#value_box.placeholder = val;
  }
  get placeholder(): string {
    return this.#value_box.placeholder;
  }

  set max_length(val: number | undefined) {
    this.#max_length = val;
    this.#value_box.maxLength = val ?? -1;
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
    this.#value_box.value = val;
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
define_element(FormTextMultiline);

export const form_text_multiline = {
  /**Creates a multi line text input form element */
  from<ID extends string | undefined>(
    options?: FormTextInputOptions<ID>
  ): FormTextMultiline<ID> {
    const input = new FormTextMultiline<ID>(options?.id);
    if (options) {
      if (options.placeholder) input.placeholder = options.placeholder;
      if (options.max_length) input.max_length = options.max_length;
      if (options.max_bytes) input.max_bytes = options.max_bytes;
      FormValueWrite.apply_options(input, options);
    }
    return input;
  },
};
