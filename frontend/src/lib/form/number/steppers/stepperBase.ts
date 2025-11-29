import "./stepperBase.scss"
import { NumberBase, NumberBaseOptions } from "../numberBase";

export interface StepperBaseOptions extends NumberBaseOptions {
    /**wether the events are live as the slider is moved or only when moving stops */
    live?: boolean,
    /**Icon to use for decreasing value*/
    iconDec?: SVGSVGElement,
    /**Icon to use for increasing value*/
    iconInc?: SVGSVGElement,
}

/**Base for stepper elements*/
export abstract class StepperBase extends NumberBase {
    protected _live: boolean = false;
    protected _iconDec: SVGSVGElement | undefined;
    protected _iconInc: SVGSVGElement | undefined;

    /**Sets options for the slider*/
    options(options: StepperBaseOptions) {
        super.options(options)
        this.live = options.live;
        if (options.iconDec) {
            this.iconLeft = options.iconDec;
        }
        if (options.iconInc) {
            this.iconRight = options.iconInc;
        }
        return this;
    }


    /**Gets wether the slider is in live mode*/
    get live() {
        return this._live;
    }
    /**Set wether the slider is in live mode*/
    set live(live: boolean | undefined) {
        this._live = live || false;
    }

    /**Changes the icon on the left of the slider*/
    set iconLeft(icon: SVGSVGElement) {
        this._iconDec?.replaceWith(icon);
        this._stepperFunc(icon, false);
    }

    /**Changes the icon on the right of the slider*/
    set iconRight(icon: SVGSVGElement) {
        this._iconInc?.replaceWith(icon);
        this._stepperFunc(icon, true);
    }

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
                    icon.releasePointerCapture(e.pointerId)
                    icon.classList.remove('active');
                }
                icon.setPointerCapture(e.pointerId);
                icon.classList.add('active');
                let timeout = setTimeout(() => {
                    if (this._stepValue(dir)) {
                        icon.onpointerup = null;
                    } else {
                        interval = setInterval(() => {
                            if (this._stepValue(dir)) {
                                release();
                            }
                        }, scaler);
                        scalerInterval = setInterval(() => {
                            if (scaler > 20) {
                                scaler /= 1.1;
                            }
                            clearInterval(interval);
                            interval = setInterval(() => {
                                if (this._stepValue(dir)) {
                                    release();
                                }
                            }, scaler);
                        }, 200)
                    }
                }, 500);
                icon.onpointerup = () => {
                    if (interval === 0) {
                        this._stepValue(dir);
                    }
                    release();
                }
            }
        }
        return icon
    }

    /**This steps the slider value in the given direction*/
    protected _stepValue(dir: boolean): boolean | void {
        if (this._step === 0) {
            if (this._decimals === 0) {
                var step = Math.max(1, Math.floor(Math.abs(this._value || 0) / 150));
            } else {
                var step = Math.max(1 / this._decimals, Math.floor(Math.abs(this._value || 0) / 150));
            }
        } else if (this._stepFunc) {
            var step = this._stepFunc(this._value || 0);
        } else {
            var step = this._step;
        }
        if (dir) {
            return this._setValueValidate((this._value || 0) + step, true);
        } else {
            return this._setValueValidate((this._value || 0) - step, true);
        }
    }
}
