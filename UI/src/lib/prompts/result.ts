import { defineElement } from "@libBase";
import { ResultWrapper } from "@libCommon";
import { remToPx } from "@libUI";
import {
  createPromptWindow,
  Prompt,
  type PromptBaseOptions,
  promptsWindowLayer,
} from "./common";

/** Defines result prompt options*/
export type PromptResultOptions = {
  /**the result object to display */
  result?: ResultWrapper;
  /**wether successfull results should be shown */
  showSuccess?: boolean;
} & PromptBaseOptions;

export class PromptResult extends Prompt<{}, PromptResultOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "result";
  }

  /**Options toggeler*/
  options(options: PromptResultOptions): this {
    super.options(options);
    if (options.result) this.result = options.result;
    return this;
  }

  /**Changes the displayd result for the prompt*/
  set result(r: ResultWrapper) {
    this.title = (r.success ? "Success: " : "Failure: ") + r.reason;
  }
}
defineElement(PromptResult);
export let promptResult = (options: PromptResultOptions) => {
  return createPromptWindow<{}, PromptResult, new () => PromptResult>(
    options,
    PromptResult,
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
