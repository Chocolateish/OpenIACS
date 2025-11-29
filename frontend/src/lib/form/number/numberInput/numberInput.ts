import "./numberInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { NumberBase } from "../numberBase";
import { NoValueText } from "../../base";

/**Slide Selector, displays all options in a slider*/
export class NumberInput extends NumberBase {
    private _valueBox: HTMLSpanElement;
    private _legend: HTMLSpanElement;

    /**Returns the name used to define the element*/
    static elementName() { return 'numberinput' }

    constructor() {
        super();
        this._valueBox = this._body.appendChild(document.createElement('span'));
        this._valueBox.contentEditable = 'true';
        this._valueBox.textContent = NoValueText;
        this._body.appendChild(this._unit);
        this._legend = this._body.appendChild(document.createElement('span'));
        this._legend.append(this._minLegend, this._maxLegend);
        this._valueBox.onfocus = () => {
            if (this._valueBox.textContent === NoValueText) {
                this._valueBox.textContent = '';
            }
        };
        this._valueBox.onblur = async () => {
            setTimeout(() => {
                this._setValueValidate(parseFloat(this._valueBox.textContent?.replace(',', '.') || '') || 0, true);
            }, 0);
        };
        this._body.onclick = () => {
            this._valueBox.focus();
        };
        this._body.onkeydown = (e) => {
            if (e.key === 'Enter') {
                this._valueBox.blur();
            }
        };
        this._body.onbeforeinput = (e) => {
            switch (e.inputType) {
                case 'insertParagraph':
                    e.preventDefault();
                    break;
            }
            if (e.data) {
                if (!/[\d,.-]/g.test(e.data)) {
                    e.preventDefault()
                } else if (/[,.]/g.test(e.data) && this._decimals === 0) {
                    e.preventDefault()
                } else if (this._minUsr >= 0 && /-/g.test(e.data)) {
                    e.preventDefault()
                }
            }
        };
    }

    /**Called when value is changed */
    protected _valueUpdate(value: number) {
        this._valueBox.textContent = value.toFixed(this._decimals);
    }
    /**Called when value cleared */
    protected _valueClear() {
        this._valueBox.textContent = NoValueText;
    }
}
defineElement(NumberInput);
