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
import "./pump.scss";

let circleForCloning = circle(16, 16, 16, "circle");
let symbol_Fw = document.createElementNS("http://www.w3.org/2000/svg", "path");
let symbol_Bw = document.createElementNS("http://www.w3.org/2000/svg", "path");

symbol_Fw.classList.add("symbolFw");
symbol_Bw.classList.add("symbolBw");

symbol_Fw.setAttribute("d", "M 12,24 V 8 l 12,8 z");
symbol_Bw.setAttribute("d", "M 20,8 V 24 L 8,16 Z");

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

/**Defines options for Pump instrument*/
type InstrPumpOptions = {
  /**the title on the prompt */
  title?: string;
  /**the order from the instrument to send to the pump */
  order?: boolean | number | Value;
  /**feedback to display if pump is running */
  running?: boolean | number | Value;
  /**can the pump go backwards */
  bidirection?: boolean;
} & InstrumentBaseOptions;

export class InstrPump extends InstrumentBase<InstrPumpOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "pump";
  }

  private __isopen: boolean = false;
  private __buttons: boolean = false;
  private ___invalid: boolean = false;
  private __title: string = "";

  constructor() {
    super();
    this.__svg.appendChild(symbol_Fw.cloneNode(true));
    this.__svg.appendChild(symbol_Bw.cloneNode(true));
    this.__svg.appendChild(circleForCloning.cloneNode(true));
    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title || "",
          buttons: this.__buttons
            ? [
                { text: "Forward", value: 1 },
                { text: "Backwards", value: 2 },
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
  options(options: InstrPumpOptions): this {
    super.options(options);
    if (typeof options.running !== "undefined") this.running = options.running;
    if (typeof options.order !== "undefined") this.order = options.order;
    if (typeof options.title === "string") this.__title = options.title;
    if (typeof options.bidirection == "boolean")
      this.bidirection = options.bidirection;
    return this;
  }

  /**Original width of rendered graphics */
  get renderWidth(): number {
    return 32;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 32;
  }

  set bidirection(op: boolean) {
    this.__buttons = op;
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

  $vforder(_val: number) {}

  $vfrunning(value: number | boolean) {
    if (typeof value === "object") {
      this.__svg.classList.remove("stoped", "forward", "backward");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      this.__svg.classList.remove("stoped", "forward", "backward");
      switch (value) {
        case true:
        case 1: {
          this.__svg.classList.add("forward");
          break;
        }
        case 2: {
          this.__svg.classList.add("backward");
          break;
        }
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrPump);
defineElementValues(InstrPump, ["order", "running"]);
