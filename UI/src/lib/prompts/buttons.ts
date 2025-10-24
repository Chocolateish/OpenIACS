import { defineElement } from "@libBase";
import { Button } from "@libComponents";
import { remToPx } from "@libUI";
import "./buttons.scss";
import {
  createPromptWindow,
  Prompt,
  type PromptBaseOptions,
  PromptCodes,
  promptsWindowLayer,
} from "./common";

/**Defines the return object for a prompt*/
export type PromptButtonsReturn<T> = {
  data: T;
};

/**Data to pass for each button in the button prompt*/
export type ButtonPromptButtonValues<T> = {
  /**text in button */
  text: string;
  /**value to return when button is pressed */
  value: T;
  /**symbol to add to button */
  symbol?: SVGSVGElement;
  /**keyboard shortcut for button */
  key?: string;
};

/** Defines buttons prompt options*/
export type PromptButtonsOptions<T> = {
  /**the long text of the prompt */
  text?: string;
  /**Definition of buttons for prompt */
  buttons?: ButtonPromptButtonValues<T>[];
} & PromptBaseOptions;

class PromptButtons<T> extends Prompt<
  PromptButtonsReturn<T>,
  PromptButtonsOptions<T>
> {
  /**Returns the name used to define the element */
  static elementName() {
    return "buttons";
  }

  private __buttons = this.appendChild(document.createElement("div"));
  private __text?: HTMLDivElement;
  private __butts: Button[] = [];
  private __buttsKeys: { [key: string]: T } = {};

  /**Options toggeler*/
  options(options: PromptButtonsOptions<T>): this {
    super.options(options);
    if (options.text) this.text = options.text;
    if (options.buttons) this.buttons = options.buttons;
    return this;
  }

  /**This changes the text of the prompt*/
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("div"),
          this.__buttons
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**This changes the buttons in the prompt*/
  set buttons(buttons: ButtonPromptButtonValues<T>[]) {
    this.__buttons.innerHTML = "";
    this.__butts = [];
    this.__buttsKeys = {};
    for (let i = 0, m = buttons.length; i < m; i++) {
      let key = buttons[i].key;
      if (key) this.__buttsKeys[key] = buttons[i].value;
      this.__butts.push(
        this.__buttons.appendChild(
          new Button().options({
            symbol: buttons[i].symbol,
            text: buttons[i].text,
            click: () => {
              this.___finish(PromptCodes.ENTER, { data: buttons[i].value });
            },
          })
        )
      );
    }
  }

  /**Handler for keyboard events*/
  protected __keyboard(e: KeyboardEvent) {
    if (e.key == "Escape") this.___finish(PromptCodes.CLOSED);
    else if (e.key in this.__buttsKeys)
      this.___finish(PromptCodes.ENTER, { data: this.__buttsKeys[e.key] });
  }
}
defineElement(PromptButtons);
export function promptButtons<T>(options: PromptButtonsOptions<T>) {
  return createPromptWindow<
    PromptButtonsReturn<T>,
    PromptButtons<T>,
    new () => PromptButtons<T>
  >(options, PromptButtons, {
    height: "content",
    width: remToPx(25),
    sizeable: false,
    moveable: false,
    modal: true,
    layer: promptsWindowLayer,
  });
}
