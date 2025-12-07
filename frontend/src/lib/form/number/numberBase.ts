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

export interface FormStepperBaseOptions<RT = number>
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
    if (options.unit) element.unit = options.unit;
    if (options.decimals) element.decimals = options.decimals;
    if (options.min !== undefined) element.min = options.min;
    if (options.max !== undefined) element.max = options.max;
    if (options.step) element.step = options.step;
    if (options.start) element.start = options.start;
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
}
