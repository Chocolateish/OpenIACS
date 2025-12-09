import "./textInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { InputBase } from "../inputBase";

/**Color selector*/
export class TextInput extends InputBase<string> {
    /**Returns the name used to define the element*/
    static elementName() { return 'textinput' }

    constructor() {
        super();
        this._input.type = 'url';
    }
}
defineElement(TextInput);
