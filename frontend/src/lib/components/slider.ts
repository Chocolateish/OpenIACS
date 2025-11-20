import { AccessTypes, defineElement } from "@libBase";
import {
  chevron_left,
  chevron_right,
  expand_less,
  expand_more,
} from "@libOldIcons";
import { ValueComponent, type ValueComponentOptions, Way } from "./common";
import "./slider.scss";

/**Defines options for slider component*/
export type SliderOptions = {
  /**unit to use for component*/
  unit?: string;
  /**symbol to use for left/top side*/
  leftSymbol?: SVGSVGElement;
  /**symbol to use for right/bottom side*/
  rightSymbol?: SVGSVGElement;
  /**lower limit for slider value*/
  min?: number;
  /**upper limit for slider value*/
  max?: number;
  /**amount of steps on the slider 0 is infinite*/
  step?: number;
  /**amount of decimals to round to*/
  decimals?: number;
  /**wether the events are live as the slider is moved or only when moving stops*/
  live?: boolean;
} & ValueComponentOptions;

/**Slide Selector, displays all options in a slider*/
export class Slider extends ValueComponent<SliderOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "slider";
  }

  /**Slide background box*/
  private _slide = this.appendChild(document.createElement("div"));
  /**Slide container box*/
  private __slide = this._slide.appendChild(document.createElement("div"));
  /**The slider thing itself*/
  private __slider = this.__slide.appendChild(document.createElement("div"));
  /**Textnode for value*/
  private __valNode = this.__slider.appendChild(document.createTextNode(""));
  /**Container for unit of value*/
  private __unit = this.__slider.appendChild(document.createElement("div"));
  private __moving: boolean = false;

  private __min = 0;
  private __max = 100;
  private __span = this.__max - this.__min;
  private __step = 0;
  private __dec = 0;
  private __text?: HTMLSpanElement;
  private __live: boolean = false;
  private __leftSymbol: any;
  private __rightSymbol: any;
  private __valueBufferSlider?: number;
  private __val?: number;

  constructor() {
    super();
    this.__slider.tabIndex = 0;
    //Handlers for moving the slider
    this._slide.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.__moving = true;
      this.__moveTo(e.clientX, e.clientY);
      this.__slider.setPointerCapture(e.pointerId);
      this.__slider.onpointermove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.__moveTo(e.clientX, e.clientY);
      };
      this.__slider.onpointerup = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.__moving = false;
        this.__slider.releasePointerCapture(e.pointerId);
        this.__slider.onpointermove = null;
        this.__slider.onpointerup = null;
        this.__moveTo(e.clientX, e.clientY);
      };
      this.__slider.focus();
    };

    this.__slider.onkeydown = (e) => {
      e.stopPropagation();
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          this.__stepValue(true);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          this.__stepValue(false);
          break;
      }
    };
  }

  /**Options toggeler*/
  options(options: SliderOptions): this {
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.step = options.step ?? 0;
    super.options(options);
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    this.leftSymbol = options.leftSymbol;
    this.rightSymbol = options.rightSymbol;
    if (typeof options.decimals !== "undefined")
      this.decimals = options.decimals;
    if (typeof options.live !== "undefined") this.live = options.live;
    return this;
  }

  /**Updates text of component*/
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this._slide
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.__text.remove;
      delete this.__text;
    }
  }

  /**Internal unit setter*/
  protected $vfunit(val: string) {
    this.__unit.innerHTML = val;
  }

  /**Moves the value to a position by the mouse xy coordinates*/
  private __moveTo(x: number, y: number) {
    let box = this.__slide.getBoundingClientRect();
    switch (this.__way) {
      case Way.RIGHT:
      case Way.LEFT: {
        var perc = Math.min(100, Math.max(0, ((y - box.y) / box.height) * 100));
        break;
      }
      default: {
        var perc = Math.min(100, Math.max(0, ((x - box.x) / box.width) * 100));
        break;
      }
    }
    this.__userSetValue((perc / 100) * this.__span + this.__min);
  }

  /**Moves the slider to the given percent position */
  private __movePerc(perc: number) {
    perc = Math.min(Math.max(perc, 0), 100);
    if (this.__way == 2 || this.__way == 3) {
      this.__slider.style.top = perc + "%";
    } else {
      this.__slider.style.left = perc + "%";
    }
  }

  /**This is called when the user sets the value*/
  private __userSetValue(val: number) {
    if (this.__step != 0) {
      let modBuff = val % this.__step;
      if (modBuff >= this.__step / 2) {
        val = val + this.__step - modBuff;
      } else {
        val = val - modBuff;
      }
    }
    this.__valueBufferSlider = val;

    val = Math.min(Math.max(val, this.__min), this.__max);
    if (this.__live || !this.__moving) {
      this.__val = Number(val.toFixed(this.__dec));
      this.setValue(this.__val);
    }

    this.__movePerc(((-this.__min + val) / this.__span) * 100);
    this.__valNode.nodeValue = val.toLocaleString(undefined, {
      maximumFractionDigits: this.__dec,
    });
  }

  /**This steps the slider value in the given direction*/
  private __stepValue(dir: boolean) {
    let step = this.__step || this.__span / 100;
    if (dir) {
      this.__userSetValue((this.__valueBufferSlider || 0) + step);
    } else {
      this.__userSetValue((this.__valueBufferSlider || 0) - step);
    }
  }

  /**Internal value setter*/
  protected __newValue(val: number) {
    if (!this.__moving) {
      this.__movePerc(((-this.__min + val) / this.__span) * 100);
      this.__valNode.nodeValue = val.toLocaleString(undefined, {
        maximumFractionDigits: this.__dec,
      });
    }
  }

  /**Set the minimum value on the slider*/
  set min(min: number) {
    this.__min = min;
    this.__span = this.__max - min;
  }

  /**Gets the minimum value on the slider*/
  get min(): number {
    return this.__min;
  }

  /**Set the maximum value on the slider */
  set max(max: number) {
    this.__max = max;
    this.__span = max - this.__min;
  }

  /**Gets the maximum value on the slider */
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

  /**Sets the amount of decimals the slider can have, 0 is none */
  set decimals(dec: number) {
    this.__dec = Math.max(parseInt(String(dec)), 0);
  }

  /**Gets the amount of decimals the slider can have */
  get decimals(): number {
    return this.__dec;
  }

  /**Changes the icon on the right of the slider*/
  set rightSymbol(sym: SVGSVGElement | undefined) {
    if (typeof sym === "undefined") {
      switch (this.__way) {
        case Way.RIGHT:
        case Way.LEFT: {
          sym = expand_more();
          break;
        }
        default: {
          sym = chevron_right();
          break;
        }
      }
    }
    if (this.__rightSymbol) {
      this.__rightSymbol = this._slide.replaceChild(sym, this.__rightSymbol);
      this.__rightSymbol = sym;
    } else {
      this.__rightSymbol = this._slide.appendChild(sym);
    }
    sym.onpointerdown = (e) => {
      e.stopPropagation();
      this.__stepValue(true);
    };
  }

  /**Changes the icon on the left of the slider*/
  set leftSymbol(sym: SVGSVGElement | undefined) {
    if (typeof sym === "undefined") {
      switch (this.__way) {
        case Way.RIGHT:
        case Way.LEFT: {
          sym = expand_less();
          break;
        }
        default: {
          sym = chevron_left();
          break;
        }
      }
    }
    if (this.__leftSymbol) {
      this.__leftSymbol = this._slide.replaceChild(sym, this.__leftSymbol);
      this.__leftSymbol = sym;
    } else {
      this.__leftSymbol = this._slide.appendChild(sym);
    }
    sym.onpointerdown = (e) => {
      e.stopPropagation();
      this.__stepValue(false);
    };
  }

  /**Set wether the slider is in live mode */
  set live(live: boolean) {
    this.__live = Boolean(live);
  }

  /**Internal access call*/
  protected onAccess(a: AccessTypes) {
    switch (a) {
      case AccessTypes.READ:
        this.__slider.tabIndex = -1;
        break;
      case AccessTypes.WRITE:
        this.__slider.tabIndex = 0;
        break;
    }
  }

  /**Sets the unit of the inputbox*/
  set unit(_unit: string) {}

  /**Returns the current unit*/
  get unit(): string {
    return "";
  }
}
defineElement(Slider);
