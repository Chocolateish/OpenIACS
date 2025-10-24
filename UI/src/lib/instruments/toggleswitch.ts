import { defineElement } from "@libBase";
import {
  element_neutral_color,
  red,
  thumb_enabled_background_color,
  thumb_enabled_border_color,
} from "@libColors";
import { attachClickListener, circle, defineElementValues } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./toggleswitch.scss";

let outerBorder = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let circleForCloning = circle(12, 12, 12, "circle");
outerBorder.classList.add("outerborder");
outerBorder.setAttribute(
  "d",
  "M0 12C0 5.37258 5.37258 0 12 0H36C42.6274 0 48 5.37258 48 12C48 18.6274 42.6274 24 36 24H12C5.37258 24 0 18.6274 0 12Z"
);

addThemeVariable(
  "instrToggleSwitchThumbColor",
  ["Instruments", "ToggleSwitch"],
  thumb_enabled_background_color.day,
  thumb_enabled_background_color.dusk
);
addThemeVariable(
  "instrToggleSwitchBorderColor",
  ["Instruments", "ToggleSwitch"],
  thumb_enabled_border_color.day,
  thumb_enabled_border_color.dusk
);
addThemeVariable(
  "instrToggleSwitchInactiveColor",
  ["Instruments", "ToggleSwitch"],
  element_neutral_color.day,
  element_neutral_color.dusk
);
addThemeVariable(
  "instrToggleSwitchActiveColor",
  ["Instruments", "ToggleSwitch"],
  red[500],
  red[500]
);

/**Defines options for button component*/
type InstrToggleSwitchOptions = {
  value?: boolean | Value;
} & InstrumentBaseOptions;

export class InstrToggleSwitch extends InstrumentBase {
  /**Returns the name used to define the element */
  static elementName() {
    return "toggleswitch";
  }

  private __border: SVGPathElement = this.__svg.appendChild(
    outerBorder.cloneNode(true) as SVGPathElement
  );
  private __circlePlace: SVGCircleElement = this.__svg.appendChild(
    circleForCloning.cloneNode(true) as SVGCircleElement
  );
  private ___invalid: boolean = true;

  constructor() {
    super();
    attachClickListener(this.__svg, () => {
      //@ts-expect-error
      this.$vsvalue(!this.$vbvalue);
    });
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrToggleSwitchOptions): this {
    super.options(options);
    if (typeof options.value !== "undefined") this.value = options.value;
    return this;
  }

  /**Original width of rendered graphics */
  get renderWidth(): number {
    return 48;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 24;
  }

  set value(_value: boolean | Value) {}

  protected $vfvalue(value: boolean) {
    if (typeof value === "object") {
      this.__circlePlace.setAttribute("cx", "12");
      this.__border.classList.remove("selected");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (value) {
        this.__circlePlace.setAttribute("cx", "36");
        this.__border.classList.add("selected");
      } else {
        this.__circlePlace.setAttribute("cx", "12");
        this.__border.classList.remove("selected");
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrToggleSwitch);
defineElementValues(InstrToggleSwitch, ["value"]);
