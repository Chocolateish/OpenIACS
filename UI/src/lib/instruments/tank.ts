import { defineElement } from "@libBase";
import {
  border_divider_color,
  container_background_color,
  element_active_color,
  element_neutral_color,
  grey,
  instrument_dynamic_color,
  instrument_track_color,
  normal_enabled_border_color,
} from "@libColors";
import {
  defineElementValues,
  line,
  rectangle,
  SVGAnchor,
  svgGroup,
  svgMultiLineText,
} from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./tank.scss";

addThemeVariable(
  "instrTankBackgroundColor",
  ["Instruments", "Tank"],
  container_background_color.day,
  container_background_color.dusk
);
addThemeVariable(
  "instrTankOuterColor",
  ["Instruments", "Tank"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);
addThemeVariable(
  "outerBackground",
  ["Instruments", "Tank"],
  grey[50],
  grey[900]
);
addThemeVariable(
  "instrMessureBackGroundColor",
  ["Instruments", "Tank"],
  instrument_track_color.day,
  instrument_track_color.dusk
);
addThemeVariable(
  "instrmessurValGroundColor",
  ["Instruments", "Tank"],
  instrument_dynamic_color.day,
  instrument_dynamic_color.dusk
);
addThemeVariable(
  "instrdividerColor",
  ["Instruments", "Tank"],
  border_divider_color.day,
  border_divider_color.dusk
);
addThemeVariable(
  "instrElementActive",
  ["Instruments", "Tank"],
  element_active_color.day,
  element_active_color.dusk
);
addThemeVariable(
  "instrElementNeutral",
  ["Instruments", "Tank"],
  element_neutral_color.day,
  element_neutral_color.dusk
);

let overAllBackground = rectangle(60, 88, 120, 176, 6);
overAllBackground.classList.add("overAllBaground");

let outerBorder = rectangle(60, 88, 120, 176, 6);
outerBorder.classList.add("outer_border");

let background = rectangle(60, 88, 118, 174, 6);
background.classList.add("background");

let measureBackground = rectangle(109, 88, 22, 176, 0);
measureBackground.classList.add("messureBackground");

let outerFrame = rectangle(60, 88, 122, 178, 6);
outerFrame.classList.add("outerFrame");

let measureval = rectangle(109, 88, 22, 176, 0);
measureval.classList.add("messureVal");
measureval.setAttribute("transform-origin", "120 176");

let divider = line(98, 0, 98, 176, "divider", 1);
let valueDivider = line(8, 55, 90, 55, "valueDivider", 1);
let headline = svgMultiLineText(5, -1, 122, 24, "VALUE1", 12, "headline", 1);
let subline = svgMultiLineText(5, 14, 122, 24, "MSD", 12, "subline", 1);
let tankMaxValue = svgMultiLineText(
  5,
  29,
  122,
  24,
  "<span></span><span></span>",
  12,
  "value3",
  0
);
let per = svgMultiLineText(
  -7,
  37,
  91,
  16,
  "0",
  20,
  "value4",
  SVGAnchor.middleRight
);
let persym = svgMultiLineText(
  85,
  39,
  20,
  16,
  "%",
  14,
  "value5",
  SVGAnchor.middleLeft
);
let value = svgMultiLineText(4, 58, 91, 24, "", 24, "value4", 5);
let unitBig = svgMultiLineText(4, 76, 91, 24, "", 16, "value5", 5);
let mass = svgMultiLineText(4, 98, 91, 24, "", 24, "value4", 5);
let massUnit = svgMultiLineText(4, 116, 91, 24, "", 16, "value5", 5);
let density = svgMultiLineText(4, 137, 91, 24, "", 20, "value4", 5);
let densityUnit = svgMultiLineText(4, 153, 91, 24, "", 12, "value5", 5);

/**Defines options for Tank component*/
type InstrTankOptions = {
  /**lines to be replaced */
  lines?: number[];
  /**the headline of the tank */
  headline?: string;
  /**the subline of the tank */
  subline?: string;
  /**Tank level */
  value?: number | Value;
  /*unit */
  unit?: string | Value;
  /**Amount of decimals */
  decimals?: number;
  /**maxvalue of the tank */
  maxValue?: number;

  /**Mass of fluid in tank */
  mass?: number | Value;
  /** */
  massUnit?: string | Value;
  /**Amount of decimals for mass */
  massDecimals?: number;

  /**Tank fluid density */
  density?: number | Value;
  /*Tank fluid density unit */
  densityUnit?: string | Value;
  /**Amount of decimals for density */
  densityDecimals?: number;
} & InstrumentBaseOptions;

export class InstrTank extends InstrumentBase {
  /**Returns the name used to define the element */
  static elementName() {
    return "tank";
  }

  private __rect1: SVGRectElement = measureval.cloneNode(
    true
  ) as SVGRectElement;
  private __lines: SVGGElement = svgGroup();
  private __headline: SVGForeignObjectElement = headline.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __subline: SVGForeignObjectElement = subline.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __tankMaxValue: SVGForeignObjectElement = tankMaxValue.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __per: SVGForeignObjectElement = per.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __value: SVGForeignObjectElement = value.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __valueUnit: SVGForeignObjectElement = unitBig.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __decimals: number = 1;
  private __mass: SVGForeignObjectElement = mass.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __massUnit: SVGForeignObjectElement = massUnit.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __massDecimals: number = 1;
  private __density: SVGForeignObjectElement = density.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __densityUnit: SVGForeignObjectElement = densityUnit.cloneNode(
    true
  ) as SVGForeignObjectElement;
  private __densityDecimals: number = 1;
  private ___invalid: boolean = true;
  private __maxValue: number = 100;

  constructor() {
    super();
    this.__svg.appendChild(overAllBackground.cloneNode(true));
    this.__svg.appendChild(measureBackground.cloneNode(true));
    this.__svg.appendChild(this.__rect1);
    this.__svg.appendChild(divider.cloneNode(true));
    this.__svg.appendChild(this.__lines);
    this.__svg.appendChild(valueDivider.cloneNode(true));
    this.__svg.appendChild(this.__headline);
    this.__svg.appendChild(this.__subline);
    this.__svg.appendChild(this.__tankMaxValue);
    this.__svg.appendChild(this.__per);
    this.__svg.appendChild(persym.cloneNode(true));
    this.__svg.appendChild(this.__value);
    this.__svg.appendChild(this.__valueUnit);
    this.__svg.appendChild(this.__mass);
    this.__svg.appendChild(this.__massUnit);
    this.__svg.appendChild(this.__density);
    this.__svg.appendChild(this.__densityUnit);
    this.__svg.appendChild(outerFrame.cloneNode(true));
    this.__svg.appendChild(outerBorder.cloneNode(true));
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrTankOptions): this {
    super.options(options);
    if (typeof options.decimals === "number")
      this.__decimals = options.decimals;
    if (typeof options.maxValue === "number") this.maxValue = options.maxValue;
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    if (typeof options.value !== "undefined") this.value = options.value;

    if (typeof options.density !== "undefined") this.density = options.density;
    if (typeof options.densityUnit !== "undefined")
      this.densityUnit = options.densityUnit;
    if (typeof options.densityDecimals === "number")
      this.__densityDecimals = options.densityDecimals;

    if (typeof options.mass !== "undefined") this.mass = options.mass;
    if (typeof options.massUnit !== "undefined")
      this.massUnit = options.massUnit;
    if (typeof options.massDecimals === "number")
      this.__massDecimals = options.massDecimals;

    if (options.lines) this.lines = options.lines;
    if (typeof options.headline === "string") this.headline = options.headline;
    if (typeof options.subline === "string") this.subline = options.subline;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 120;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 176;
  }

  private __setBar() {
    let max = this.__maxValue;
    //@ts-expect-error
    let val = this.$vbvalue;
    let barBuf = val / max;
    if (barBuf <= 1)
      this.__rect1.setAttribute("transform", "scale(" + 1 + "," + barBuf + ")");
    else this.__rect1.setAttribute("transform", "scale(" + 1 + "," + 1 + ")");
    (this.__per.firstChild! as HTMLElement).innerHTML = String(
      Math.round(barBuf * 100)
    );
  }

  set maxValue(maxValue: number) {
    this.__maxValue = maxValue;
    (
      (this.__tankMaxValue.firstChild! as HTMLElement)
        .firstChild! as HTMLElement
    ).innerHTML = String(this.__maxValue);
  }

  set value(_value: number | Value) {}
  set unit(_unit: string | Value) {}

  set density(_density: number | Value) {}
  set densityUnit(_unit: string | Value) {}

  set mass(_mass: number | Value) {}
  set massUnit(_unit: string | Value) {}

  /**this checkes that lines is an array*/
  set lines(lines: number[]) {
    this.__drawLines(lines);
  }

  set headline(headline: string) {
    (this.__headline.firstChild! as HTMLElement).innerHTML = headline;
  }
  get headline() {
    return (this.__headline.firstChild! as HTMLElement).innerHTML;
  }

  set subline(subline: string) {
    (this.__subline.firstChild! as HTMLElement).innerHTML = subline;
  }

  /** This dwars the lines on the tank indicator*/
  private __drawLines(lines: number[]) {
    if (!this.__maxValue) return;
    for (let i = 0; i < lines.length; i++) {
      let prec = lines[i] / this.__maxValue;
      let lineHight = 178 * prec;
      lineHight = 178 - lineHight;
      this.__lines.appendChild(
        line(98, lineHight, 122, lineHight, "leveler", 1)
      );
    }
  }

  protected $vfvalue(value: number) {
    switch (typeof value) {
      case "number":
        (this.__value.firstChild! as HTMLElement).innerHTML = value.toFixed(
          this.__decimals
        );
        this.__setBar();
        if (this.___invalid) {
          this.classList.remove("invalid");
          this.___invalid = false;
        }
        break;
      case "object":
        //@ts-expect-error
        (this.__value.firstChild! as HTMLElement).innerHTML = value.reason;
        this.classList.add("invalid");
        this.___invalid = true;
        //@ts-expect-error
        (this.__per.firstChild! as HTMLElement).innerHTML = value.reason;
        break;
      default:
        (this.__value.firstChild! as HTMLElement).innerHTML = "0";
        this.classList.add("invalid");
        this.___invalid = true;
        (this.__per.firstChild! as HTMLElement).innerHTML = "0";
        break;
    }
  }
  protected $vfunit(unit: string) {
    (this.__tankMaxValue.firstChild! as HTMLElement).children[1].innerHTML =
      unit;
    (this.__valueUnit.firstChild! as HTMLElement).innerHTML =
      "<span>" + unit + "</span>";
  }

  protected $vfdensity(density: number) {
    switch (typeof density) {
      case "number":
        (this.__density.firstChild! as HTMLElement).innerHTML = density.toFixed(
          this.__densityDecimals
        );
        break;
    }
  }
  protected $vfdensityUnit(unit: string) {
    (this.__densityUnit.firstChild! as HTMLElement).innerHTML =
      "<span>" + unit + "</span>";
  }

  protected $vfmass(mass: number) {
    switch (typeof mass) {
      case "number":
        (this.__mass.firstChild! as HTMLElement).innerHTML = mass.toFixed(
          this.__massDecimals
        );
        break;
    }
  }
  protected $vfmassUnit(unit: string) {
    (this.__massUnit.firstChild! as HTMLElement).innerHTML =
      "<span>" + unit + "</span>";
  }
}

defineElement(InstrTank);
defineElementValues(InstrTank, [
  "value",
  "unit",
  "mass",
  "massUnit",
  "density",
  "densityUnit",
]);
