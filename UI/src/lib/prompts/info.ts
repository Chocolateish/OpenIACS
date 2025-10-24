import { defineElement } from "@libBase";
import { remToPx, type WindowBase } from "@libUI";
import {
  createPromptWindow,
  Prompt,
  type PromptBaseOptions,
  promptsWindowLayer,
} from "./common";
import "./info.scss";

/**Defines info prompt options*/
export type PromptInfoOptions = {
  /*the long text of the prompt*/
  text?: string;
} & PromptBaseOptions;

export class PromptInfo extends Prompt<{}, PromptInfoOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "info";
  }

  /**Options toggeler*/
  options(options: PromptInfoOptions): this {
    super.options(options);
    if (typeof options.text === "string") this.text = options.text;
    return this;
  }

  /**This changes the text of the prompt*/
  set text(text: string) {
    if (typeof text == "string" && text != "") {
      this.innerHTML = text;
      (this.container as WindowBase).showContent = true;
    } else {
      this.innerHTML = "";
      (this.container as WindowBase).showContent = false;
    }
  }
}
defineElement(PromptInfo);
export let promptInfo = (options: PromptInfoOptions) => {
  return createPromptWindow<{}, PromptInfo, new () => PromptInfo>(
    options,
    PromptInfo,
    {
      height: "content",
      width: remToPx(25),
      sizeable: false,
      moveable: false,
      modal: true,
      layer: promptsWindowLayer,
    }
  );
};
