import { defineElement } from "@libBase";
import {
  alert_running_color,
  element_active_color,
  element_neutral_color,
  normal_enabled_border_color,
} from "@libColors";
import {
  attachClickListener,
  circle,
  defineElementValues,
  rectangle,
} from "@libCommon";
import { promptButtons, PromptCodes } from "@libPrompts";
import { addThemeVariable } from "@libTheme";
import { Value } from "@libValues";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./switch.scss";

let border = rectangle(24, 24, 48, 48, 6, "border", 1);
let connectorCircle1 = circle(-4.5, 24, 4, "connectorCircle", 1);
let connectorCircle2 = circle(52.5, 24, 4, "connectorCircle", 1);

let connectorOff = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
connectorOff.setAttribute("stroke-linecap", "round");
connectorOff.setAttribute("transform-origin", "4 24");
connectorOff.classList.add("connectorOff");
connectorOff.setAttribute("d", "M4 24L44 24");
connectorOff.setAttribute("transform", "rotate(-25)");

let connectorOn = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
connectorOn.setAttribute("stroke-linecap", "round");
connectorOn.classList.add("connectorOn");
connectorOn.setAttribute("d", "M4 24L44 24");

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
addThemeVariable(
  "NormalEnabledBorderColor",
  ["Instruments", "Button"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);

/**Defines options for switch instrument*/
type InstrSwitchOptions = {
  /**The order from the instrument to send to the switch*/
  order: boolean | number | Value;
  /**Feedback to display if switch is closed*/
  status: boolean | number | Value;
  /**The title on the popup*/
  title: string;
} & InstrumentBaseOptions;

export class InstrSwitch extends InstrumentBase<InstrSwitchOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "switch";
  }

  private __title: string = "Switch";
  private __isopen: boolean = false;
  private ___invalid: boolean = true;

  constructor() {
    super();
    this.__svg.appendChild(border.cloneNode(true));
    this.__svg.appendChild(connectorOff.cloneNode(true));
    this.__svg.appendChild(connectorOn.cloneNode(true));
    this.__svg.appendChild(connectorCircle1.cloneNode(true));
    this.__svg.appendChild(connectorCircle2.cloneNode(true));
    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title,
          buttons: [
            { text: "Close", value: true },
            { text: "Open", value: false },
          ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER) this.$vsorder(result.data);
        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrSwitchOptions): this {
    super.options(options);
    if (typeof options.status !== "undefined") this.status = options.status;
    if (typeof options.order !== "undefined") this.order = options.order;
    if (typeof options.title === "string") this.__title = options.title;
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

  set status(_status: number | boolean | Value) {}
  set order(_order: number | boolean | Value) {}

  protected $vforder(_val: number) {}

  protected $vsorder(_val: string | number | boolean) {}

  protected $vfstatus(val: boolean) {
    if (typeof val === "object") {
      this.__svg.classList.remove("on");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (val) this.__svg.classList.add("on");
      else this.__svg.classList.remove("on");
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrSwitch);
defineElementValues(InstrSwitch, ["order", "status"]);
