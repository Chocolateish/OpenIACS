import { Value, ValueLimitedString } from "@chocolatelib/value";
import { FormBaseRead, FormValueOptions } from "../base";
import "./selectorBase.scss";

export interface SelectorOption<T> {
  /**Value to set when option is selected */
  value: T;
  /**Text for selection */
  text: string;
  /**Icon to display for option*/
  icon?: SVGSVGElement;
}

export interface SelectorBaseOptions<T> extends FormValueOptions<T> {
  /**Options for selector*/
  selections?: SelectorOption<T>[];
}

export interface SelectionBase<T> {
  index: number;
  selection: SelectorOption<T>;
}

/**Base for number elements elements*/
export abstract class SelectorBase<
  T,
  S extends SelectionBase<T>
> extends FormBaseRead<T> {
  protected _selectionValues: T[] = [];
  protected _selections: S[] = [];
  protected _selection: S | undefined;

  /**Sets options for the element*/
  options(options: SelectorBaseOptions<T>) {
    super.options(options);
    if (options.selections) {
      this.selections = options.selections;
    }
    return this;
  }

  /**Gets the selection options for the selector */
  get selections() {
    let selections: SelectorOption<T>[] = [];
    for (let i = 0; i < this._selections.length; i++) {
      const sel = this._selections[i].selection;
      if (sel.icon) {
        selections.push({
          text: sel.text,
          value: sel.value,
          icon: <SVGSVGElement>sel.icon.cloneNode(true),
        });
      } else {
        selections.push({ text: sel.text, value: sel.value });
      }
    }
    return selections;
  }

  /**Sets the selection options for the selector */
  set selections(selections: SelectorOption<T>[] | undefined) {
    this._selectionValues = [];
    this._selections = [];
    this._clearSelections();
    if (selections) {
      for (let i = 0; i < selections.length; i++) {
        const selection = selections[i];
        if (selection) {
          this._selectionValues[i] = selections[i].value;
          this._selections[i] = this._addSelection(selections[i], i);
        }
      }
    }
  }
  /**Clears all selections from the element */
  protected abstract _clearSelections(): void;
  /**Add a selection to the element */
  protected abstract _addSelection(
    selection: SelectorOption<T>,
    index: number
  ): S;
  /**Sets which selection is active*/
  protected abstract _setSelection(selection: S): void;
  /**Clears any active selection*/
  protected abstract _clearSelection(selection: S): void;
  /**Set a selection to focused*/
  protected abstract _focusSelection(selection: S): void;

  /**Selects the previous or next selection in the element
   * @param dir false is next true is previous*/
  protected _selectAdjacent(dir: boolean) {
    if (dir) {
      let index = this._selection?.index ?? -1;
      if (index < this._selections.length - 1) {
        this._valueSet(this._selectionValues[index + 1]);
        this._focusSelection(this._selections[index + 1]);
      }
    } else {
      let index = this._selection?.index ?? this._selections.length - 1;
      if (index > 0) {
        this._valueSet(this._selectionValues[index - 1]);
        this._focusSelection(this._selections[index - 1]);
      }
    }
  }

  /**Called when value is changed */
  protected _valueUpdate(value: T) {
    if (this._selection) {
      this._clearSelection(this._selection);
      this._selection = undefined;
    }
    let index = this._selectionValues.indexOf(value);
    if (index !== -1) {
      this._setSelection(this._selections[index]);
      this._selection = this._selections[index];
    }
  }
  /**Called when value cleared */
  protected _valueClear() {
    if (this._selection) {
      this._clearSelection(this._selection);
    }
  }

  /**Called when Value is changed */
  protected _ValueUpdate(value: Value<T>) {
    if (value instanceof ValueLimitedString) {
      let selections: SelectorOption<any>[] = [];
      for (const key in value.enums) {
        let enu = value.enums[key];
        selections.push({
          text: enu.name,
          icon: enu.icon,
          value: key,
        });
      }
      this.selections = selections;
    }
  }
  /**Called when the form element is set to not use a Value anymore*/
  protected _ValueClear() {}
}
