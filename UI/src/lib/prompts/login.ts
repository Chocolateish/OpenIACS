import { defineElement } from "@libBase";
import {
  Button,
  InputBox,
  type InputBoxOptions,
  InputBoxTypes,
} from "@libComponents";
import { remToPx } from "@libUI";
import {
  createPromptWindow,
  Prompt,
  type PromptBaseOptions,
  PromptCodes,
  promptsWindowLayer,
} from "./common";
import "./login.scss";

/**Defines the return object for a prompt*/
export type PromptLoginReturn = {
  /**password entered */
  password: string;
  /**username entered */
  username: string;
};

/**Defines input prompt options*/
type PromptLoginOptions = {
  /**text added above username input box */
  usertext?: string;
  /**text added above password input box */
  passtext?: string;
  /**the options to pass to the inputbox */
  input?: InputBoxOptions;
  /**the text of the button */
  buttonText?: string;
} & PromptBaseOptions;

class PromptLogin extends Prompt<PromptLoginReturn, PromptLoginOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "login";
  }

  username?: InputBox;
  password?: InputBox;
  private __button?: Button;

  /**Options toggeler*/
  options(options: PromptLoginOptions): this {
    super.options(options);
    this.username = this.appendChild(
      new InputBox().options({
        text: options.usertext || "Username",
        value: "",
        type: InputBoxTypes.TEXT,
      })
    );
    this.password = this.appendChild(
      new InputBox().options({
        text: options.passtext || "Password",
        value: "",
        type: InputBoxTypes.PASSWORD,
      })
    );
    this.__button = this.appendChild(
      new Button().options({
        text: options.buttonText || "Login",
        click: () => {
          this.___finish(PromptCodes.ENTER, {
            password: this.password!.value as string,
            username: this.username!.value as string,
          });
        },
      })
    );
    return this;
  }

  /**This changes the text over the username box*/
  set usertext(text: string) {
    this.username!.text = text;
  }

  /**This changes the text over the password box*/
  set passtext(text: string) {
    this.password!.text = text;
  }

  /**This changes the text of the confirmation button*/
  set buttonText(text: string) {
    if (typeof text == "string") {
      this.__button!.text = text;
    }
  }

  /**Method handeling key events for prompt*/
  protected __keyboard(e: KeyboardEvent) {
    if (e.key == "Escape") {
      this.___finish(PromptCodes.CLOSED);
    } else if (e.key == "Enter") {
      this.___finish(PromptCodes.ENTER, {
        password: this.password!.value as string,
        username: this.username!.value as string,
      });
    } else if (e.target === this) {
      this.username!.focus();
    }
  }

  focus() {
    this.username!.focus();
  }
}
defineElement(PromptLogin);
export let promptLogin = (options: PromptLoginOptions) => {
  return createPromptWindow<
    PromptLoginReturn,
    PromptLogin,
    new () => PromptLogin
  >(options, PromptLogin, {
    height: "content",
    width: remToPx(25),
    sizeable: false,
    moveable: false,
    modal: true,
    layer: promptsWindowLayer,
  });
};
