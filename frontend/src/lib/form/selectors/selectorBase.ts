import { STATE_ENUM_HELPER, type State } from "@libState";
import type { SVGFunc } from "@libSVG";
import { FormValueWrite, type FormValueOptions } from "../base";

export interface FormSelectorOption<RT> {
  /**Value to set when option is selected */
  value: RT;
  /**Text for selection */
  text: string;
  /**Icon to display for option*/
  icon?: SVGFunc;
}

export interface FormSelectorBaseOptions<T, ID extends string | undefined>
  extends FormValueOptions<T, ID> {
  /**Options for selector*/
  selections?: FormSelectorOption<T>[];
}

/**Base for number elements elements*/
export abstract class FormSelectorBase<
  RT,
  ID extends string | undefined
> extends FormValueWrite<RT, ID> {
  /**Sets the selection options for the selector */
  abstract set selections(selections: FormSelectorOption<RT>[] | undefined);

  static apply_options<RT, ID extends string | undefined>(
    element: FormSelectorBase<RT, ID>,
    options: FormSelectorBaseOptions<RT, ID>
  ) {
    if (options.selections) element.selections = options.selections;
    super.apply_options(element, options);
  }

  set value_by_state(st: State<RT> | undefined) {
    st?.related().map((val) => {
      if (val instanceof STATE_ENUM_HELPER) {
        this.selections = val.map((key, val) => {
          return {
            text: val.name,
            value: key as RT,
            icon: val.icon,
          };
        });
      }
    });
    super.value_by_state = st;
  }
}
