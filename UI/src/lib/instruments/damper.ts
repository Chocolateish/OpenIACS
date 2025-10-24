import { defineElement } from "@libBase";
import { alert_running_color, element_neutral_color } from "@libColors";
import {
  attachClickListener,
  defineElementValues,
  rectangle,
} from "@libCommon";
import { promptButtons, PromptCodes } from "@libPrompts";
import { addThemeVariable } from "@libTheme";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./damper.scss";

let box = rectangle(24, 24, 48, 48, 6, "box", 1);
let dsOn = document.createElementNS("http://www.w3.org/2000/svg", "path");
dsOn.classList.add("dsOn");
dsOn.setAttribute(
  "d",
  "M44 22L29.6586 22C28.8349 19.6696 26.6124 18 24 18C21.3876 18 19.1651 19.6696 18.3414 22L4 22C2.89543 22 2 22.8954 2 24C2 25.1046 2.89543 26 4 26L18.3414 26C19.1651 28.3304 21.3876 30 24 30C26.6124 30 28.8349 28.3304 29.6586 26L44 26C45.1046 26 46 25.1046 46 24C46 22.8954 45.1046 22 44 22ZM24 26C25.1046 26 26 25.1046 26 24C26 22.8954 25.1046 22 24 22C22.8954 22 22 22.8954 22 24C22 25.1046 22.8954 26 24 26Z"
);

let dsOff = document.createElementNS("http://www.w3.org/2000/svg", "path");
dsOff.classList.add("dsOff");
dsOff.setAttribute(
  "d",
  "M22 4L22 18.3414C19.6696 19.1651 18 21.3876 18 24C18 26.6124 19.6696 28.8349 22 29.6586L22 44C22 45.1046 22.8954 46 24 46C25.1046 46 26 45.1046 26 44L26 29.6586C28.3304 28.8349 30 26.6124 30 24C30 21.3876 28.3304 19.1651 26 18.3414L26 4C26 2.89543 25.1046 2 24 2C22.8954 2 22 2.89543 22 4ZM26 24C26 22.8954 25.1046 22 24 22C22.8954 22 22 22.8954 22 24C22 25.1046 22.8954 26 24 26C25.1046 26 26 25.1046 26 24Z"
);

addThemeVariable(
  "AlertRunningColor",
  ["Instruments", "Button"],
  alert_running_color.day,
  alert_running_color.dusk
);
addThemeVariable(
  "ElementNeutralColor",
  ["Instruments", "Button"],
  element_neutral_color.day,
  element_neutral_color.dusk
);

/**Defines options for damper instrument*/
type InstrDamperOptions = {
  /**the title onm the prompt */
  title?: string;
  /**value */
  value?: boolean;
} & InstrumentBaseOptions;

export class InstrDamper extends InstrumentBase<InstrDamperOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "damper";
  }

  private __isopen: boolean = false;
  private ___invalid: boolean = false;
  private __title: string = "";

  constructor() {
    super();
    this.__svg.appendChild(box.cloneNode(true));
    this.__svg.appendChild(dsOn.cloneNode(true));
    this.__svg.appendChild(dsOff.cloneNode(true));

    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title,
          buttons: [
            { text: "Open", value: true },
            { text: "Close", value: false },
          ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER) this.$vsvalue(result.data);

        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrDamperOptions): this {
    super.options(options);
    if (typeof options.value !== "undefined") this.value = options.value;
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

  set value(val: boolean) {
    val;
  }

  get value(): boolean {
    return false;
  }

  protected $vfvalue(value: boolean) {
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

  protected $vsvalue(value: boolean) {
    value;
  }
}
defineElement(InstrDamper);
defineElementValues(InstrDamper, ["value"]);
