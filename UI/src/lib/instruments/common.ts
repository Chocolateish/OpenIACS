import type { BaseOptions } from "@libBase";
import {
  degreesToRadians,
  svg,
  svgGroup,
  WebComponent,
  widthAndHeightOfRotatedRectangle,
} from "@libCommon";
import "./common.scss";

export let instrumentElementNameStart = "instr-";

export let generateWarning = (
  x: number,
  y: number,
  w: number,
  h: number,
  c: string
) => {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute(
    "d",
    "m15.9 3.7 12.7 24.5h-25.3l12.7-24.5m-15.6 22.6c-1.29 2.51 0.319 5.65 2.9 5.65h25.3c2.58 0 4.19-3.15 2.9-5.65l-12.7-24.5c-1.29-2.51-4.51-2.51-5.81 0zm13.9-13.1v3.77c0 1.04 0.755 1.88 1.68 1.88s1.68-0.848 1.68-1.88v-3.77c0-1.04-0.755-1.88-1.68-1.88s-1.68 0.848-1.68 1.88zm0 9.42h3.36v3.77h-3.36z"
  );
  line.setAttribute(
    "transform",
    "translate(" + x + " " + y + ") " + "scale(" + w / 32 + "" + h / 32 + ")"
  );
  line.classList.add(c);
  return line;
};

/** Defines base options for components with values*/
export type InstrumentBaseOptions = {
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
} & BaseOptions;

export abstract class InstrumentBase<
  Options extends InstrumentBaseOptions = InstrumentBaseOptions
> extends WebComponent<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "instrument";
  }

  protected __container: SVGSVGElement;
  protected __svg: SVGGElement;
  protected ___x: number;
  protected ___y: number;
  protected ___r: number;
  protected ___width: number;
  protected ___height: number;
  protected ___init?: boolean;

  constructor() {
    super();
    this.__container = svg(
      this.renderWidth,
      this.renderHeight,
      `0 0 ${this.renderWidth || 0} ${this.renderHeight || 0}`,
      (this.constructor as typeof InstrumentBase).elementName()
    );
    this.__container.appendChild(this);
    this.__svg = svgGroup();
    this.__container.appendChild(this.__svg);
    this.___x = this.___y = this.___r = 0;
    this.___width = this.renderWidth;
    this.___height = this.renderHeight;
    this.___init = true;
  }

  /**Options toggeler*/
  options(options: Options): this {
    super.options(options);
    if (typeof options.x === "number") this.x = options.x;
    if (typeof options.y === "number") this.y = options.y;
    if (typeof options.width === "number") this.width = options.width;
    if (typeof options.height === "number") this.height = options.height;
    else this.height = options.width * (this.renderHeight / this.renderWidth);
    if (typeof options.rotation === "number") this.rotation = options.rotation;
    delete this.___init;
    this.__updateRender();
    return this;
  }

  /**Sets x position of instrument from top left*/
  set x(x: number) {
    this.___x = x;
    this.__updateRender();
  }

  /**Sets y position of instrument from top left*/
  set y(y: number) {
    this.___y = y;
    this.__updateRender();
  }

  /**Sets width of instrument*/
  set width(width: number) {
    this.___width = width;
    this.__updateRender();
  }

  /**Sets height of instrument*/
  set height(height: number) {
    this.___height = height;
    this.__updateRender();
  }

  /**Sets height of instrument*/
  set rotation(rot: number) {
    this.___r = rot;
    this.__updateRender();
  }

  /**Updates the transform scale of the instrument*/
  __updateRender() {
    if (!this.___init) {
      let x = this.___x;
      let y = this.___y;
      this.__container.setAttribute("x", String(x));
      this.__container.setAttribute("y", String(y));

      let w = this.___width;
      let h = this.___height;
      let ratio = w / h;

      let renderRatio = this.renderWidth / this.renderHeight;
      let morphRatio = ratio / renderRatio;

      let ratioWidth = w / this.renderWidth;
      let ratioHeight = h / this.renderHeight;

      if (morphRatio != 1) {
        if (this.___r) {
          let { width, height } = widthAndHeightOfRotatedRectangle(
            w,
            h,
            degreesToRadians(this.___r)
          );
          this.__container.setAttribute("width", String(width));
          this.__container.setAttribute("height", String(height));
          this.__container.setAttribute("viewBox", `0 0 ${width} ${height}`);
          this.__svg.setAttribute(
            "transform",
            `translate(${(width - w) / 2},${(height - h) / 2}) rotate(${
              this.___r
            },${w / 2},${h / 2}) scale(${ratioWidth},${ratioHeight})`
          );
        } else {
          this.__container.setAttribute("width", String(w));
          this.__container.setAttribute("height", String(h));
          this.__container.setAttribute("viewBox", `0 0 ${w} ${h}`);
          this.__svg.setAttribute(
            "transform",
            `scale(${ratioWidth},${ratioHeight})`
          );
        }
      } else {
        if (this.___r) {
          let { width, height } = widthAndHeightOfRotatedRectangle(
            w,
            h,
            degreesToRadians(this.___r)
          );
          this.__container.setAttribute("width", String(width));
          this.__container.setAttribute("height", String(height));
          this.__container.setAttribute("viewBox", `0 0 ${width} ${height}`);
          this.__svg.setAttribute(
            "transform",
            `translate(${(width - w) / 2},${(height - h) / 2}) rotate(${
              this.___r
            },${w / 2},${h / 2}) scale(${ratioWidth},${ratioHeight})`
          );
        } else {
          this.__container.setAttribute("width", String(w));
          this.__container.setAttribute("height", String(h));
          this.__container.setAttribute(
            "viewBox",
            `0 0 ${this.renderWidth} ${this.renderHeight}`
          );
          this.__svg.removeAttribute("transform");
        }
      }
    }
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 64;
  }

  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 64;
  }
}

/* The instrument must inherit from InstrumentBase
    //* The instruement can have the property for documentation purpose but leave it empty as it is overwritten
    export class InstrumentWithValue extends InstrumentBase {
        set value(val) {}

        //* the instrument must then provide an internal method of the same name prefixed $vf which does the internal workings of the instrument
        $vfvalue(val) {
            stuff()
        }
    }
    //* The instrument must be initialized with this method
    initWebComponentValuesWithOptions(InstrumentWithValue);
    //* The value can then be attached with this method
    attachValue(InstrumentWithValue, 'value');
 */
