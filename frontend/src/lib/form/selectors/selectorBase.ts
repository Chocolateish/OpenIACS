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

export interface SelectionBase<T> {
  index: number;
}

/**Base for number elements elements*/
export abstract class SelectorBase<
  RT,
  S extends SelectionBase<RT>
> extends FormValueWrite<RT> {
  //Stores selections by value
  #map: Map<RT, S> = new Map();
  //Stores values in order supplied
  #values: RT[] = [];
  #selection: number = -1;

  static apply_options<RT, S extends SelectionBase<RT>>(
    element: SelectorBase<RT, S>,
    options: SelectorBaseOptions<RT>
  ) {
    if (options.selections) element.selections = options.selections;
  }

  /**Sets the selection options for the selector */
  set selections(selections: SelectorOption<RT>[] | undefined) {
    if (this.#selection != -1)
      this._clear_selection(this.#map.get(this.#values[this.#selection])!);
    this._clear_selections();
    this.#values = [];
    this.#map.clear();
    if (selections) {
      this.#values = selections.map((s) => s.value);
      for (let i = 0; i < selections.length; i++) {
        let sel = selections[i];
        if (this.#map.has(sel.value))
          console.error(
            "Selection with value " +
              sel.value +
              " already exists in " +
              (this.formID ?? "selector")
          );
        this.#map.set(sel.value, this._add_selection(sel, i));
      }
    }
  }

  /**Clears all selections from the element */
  protected abstract _clear_selections(): void;
  /**Add a selection to the element */
  protected abstract _add_selection(
    selection: SelectorOption<RT>,
    index: number
  ): S;
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
      Math.max(0, dir ? this.#selection + 1 : this.#selection - 1)
    );
    if (y !== this.#selection) {
      this.set_value(this.#values[y]);
      this._focus_selection(this.#map.get(this.#values[y])!);
    }
  }

  /**Called when Value is changed */
  protected new_value(value: RT) {
    if (!this.#map.has(value) && this.#selection != -1)
      return this._clear_selection(this.#map.get(this.buffer!)!);
    this._set_selection(this.#map.get(value)!);
  }

  protected new_error(_val: string): void {}
}
