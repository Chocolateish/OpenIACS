import "./phoneInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { InputBase } from "../inputBase";

/**Color selector*/
export class PhoneInput extends InputBase<string> {
    /**Returns the name used to define the element*/
    static elementName() { return 'phoneinput' }

    constructor() {
        super();
        this._input.type = 'tel';
        this._input.pattern = '[0-9]{3}-[0-9]{2}-[0-9]{3}';
    }
}
defineElement(PhoneInput);
