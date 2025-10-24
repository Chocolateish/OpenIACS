import { defineElement } from "@libBase";
import { border_solid_color, green, lightBlue, yellow } from "@libColors";
import { addThemeVariable } from "@libTheme";
import "./background.scss";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";

addThemeVariable(
  "instrBackgroundBlack",
  ["Instruments", "Background"],
  border_solid_color.day,
  border_solid_color.dusk
);
addThemeVariable(
  "instrBackgroundLightBlue",
  ["Instruments", "Background"],
  lightBlue[300],
  lightBlue[800]
);
addThemeVariable(
  "instrBackgroundYellow",
  ["Instruments", "Background"],
  yellow[600],
  yellow[500]
);
addThemeVariable(
  "instrBackgroundGreen",
  ["Instruments", "Background"],
  green[600],
  green[500]
);

export type BackgroundOptions = {
  background: SVGSVGElement | string;
} & InstrumentBaseOptions;

/** */
export class InstrBackground extends InstrumentBase<BackgroundOptions> {
  private __hight: number = 0;
  private __width: number = 0;

  /**Returns the name used to define the element */
  static elementName() {
    return "background";
  }

  /**Options toggeler*/
  options(options: BackgroundOptions): this {
    super.options(options);
    if (options.background instanceof SVGSVGElement) {
      this.background = options.background;
    } else if (typeof options.background === "string") {
      let parser = new DOMParser();
      let doc = parser.parseFromString(options.background, "image/svg+xml");
      this.background = doc.getElementsByTagName("svg")[0];
    }
    return this;
  }

  set background(bg: SVGSVGElement) {
    let buf = bg.getAttribute("viewBox") ?? "";
    let bufarray = buf.split(" ");
    this.__hight = Number(bufarray[2]);
    this.__width = Number(bufarray[3]);
    this.__svg.parentElement!.replaceChild(bg, this.__svg);
    this.__svg = bg as any;
  }

  /** returns w,h of instrument in array*/
  get size() {
    return [this.__width || 0, this.__hight || 0];
  }
}
defineElement(InstrBackground);
