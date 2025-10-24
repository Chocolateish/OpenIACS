import { defineElement } from "@libBase";
import { Component } from "@libComponents";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./component.scss";

/**Defines options for component wrapper*/
export type InstrComponentOptions = {
  /**Component to show */
  component: Component;
  /**Width to use when rendering component */
  renderWidth: number;
  /**Height to use when rendering component */
  renderHeight: number;
} & InstrumentBaseOptions;

export class InstrComponent extends InstrumentBase<InstrComponentOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "component";
  }

  private __compContainer = this.__svg.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "foreignObject")
  );
  protected __width = 0;
  protected __height = 0;
  private __renderWidth?: number;
  private __renderHeight?: number;

  constructor() {
    super();
    this.__compContainer.classList.add("touch");
    this.__compContainer.setAttribute("x", "0");
    this.__compContainer.setAttribute("y", "0");
  }

  /**Options toggeler*/
  options(options: InstrComponentOptions): this {
    if (typeof options.renderWidth === "number")
      this.renderWidth = options.renderWidth;
    else this.renderWidth = 1;
    if (typeof options.renderHeight === "number")
      this.renderHeight = options.renderHeight;
    else this.renderHeight = 1;
    super.options(options);
    if (typeof options.component !== "undefined")
      this.component = options.component;
    return this;
  }

  /**Changes the wrapped component*/
  set component(comp: Component) {
    this.__compContainer.appendChild(comp);
  }

  /**Changes width to use for rendering component*/
  set renderWidth(w: number) {
    this.__renderWidth = w;
  }

  /**Changes height used for rendering component*/
  set renderHeight(h: number) {
    this.__renderHeight = h;
  }

  set width(width: number) {
    this.__width = width;
    this.__compContainer.setAttribute("width", String(width));
    super.width = width;
  }

  set height(height: number) {
    this.__height = height;
    this.__compContainer.setAttribute("height", String(height));
    super.height = height;
  }

  /**Original width of rendered graphics */
  get renderWidth(): number {
    return this.__renderWidth || 0;
  }
  /**Original height of rendered graphics */
  get renderHeight(): number {
    return this.__renderHeight || 0;
  }
}
defineElement(InstrComponent);
