import { defineElement } from "@libBase";
import { Button, InputBox, type InputBoxOptions } from "@libComponents";
import { remToPx } from "@libUI";
import {
  createPromptWindow,
  Prompt,
  type PromptBaseOptions,
  PromptCodes,
  promptsWindowLayer,
} from "./common";
import "./input.scss";

/**Defines the return object for a prompt*/
type PromptInputReturn = {
  data: string | number;
};

/**Defines input prompt options*/
export type PromptInputOptions = {
  /**the long text of the prompt */
  text?: string;
  /**The text in the confirming button */
  buttonText?: string;
  /**the options to pass to the inputbox */
  input: InputBoxOptions;
} & PromptBaseOptions;

class PromptInput extends Prompt<PromptInputReturn, PromptInputOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "input";
  }

  input: any;
  __button: any;
  __text: any;

  /**Options toggeler*/
  options(options: PromptInputOptions): this {
    super.options(options);
    if (typeof options.text !== "undefined") this.text = options.text;
    this.input = this.appendChild(new InputBox().options({ ...options.input }));
    this.__button = this.appendChild(
      new Button().options({
        text: options.buttonText || "OK",
        click: () => {
          this.___finish(PromptCodes.ENTER, { data: this.input.value });
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
          this.input
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
    if (typeof text == "string") this.__button.text = text;
  }

  /**Method handeling key events for prompt*/
  protected __keyboard(e: KeyboardEvent) {
    if (e.key == "Escape") {
      this.___finish(PromptCodes.CLOSED);
    } else {
      this.input.focus();
    }
  }

  /**Method handeling key events for prompt*/
  protected __keyboardUp(e: KeyboardEvent) {
    if (e.key == "Enter")
      this.___finish(PromptCodes.ENTER, { data: this.input.value });
  }

  focus() {
    super.focus();
    this.input.focus();
  }
}
defineElement(PromptInput);
export let promptInput = (options: PromptInputOptions) => {
  return createPromptWindow<
    PromptInputReturn,
    PromptInput,
    new () => PromptInput
  >(options, PromptInput, {
    height: "content",
    width: remToPx(25),
    sizeable: false,
    moveable: false,
    modal: true,
    layer: promptsWindowLayer,
  });
};
