import { AccessTypes, define_element } from "@libBase";
import {
  material_navigation_chevron_left_rounded,
  material_navigation_chevron_right_rounded,
} from "@libIcons";
import type { SVGFunc } from "@libSVG";
import { FormValueWrite } from "./common";
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
};

/**Slide Selector, displays all options in a slider*/
export class Slider extends FormValueWrite<number> {
  /**Returns the name used to define the element */
  static element_name() {
    return "slider";
  }

  #slide_bg = this.appendChild(document.createElement("div"));
  #slide_way = document.createElement("div");
  #slider = this.#slide_way.appendChild(document.createElement("div"));
  #valNode = this.#slider.appendChild(document.createTextNode(""));
  #unit = this.#slider.appendChild(document.createElement("div"));
  #moving: boolean = false;

  #text?: HTMLSpanElement;
  #leftIcon: any;
  #rightIcon: any;
  #min = 0;
  #max = 100;
  #span = this.#max - this.#min;
  #step = 0;
  #dec = 0;
  #live: boolean = false;
  #valueBufferSlider?: number;
  #val?: number;

  constructor(
    label?: string,
    rightIcon?: SVGFunc,
    leftIcon?: SVGFunc,
    cid?: string
  ) {
    super(cid);
    if (label) this.label = label;

    this.#slide_bg.appendChild(this.warn_input);
    this.leftIcon = leftIcon ?? material_navigation_chevron_left_rounded;
    this.#slide_bg.appendChild(this.#slide_way);
    this.rightIcon = rightIcon ?? material_navigation_chevron_right_rounded;
    this.#slider.tabIndex = 0;
    //Handlers for moving the slider
    this.#slider.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let bbox = this.#slider.getBoundingClientRect();
      let offset = e.clientX - bbox.x;
      console.error(offset, e.clientX, bbox.x);

      this.#moving = true;
      this.#slider.setPointerCapture(e.pointerId);
      this.#slider.onpointermove = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.#move_to(ev.clientX - offset);
      };
      this.#slider.onpointerup = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.#moving = false;
        this.#slider.releasePointerCapture(ev.pointerId);
        this.#slider.onpointermove = null;
        this.#slider.onpointerup = null;
        this.#move_to(ev.clientX - offset);
      };
      this.#slider.focus();
    };

    this.#slider.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === "ArrowRight") this.#step_value(true);
      else if (e.key === "ArrowLeft") this.#step_value(false);
    };
  }

  /**Options toggeler*/
  options(options: SliderOptions): this {
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.step = options.step ?? 0;
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    if (typeof options.decimals !== "undefined")
      this.decimals = options.decimals;
    if (typeof options.live !== "undefined") this.live = options.live;
    return this;
  }

  /**Updates text of component*/
  set label(text: string) {
    if (typeof text == "string") {
      if (!this.#text) {
        this.#text = this.insertBefore(
          document.createElement("span"),
          this.#slide_bg
        );
      }
      this.#text.innerHTML = text;
    } else if (this.#text) {
      this.#text.remove;
      this.#text = undefined;
    }
  }

  /**Changes the icon on the right of the slider*/
  set rightIcon(icon: SVGFunc) {
    let i = icon();
    if (this.#rightIcon) this.#slide_bg.replaceChild(i, this.#rightIcon);
    else this.#slide_bg.appendChild(i);
    this.#rightIcon = i;
    i.onpointerdown = (e) => {
      e.stopPropagation();
      this.#step_value(true);
    };
  }

  /**Changes the icon on the left of the slider*/
  set leftIcon(icon: SVGFunc) {
    let i = icon();
    if (this.#leftIcon) this.#slide_bg.replaceChild(i, this.#leftIcon);
    else this.#slide_bg.appendChild(i);
    this.#leftIcon = i;
    i.onpointerdown = (e) => {
      e.stopPropagation();
      this.#step_value(false);
    };
  }

  /**Moves the value to a position by the mouse xy coordinates*/
  #move_to(x: number) {
    let way = this.#slide_way.getBoundingClientRect();
    let slider = this.#slider.getBoundingClientRect();
    let span = way.width - slider.width;
    let xinspan = x - way.x;
    let yo = xinspan / span;
    console.error(yo);
    var perc = Math.min(100, Math.max(0, yo * 100));
    this.#user_set_value((perc / 100) * this.#span + this.#min);
  }

  /**Moves the slider to the given percent position */
  #move_perc(perc: number) {
    this.#slider.style.left = Math.min(Math.max(perc, 0), 100) + "%";
  }

  /**This is called when the user sets the value*/
  #user_set_value(val: number) {
    if (this.#step != 0) {
      let modBuff = val % this.#step;
      if (modBuff >= this.#step / 2) val = val + this.#step - modBuff;
      else val = val - modBuff;
    }
    this.#valueBufferSlider = val;
    val = Math.min(Math.max(val, this.#min), this.#max);
    if (this.#live || !this.#moving) {
      this.#val = Number(val.toFixed(this.#dec));
      this.set_value(this.#val);
    }
    this.#move_perc(((-this.#min + val) / this.#span) * 100);
    this.#valNode.nodeValue = val.toLocaleString(undefined, {
      maximumFractionDigits: this.#dec,
    });
  }

  /**This steps the slider value in the given direction*/
  #step_value(dir: boolean) {
    let step = this.#step || this.#span / 100;
    if (dir) this.#user_set_value((this.#valueBufferSlider || 0) + step);
    else this.#user_set_value((this.#valueBufferSlider || 0) - step);
  }

  /**Internal value setter*/
  protected new_value(val: number) {
    if (!this.#moving) {
      this.#move_perc(((-this.#min + val) / this.#span) * 100);
      this.#valNode.nodeValue = val.toLocaleString(undefined, {
        maximumFractionDigits: this.#dec,
      });
    }
  }

  protected new_error(_val: string): void {}

  /**Set the minimum value on the slider*/
  set min(min: number) {
    this.#min = min;
    this.#span = this.#max - min;
  }

  /**Gets the minimum value on the slider*/
  get min(): number {
    return this.#min;
  }

  /**Set the maximum value on the slider */
  set max(max: number) {
    this.#max = max;
    this.#span = max - this.#min;
  }

  /**Gets the maximum value on the slider */
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

  /**Sets the amount of decimals the slider can have, 0 is none */
  set decimals(dec: number) {
    this.#dec = Math.max(parseInt(String(dec)), 0);
  }

  /**Gets the amount of decimals the slider can have */
  get decimals(): number {
    return this.#dec;
  }

  /**Set wether the slider is in live mode */
  set live(live: boolean) {
    this.#live = Boolean(live);
  }

  /**Internal access call*/
  protected onAccess(a: AccessTypes) {
    switch (a) {
      case AccessTypes.Read:
        this.#slider.tabIndex = -1;
        break;
      case AccessTypes.Write:
        this.#slider.tabIndex = 0;
        break;
    }
  }

  /**Sets the unit of the inputbox*/
  set unit(unit: string) {
    this.#unit.innerHTML = unit;
  }
}
define_element(Slider);

export let form_slider = {
  /**Creates a button form element */
  from(text?: string): Slider {
    return new Slider(text);
  },
};
