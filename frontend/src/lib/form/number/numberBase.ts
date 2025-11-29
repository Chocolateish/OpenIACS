import { Value, ValueLimited, ValueLimitedNumber } from "@chocolatelib/value";
import { FormBaseRead, FormValueOptions } from "../base";
import "./numberBase.scss";

export interface NumberBaseOptions extends FormValueOptions<number> {
  /**Lower limit for slider value*/
  min?: number;
  /**Upper limit for slider value*/
  max?: number;
  /**Step size, use 0 for automatic step size*/
  step?: number | ((value: number) => number);
  /**Amount of decimals to show*/
  decimals?: number;
  /**Unit to use for slider*/
  unit?: string | Value<string>;
}

/**Base for number elements elements*/
export abstract class NumberBase extends FormBaseRead<number> {
  /**Minimum and maximum value for element */
  protected _min: number = -Infinity;
  protected _max: number = Infinity;
  protected _span: number = Infinity;
  protected _minUsr: number = -Infinity;
  protected _maxUsr: number = Infinity;
  protected _minVal: number = -Infinity;
  protected _maxVal: number = Infinity;
  protected _minLegend: HTMLSpanElement = document.createElement("span");
  protected _maxLegend: HTMLSpanElement = document.createElement("span");
  /**Precision of input*/
  protected _step: number = 0;
  protected _stepFunc: ((value: number) => number) | undefined;
  protected _decimals: number = 0;
  /**Unit of input*/
  protected _unit: HTMLSpanElement = document.createElement("span");
  private _unitListener: ((value: string) => void) | undefined;
  /**Element used to display validation warnings*/
  protected _validator: HTMLButtonElement = document.createElement("button");

  constructor() {
    super();
    this._body.appendChild(this._validator);
  }

  /**Sets options for the element*/
  options(options: NumberBaseOptions) {
    this.step = options.step;
    this.decimals = options.decimals;
    this.min = options.min;
    this.max = options.max;
    super.options(options);
    if (options.unit) {
      this.unit = options.unit;
    }
    return this;
  }

  /**Gets the minimum value on the element*/
  get min() {
    return this._minUsr;
  }
  /**Set the minimum value*/
  set min(min: number | undefined) {
    if (typeof min === "number") {
      this._minUsr = min;
    } else {
      this._minUsr = -Infinity;
    }
    this._updateMinMax();
  }

  /**Gets the maximum value on the element*/
  get max() {
    return this._maxUsr;
  }
  /**Set the minimum value*/
  set max(max: number | undefined) {
    if (typeof max === "number") {
      this._maxUsr = max;
    } else {
      this._maxUsr = Infinity;
    }
    this._updateMinMax();
  }

  protected _updateMinMax() {
    this._min = Math.max(this._minUsr, this._minVal);
    if (String(this._min).length > 5) {
      this._minLegend.textContent =
        this._min === -Infinity ? "" : "Min:" + this._min.toPrecision(5);
    } else {
      this._minLegend.textContent =
        this._min === -Infinity
          ? ""
          : "Min:" + this._min.toFixed(this.decimals);
    }
    this._max = Math.min(this._maxUsr, this._maxVal);
    if (String(this._max).length > 5) {
      this._maxLegend.textContent =
        this._max === Infinity ? "" : "Max:" + this._max.toPrecision(5);
    } else {
      this._maxLegend.textContent =
        this._max === Infinity ? "" : "Max:" + this._max.toFixed(this.decimals);
    }
    this._span = this._max - this._min;
  }

  /**Gets the amount of steps on the slider*/
  get step() {
    return this._step;
  }
  /**Sets the amount of steps on the slider*/
  set step(step: number | undefined | ((value: number) => number)) {
    if (typeof step === "function") {
      this._stepFunc = step;
    } else {
      this._stepFunc = undefined;
      this._step = step ?? 0;
    }
  }

  /**Gets the amount of decimals the element can have*/
  get decimals() {
    return this._decimals;
  }
  /**Sets the amount of decimals the element can have*/
  set decimals(dec: number | undefined) {
    this._decimals = Math.max(dec ?? 0, 0);
  }

  /**Returns the current unit value*/
  get unit(): string {
    return this._unit.textContent ?? "";
  }

  /**Sets the unit of the element*/
  set unit(unit: string | Value<string> | undefined) {
    if (this._unitListener) {
      this.dettachValue(this._unitListener);
      delete this._unitListener;
    }
    if (typeof unit === "object" && unit instanceof Value) {
      this._unitListener = this.attachValue(unit, (val) => {
        this._setUnit(val);
      });
    } else {
      this._setUnit(unit);
    }
  }
  /**Method for ancestors to overwrite */
  protected _setUnit(unit: string | undefined) {
    this._unit.textContent = unit ?? "";
  }
  /**Called when Value is changed */
  protected _ValueUpdate(value: Value<number>) {
    if (value instanceof ValueLimitedNumber) {
      this._minVal = value.min;
      this._maxVal = value.max;
      this._updateMinMax();
    }
  }
  /**Called when the form element is set to not use a Value anymore*/
  protected _ValueClear() {
    this._minVal = -Infinity;
    this._maxVal = Infinity;
    this._updateMinMax();
  }

  /**Validates given value then sets it*/
  protected _setValueValidate(val: number, warn: boolean): boolean | void {
    if (this._Value && this._Value instanceof ValueLimited) {
      let { allowed, reason, correction } = this._Value.checkLimitReason(val);
      if (!allowed) {
        this._warnValidator(reason, warn);
        if (typeof correction !== "undefined") {
          if (correction === this._value) {
            this._valueUpdate(this._value || 0);
          } else {
            this._valueSet(correction);
          }
        } else {
          this._valueUpdate(this._value || 0);
        }
        return true;
      }
    }
    if (val < this._min) {
      this._warnValidator(
        "Minimum value is " + this._min.toFixed(this._decimals),
        warn
      );
      this._valueSet(this._min);
      return true;
    }
    if (val > this._max) {
      this._warnValidator(
        "Maximum value is " + this._max.toFixed(this._decimals),
        warn
      );
      this._valueSet(this._max);
      return true;
    }
    this._warnValidator("", true);
    this._valueSet(val);
  }

  /**Displays warning for value validation*/
  private _warnValidator(warning: string, warn: boolean) {
    if (warn) {
      this._validator.setCustomValidity(warning);
      this._validator.reportValidity();
    }
  }

  /**Method for ancestors to overwrite */
  protected _valueApplyPrecision(value: number) {
    value = Number(value.toFixed(this._decimals));
    if (this._step !== 0) {
      let modBuff = value % this._step;
      return modBuff >= this._step / 2
        ? value + this._step - modBuff
        : value - modBuff;
    } else {
      return value;
    }
  }
}
