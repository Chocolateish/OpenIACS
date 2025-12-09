import "./colorInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { InputBase } from "../inputBase";

/**Color selector*/
export class ColorInput extends InputBase<string> {
    /**Returns the name used to define the element*/
    static elementName() { return 'colorinput' }

    constructor() {
        super();
        this._input.type = 'color';
        this._input.onchange = () => {
            this._valueSet(this._input.value);
        }
    }

    /**Called when value is changed */
    protected _valueUpdate(value: string) {
        this._input.value = value;
    }

    /**Called when value cleared */
    protected _valueClear() {
        this._input.value = ''
    }
}
defineElement(ColorInput);
