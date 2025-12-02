import type { SVGFunc } from "@libSVG";
import { FormValueWrite, type FormValueOptions } from "../base";
import "./selectorBase.scss";

export interface SelectorOption<T> {
  /**Value to set when option is selected */
  value: T;
  /**Text for selection */
  text: string;
  /**Icon to display for option*/
  icon?: SVGFunc;
}

export interface SelectorBaseOptions<T> extends FormValueOptions<T> {
  /**Options for selector*/
  selections?: SelectorOption<T>[];
}

export function form_selector_apply_options<RT>(
  element: SelectorBase<RT>,
  options: SelectorBaseOptions<RT>
) {
  if (options.selections) element.selections = options.selections;
}

/**Base for number elements elements*/
export abstract class SelectorBase<RT> extends FormValueWrite<RT> {
  /**Sets the selection options for the selector */
  abstract set selections(selections: SelectorOption<RT>[] | undefined);

  static apply_options<RT>(
    element: SelectorBase<RT>,
    options: SelectorBaseOptions<RT>
  ) {
    if (options.selections) element.selections = options.selections;
    super.apply_options(element, options);
  }
}
