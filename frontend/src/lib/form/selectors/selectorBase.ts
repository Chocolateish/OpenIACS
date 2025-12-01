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

export function form_selector_apply_options<RT, S extends {}>(
  element: SelectorBase<RT, S>,
  options: SelectorBaseOptions<RT>
) {
  if (options.selections) element.selections = options.selections;
}

/**Base for number elements elements*/
export abstract class SelectorBase<
  RT,
  S extends {}
> extends FormValueWrite<RT> {
  //Stores selections by value
  #map: Map<RT, S> = new Map();
  //Stores values in order supplied
  #values: RT[] = [];
  #selected: number = -1;
  #selection?: S;

  static apply_options<RT, S extends {}>(
    element: SelectorBase<RT, S>,
    options: SelectorBaseOptions<RT>
  ) {
    if (options.selections) element.selections = options.selections;
  }

  /**Sets the selection options for the selector */
  set selections(selections: SelectorOption<RT>[] | undefined) {
    if (this.#selected != -1)
      this._clear_selection(this.#map.get(this.#values[this.#selected])!);
    this._clear_selections();
    this.#values = [];
    this.#map.clear();
    if (selections) {
      this.#values = selections.map((s) => s.value);
      this.#map = new Map(
        selections.map((s) => [s.value, this._add_selection(s)])
      );
      if (this.#map.size < selections.length)
        console.error("Same value used multiple times in selector options");
    }
  }

  /**Clears all selections from the element */
  protected abstract _clear_selections(): void;
  /**Add a selection to the element */
  protected abstract _add_selection(selection: SelectorOption<RT>): S;
  /**Sets which selection is active*/
  protected abstract _set_selection(selection: S): void;
  /**Clears any active selection*/
  protected abstract _clear_selection(selection: S): void;
  /**Set a selection to focused*/
  protected abstract _focus_selection(selection: S, old?: S): void;

  /**Selects the previous or next selection in the element
   * @param dir false is next true is previous*/
  protected _selectAdjacent(dir: boolean) {
    let y = Math.min(
      this.#values.length - 1,
      Math.max(0, dir ? this.#selected + 1 : this.#selected - 1)
    );
    if (y !== this.#selected)
      this._focus_selection(this.#map.get(this.#values[y])!);
  }

  /**Called when Value is changed */
  protected new_value(value: RT) {
    if (!this.#map.has(value) && this.#selected != -1) {
      this._clear_selection(this.#map.get(this.buffer!)!);
      this.#selected = -1;
      return;
    }
    this._set_selection(this.#map.get(value)!);
    this.#selected = this.#values.indexOf(value);
  }

  protected new_error(_val: string): void {}
}
