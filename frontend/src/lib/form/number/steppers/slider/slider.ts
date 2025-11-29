import "./slider.scss"
import { defineElement } from "@chocolatelibui/core";
import { material_navigation_chevron_left_rounded, material_navigation_chevron_right_rounded } from "@chocolatelibui/icons";
import { StepperBase } from "../stepperBase";
import { NoValueText } from "../../../base";

/**Slide Selector, displays all options in a slider*/
export class Slider extends StepperBase {
    private _slide: HTMLDivElement;
    private _slider: HTMLDivElement;
    private _valueBox: HTMLSpanElement;
    private _legend: HTMLSpanElement;

    /**Returns the name used to define the element*/
    static elementName() { return 'slider' }

    constructor() {
        super();
        this._iconDec = this._stepperFunc(this._body.appendChild(material_navigation_chevron_left_rounded()), false);
        this._slide = this._body.appendChild(document.createElement('div'));
        this._slide.append(this._minLegend, this._maxLegend);
        this._iconInc = this._stepperFunc(this._body.appendChild(material_navigation_chevron_right_rounded()), true);
        this._slider = this._slide.appendChild(document.createElement('div'));
        this._slider.setAttribute('tabindex', '0');
        this._valueBox = this._slider.appendChild(document.createElement('span'));
        this._valueBox.textContent = NoValueText;
        this._slider.appendChild(this._unit);
        this._legend = this._body.appendChild(document.createElement('span'));
        this._legend.append(this._minLegend, this._maxLegend);

        this._body.onpointerdown = (e) => {
            if (e.button === 0) {
                e.stopPropagation();
                this._slider.classList.add('active');
                let box = this._slider.getBoundingClientRect();
                let offset = (e.clientX >= box.x ? e.clientX <= box.x + box.width ? box.x - e.clientX : -box.width : 0)
                if (this._min === -Infinity || this._max === Infinity) {
                    let value = this._value || 0;
                    let interval = setInterval(() => {
                        if (this._live) {
                            this._setValueValidate(value += diff / 50, true);
                        } else {
                            this._moveValue(value += diff / 50);
                        }
                    }, 100);
                    let diff = this._xToPerc(e.clientX + offset) - 50;

                    this._moveSlide(this._xToPerc(e.clientX + offset));
                    this._slider.setPointerCapture(e.pointerId);
                    this._slider.onpointermove = (ev) => {
                        ev.stopPropagation();
                        let perc = this._xToPerc(ev.clientX + offset);
                        diff = perc - 50;
                        this._moveSlide(perc);
                    };
                    this._slider.onpointerup = (ev) => {
                        ev.stopPropagation();
                        this._slider.classList.remove('active');
                        this._slider.releasePointerCapture(e.pointerId);
                        this._slider.onpointermove = null;
                        this._slider.onpointerup = null;
                        this._moveSlide(50);
                        if (!this._live) {
                            this._setValueValidate(value, true);
                        }
                        clearInterval(interval);
                    };
                } else {
                    this._moveAbsolute(e.clientX + offset, false)
                    this._slider.setPointerCapture(e.pointerId);
                    this._slider.onpointermove = (ev) => {
                        ev.stopPropagation();
                        this._moveAbsolute(ev.clientX + offset, false)
                    };
                    this._slider.onpointerup = (ev) => {
                        ev.stopPropagation();
                        this._slider.classList.remove('active');
                        this._slider.releasePointerCapture(e.pointerId);
                        this._slider.onpointermove = null;
                        this._slider.onpointerup = null;
                        this._moveAbsolute(ev.clientX + offset, true)
                    };
                }
            }
        };


        this._slider.onkeydown = (e) => {
            switch (e.key) {
                case 'ArrowRight':
                    e.stopPropagation();
                    this._stepValue(true);
                    break;
                case 'ArrowLeft':
                    e.stopPropagation();
                    this._stepValue(false);
                    break;
            }
        };
    }

    private _moveAbsolute(x: number, last: boolean) {
        let perc = this._xToPerc(x);
        if (last && !this._live) {
            this._setValueValidate(this._valueApplyPrecision(this._percToValue(perc)), true);
        } else {
            if (this._live) {
                this._setValueValidate(this._valueApplyPrecision(this._percToValue(perc)), false);
            } else {
                this._moveSlide(perc);
                this._moveValue(this._valueApplyPrecision(this._percToValue(perc)));
            }
        }
    }

    /**Calculates the percent from the x value*/
    private _xToPerc(x: number) {
        let box = this._slide.getBoundingClientRect();
        return Math.min(100, Math.max(0, (x - box.x) / (box.width) * 100));
    }

    private _percToValue(perc: number) {
        return (perc / 100 * this._span) + this._min;
    }
    private _valueToPerc(value: number) {
        return Math.min(Math.max((-this._min + value) / this._span * 100, 0), 100);
    }
    private _moveSlide(perc: number) {
        this._slider.style.left = perc + '%';
    }
    private _moveValue(value: number) {
        this._valueBox.textContent = value.toFixed(this._decimals);
    }

    /**Called when value is changed */
    protected _valueUpdate(value: number) {
        this._moveValue(value);
        this._moveSlide(this._valueToPerc(value));
    }
    /**Called when value cleared */
    protected _valueClear() {
        this._moveSlide(50);
        this._valueBox.textContent = NoValueText;
    }
}
defineElement(Slider);
