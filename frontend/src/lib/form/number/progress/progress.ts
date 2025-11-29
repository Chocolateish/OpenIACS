import "./progress.scss"
import { defineElement } from "@chocolatelibui/core";
import { NumberBase } from "../numberBase";
import { NoValueText } from "../../base";


/**Slide Selector, displays all options in a slider*/
export class Progress extends NumberBase {
    private _bar: HTMLDivElement;
    private _val: HTMLSpanElement;

    /**Returns the name used to define the element*/
    static elementName() { return 'progress' }

    constructor() {
        super();
        this._bar = this._body.appendChild(document.createElement('div'));
        this._val = this._body.appendChild(document.createElement('span'));
        this._body.appendChild(this._unit);
    }

    /**Called when value is changed */
    protected _valueUpdate(value: number) {
        this._bar.style.width = Math.min(Math.max((value - this._min) / this._span * 100, 0), 100) + '%';
        this._val.innerHTML = (value.toFixed(this._decimals));
    }
    /**Called when value cleared */
    protected _valueClear() {
        this._bar.style.width = '50%';
        this._val.innerHTML = NoValueText;
    }
}
defineElement(Progress);
