import { AccessTypes, defineElement } from "@libBase";
import { defineElementValues, setCaretPosition } from "@libCommon";
import { add, remove } from "@libIcons";
import {
  type ComponentUnit,
  ValueComponent,
  type ValueComponentOptions,
} from "./common";
import "./stepper.scss";

/**Defines options for stepper component*/
export type StepperOptions = {
  /**unit to use for component */
  unit?: ComponentUnit;
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

  private __min = 0;
  private __max = 100;
  private __step = 0;
  private __dec = 0;
  private __stepper = this.appendChild(document.createElement("div"));
  private __leftSymbol = this.__stepper.appendChild(
    document.createElement("div")
  );
  private __interval: any;
  private __valueContainer = this.__stepper.appendChild(
    document.createElement("span")
  );
  private __field = this.__valueContainer.appendChild(
    document.createElement("span")
  );
  private __valueField = this.__field.appendChild(document.createTextNode(""));
  private __unit = this.__valueContainer.appendChild(
    document.createElement("div")
  );
  private __unitField = this.__unit.appendChild(document.createTextNode(""));
  private __rightSymbol = this.__stepper.appendChild(
    document.createElement("div")
  );
  private __text?: HTMLSpanElement;

  constructor() {
    super();
    this.__stepper.tabIndex = 0;
    this.__stepper.onkeydown = (e) => {
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
        this.__field.focus();
      }
    };
    this.__leftSymbol.appendChild(remove());
    this.__leftSymbol.onpointerdown = (e) => {
      this.__leftSymbol.setPointerCapture(e.pointerId);
      this.__stepValue(false);
      this.__setInterval(false);
    };
    this.__leftSymbol.onpointerup = () => {
      clearInterval(this.__interval);
    };

    this.__valueContainer.onclick = (e) => {
      let box = this.__field.getBoundingClientRect();
      this.__field.focus();
      if (e.clientX > box.x) {
        setCaretPosition(this.__field, this.__valueField.nodeValue!.length);
      }
    };
    this.__field.contentEditable = "true";
    this.__field.inputMode = "decimal";
    this.__field.tabIndex = -1;
    this.__field.onkeydown = (e) => {
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
              Number(this.__valueField.nodeValue!.replace(",", "."))
            );
            e.preventDefault();
            break;
          }
        }
      } else {
        e.preventDefault();
      }
    };
    this.__field.onblur = () => {
      this.__internalSet(
        Number(this.__valueField.nodeValue!.replace(",", "."))
      );
    };
    this.__field.ondrop = (e) => {
      e.preventDefault();
    };
    this.__field.onclick = (e) => {
      e.stopPropagation();
    };
    this.__rightSymbol.appendChild(add());
    this.__rightSymbol.onpointerdown = (e) => {
      this.__rightSymbol.setPointerCapture(e.pointerId);
      this.__stepValue(true);
      this.__setInterval(true);
    };
    this.__rightSymbol.onpointerup = () => {
      clearInterval(this.__interval);
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
    clearInterval(this.__interval);
    this.__interval = setTimeout(() => {
      this.__stepValue(dir);
      this.__setInterval(dir, Math.max(80, time - 20));
    }, time);
  }

  /**Updates text of component */
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.__stepper
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.__text.remove;
      delete this.__text;
    }
  }

  /**Set the minimum value on the slider*/
  set min(min: number) {
    if (typeof min === "number") {
      this.__min = min;
    }
  }

  /**Gets the minimum value on the slider*/
  get min(): number {
    return this.__min;
  }

  /**Set the maximum value on the slider*/
  set max(max: number) {
    if (typeof max === "number") {
      this.__max = max;
    }
  }

  /**Gets the maximum value on the slider*/
  get max(): number {
    return this.__max;
  }

  /**Sets the amount of steps on the slider */
  set step(step: number) {
    this.__step = Math.max(step, 0);
  }

  /**Gets the amount of steps on the slider*/
  get step(): number {
    return this.__step;
  }

  /**Sets the amount of decimals the slider can have, 0 is none*/
  set decimals(dec: number) {
    this.__dec = Math.max(parseInt(String(dec)), 0);
  }

  /**Gets the amount of decimals the slider can have
   * @returns {number} */
  get decimals() {
    return this.__dec;
  }

  /**Changes the icon on the right of the slider
   * @param {SVGElement} sym */
  set rightSymbol(sym: SVGSVGElement) {
    this.__rightSymbol.replaceChild(sym, this.__rightSymbol.firstChild!);
  }

  /**Changes the icon on the left of the slider*/
  set leftSymbol(sym: SVGSVGElement) {
    this.__leftSymbol.replaceChild(sym, this.__leftSymbol.firstChild!);
  }

  /**This steps the slider value in the given direction*/
  private __stepValue(dir: boolean) {
    if (dir) {
      this.__internalSet(
        (this.__valueBuffer as number) + (this.__step != 0 ? this.__step : 1)
      );
    } else {
      this.__internalSet(
        (this.__valueBuffer as number) - (this.__step != 0 ? this.__step : 1)
      );
    }
  }

  /**This is called when the user sets the value*/
  private __internalSet(val: number) {
    if (this.__step != 0) {
      let modBuff = val % this.__step;
      if (modBuff >= this.__step / 2) {
        val = val + this.__step - modBuff;
      } else {
        val = val - modBuff;
      }
    }
    val = Number(
      Math.min(Math.max(val, this.__min), this.__max).toFixed(this.__dec)
    );
    this.__setValue(val);
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes) {
    if (a == AccessTypes.READ) this.__stepper.tabIndex = -1;
    else if (a == AccessTypes.WRITE) this.__stepper.tabIndex = 0;
  }

  /**Internal value setter */
  protected __newValue(val: number) {
    this.__valueField.nodeValue = val.toLocaleString(undefined, {
      maximumFractionDigits: this.__dec,
    });
  }

  /**Sets the unit of the inputbox*/
  set unit(_unit: ComponentUnit) {}

  /**Returns the current unit */
  get unit(): string {
    return "";
  }

  /**Internal unit setter*/
  //@ts-ignore
  private $vfunit(unit: string) {
    this.__unitField.nodeValue = unit;
  }
}
defineElement(Stepper);
defineElementValues(Stepper, ["unit"]);
