import { defineElement } from "@libBase";
import { Button, DropDown, type DropDownOptions } from "@libComponents";
import { remToPx } from "@libUI";
import {
  createPromptWindow,
  Prompt,
  type PromptBaseOptions,
  PromptCodes,
  promptsWindowLayer,
} from "./common";
import "./dropdown.scss";

/**Defines the return object for a dropdown prompt*/
export type PromptDropdownReturn = {
  data: string;
};

/**Defines dropdown prompt options*/
export type PromptDropdownOptions = {
  /**the long text of the prompt */
  text?: string;
  /**The text in the confirming button */
  buttonText?: string;
  /**the options to pass to the dropdownbox */
  dropdown: DropDownOptions;
} & PromptBaseOptions;

class PromptDropdown extends Prompt<
  PromptDropdownReturn,
  PromptDropdownOptions
> {
  /**Returns the name used to define the element */
  static elementName() {
    return "dropdown";
  }

  dropdown?: DropDown;
  private __button?: Button;
  private __text?: HTMLDivElement;

  options(options: PromptDropdownOptions): this {
    super.options(options);
    if (typeof options.text !== "undefined") this.text = options.text;
    this.dropdown = this.appendChild(
      new DropDown().options({ ...options.dropdown })
    );
    this.__button = this.appendChild(
      new Button().options({
        text: options.buttonText || "OK",
        click: () => {
          this.___finish(PromptCodes.ENTER, {
            data: this.dropdown!.value as string,
          });
        },
      })
    );
    return this;
  }

  /**This changes the text of the prompt*/
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("div"),
          this.dropdown!
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**This changes the text of the confirmation button*/
  set buttonText(text: string) {
    if (typeof text == "string") this.__button!.text = text;
  }

  /**Method handeling key events for prompt */
  protected __keyboard(e: KeyboardEvent) {
    if (e.key == "Escape") this.___finish(PromptCodes.CLOSED);
    else this.dropdown!.focus();
  }

  /**Method handeling key events for prompt*/
  protected __keyboardUp(e: KeyboardEvent) {
    if (e.key == "Enter")
      this.___finish(PromptCodes.ENTER, {
        data: this.dropdown!.value as string,
      });
  }

  focus() {
    super.focus();
    this.dropdown!.focus();
  }
}
defineElement(PromptDropdown);
export let promptDropdown = (options: PromptDropdownOptions) => {
  return createPromptWindow<
    PromptDropdownReturn,
    PromptDropdown,
    new () => PromptDropdown
  >(options, PromptDropdown, {
    height: "content",
    width: remToPx(25),
    sizeable: false,
    moveable: false,
    modal: true,
    layer: promptsWindowLayer,
  });
};
