import type { SVGFunc } from "@libSVG";
import { FormValueWrite, type FormValueOptions } from "../base";
import "./numberBase.scss";

export interface FormNumberOptions<RT = number> extends FormValueOptions<RT> {
  /**Lower limit for slider value*/
  min?: number;
  /**Upper limit for slider value*/
  max?: number;
  /**Amount of decimals to show*/
  decimals?: number;
  /**Unit to use for slider*/
  unit?: string;
}

export interface FormNumberWriteOptions<RT = number>
  extends FormNumberOptions<RT> {
  /**Step size, use 0 for automatic step size*/
  step?: number;
  /**Start for step, use 0 for automatic */
  start?: number;
}

export interface StepperBaseOptions<RT = number>
  extends FormNumberWriteOptions<RT> {
  /**wether the events are live as the slider is moved or only when moving stops */
  live?: boolean;
  /**Icon to use for decreasing value*/
  icon_decrease?: SVGFunc;
  /**Icon to use for increasing value*/
  icon_increase?: SVGFunc;
}

export abstract class FormNumberWrite<RT = number> extends FormValueWrite<RT> {
  static apply_options<RT>(
    element: FormNumberWrite<RT>,
    options: FormNumberWriteOptions<RT>
  ) {
    if (options.decimals) element.decimals = options.decimals;
    if (options.min !== undefined) element.min = options.min;
    if (options.max !== undefined) element.max = options.max;
    if (options.step) element.step = options.step;
    if (options.start) element.start = options.start;
    if (options.unit) element.unit = options.unit;
    super.apply_options(element, options);
  }

  /**Set the minimum value*/
  abstract set min(min: number | undefined);

  /**Set the minimum value*/
  abstract set max(max: number | undefined);

  /**Sets the size of number change steps*/
  abstract set step(step: number | undefined);

  /**Sets the start offset for number steps*/
  abstract set start(step: number | undefined);

  /**Sets the amount of decimals the element can have*/
  abstract set decimals(dec: number | undefined);

  /**Sets the unit of the element*/
  abstract set unit(unit: string | undefined);

  protected _update_min_max() {
    // this._min = Math.max(this._minUsr, this._minVal);
    // if (String(this._min).length > 5) {
    //   this._minLegend.textContent =
    //     this._min === -Infinity ? "" : "Min:" + this._min.toPrecision(5);
    // } else {
    //   this._minLegend.textContent =
    //     this._min === -Infinity
    //       ? ""
    //       : "Min:" + this._min.toFixed(this.decimals);
    // }
    // this._max = Math.min(this._maxUsr, this._maxVal);
    // if (String(this._max).length > 5) {
    //   this._maxLegend.textContent =
    //     this._max === Infinity ? "" : "Max:" + this._max.toPrecision(5);
    // } else {
    //   this._maxLegend.textContent =
    //     this._max === Infinity ? "" : "Max:" + this._max.toFixed(this.decimals);
    // }
    // this._span = this._max - this._min;
  }

  /**Validates given value then sets it*/
  protected _set_value_validate(val: RT, warn: boolean): boolean | void {
    // if (this._Value && this._Value instanceof ValueLimited) {
    //   let { allowed, reason, correction } = this._Value.checkLimitReason(val);
    //   if (!allowed) {
    //     this._warnValidator(reason, warn);
    //     if (typeof correction !== "undefined") {
    //       if (correction === this._value) {
    //         this._valueUpdate(this._value || 0);
    //       } else {
    //         this.set_value(correction);
    //       }
    //     } else {
    //       this._valueUpdate(this._value || 0);
    //     }
    //     return true;
    //   }
    // }
    // if (val < this._min) {
    //   this._warnValidator(
    //     "Minimum value is " + this._min.toFixed(this._decimals),
    //     warn
    //   );
    //   this.set_value(this._min);
    //   return true;
    // }
    // if (val > this._max) {
    //   this._warnValidator(
    //     "Maximum value is " + this._max.toFixed(this._decimals),
    //     warn
    //   );
    //   this.set_value(this._max);
    //   return true;
    // }
    // this._warnValidator("", true);
    this.set_value(val);
  }

  // protected _value_apply_precision(value: number) {
  //   value = Number(value.toFixed(this._decimals));
  //   if (this._step !== 0) {
  //     let modBuff = value % this._step;
  //     return modBuff >= this._step / 2
  //       ? value + this._step - modBuff
  //       : value - modBuff;
  //   } else {
  //     return value;
  //   }
  // }
}
