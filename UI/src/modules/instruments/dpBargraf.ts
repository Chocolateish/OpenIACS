import { defineElement } from "@libBase";
import { normal_enabled_border_color } from "@libColors";
import { defineElementValues, line, rectangle } from "@libCommon";
import { InstrumentBase, type InstrumentBaseOptions } from "@libInstr";
import { addThemeVariable } from "@libTheme";
import "./dpBargraf.scss";

let frame = rectangle(50, 15, 100, 30, 3, "frame", 2);
frame.classList.add("frame");
let valone = rectangle(75, 15, 50, 28, 3, "val", 1);
valone.setAttribute("transform-origin", "50 1");
let valtwo = rectangle(25, 15, 50, 28, 3, "val", 1);
valtwo.setAttribute("transform-origin", "50 1");
let startLine = line(50, 0, 50, 30, "startLine", 3);

addThemeVariable(
  "instrButtonOuterColor",
  ["Instruments", "Button"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);

/**Defines options for button instrument*/
type DPBarGraphOptions = {
  /**Click function to run when clicked*/
  click?: () => void;
  /**Choose the function of the button*/
  toggle?: boolean;
  /**Text on the button*/
  text?: string;
  /**Value*/
  val?: number;
  /**The size of the text*/
  textSize?: number;
} & InstrumentBaseOptions;

export class InstrdpBargraf extends InstrumentBase {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-instrument-bargraf";
  }

  private __valOne: SVGRectElement;
  private __valTwo: SVGRectElement;

  constructor() {
    super();
    this.__svg.appendChild(frame.cloneNode(true) as SVGRectElement);
    this.__valOne = this.__svg.appendChild(
      valone.cloneNode(true) as SVGRectElement
    );
    this.__valTwo = this.__svg.appendChild(
      valtwo.cloneNode(true) as SVGRectElement
    );
    this.__svg.appendChild(startLine.cloneNode(true) as SVGPathElement);
  }

  /**Options toggeler*/
  options(options: DPBarGraphOptions): this {
    super.options(options);
    if (typeof options.val !== "undefined") this.val = options.val;
    this.__updategraf(this.val);
    return this;
  }

  __updategraf(val: number) {
    if (val < 0) {
      this.__valOne.setAttribute("transform", "scale(" + 0 + "," + 1 + ")");
      if (val < -100) {
        this.__valTwo.setAttribute("transform", "scale(" + 1 + "," + 1 + ")");
      } else {
        this.__valTwo.setAttribute(
          "transform",
          "scale(" + -val / 100 + "," + 1 + ")"
        );
      }
    } else {
      this.__valTwo.setAttribute("transform", "scale(" + 0 + "," + 1 + ")");
      if (val > 100) {
        this.__valOne.setAttribute("transform", "scale(" + 1 + "," + 1 + ")");
      } else {
        this.__valOne.setAttribute(
          "transform",
          "scale(" + val / 100 + "," + 1 + ")"
        );
      }
    }
  }

  /**Original width of rendered graphics */
  get renderWidth() {
    return 128;
  }

  /**Original height of rendered graphics*/
  get renderHeight() {
    return 128;
  }

  set val(_val: number) {}

  get val() {
    return undefined as any;
  }

  protected $vfval(val: number) {
    this.__updategraf(val);
  }

  protected $vsval() {}
}
defineElement(InstrdpBargraf);
defineElementValues(InstrdpBargraf, ["val"]);
