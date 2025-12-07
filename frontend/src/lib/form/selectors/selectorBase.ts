import type { SVGFunc } from "@libSVG";
import { FormValueWrite, type FormValueOptions } from "../base";
import "./selectorBase.scss";

export interface FormSelectorOption<T> {
  /**Value to set when option is selected */
  value: T;
  /**Text for selection */
  text: string;
  /**Icon to display for option*/
  icon?: SVGFunc;
}

export interface FormSelectorBaseOptions<T> extends FormValueOptions<T> {
  /**Options for selector*/
  selections?: FormSelectorOption<T>[];
}

/**Base for number elements elements*/
export abstract class FormSelectorBase<RT> extends FormValueWrite<RT> {
  /**Sets the selection options for the selector */
  abstract set selections(selections: FormSelectorOption<RT>[] | undefined);

  static apply_options<RT>(
    element: FormSelectorBase<RT>,
    options: FormSelectorBaseOptions<RT>
  ) {
    if (options.selections) element.selections = options.selections;
    super.apply_options(element, options);
  }
}
