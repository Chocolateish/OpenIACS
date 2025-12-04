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

//##################################################################################################
//      _   _ _    _ __  __ ____  ______ _____   __          _______ _______ _____ ______
//     | \ | | |  | |  \/  |  _ \|  ____|  __ \  \ \        / /  __ \__   __|_   _|  ____|
//     |  \| | |  | | \  / | |_) | |__  | |__) |  \ \  /\  / /| |__) | | |    | | | |__
//     | . ` | |  | | |\/| |  _ <|  __| |  _  /    \ \/  \/ / |  _  /  | |    | | |  __|
//     | |\  | |__| | |  | | |_) | |____| | \ \     \  /\  /  | | \ \  | |   _| |_| |____
//     |_| \_|\____/|_|  |_|____/|______|_|  \_\     \/  \/   |_|  \_\ |_|  |_____|______|

export interface FormNumberWriteOptions<RT = number>
  extends FormNumberOptions<RT> {
  /**Step size, use 0 for automatic step size*/
  step?: number;
  /**Start for step, use 0 for automatic */
  start?: number;
}

export abstract class FormNumberWrite<RT = number> extends FormValueWrite<RT> {
  static apply_options<RT>(
    element: FormNumberWrite<RT>,
    options: FormNumberWriteOptions<RT>
  ) {
    element.decimals = options.decimals;
    element.min = options.min;
    element.max = options.max;
    element.step = options.step;
    element.start = options.start;
    element.unit = options.unit;
    super.apply_options(element, options);
  }

  /**Minimum and maximum value for element */
  protected _min: number = -Infinity;
  protected _max: number = Infinity;
  protected _span: number = Infinity;
  protected _minUsr: number = -Infinity;
  protected _maxUsr: number = Infinity;
  protected _minVal: number = -Infinity;
  protected _maxVal: number = Infinity;
  /**Precision of input*/
  protected _step: number = 0;
  protected _start: number = 0;
  protected _decimals: number = 0;

  /**Set the minimum value*/
  set min(min: number | undefined) {
    if (typeof min === "number") {
      this._minUsr = min;
    } else {
      this._minUsr = -Infinity;
    }
    this._updateMinMax();
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

  /**Sets the size of number change steps*/
  set step(step: number | undefined) {
    this._step = step ?? 0;
  }

  /**Sets the start offset for number steps*/
  set start(step: number | undefined) {
    this._step = step ?? 0;
  }

  /**Sets the amount of decimals the element can have*/
  set decimals(dec: number | undefined) {
    this._decimals = Math.max(dec ?? 0, 0);
  }

  /**Sets the unit of the element*/
  abstract set unit(unit: string | undefined);

  /**Validates given value then sets it*/
  protected _setValueValidate(val: number, warn: boolean): boolean | void {
    // if (this._Value && this._Value instanceof ValueLimited) {
    //   let { allowed, reason, correction } = this._Value.checkLimitReason(val);
    //   if (!allowed) {
    //     this._warnValidator(reason, warn);
    //     if (typeof correction !== "undefined") {
    //       if (correction === this._value) {
    //         this._valueUpdate(this._value || 0);
    //       } else {
    //         this._valueSet(correction);
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
    //   this._valueSet(this._min);
    //   return true;
    // }
    // if (val > this._max) {
    //   this._warnValidator(
    //     "Maximum value is " + this._max.toFixed(this._decimals),
    //     warn
    //   );
    //   this._valueSet(this._max);
    //   return true;
    // }
    // this._warnValidator("", true);
    // this._valueSet(val);
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
