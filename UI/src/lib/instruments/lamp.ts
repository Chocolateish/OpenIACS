import { defineElement } from "@libBase";
import {
  alert_caution_color,
  alert_running_color,
  instrument_dynamic_color,
  instrument_port_color,
  thumb_enabled_border_color,
} from "@libColors";
import { circle, defineElementValues } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./lamp.scss";

/**Defines possible colors for lamp*/
export let InstrLampColour = {
  OFF: 0,
  RED: 1,
  GREEN: 2,
  YELLOW: 3,
  BLUE: 4,
};
export type InstrLampColour =
  (typeof InstrLampColour)[keyof typeof InstrLampColour];

let circleForCloning = circle(12, 12, 12, "circle");
addThemeVariable(
  "instrLampBorderColor",
  ["Instruments", "Lamp"],
  thumb_enabled_border_color.day,
  thumb_enabled_border_color.dusk
);
addThemeVariable(
  "instrLampRedColor",
  ["Instruments", "Lamp"],
  instrument_port_color.day,
  instrument_port_color.dusk
);
addThemeVariable(
  "instrLampGreenColor",
  ["Instruments", "Lamp"],
  alert_running_color.day,
  alert_running_color.dusk
);
addThemeVariable(
  "instrLampBlueColor",
  ["Instruments", "Lamp"],
  instrument_dynamic_color.day,
  instrument_dynamic_color.dusk
);
addThemeVariable(
  "instrLampYellowColor",
  ["Instruments", "Lamp"],
  alert_caution_color.day,
  alert_caution_color.dusk
);

/**Defines options for damper instrument*/
type InstrLampOptions = {
  /**value */
  value?: boolean;
  /**the title onm the prompt */
  primary?: InstrLampColour;
  secondary?: InstrLampColour;
} & InstrumentBaseOptions;

export class InstrLamp extends InstrumentBase<InstrLampOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "lamp";
  }

  private ___invalid: boolean = true;
  private __circle: SVGCircleElement = this.__svg.appendChild(
    circleForCloning.cloneNode(true) as SVGCircleElement
  );
  private __secondary: number = InstrLampColour.GREEN;
  private __primary: number = InstrLampColour.RED;

  constructor() {
    super();
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrLampOptions): this {
    super.options(options);
    if (typeof options.primary === "number") this.__primary = options.primary;
    if (typeof options.secondary === "number")
      this.__secondary = options.secondary;
    if (typeof options.value !== "undefined") this.value = options.value;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 24;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 24;
  }

  private __setColour(val: InstrLampColour) {
    this.__circle.classList.remove("green", "red", "blue", "yellow");
    switch (val) {
      case InstrLampColour.RED:
        this.__circle.classList.add("red");
        break;
      case InstrLampColour.GREEN:
        this.__circle.classList.add("green");
        break;
      case InstrLampColour.BLUE:
        this.__circle.classList.add("blue");
        break;
      case InstrLampColour.YELLOW:
        this.__circle.classList.add("yellow");
        break;
    }
  }

  set value(val: boolean) {
    val;
  }

  get value(): boolean {
    return false;
  }

  protected $vfvalue(val: boolean | InstrLampColour) {
    if (typeof val === "object") {
      this.__setColour(InstrLampColour.OFF);
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (val) {
        this.__setColour(this.__secondary);
      } else {
        this.__setColour(this.__primary);
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrLamp);
defineElementValues(InstrLamp, ["value"]);
