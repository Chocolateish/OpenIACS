import { defineElement } from "@libBase";
import { element_neutral_color } from "@libColors";
import {
  attachClickListener,
  circle,
  defineElementValues,
  rectangle,
} from "@libCommon";
import { promptButtons, PromptCodes } from "@libPrompts";
import { addThemeVariable } from "@libTheme";
import "./clutch.scss";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";

let border = rectangle(24, 24, 48, 48, 6, "border", 1);
let connectorCircle1 = circle(-4.5, 24, 4, "connectorCircle", 1);
let connectorCircle2 = circle(52.5, 24, 4, "connectorCircle", 1);

let connectorOff = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let connectorOn = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let clutchLeft = document.createElementNS("http://www.w3.org/2000/svg", "path");

connectorOff.setAttribute("stroke-linecap", "round");

clutchLeft.setAttribute(
  "d",
  "M 19.768982,41.295447 12.321116,38.294391 V 31.794355 25.294316 H 7.5352959 2.7494769 v -1.412325 -1.412325 h 4.779498 4.7794981 l 0.09835,-6.466772 0.09836,-6.466773 L 19.960016,6.5235611 27.41485,3.511 l -0.0047,1.583154 -0.0047,1.583154 -5.50848,2.182684 -5.508479,2.182683 -0.009,12.878327 -0.009,12.878328 5.522098,2.224615 5.5221,2.224617 v 1.523972 c 0,0.838184 -0.04456,1.523971 -0.099,1.523971 -0.05446,0 -3.450541,-1.350475 -7.546868,-3.001057 z"
);
connectorOn.setAttribute("stroke-linecap", "round");

clutchLeft.classList.add("clutchLeft");
connectorOn.classList.add("connectorOn");
connectorOff.classList.add("connectorOff");

connectorOff.setAttribute(
  "d",
  "M 31.687187,39.265519 27.94004,37.680369 27.84252,23.974508 27.745,10.268634 31.463949,8.7038183 C 33.509369,7.8431703 35.278674,7.139 35.39574,7.139 c 0.117073,0 0.257943,3.418638 0.313066,7.596969 l 0.100221,7.596984 4.777613,0.08595 4.77761,0.08595 v 1.525563 1.525577 h -4.864863 -4.864859 l -0.100122,7.64739 -0.100121,7.647377 z"
);
connectorOn.setAttribute(
  "d",
  "m 24.386699,39.265519 -3.747147,-1.58515 -0.09752,-13.705861 -0.09752,-13.705874 3.718949,-1.5648157 C 26.208881,7.8431703 27.978186,7.139 28.095252,7.139 c 0.117073,0 0.257943,3.418638 0.313066,7.596969 l 0.100221,7.596984 4.777613,0.08595 4.77761,0.08595 v 1.525563 1.525577 H 33.198899 28.33404 l -0.100122,7.64739 -0.100121,7.647377 z"
);

addThemeVariable(
  "ElementNeutralColor",
  ["Instruments", "Button"],
  element_neutral_color.day,
  element_neutral_color.dusk
);

/**Defines options for button instrument*/
type InstrClutchOptions = {
  /**the title onm the prompt */
  title?: string;
  /**value */
  value?: boolean;
} & InstrumentBaseOptions;

export class InstrClutch extends InstrumentBase<InstrClutchOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "clutch";
  }

  private __isopen: boolean = false;
  private __title: string = "";
  private ___invalid: boolean = false;

  constructor() {
    super();
    this.__svg.appendChild(border.cloneNode(true));
    this.__svg.appendChild(connectorOff.cloneNode(true));
    this.__svg.appendChild(connectorOn.cloneNode(true));
    this.__svg.appendChild(connectorCircle1.cloneNode(true));
    this.__svg.appendChild(connectorCircle2.cloneNode(true));
    this.__svg.appendChild(clutchLeft.cloneNode(true));
    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title,
          buttons: [
            { text: "Engage", value: true },
            { text: "Disengage", value: false },
          ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER) {
          this.$vsvalue(result.data);
        }
        this.__isopen = false;
      }
    });
    this.classList.add("invalid");
    this.___invalid = true;
  }

  /**Options toggeler*/
  options(options: InstrClutchOptions): this {
    super.options(options);
    if (typeof options.value !== "undefined") this.value = options.value;
    if (typeof options.title === "string") this.__title = options.title;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 48;
  }
  /**Original height of rendered graphics */
  get renderHeight(): number {
    return 48;
  }

  set value(val: boolean) {
    val;
  }

  get value(): boolean {
    return false;
  }

  /***/
  protected $vfvalue(val: boolean) {
    if (typeof val === "object") {
      this.__svg.classList.remove("on");
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (val) {
        this.__svg.classList.add("on");
      } else {
        this.__svg.classList.remove("on");
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
defineElement(InstrClutch);
defineElementValues(InstrClutch, ["value"]);
