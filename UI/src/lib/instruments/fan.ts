import { defineElement } from "@libBase";
import {
  alert_running_color,
  element_active_color,
  element_neutral_color,
} from "@libColors";
import { attachClickListener, circle, defineElementValues } from "@libCommon";
import { promptButtons, PromptCodes } from "@libPrompts";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./fan.scss";

let circleForCloning = circle(24, 24, 24, "circle");

let symbolFan = document.createElementNS("http://www.w3.org/2000/svg", "path");
let symbolPlay1 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let symbolPlay2_1 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let symbolPlay2_2 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);

symbolFan.classList.add("symbolFan");
symbolPlay1.classList.add("symbolPlay1");
symbolPlay2_1.classList.add("symbolPlay2");
symbolPlay2_2.classList.add("symbolPlay2");

symbolFan.setAttribute(
  "d",
  "M33.4115 15.5C32.7115 15.52 32.0115 15.5 31.3115 15.5C30.1115 15.5 28.9115 15.51 27.7115 15.5C27.2915 15.49 27.0915 15.59 27.0715 16.13C27.0615 16.52 27.1515 16.75 27.4615 17C28.6715 17.99 29.6115 19.21 30.0515 20.73C30.4715 22.22 29.8815 23.98 28.4815 24.91C27.4415 25.6 26.2615 25.78 25.0715 25.95C24.9915 25.97 24.9115 25.99 24.8315 26H24.7915C24.4015 25.93 24.4015 25.63 24.4015 25.33C24.4015 23.49 24.4115 21.66 24.4015 19.82C24.3915 19.56 24.5415 19.22 24.1215 19.1C23.5215 18.92 23.3415 18.97 23.0115 19.38C22.1815 20.42 21.1615 21.25 19.9415 21.78C17.6615 22.77 15.2815 21.63 14.5215 19.34C14.2515 18.53 14.0615 17.7 14.0015 16.85C13.9815 16.53 14.1615 16.37 14.5815 16.37C15.2915 16.36 16.0115 16.37 16.7315 16.37C17.9015 16.37 19.0715 16.37 20.2315 16.36C20.4815 16.36 20.8315 16.49 20.9015 16.08C20.9615 15.71 21.1315 15.32 20.7115 15.02C19.7615 14.32 19.0115 13.43 18.4615 12.39C17.7115 10.96 17.5915 9.54 18.5015 8.12C19.0415 7.28 19.7915 6.74 20.7115 6.46C21.4415 6.23 22.1815 6.01 22.9615 6C23.5215 6 23.5215 6.16 23.5315 6.59C23.5515 7.29 23.5415 7.99 23.5415 8.7C23.5415 9.9 23.5515 11.09 23.5315 12.29C23.5315 12.71 23.6315 12.91 24.1615 12.93C24.5515 12.95 24.7915 12.86 25.0415 12.54C25.8315 11.54 26.8315 10.78 28.0015 10.23C30.0715 9.25 32.5015 10.14 33.3715 12.29C33.7115 13.14 33.9515 14.01 34.0015 14.93C34.0215 15.48 33.8415 15.49 33.4115 15.5ZM24.0015 14.31C23.0715 14.31 22.3115 15.07 22.3115 16C22.3115 16.93 23.0715 17.69 24.0015 17.69C24.9315 17.69 25.6915 16.93 25.6915 16C25.6915 15.07 24.9315 14.31 24.0015 14.31Z"
);
symbolPlay1.setAttribute("d", "M21 42L21 30L30 36L21 42Z");
symbolPlay2_1.setAttribute("d", "M16 42L16 30L25 36L16 42Z");
symbolPlay2_2.setAttribute("d", "M26 42L26 30L35 36L26 42Z");

addThemeVariable(
  "ElementNeutralColor",
  ["Instruments", "Button"],
  element_neutral_color.day,
  element_neutral_color.dusk
);
addThemeVariable(
  "alertRunningColor",
  ["Instruments", "Button"],
  alert_running_color.day,
  alert_running_color.dusk
);
addThemeVariable(
  "ElementActiveColor",
  ["Instruments", "Button"],
  element_active_color.day,
  element_active_color.dusk
);

/**Defines options for button instrument*/
type InstrFanOptions = {
  /**the title onm the prompt */
  title?: string;
  /**the order from the instrument to send to the fan */
  order?: boolean | number | Value;
  /**feedback to display if fan is running */
  running?: boolean | number | Value;
  /**can the pump go backwards */
  twoSpeed?: boolean;
} & InstrumentBaseOptions;

export class InstrFan extends InstrumentBase<InstrFanOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "fan";
  }

  private __isopen: boolean = false;
  private ___invalid: boolean = false;
  private __title: string = "";
  private __twoSpeed: boolean = false;

  constructor() {
    super();
    this.__svg.appendChild(symbolFan.cloneNode(true));
    this.__svg.appendChild(symbolPlay1.cloneNode(true));
    this.__svg.appendChild(symbolPlay2_1.cloneNode(true));
    this.__svg.appendChild(symbolPlay2_2.cloneNode(true));
    this.__svg.appendChild(circleForCloning.cloneNode(true));

    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title || "",
          buttons: this.__twoSpeed
            ? [
                { text: "Speed 1", value: 1 },
                { text: "Speed 2", value: 2 },
                { text: "Stop", value: 0 },
              ]
            : [
                { text: "Start", value: 1 },
                { text: "Stop", value: 0 },
              ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER) {
          //@ts-expect-error
          this.$vsorder(result.data);
        }
        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrFanOptions): this {
    super.options(options);
    if (typeof options.running !== "undefined") this.running = options.running;
    if (typeof options.order !== "undefined") this.order = options.order;
    if (typeof options.title === "string") this.__title = options.title;
    if (typeof options.twoSpeed == "boolean")
      this.__twoSpeed = options.twoSpeed;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 48;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 48;
  }

  set running(val: boolean | number | Value) {
    val;
  }

  get running(): boolean | number | Value {
    return false;
  }

  set order(val: boolean | number | Value) {
    val;
  }

  get order(): boolean | number | Value {
    return false;
  }

  protected $vforder(_val: boolean) {}

  protected $vfrunning(value: number | boolean) {
    if (typeof value === "object") {
      this.__svg.classList.remove("stoped", "play2", "play1");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      this.__svg.classList.remove("stoped", "play2", "play1");
      switch (value) {
        case false:
        case 0:
          this.__svg.classList.add("stoped");
          break;
        case true:
        case 1:
          this.__svg.classList.add("play1");
          break;
        case 2:
          this.__svg.classList.add("play2");
          break;
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }

  protected $vsvalue(value: boolean) {
    value;
  }
}
defineElement(InstrFan);
defineElementValues(InstrFan, ["order", "running"]);
