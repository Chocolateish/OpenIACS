import { defineElement } from "@libBase";
import {
  element_active_color,
  normal_enabled_background_color,
  normal_enabled_border_color,
} from "@libColors";
import { defineElementValues, rectangle, svg, svgText } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./slider.scss";

let bar = rectangle(133, 24, 265, 3, 1.5, "bar", 1);
let barmarked = rectangle(133, 24, 265, 3, 1.5, "barmarked", 1);
let slider = rectangle(133, 24, 40, 32, 6, "slider", 1);
let text = svgText(133, 24, "50", 12, "text", 8);
let left = svg(24, 24, "0 0 24 24", "minus");
let right = svg(24, 24, "0 0 24 24", "plus");
let minus = document.createElementNS("http://www.w3.org/2000/svg", "path");
minus.classList.add("icon");
minus.setAttribute(
  "d",
  "M19,19V5H5V19H19M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5C3,3.89 3.9,3 5,3H19M17,11V13H7V11H17Z"
);
left.appendChild(minus);
let plus = document.createElementNS("http://www.w3.org/2000/svg", "path");
plus.classList.add("icon");
plus.setAttribute(
  "d",
  "M19,19V5H5V19H19M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5C3,3.89 3.9,3 5,3H19M11,7H13V11H17V13H13V17H11V13H7V11H11V7Z"
);
right.appendChild(plus);

addThemeVariable(
  "ElementActiveColor",
  ["Instruments", "Button"],
  element_active_color.day,
  element_active_color.dusk
);
addThemeVariable(
  "NormalEnabledBackgroundColor",
  ["Instruments", "Button"],
  normal_enabled_background_color.day,
  normal_enabled_background_color.dusk
);
addThemeVariable(
  "NormalEnabledBorderColor",
  ["Instruments", "Button"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);

/**Defines options for slider instrument*/
type InstrSliderOptions = {
  /**The symbol to the right of the slider */
  right?: SVGSVGElement;
  /**The symbol to the left of the slider */
  left?: SVGSVGElement;
  /**The maximum value of the slider */
  maxValue?: number;
  /**The minimum value of the slider */
  minValue?: number;
  /**The value of the slider */
  value?: number | Value;
  /**The stepsize of the buttons */
  stepsize?: number;
} & InstrumentBaseOptions;

export class InstrSlider extends InstrumentBase<InstrSliderOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }

  private __barmarked: SVGRectElement;
  private __slider: SVGRectElement;
  private __text: SVGTextElement;
  private __asdf: ChildNode;
  private __maxValue: number = 100;
  private __minValue: number = 0;
  private __span: number = 100;
  private __stepsize: number | undefined;
  private ___invalid: boolean = true;
  private $vbvalue: number = 0;
  private __minus?: SVGSVGElement;
  private __plus?: SVGSVGElement;

  constructor() {
    super();
    this.__svg.appendChild(bar.cloneNode(true));
    this.__svg.appendChild(
      (this.__barmarked = barmarked.cloneNode(true) as SVGRectElement)
    );
    this.__svg.appendChild(
      (this.__slider = slider.cloneNode(true) as SVGRectElement)
    );
    this.__svg.appendChild(
      (this.__text = text.cloneNode(true) as SVGTextElement)
    );
    this.__asdf = this.__text.firstChild!;

    this.__svg.onpointerdown = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGGElement).setPointerCapture(e.pointerId);
      (e.currentTarget! as SVGGElement).onpointermove = (e) => {
        this.__moveSlider(e);
      };
    };
    this.__svg.onpointerup = (e) => {
      this.__moveSlider(e);
      e.stopPropagation();
      (e.currentTarget! as SVGGElement).releasePointerCapture(e.pointerId);
      //@ts-expect-error
      (e.currentTarget! as SVGGElement).onpointermove = undefined;
    };
    this.__barmarked.setAttribute("transform", "scale(" + 0.5 + "," + 1 + ")");
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrSliderOptions): this {
    super.options(options);
    this.leftSymbol = options.left;
    this.rightSymbol = options.right;
    if (typeof options.maxValue === "number") this.maxValue = options.maxValue;
    if (typeof options.minValue === "number") this.minValue = options.minValue;
    if (typeof options.value !== "undefined") this.value = options.value;
    if (typeof options.stepsize == "number") this.__stepsize = options.stepsize;
    return this;
  }

  set maxValue(max: number) {
    this.__maxValue = max;
    this.__initSpan();
  }

  set minValue(min: number) {
    this.__minValue = min;
    this.__initSpan();
  }

  private __initSpan() {
    this.__span = this.__maxValue - this.__minValue;
    this.__setPos(this.$vbvalue);
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 266;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 48;
  }

  set leftSymbol(symbol: SVGSVGElement | undefined) {
    if (symbol) this.__svg.appendChild((this.__minus = symbol));
    else
      this.__svg.appendChild(
        (this.__minus = left.cloneNode(true) as SVGSVGElement)
      );

    this.__minus.appendChild(rectangle(12, 12, 24, 24, 0, "boxbackground"));
    this.__minus.setAttribute("x", "-24");
    this.__minus.setAttribute("y", "12");
    this.__minus.setAttribute("hight", "24");
    this.__minus.setAttribute("width", "24");

    this.__minus.onpointerdown = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGSVGElement).setPointerCapture(e.pointerId);
    };
    this.__minus.onpointerup = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGSVGElement).releasePointerCapture(e.pointerId);
      if (this.__stepsize) {
        let valbuf = this.$vbvalue - this.__stepsize;
        if (valbuf < this.__minValue) {
          valbuf = this.__minValue;
        }
        this.$vsvalue(valbuf);
      }
    };
    this.__minus.onpointerleave = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGSVGElement).releasePointerCapture(e.pointerId);
    };
  }

  set rightSymbol(symbol: SVGSVGElement | undefined) {
    if (symbol) this.__svg.appendChild((this.__plus = symbol));
    else
      this.__svg.appendChild(
        (this.__plus = right.cloneNode(true) as SVGSVGElement)
      );

    this.__plus.appendChild(rectangle(12, 12, 24, 24, 0, "boxbackground"));
    this.__plus.setAttribute("x", "266");
    this.__plus.setAttribute("y", "12");
    this.__plus.setAttribute("hight", "24");
    this.__plus.setAttribute("width", "24");

    this.__plus.onpointerdown = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGSVGElement).setPointerCapture(e.pointerId);
    };
    this.__plus.onpointerup = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGSVGElement).releasePointerCapture(e.pointerId);
      if (this.__stepsize) {
        let valbuf = this.$vbvalue + this.__stepsize;
        if (valbuf > this.__maxValue) {
          valbuf = this.__maxValue;
        }
        this.$vsvalue(valbuf);
      }
    };
    this.__plus.onpointerleave = (e) => {
      e.stopPropagation();
      (e.currentTarget! as SVGSVGElement).releasePointerCapture(e.pointerId);
    };
  }

  private __setPos(val: number) {
    let place = (val - this.__minValue) / this.__span;
    if (place > 1) {
      place = 1;
    } else if (val < this.__minValue) {
      place = 0;
    }
    this.__barmarked.setAttribute(
      "transform",
      "scale(" + place + "," + 1 + ")"
    );
    this.__slider.setAttribute("x", String(Math.round(place * 226)));
    this.__asdf.nodeValue = String(Math.round(val));
    this.__text.setAttribute("x", String(Math.round(place * 226) + 20));
  }

  /**Sets the value according to the slider*/
  private __moveSlider(e: PointerEvent) {
    let x = e.clientX;
    let box = this.__svg.getBoundingClientRect();
    let littelbox = this.__slider.getBoundingClientRect();
    let per = (x - box.x - littelbox.width / 2) / (box.width - littelbox.width);
    if (per < 0) per = 0;
    else if (per > 1) per = 1;
    let val = (this.__maxValue - this.__minValue) * per + this.__minValue;
    this.$vsvalue(val);
  }

  set value(_value: number | Value) {}

  protected $vfvalue(value: number) {
    if (typeof value === "object") {
      this.__setPos(0);
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      this.__setPos(value);
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }

  protected $vsvalue(_value: number) {}
}
defineElement(InstrSlider);
defineElementValues(InstrSlider, ["value"]);
