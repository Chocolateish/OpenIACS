import { defineElement } from "@chocolatelibui/core";
import {
  material_action_calendar_month_rounded,
  material_action_schedule_rounded,
} from "@chocolatelibui/icons";
import { FormValueOptions } from "../../base";
import { InputBase } from "../inputBase";
import "./dateTimeInput.scss";

export interface DateTimeInputOptions<T> extends FormValueOptions<T> {
  /**Type of date time*/
  type?: DateTimeType;
  mode?: DateTimeMode;
}

export const enum DateTimeType {
  DATE = "date",
  TIME = "time",
  DATETIME = "datetime",
}

export const enum DateTimeMode {
  DATE = "date",
  STRING = "string",
  NUMBER = "number",
}

/**Date Input*/
export class DateTimeInput<
  T extends Date | string | number
> extends InputBase<T> {
  private _type: DateTimeType = DateTimeType.DATETIME;
  private _mode: DateTimeMode = DateTimeMode.DATE;

  /**Returns the name used to define the element*/
  static elementName() {
    return "datetime";
  }

  constructor() {
    super();
    this._input.type = "datetime-local";
    this._input.step = "1";
    this._body.appendChild(material_action_calendar_month_rounded()).onclick =
      () => {
        this._input.showPicker();
      };
    this._body.appendChild(material_action_schedule_rounded()).onclick = () => {
      this._input.showPicker();
    };
    this._input.onchange = () => {
      if (this._input.value) {
        switch (this._mode) {
          case DateTimeMode.DATE:
            this._valueSet(<any>new Date(this._input.valueAsNumber));
            break;
          case DateTimeMode.STRING:
            this._valueSet(<any>this._input.value);
            break;
          case DateTimeMode.NUMBER:
            this._valueSet(<any>this._input.valueAsNumber);
            break;
        }
      }
    };
  }

  /**Called when value is changed */
  protected _valueUpdate(value: T) {
    let time: number;
    switch (typeof value) {
      case "number":
        time = value;
        break;
      case "string":
        time = new Date(value).getTime();
        break;
      case "object":
        time = value.getTime();
        break;
    }
    switch (this._type) {
      case DateTimeType.DATE:
        this._input.valueAsNumber = time;
        break;
      case DateTimeType.TIME:
        this._input.valueAsNumber = time;
        break;
      case DateTimeType.DATETIME:
        this._input.valueAsNumber = time;
        break;
    }
  }

  /**Called when value cleared */
  protected _valueClear() {
    this._input.value = "";
  }

  /**Sets options for the element*/
  options(options: DateTimeInputOptions<T>) {
    if (options.type) {
      this.type = options.type;
    }
    super.options(options);
    if (options.mode) {
      this.mode = options.mode;
    }
    return this;
  }

  /**Returns the date time type*/
  get type() {
    return this._type;
  }

  /**Sets the date time type*/
  set type(type: DateTimeType) {
    switch (type) {
      case DateTimeType.DATE:
        this._input.type = "date";
        break;
      case DateTimeType.TIME:
        this._input.type = "time";
        break;
      case DateTimeType.DATETIME:
        this._input.type = "datetime-local";
        break;
    }

    this._type = type;
  }

  /**Returns the date time type*/
  get mode() {
    return this._mode;
  }
  /**Sets the date time type*/
  set mode(mode: DateTimeMode) {
    this._mode = mode;
  }

  /**Returns the date time type*/
  get step() {
    return Number(this._input.step);
  }
  /**Sets the date time type*/
  set step(step: number) {
    this._input.step = String(step);
  }

  /**Returns the date time type*/
  get min() {
    return Number(this._input.min);
  }
  /**Sets the date time type*/
  set min(min: number) {
    this._input.min = String(min);
  }

  /**Returns the date time type*/
  get max() {
    return Number(this._input.max);
  }
  /**Sets the date time type*/
  set max(max: number) {
    this._input.max = String(max);
  }
}
defineElement(DateTimeInput);
