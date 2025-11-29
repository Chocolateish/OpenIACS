import "./urlInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { InputBase } from "../inputBase";

/**Color selector*/
export class URLInput extends InputBase<string> {
    /**Returns the name used to define the element*/
    static elementName() { return 'urlinput' }

    constructor() {
        super();
        this._input.type = 'url';
    }
}
defineElement(URLInput);
