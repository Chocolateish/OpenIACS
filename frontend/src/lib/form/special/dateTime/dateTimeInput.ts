import { define_element } from "@libBase";
import {
  material_action_calendar_month_rounded,
  material_action_schedule_rounded,
} from "@libIcons";
import { FormValueWrite, type FormValueOptions } from "../../base";
import "./dateTimeInput.scss";

export interface DateTimeInputOptions<RT, ID extends string | undefined>
  extends FormValueOptions<RT, ID> {
  /**Type of date time*/
  type?: FormDateTimeType;
}

export const FormDateTimeType = {
  DATE: "date",
  TIME: "time",
  DATETIME: "datetime",
} as const;
export type FormDateTimeType =
  (typeof FormDateTimeType)[keyof typeof FormDateTimeType];

const DateTimeMode = {
  DATE: "date",
  STRING: "string",
  NUMBER: "number",
} as const;

class FormDateTimeInput<
  RT extends Date | string | number,
  ID extends string | undefined
> extends FormValueWrite<RT, ID> {
  static element_name() {
    return "datetimeinput";
  }
  static element_name_space(): string {
    return "form";
  }

  #type: FormDateTimeType = FormDateTimeType.DATETIME;
  #mode: string = DateTimeMode.DATE;

  constructor(id?: ID) {
    super(id);
    this.warn_input.type = "datetime-local";
    this.warn_input.lang = "da-DK";
    this.warn_input.step = "0.1";
    this._body.appendChild(this.warn_input);
    this._body.appendChild(material_action_calendar_month_rounded()).onclick =
      () => this.warn_input.showPicker();
    this._body.appendChild(material_action_schedule_rounded()).onclick = () =>
      this.warn_input.showPicker();
    this.warn_input.onchange = () => {
      if (this.warn_input.value) {
        if (this.#mode === DateTimeMode.DATE)
          this.set_value_check(new Date(this.warn_input.valueAsNumber) as RT);
        else if (this.#mode === DateTimeMode.STRING)
          this.set_value_check(this.warn_input.value as RT);
        else if (this.#mode === DateTimeMode.NUMBER)
          this.set_value_check(this.warn_input.valueAsNumber as RT);
      }
    };
  }

  /**Returns the date time type*/
  get type() {
    return this.#type;
  }

  /**Sets the date time type*/
  set type(type: FormDateTimeType) {
    if (type === FormDateTimeType.DATE) this.warn_input.type = "date";
    if (type === FormDateTimeType.TIME) this.warn_input.type = "time";
    if (type === FormDateTimeType.DATETIME)
      this.warn_input.type = "datetime-local";
    this.#type = type;
  }

  /**Returns the date time type*/
  get step() {
    return Number(this.warn_input.step);
  }
  /**Sets the date time type*/
  set step(step: number) {
    this.warn_input.step = String(step);
  }

  protected new_value(value: RT): void {
    if (!this.#mode) {
      if (typeof value === "number") this.#mode = DateTimeMode.NUMBER;
      else if (typeof value === "string") this.#mode = DateTimeMode.STRING;
      else this.#mode = DateTimeMode.DATE;
    }
    let time: number;
    if (typeof value === "number") time = value;
    else if (typeof value === "string") time = new Date(value).getTime();
    else time = value.getTime();
    this.warn_input.valueAsNumber = time;
  }

  protected new_error(_val: string): void {}

  protected clear_value(): void {
    this.warn_input.value = "";
  }
}
define_element(FormDateTimeInput);

export const form_date_time_input = {
  /**Creates a color input form element */
  from<RT extends Date | string | number, ID extends string | undefined>(
    options?: DateTimeInputOptions<RT, ID>
  ): FormDateTimeInput<RT, ID> {
    const input = new FormDateTimeInput<RT, ID>(options?.id);
    if (options) {
      if (options.type) input.type = options.type;
      FormValueWrite.apply_options(input, options);
    }
    return input;
  },
};
