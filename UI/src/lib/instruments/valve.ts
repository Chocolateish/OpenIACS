import { defineElement } from "@libBase";
import { alert_running_color, element_neutral_color } from "@libColors";
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
import "./valve.scss";

let circleForCloning = circle(16, 16, 16, "circle");
let symbol_left = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let symbol_right = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let bar_low = rectangle(16, 19.5, 2, 5, 0, "bar", 1);
let bar_hig = rectangle(16, 12.5, 2, 5, 0, "bar", 1);

symbol_left.classList.add("symbol");
symbol_right.classList.add("symbol");

symbol_left.setAttribute("d", "M15 15L7 10V22L15 17H16V15H15Z");
symbol_right.setAttribute("d", "M17 17L25 22L25 10L17 15L16 15L16 17L17 17Z");

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

/**Defines options for valve instrument*/
type InstrValveOptions = {
  /**The order from the instrument to send to the valve*/
  order: boolean | number | Value;
  /**Feedback to display if valve is closed*/
  status: boolean | number | Value;
  /**The title on the popup*/
  title: string;
} & InstrumentBaseOptions;

export class InstrValve extends InstrumentBase<InstrValveOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "valve";
  }

  private __title: string = "Valve";
  private __isopen: boolean = false;
  private ___invalid: boolean = true;

  constructor() {
    super();
    this.__svg.appendChild(symbol_left.cloneNode(true));
    this.__svg.appendChild(symbol_right.cloneNode(true));
    this.__svg.appendChild(circleForCloning.cloneNode(true));
    this.__svg.appendChild(bar_low.cloneNode(true));
    this.__svg.appendChild(bar_hig.cloneNode(true));
    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title || "",
          buttons: [
            { text: "Open", value: true },
            { text: "Close", value: false },
          ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER) {
          this.$vsorder(result.data);
        }
        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrValveOptions): this {
    super.options(options);
    if (typeof options.status !== "undefined") this.status = options.status;
    if (typeof options.order !== "undefined") this.order = options.order;
    if (typeof options.title !== "undefined") this.__title = options.title;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 32;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 32;
  }

  set status(_status: number | boolean | Value) {}
  set order(_order: number | boolean | Value) {}

  protected $vforder(_value: number) {}

  protected $vsorder(_val: string | number | boolean) {}

  protected $vfstatus(value: boolean | number) {
    if (typeof value === "object") {
      this.__svg.classList.remove("open");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (value) {
        this.__svg.classList.add("open");
      } else {
        this.__svg.classList.remove("open");
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrValve);
defineElementValues(InstrValve, ["order", "status"]);
