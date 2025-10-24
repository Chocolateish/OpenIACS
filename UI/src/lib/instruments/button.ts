import { defineElement } from "@libBase";
import {
  alert_running_color,
  grey,
  normal_enabled_background_color,
  normal_enabled_border_color,
  normal_pressed_background_color,
  on_normal_active_color,
  red,
} from "@libColors";
import { defineElementValues, rectangle } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import "./button.scss";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";

addThemeVariable(
  "instrButtonOuterColor",
  ["Instruments", "Button"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);
addThemeVariable(
  "instrButtonBackground",
  ["Instruments", "Button"],
  normal_enabled_background_color.day,
  normal_enabled_background_color.dusk
);
addThemeVariable(
  "instrButtonBackgroundPressed",
  ["Instruments", "Button"],
  normal_pressed_background_color.day,
  normal_pressed_background_color.dusk
);
addThemeVariable(
  "instrButtonOuterColorPressed",
  ["Instruments", "Button"],
  grey["50"],
  grey["50"]
);
addThemeVariable(
  "instrButtonText",
  ["Instruments", "Button"],
  on_normal_active_color.day,
  on_normal_active_color.dusk
);
addThemeVariable(
  "instrLampGreenColor",
  ["Instruments", "Lamp"],
  alert_running_color.day,
  alert_running_color.dusk
);
addThemeVariable(
  "instrLampRedColor",
  ["Instruments", "Lamp"],
  red[500],
  red[500]
);

/**Defines options for button instrument*/
type InstrButtonOptions = {
  /**function to run when clicked */
  click?: () => void;
  /**choose the function of the button */
  toggle?: boolean;
  /**text on the button */
  text?: string;
  /**value */
  value?: boolean;
  /**value */
  light?: boolean;
  /**the size of the text */
  textSize?: number;
  /**the width of the border */
  strokeWidth?: number;
  /**value */
  red?: boolean;
} & InstrumentBaseOptions;

export class InstrButton extends InstrumentBase<InstrButtonOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "button";
  }

  private __border = this.__svg.appendChild(
    rectangle(1, 1, 2, 2, 10, undefined, 3)
  );
  private __textContainer = this.__svg.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
  );
  private __text = this.__textContainer.appendChild(
    document.createElement("div")
  );
  private __width: number = 0;
  private __height: number = 0;
  private __click?: () => void;
  toggle: boolean = false;
  red: boolean = false;
  private ___invalid: boolean = false;

  constructor() {
    super();
    this.__textContainer.setAttribute("x", "2");
    this.__textContainer.setAttribute("y", "2");
    this.__textContainer.onpointerdown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.__svg.setPointerCapture(e.pointerId);
      if (!this.toggle) this.$vsvalue(true);
      this.__svg.onpointerup = (ev) => {
        ev.stopPropagation();
        this.__svg.releasePointerCapture(ev.pointerId);
        //@ts-expect-error
        if (this.toggle) this.$vsvalue(!this.$vbvalue);
        else this.$vsvalue(false);
        if (this.__click)
          try {
            this.__click();
          } catch (error) {
            console.warn("Failed while calling click function", error);
          }

        this.__svg.onpointerup = null;
        this.__svg.ontouchend = null;
      };
      this.__svg.ontouchend = (ev) => {
        ev.stopPropagation();
        //@ts-expect-error
        if (this.toggle) this.$vsvalue(!this.$vbvalue);
        else this.$vsvalue(false);
        if (this.__click)
          try {
            this.__click();
          } catch (error) {
            console.warn("Failed while calling click function", error);
          }

        this.__svg.onpointerup = null;
        this.__svg.ontouchend = null;
      };
    };
  }

  /**Options toggeler*/
  options(options: InstrButtonOptions): this {
    super.options(options);
    if (typeof options.textSize !== "undefined")
      this.textSize = options.textSize;
    if (options.text) this.text = options.text;
    if (typeof options.value !== "undefined") this.value = options.value;
    if (options.light) this.light = options.light;
    if (options.click) this.__click = options.click;
    if (typeof options.toggle === "boolean") this.toggle = options.toggle;
    if (typeof options.strokeWidth !== "undefined")
      this.strokeWidth = options.strokeWidth;
    if (typeof options.red !== "undefined") this.red = options.red;
    return this;
  }

  set width(width: number) {
    this.__width = Math.max(width, 0);
    this.__border.setAttribute("width", String(width));
    this.__textContainer.setAttribute("width", String(width - 4));
    super.width = width;
  }

  set height(height: number) {
    this.__height = Math.max(height, 0);
    this.__border.setAttribute("height", String(height));
    this.__textContainer.setAttribute("height", String(height - 4));
    super.height = height;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return this.__width || 0;
  }

  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return this.__height || 0;
  }

  set strokeWidth(w: number) {
    this.__border.setAttribute("stroke-width", String(w));
  }

  set text(text: string) {
    this.__text.innerHTML = text;
  }

  set textSize(size: number) {
    this.__text.style.fontSize = size + "px";
  }

  set value(val: boolean) {
    val;
  }

  get value(): boolean {
    return false;
  }

  protected $vsvalue(value: boolean) {
    value;
  }

  protected $vfvalue(value: boolean) {
    if (typeof value === "object") {
      this.__svg.classList.remove("press");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (value) this.__svg.classList.add("press");
      else this.__svg.classList.remove("press");
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }

  set light(val: boolean) {
    val;
  }

  get light(): boolean {
    return false;
  }

  protected $vflight(value: boolean) {
    if (value) {
      if (this.red) this.__svg.classList.add("red");
      else this.__svg.classList.add("light");
    } else {
      if (this.red) this.__svg.classList.remove("red");
      else this.__svg.classList.remove("light");
    }
  }
}
defineElement(InstrButton);
defineElementValues(InstrButton, ["value", "light"]);
