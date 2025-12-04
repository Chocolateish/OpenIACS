import type { SVGFunc } from "@libSVG";
import { FormNumberWrite, type FormNumberWriteOptions } from "../numberBase";
import "./stepperBase.scss";

export interface StepperBaseOptions<RT = number>
  extends FormNumberWriteOptions<RT> {
  /**wether the events are live as the slider is moved or only when moving stops */
  live?: boolean;
  /**Icon to use for decreasing value*/
  icon_decrease?: SVGFunc;
  /**Icon to use for increasing value*/
  icon_increase?: SVGFunc;
}

/**Base for stepper elements*/
export abstract class StepperBase<
  RT extends number = number
> extends FormNumberWrite<RT> {
  protected _live: boolean = false;

  static apply_options(
    element: StepperBase<any>,
    options: StepperBaseOptions<any>
  ) {
    if (options.live) element.live = options.live;
    if (options.icon_decrease) element.icon_decrease = options.icon_decrease;
    if (options.icon_increase) element.icon_increase = options.icon_increase;
    super.apply_options(element, options);
  }

  /**Set wether the slider is in live mode*/
  set live(live: boolean) {
    this._live = live;
  }

  /**Changes the icon used for decreasing the slider*/
  abstract set icon_decrease(icon: SVGFunc);

  /**Changes the icon used for increasing the slider*/
  abstract set icon_increase(icon: SVGFunc);

  protected _stepperFunc(icon: SVGSVGElement, dir: boolean) {
    icon.onpointerdown = (e) => {
      if (e.button === 0) {
        e.stopPropagation();
        let interval = 0;
        let scalerInterval = 0;
        let scaler = 200;
        let release = () => {
          clearInterval(interval);
          clearInterval(scalerInterval);
          clearTimeout(timeout);
          icon.onpointerup = null;
          icon.releasePointerCapture(e.pointerId);
          icon.classList.remove("active");
        };
        icon.setPointerCapture(e.pointerId);
        icon.classList.add("active");
        let timeout = setTimeout(() => {
          if (this._step_value(dir)) {
            icon.onpointerup = null;
          } else {
            interval = setInterval(() => {
              if (this._step_value(dir)) {
                release();
              }
            }, scaler);
            scalerInterval = setInterval(() => {
              if (scaler > 20) {
                scaler /= 1.1;
              }
              clearInterval(interval);
              interval = setInterval(() => {
                if (this._step_value(dir)) {
                  release();
                }
              }, scaler);
            }, 200);
          }
        }, 500);
        icon.onpointerup = () => {
          if (interval === 0) {
            this._step_value(dir);
          }
          release();
        };
      }
    };
    return icon;
  }

  /**This steps the slider value in the given direction*/
  protected _step_value(dir: boolean): boolean | void {
    if (this._step === 0) {
      if (this._decimals === 0) {
        var step = Math.max(1, Math.floor(Math.abs(this.buffer || 0) / 150));
      } else {
        var step = Math.max(
          1 / this._decimals,
          Math.floor(Math.abs(this.buffer || 0) / 150)
        );
      }
    } else {
      var step = this._step;
    }
    if (dir) {
      return this._setValueValidate((this.buffer || 0) + step, true);
    } else {
      return this._setValueValidate((this.buffer || 0) - step, true);
    }
  }
}
