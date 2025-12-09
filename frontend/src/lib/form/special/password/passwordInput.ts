import "./passwordInput.scss"
import { defineElement } from "@chocolatelibui/core";
import { InputBase } from "../inputBase";

/**Color selector*/
export class PasswordInput extends InputBase<string> {
    /**Returns the name used to define the element*/
    static elementName() { return 'passwordinput' }

    constructor() {
        super();
        this._input.type = 'password';
    }
}
defineElement(PasswordInput);
