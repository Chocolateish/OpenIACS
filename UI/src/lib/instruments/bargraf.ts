import { defineElement } from "@libBase";
import {
  border_divider_color,
  container_background_color,
  grey,
  instrument_dynamic_color,
  instrument_port_color,
  instrument_starbord_color,
  instrument_track_color,
  normal_enabled_border_color,
} from "@libColors";
import {
  defineElementValues,
  line,
  rectangle,
  svgGroup,
  svgText,
} from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import "./bargraf.scss";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
let height = 176;
let width = 30;

let frame = rectangle(15, 88, width, height, 6);
frame.classList.add("frame");

let measureBackground = rectangle(15, 88, width, height, 6);
measureBackground.classList.add("messureBackground");

let measureval = rectangle(15, 88, width, height, 0);
measureval.classList.add("messureVal");
measureval.setAttribute("transform-origin", "120 176");

let outherFrame = rectangle(15, 88, width + 2, height + 2, 6);
outherFrame.classList.add("outherFrame");

let topBar = rectangle(1.5, 88, 3, height - 2, 0);
topBar.classList.add("greenBar");

let bottomBar = rectangle(1.5, 88, 3, height - 2, 0);
bottomBar.classList.add("redBar");

addThemeVariable(
  "instrTankBackgroundColor",
  ["Instruments", "Button"],
  container_background_color.day,
  container_background_color.dusk
);
addThemeVariable(
  "instrTankOuterColor",
  ["Instruments", "Button"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);
addThemeVariable(
  "outerBackground",
  ["Instruments", "Button"],
  grey[50],
  grey[900]
);
addThemeVariable(
  "instrMessureBackGroundColor",
  ["Instruments", "Button"],
  instrument_track_color.day,
  instrument_track_color.dusk
);
addThemeVariable(
  "instrmessurValGroundColor",
  ["Instruments", "Button"],
  instrument_dynamic_color.day,
  instrument_dynamic_color.dusk
);
addThemeVariable(
  "instrdividerColor",
  ["Instruments", "Button"],
  border_divider_color.day,
  border_divider_color.dusk
);
addThemeVariable(
  "instrRed",
  ["Instruments", "Button"],
  instrument_port_color.day,
  instrument_port_color.dusk
);
addThemeVariable(
  "instrGreen",
  ["Instruments", "Button"],
  instrument_starbord_color.day,
  instrument_starbord_color.dusk
);

/**Defines options for Tank component */
export type BarGraphOptions = {
  /** number of lines */
  ticks: number;
  /** tankt level */
  value: number | Value;
  /** the max value of the tank */
  maxValue: number;
  /** The minimum value */
  minValue: number;
  /** the boder fore the red bar */
  readborder: number;
  /** The offset of the text from the top and buttom */
  textOffset: number;
  /** True if the redbar should start at the top */
  redbarTop: boolean;
  /** The unit of the tank */
  unit: string;
} & InstrumentBaseOptions;

export class InstrBarGraph extends InstrumentBase<BarGraphOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "bargraph";
  }

  private ___invalid: boolean;
  private __rect1: SVGRectElement;
  private __bottomBar: SVGRectElement;
  private __lines: SVGGElement;
  private __topBar: SVGRectElement;
  frame: SVGRectElement;
  private __maxValue?: number;
  private __minValue?: number;
  private __ticks?: number;
  private __textOffset?: number;
  unit?: string;
  value?: number | Value;
  private __readborder?: number;
  private __redbarTop?: boolean;

  constructor() {
    super();
    this.__svg.appendChild(measureBackground.cloneNode(true));
    this.__svg.appendChild(
      (this.__rect1 = measureval.cloneNode(true) as SVGRectElement)
    );
    this.__svg.appendChild(
      (this.__bottomBar = bottomBar.cloneNode(true) as SVGRectElement)
    );
    this.__svg.appendChild((this.__lines = svgGroup()));
    this.__svg.appendChild(
      (this.__topBar = topBar.cloneNode(true) as SVGRectElement)
    );
    this.__svg.appendChild(outherFrame.cloneNode(true));
    this.__svg.appendChild(
      (this.frame = frame.cloneNode(true) as SVGRectElement)
    );
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: BarGraphOptions): this {
    super.options(options);
    if (typeof options.maxValue === "number")
      this.__maxValue = options.maxValue;
    if (typeof options.minValue === "number")
      this.__minValue = options.minValue;
    if (typeof options.ticks === "number") this.__ticks = options.ticks;
    if (typeof options.textOffset === "number")
      this.__textOffset = options.textOffset;
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    if (typeof options.value !== "undefined") this.value = options.value;
    if (typeof options.readborder === "number")
      this.__readborder = options.readborder;
    if (typeof options.redbarTop === "boolean")
      this.__redbarTop = options.redbarTop;
    this.__drawLines();
    this.__drawGreenline();
    return this;
  }

  /**Original width of rendered graphics */
  get renderWidth(): number {
    return 32;
  }
  /**Original height of rendered graphics */
  get renderHeight(): number {
    return 176;
  }

  private __setBar(value: number) {
    if (this.__maxValue == 0) return;
    if (value < this.__minValue!) {
      let min = this.__textOffset! / height;
      this.__rect1.setAttribute("transform", "scale(" + 1 + "," + min + ")");
    } else if (value > this.__maxValue!) {
      this.__rect1.setAttribute("transform", "scale(" + 1 + "," + 1 + ")");
    } else {
      let dif = this.__maxValue! - this.__minValue!;
      let deltaT = dif / (this.__ticks! - 1);
      let Tnum = (value - this.__minValue!) / deltaT;
      let hi =
        height -
        this.__textOffset! -
        ((height - this.__textOffset! * 2) / (this.__ticks! - 1)) * Tnum;
      let barBuf = (height - hi) / height;
      this.__rect1.setAttribute("transform", "scale(" + 1 + "," + barBuf + ")");
    }
  }

  private __drawLine(linehight: number, val: number, warninglevel: string) {
    val = Math.round(val);
    if (val < 10) {
      this.__lines.appendChild(line(0, linehight, 10, linehight, "leveler", 1));
      this.__lines.appendChild(
        line(20, linehight, 30, linehight, "leveler", 1)
      );
      let subline = svgText(12.5, linehight, String(val), 10, warninglevel, 1);
      this.__lines.appendChild(subline.cloneNode(true));
    } else if (val < 100) {
      this.__lines.appendChild(
        line(0, linehight, 7.5, linehight, "leveler", 1)
      );
      this.__lines.appendChild(
        line(22.5, linehight, 30, linehight, "leveler", 1)
      );
      let subline = svgText(9.5, linehight, String(val), 10, warninglevel, 1);
      this.__lines.appendChild(subline.cloneNode(true));
    } else if (val < 1000) {
      this.__lines.appendChild(line(0, linehight, 5, linehight, "leveler", 1));
      this.__lines.appendChild(
        line(25, linehight, 30, linehight, "leveler", 1)
      );
      let subline = svgText(6.5, linehight, String(val), 10, warninglevel, 1);
      this.__lines.appendChild(subline.cloneNode(true));
    }
  }

  /** This draws the lines on the tank indicator */
  private __drawLines() {
    if (!this.__maxValue && this.__minValue) return;
    let dif = this.__maxValue! - this.__minValue!;
    let deltaT = dif / (this.__ticks! - 1);
    this.__drawLine(height - this.__textOffset!, this.__minValue!, "black");
    for (let i = 1; i < this.__ticks!; i++) {
      let va = deltaT * i + this.__minValue!;
      let hi =
        height -
        this.__textOffset! -
        ((height - this.__textOffset! * 2) / (this.__ticks! - 1)) * i;
      this.__drawLine(hi, va, "black");
    }
  }

  __drawGreenline() {
    let dif = this.__maxValue! - this.__minValue!;
    let deltaT = dif / (this.__ticks! - 1);
    let Tnum = (this.__readborder! - this.__minValue!) / deltaT;
    let hi =
      height -
      this.__textOffset! -
      ((height - this.__textOffset! * 2) / (this.__ticks! - 1)) * Tnum;
    this.__topBar.setAttribute("height", String(hi - 1));
    if (this.__redbarTop == true) {
      this.__topBar.classList.remove("greenBar");
      this.__topBar.classList.add("redBar");
      this.__bottomBar.classList.remove("redBar");
      this.__bottomBar.classList.add("greenBar");
    }
  }

  protected $vfvalue(value: number) {
    if (typeof value === "object") {
      this.__setBar(0);
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      this.__setBar(value);
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}

defineElement(InstrBarGraph);
defineElementValues(InstrBarGraph, ["value"]);
