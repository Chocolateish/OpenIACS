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
import "./valveV3.scss";

let circleForCloning = circle(16, 16, 16, "circle");
let symbol_left = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let symbol_right = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let symbol_buttom = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let bar_hig = rectangle(16, 12.5, 2, 5, 0, "bar", 1);

symbol_left.classList.add("symbolL");
symbol_right.classList.add("symbolR");
symbol_buttom.classList.add("symbolB");

symbol_left.setAttribute("d", "M15 15L7 10V22L15 17H16V15H15Z");
symbol_right.setAttribute("d", "M17 17L25 22L25 10L17 15L16 15L16 17L17 17Z");
symbol_buttom.setAttribute("d", "M15 17L10 25L22 25L17 17L15 17Z");

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

/**Defines options for 3 way valve instrument*/
type InstrValveV3Options = {
  /**function to run when clicked*/
  click?: () => void;
  /**text on the button*/
  text?: string;
  /**name of the middle valve*/
  middle?: string;
  /**name of the left valve*/
  left?: string;
  /**name of the right valve*/
  right?: string;
  /**title of the buttom onclick*/
  title?: string;
  /** the left valve value*/
  valveLeft?: boolean | Value;
  /** the left valve value*/
  valveMiddle?: boolean | Value;
  /** the left valve value*/
  valveRight?: boolean | Value;
} & InstrumentBaseOptions;

export class InstrValveV3 extends InstrumentBase<InstrValveV3Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "valvev3";
  }

  private __symbol_left: SVGPathElement;
  private __symbol_right: SVGPathElement;
  private __symbol_buttom: SVGPathElement;
  private __circle: SVGCircleElement;
  private __bar: SVGRectElement;
  private __isopen: boolean = false;
  private __title: string = "3-way Valve";
  private __left: string = "Left";
  private __right: string = "Right";
  private __middle: string = "Middle";
  private $vbvalveLeft: boolean = false;
  private $vbvalveRight: boolean = false;
  private $vbvalveMiddle: boolean = false;

  constructor() {
    super();
    this.__svg.appendChild(
      (this.__symbol_left = symbol_left.cloneNode(true) as SVGPathElement)
    );
    this.__svg.appendChild(
      (this.__symbol_right = symbol_right.cloneNode(true) as SVGPathElement)
    );
    this.__svg.appendChild(
      (this.__symbol_buttom = symbol_buttom.cloneNode(true) as SVGPathElement)
    );
    this.__svg.appendChild(
      (this.__circle = circleForCloning.cloneNode(true) as SVGCircleElement)
    );
    this.__svg.appendChild(
      (this.__bar = bar_hig.cloneNode(true) as SVGRectElement)
    );
    attachClickListener(this.__svg, async () => {
      if (!this.__isopen) {
        this.__isopen = true;
        let promt = promptButtons({
          title: this.__title || "",
          buttons: [
            { text: "Open " + this.__left + " & " + this.__right, value: 1 },
            { text: "Open " + this.__left + " & " + this.__middle, value: 2 },
            { text: "Open " + this.__middle + " & " + this.__right, value: 3 },
            { text: "Open all", value: 4 },
            { text: "Close all", value: 5 },
          ],
        });
        let result = await promt.promise;
        if (result.code == PromptCodes.ENTER) {
          this.__setValves(Number(result.data));
        }
        this.__isopen = false;
      }
    });
  }

  /**Options toggeler*/
  options(options: InstrValveV3Options): this {
    super.options(options);
    if (typeof options.middle === "string") this.__middle = options.middle;
    if (typeof options.left === "string") this.__left = options.left;
    if (typeof options.right === "string") this.__right = options.right;
    if (typeof options.valveLeft !== "undefined")
      this.valveLeft = options.valveLeft;
    if (typeof options.valveRight !== "undefined")
      this.valveRight = options.valveRight;
    if (typeof options.valveMiddle !== "undefined")
      this.valveMiddle = options.valveMiddle;
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

  private __setValves(config: number) {
    if (config === 1) {
      this.$vsvalveRight(true);
      this.$vsvalveLeft(true);
      this.$vsvalveMiddle(false);
    } else if (config === 2) {
      this.$vsvalveRight(false);
      this.$vsvalveLeft(true);
      this.$vsvalveMiddle(true);
    } else if (config === 3) {
      this.$vsvalveRight(true);
      this.$vsvalveLeft(false);
      this.$vsvalveMiddle(true);
    } else if (config === 4) {
      this.$vsvalveRight(true);
      this.$vsvalveLeft(true);
      this.$vsvalveMiddle(true);
    } else if (config === 5) {
      this.$vsvalveRight(false);
      this.$vsvalveLeft(false);
      this.$vsvalveMiddle(false);
    }
  }

  private __countActive() {
    if (this.$vbvalveRight || this.$vbvalveLeft || this.$vbvalveMiddle) {
      this.__circle.classList.add("active");
      this.__bar.classList.add("active");
    } else {
      this.__circle.classList.remove("active");
      this.__bar.classList.remove("active");
    }
  }

  set valveLeft(_status: boolean | Value) {}
  set valveRight(_status: boolean | Value) {}
  set valveMiddle(_status: boolean | Value) {}

  protected $vsvalveLeft(_valveLeft: boolean) {}
  protected $vfvalveLeft(valveLeft: boolean) {
    this.__countActive();
    if (valveLeft) this.__symbol_left.classList.add("active");
    else this.__symbol_left.classList.remove("active");
  }

  protected $vsvalveMiddle(_valveMiddle: boolean) {}
  protected $vfvalveMiddle(valveMiddle: boolean) {
    this.__countActive();
    if (valveMiddle) this.__symbol_buttom.classList.add("active");
    else this.__symbol_buttom.classList.remove("active");
  }

  protected $vsvalveRight(_valveRight: boolean) {}
  protected $vfvalveRight(valveRight: boolean) {
    this.__countActive();
    if (valveRight) this.__symbol_right.classList.add("active");
    else this.__symbol_right.classList.remove("active");
  }
}
defineElement(InstrValveV3);
defineElementValues(InstrValveV3, ["valveLeft", "valveMiddle", "valveRight"]);
