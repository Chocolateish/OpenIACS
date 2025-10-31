import { AccessTypes, defineElement } from "@libBase";
import { setCaretPosition } from "@libOldCommon";
import { add, remove } from "@libOldIcons";
import { ValueComponent, type ValueComponentOptions } from "./common";
import "./stepper.scss";

/**Defines options for stepper component*/
export type StepperOptions = {
  /**unit to use for component */
  unit?: string;
  /**symbol to use for left/top side*/
  leftSymbol?: SVGSVGElement;
  /**symbol to use for right/bottom side*/
  rightSymbol?: SVGSVGElement;
  /**lower limit for stepper value*/
  min?: number;
  /**upper limit for stepper value*/
  max?: number;
  /**amount of steps on the stepper 0 is infinite*/
  step?: number;
  /**amount of decimals to round to*/
  decimals?: number;
} & ValueComponentOptions;

/**Slide Selector, displays all options in a slider*/
export class Stepper extends ValueComponent<StepperOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "stepper";
  }

  #min = 0;
  #max = 100;
  #step = 0;
  #dec = 0;
  #stepper = this.appendChild(document.createElement("div"));
  #leftSymbol = this.#stepper.appendChild(document.createElement("div"));
  #interval: any;
  #valueContainer = this.#stepper.appendChild(document.createElement("span"));
  #field = this.#valueContainer.appendChild(document.createElement("span"));
  #valueField = this.#field.appendChild(document.createTextNode(""));
  #unit = this.#valueContainer.appendChild(document.createElement("div"));
  #unitField = this.#unit.appendChild(document.createTextNode(""));
  #rightSymbol = this.#stepper.appendChild(document.createElement("div"));
  #text?: HTMLSpanElement;

  constructor() {
    super();
    this.#stepper.tabIndex = 0;
    this.#stepper.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key == "ArrowRight" || e.key == "ArrowDown") {
        this.__stepValue(true);
      } else if (e.key == "ArrowLeft" || e.key == "ArrowUp") {
        this.__stepValue(false);
      } else if (
        [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ",",
          ".",
          "-",
        ].includes(e.key)
      ) {
        this.#field.focus();
      }
    };
    this.#leftSymbol.appendChild(remove());
    this.#leftSymbol.onpointerdown = (e) => {
      this.#leftSymbol.setPointerCapture(e.pointerId);
      this.__stepValue(false);
      this.__setInterval(false);
    };
    this.#leftSymbol.onpointerup = () => {
      clearInterval(this.#interval);
    };

    this.#valueContainer.onclick = (e) => {
      let box = this.#field.getBoundingClientRect();
      this.#field.focus();
      if (e.clientX > box.x)
        setCaretPosition(this.#field, this.#valueField.nodeValue!.length);
    };
    this.#field.contentEditable = "true";
    this.#field.inputMode = "decimal";
    this.#field.tabIndex = -1;
    this.#field.onkeydown = (e) => {
      e.stopPropagation();
      if (
        [
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ",",
          ".",
          "-",
          "Backspace",
          "Delete",
          "ArrowRight",
          "ArrowLeft",
          "Tab",
          "Enter",
        ].includes(e.key)
      ) {
        switch (e.key) {
          case "Enter": {
            this.__internalSet(
              Number(this.#valueField.nodeValue!.replace(",", "."))
            );
            e.preventDefault();
            break;
          }
        }
      } else {
        e.preventDefault();
      }
    };
    this.#field.onblur = () => {
      this.__internalSet(Number(this.#valueField.nodeValue!.replace(",", ".")));
    };
    this.#field.ondrop = (e) => {
      e.preventDefault();
    };
    this.#field.onclick = (e) => {
      e.stopPropagation();
    };
    this.#rightSymbol.appendChild(add());
    this.#rightSymbol.onpointerdown = (e) => {
      this.#rightSymbol.setPointerCapture(e.pointerId);
      this.__stepValue(true);
      this.__setInterval(true);
    };
    this.#rightSymbol.onpointerup = () => {
      clearInterval(this.#interval);
    };
  }

  /**Options toggeler*/
  options(options: StepperOptions): this {
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.step = options.step ?? 0;
    this.decimals = options.decimals ?? 0;
    super.options(options);
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    if (options.leftSymbol) this.leftSymbol = options.leftSymbol;
    if (options.rightSymbol) this.rightSymbol = options.rightSymbol;
    return this;
  }

  __setInterval(dir: boolean, time = 600) {
    clearInterval(this.#interval);
    this.#interval = setTimeout(() => {
      this.__stepValue(dir);
      this.__setInterval(dir, Math.max(80, time - 20));
    }, time);
  }

  /**Updates text of component */
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.#text)
        this.#text = this.insertBefore(
          document.createElement("span"),
          this.#stepper
        );
      this.#text.innerHTML = text;
    } else if (this.#text) {
      this.#text.remove;
      this.#text = undefined;
    }
  }

  /**Set the minimum value on the slider*/
  set min(min: number) {
    this.#min = min;
  }

  /**Gets the minimum value on the slider*/
  get min(): number {
    return this.#min;
  }

  /**Set the maximum value on the slider*/
  set max(max: number) {
    this.#max = max;
  }

  /**Gets the maximum value on the slider*/
  get max(): number {
    return this.#max;
  }

  /**Sets the amount of steps on the slider */
  set step(step: number) {
    this.#step = Math.max(step, 0);
  }

  /**Gets the amount of steps on the slider*/
  get step(): number {
    return this.#step;
  }

  /**Sets the amount of decimals the slider can have, 0 is none*/
  set decimals(dec: number) {
    this.#dec = Math.max(parseInt(String(dec)), 0);
  }

  /**Gets the amount of decimals the slider can have */
  get decimals() {
    return this.#dec;
  }

  /**Changes the icon on the right of the slider
   * @param {SVGElement} sym */
  set rightSymbol(sym: SVGSVGElement) {
    this.#rightSymbol.replaceChild(sym, this.#rightSymbol.firstChild!);
  }

  /**Changes the icon on the left of the slider*/
  set leftSymbol(sym: SVGSVGElement) {
    this.#leftSymbol.replaceChild(sym, this.#leftSymbol.firstChild!);
  }

  /**This steps the slider value in the given direction*/
  private __stepValue(dir: boolean) {
    if (dir)
      this.__internalSet(
        (this.__valueBuffer as number) + (this.#step != 0 ? this.#step : 1)
      );
    else
      this.__internalSet(
        (this.__valueBuffer as number) - (this.#step != 0 ? this.#step : 1)
      );
  }

  /**This is called when the user sets the value*/
  private __internalSet(val: number) {
    if (this.#step != 0) {
      let modBuff = val % this.#step;
      if (modBuff >= this.#step / 2) val = val + this.#step - modBuff;
      else val = val - modBuff;
    }
    val = Number(
      Math.min(Math.max(val, this.#min), this.#max).toFixed(this.#dec)
    );
    this.__setValue(val);
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes) {
    if (a == AccessTypes.READ) this.#stepper.tabIndex = -1;
    else if (a == AccessTypes.WRITE) this.#stepper.tabIndex = 0;
  }

  /**Internal value setter */
  protected __newValue(val: number) {
    this.#valueField.nodeValue = val.toLocaleString(undefined, {
      maximumFractionDigits: this.#dec,
    });
  }

  /**Sets the unit of the inputbox*/
  set unit(unit: string) {
    this.#unitField.nodeValue = unit;
  }

  /**Returns the current unit */
  get unit(): string {
    return "";
  }
}
defineElement(Stepper);
