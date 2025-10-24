import { defineElement } from "@libBase";
import {
  alert_running_color,
  blue,
  grey,
  instrument_port_color,
  red,
} from "@libColors";
import {
  angleToAnchorPoint,
  circleArc,
  defineElementValues,
  degreesToRadians,
  line,
  pointOnCircle,
  svgMultiLineText,
  svgText,
} from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./dial.scss";

addThemeVariable(
  "instrDialOuterRingColor",
  ["Instruments", "Dial"],
  grey["900"],
  grey["50"]
);
addThemeVariable(
  "instrDialBackgroundRingColor",
  ["Instruments", "Dial"],
  grey["300"],
  grey["700"]
);
addThemeVariable(
  "instrDialMajorTickColor",
  ["Instruments", "Dial"],
  grey["900"],
  grey["50"]
);
addThemeVariable(
  "instrDialMinorTickColor",
  ["Instruments", "Dial"],
  grey["700"],
  grey["200"]
);
addThemeVariable(
  "instrDialNeedleColor",
  ["Instruments", "Dial"],
  blue["700"],
  blue["300"]
);
addThemeVariable(
  "instrDialLabelColor",
  ["Instruments", "Dial"],
  grey["900"],
  grey["50"]
);
addThemeVariable(
  "instrDialTextColor",
  ["Instruments", "Dial"],
  grey["900"],
  grey["50"]
);
addThemeVariable(
  "instrDialValueColor",
  ["Instruments", "Dial"],
  blue["700"],
  blue["300"]
);
addThemeVariable(
  "instrDialUnitColor",
  ["Instruments", "Dial"],
  blue["700"],
  blue["300"]
);
addThemeVariable(
  "instrDialInvalidColor",
  ["Instruments", "Dial"],
  red["500"],
  red["500"]
);
addThemeVariable(
  "instrDialRedColor",
  ["Instruments", "Lamp"],
  instrument_port_color.day,
  instrument_port_color.dusk
);
addThemeVariable(
  "instrDialGreenColor",
  ["Instruments", "Lamp"],
  alert_running_color.day,
  alert_running_color.dusk
);

/** Definition of dial colored zone data*/
export type dialZone = {
  /**classname for zone to apply css
   * red and green are predefined colors*/
  class: string;
  /**start angle of zone in degrees*/
  start: number;
  /**end angle of zone in degrees*/
  end: number;
};

/** Defines base options for components with values*/
export type InstrDialOptions = {
  /**text/description of readout*/
  text?: string;
  /**maximum amount of decimals*/
  decimals?: number;
  /**value of dial, can be common value*/
  value?: number | Value;
  /**unit of dial, can be common value*/
  unit?: string;
  /**validity of dial value, can be common value*/
  valid?: string;
  /**minimum shown value on dial*/
  min?: number;
  /**maximum shown value on dial*/
  max?: number;
  /**how many ticks are displayed between each major tick*/
  minorTicks?: number;
  /**how many major ticks are displayed*/
  majorTicks?: number;
  /**colored zones shown on dial*/
  zones?: dialZone[];
  /**overwrite for labels on dial*/
  labels?: string[];
} & InstrumentBaseOptions;

/**Dial for showing value*/
export class InstrDial extends InstrumentBase<InstrDialOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "dial";
  }

  protected $vbvalue = 50;
  private __min = 0;
  private __max = 100;
  private __major = 6;
  private __minor = 9;
  private __drawNotOk? = true;
  private ___invalid = true;
  private __zones = document.createElementNS("http://www.w3.org/2000/svg", "g");
  private __lines = document.createElementNS("http://www.w3.org/2000/svg", "g");
  private __labels = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  private __needle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  private __valueText = svgText(32, 45, "", 8, "value", 8);
  private __unitText = svgText(32, 39, "", 5, "unit", 8);
  private __text = svgMultiLineText(4, 48, 56, 16, "", 5, "text", 3)
    .firstChild! as SVGForeignObjectElement;
  private __decimals?: number;
  private __zonesvar?: dialZone[];
  private __labelOverwrite: any;

  constructor() {
    super();
    this.__svg.appendChild(
      circleArc(
        32,
        32,
        30,
        30,
        degreesToRadians(150),
        degreesToRadians(240),
        0,
        "backRing",
        4
      )
    );
    this.__svg.appendChild(this.__zones);
    this.__svg.appendChild(
      circleArc(
        32,
        32,
        31.9,
        31.9,
        degreesToRadians(150),
        degreesToRadians(240),
        0,
        "outRing",
        0.15
      )
    );
    this.__svg.appendChild(this.__lines);
    this.__svg.appendChild(this.__labels);
    this.__svg.appendChild(this.__needle);
    this.__svg.appendChild(this.__valueText);
    this.__svg.appendChild(this.__unitText);
    this.__svg.appendChild(this.__text.parentElement!);

    this.__zones.classList.add("zones");
    this.__needle.setAttribute("d", "m31.9 1h0.2l0.9 31c0 1.35-2 1.35-2 0z");
    this.__needle.classList.add("needle");
    this.__needle.setAttribute("transform-origin", "32 32");
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrDialOptions): this {
    if (options.decimals) this.decimals = options.decimals;
    super.options(options);
    if (options.text) this.text = options.text;
    if (options.unit) this.unit = options.unit;
    if (options.min != undefined) this.min = options.min;
    if (options.max != undefined) this.max = options.max;
    if (options.minorTicks != undefined) this.minorTicks = options.minorTicks;
    if (options.majorTicks != undefined) this.majorTicks = options.majorTicks;
    if (options.zones) this.zones = options.zones;
    if (options.labels) this.labels = options.labels;
    this.value = options.value;
    delete this.__drawNotOk;
    this.__drawLines();
    return this;
  }

  /**Sets value of dial*/
  set value(val: number | Value | undefined) {
    val;
  }

  /**Sets unit of dial*/
  set unit(val: string | Value) {
    val;
  }

  /**Sets validity of dial*/
  set valid(val: string | boolean | Value) {
    val;
  }

  /** This sets the minimum value on the dial */
  set min(val: number) {
    this.__min = val;
    this.__drawLines();
  }

  /** This sets the maximum value on the dial */
  set max(val: number) {
    this.__max = val;
    this.__drawLines();
  }

  /** This sets the amount of minor ticks on the dial*/
  set minorTicks(val: number) {
    this.__minor = val;
    this.__drawLines();
  }

  /** This sets the amount of major ticks on the dial */
  set majorTicks(val: number) {
    this.__major = val;
    this.__drawLines();
  }

  /** This sets the max amount of decimals shown */
  set decimals(dec: number) {
    this.__decimals = dec;
  }

  /**This adds color zones to the dial*/
  set zones(zones: dialZone[] | undefined) {
    if (zones) this.__zonesvar = zones;
    else delete this.__zonesvar;
    this.__drawLines();
  }

  /**This allows fine control over dial labels
   * Set false to disable labels
   * Set true to enable automatic labels
   * Pass array of labels to overwrite automatic labels*/
  set labels(labs: boolean | string[] | undefined) {
    if (labs === true) delete this.__labelOverwrite;
    else {
      if (labs) this.__labelOverwrite = labs;
      else this.__labelOverwrite = [];
    }
    this.__drawLines();
  }

  set text(text: string) {
    if (typeof text == "string") this.__text.innerHTML = text;
    else if (this.__text) this.__text.innerHTML = "";
  }

  private __drawLines() {
    if (this.__drawNotOk) return;
    this.__lines.innerHTML = "";
    this.__labels.innerHTML = "";
    let angle = 240 / (this.__major - 1);
    let minAngle = angle / (this.__minor + 1);
    let labelStep = (this.__max - this.__min) / (this.__major - 1);
    for (let i = 0; i < this.__major; i++) {
      let rad = ((i * angle + 150) / 180) * Math.PI;
      let start = pointOnCircle(32, 32, 31.95, rad);
      let end = pointOnCircle(32, 32, 28, rad);
      this.__lines.appendChild(
        line(start[0], start[1], end[0], end[1], "maTick", 0.18)
      );
      let label = pointOnCircle(32, 32, 27, rad);
      this.__lines.appendChild(
        svgText(
          label[0],
          label[1],
          (this.__min + labelStep * i).toFixed(0),
          5,
          "lab",
          angleToAnchorPoint(rad)
        )
      );
      if (i < this.__major - 1) {
        for (let i = 0; i < this.__minor; i++) {
          let rad2 = rad + (((1 + i) * minAngle) / 180) * Math.PI;
          let start = pointOnCircle(32, 32, 31.95, rad2);
          let end = pointOnCircle(32, 32, 30, rad2);
          this.__lines.appendChild(
            line(start[0], start[1], end[0], end[1], "miTick", 0.1)
          );
        }
      }
    }
    this.__setNeedle();
    if (this.__zonesvar) {
      this.__zones.innerHTML = "";
      for (let i = 0, m = this.__zonesvar.length; i < m; i++) {
        let start = degreesToRadians(
          ((Math.min(
            Math.max(this.__zonesvar[i].start, this.__min),
            this.__max
          ) -
            this.__min) /
            (this.__max - this.__min)) *
            240 +
            150
        );
        let end =
          degreesToRadians(
            ((Math.min(
              Math.max(this.__zonesvar[i].end, this.__min),
              this.__max
            ) -
              this.__min) /
              (this.__max - this.__min)) *
              240 +
              150
          ) - start;
        let ring = this.__zones.appendChild(
          circleArc(32, 32, 31, 31, start, end, 0, "", 2)
        );
        if (this.__zonesvar[i].class[0] == "#") {
          ring.setAttribute("stroke", this.__zonesvar[i].class);
        } else {
          ring.classList.add(this.__zonesvar[i].class);
        }
      }
    }
  }

  private __setNeedle() {
    this.__needle.setAttribute(
      "transform",
      "rotate(" +
        (((Math.min(Math.max(this.$vbvalue, this.__min), this.__max) -
          this.__min) /
          (this.__max - this.__min)) *
          240 -
          120) +
        ")"
    );
  }

  protected $vfvalue(value: any) {
    switch (typeof value) {
      case "number":
        this.__valueText.innerHTML = value.toFixed(this.__decimals);
        this.__setNeedle();
        if (this.___invalid) {
          this.classList.remove("invalid");
          this.___invalid = false;
        }
        break;
      case "object":
        this.__valueText.innerHTML = value.reason;
        this.classList.add("invalid");
        this.___invalid = true;
        break;
      default:
        this.__valueText.innerHTML = "N/A";
        this.classList.add("invalid");
        this.___invalid = true;
        break;
    }
  }

  protected $vfunit(unit: string | undefined) {
    if (typeof unit == "string") this.__unitText.innerHTML = unit;
    else this.__unitText.innerHTML = "";
  }
}
defineElement(InstrDial);
defineElementValues(InstrDial, ["value", "unit"]);
