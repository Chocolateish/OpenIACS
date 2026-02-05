export class SVGAttributes<T extends SVGElement> {
  readonly elem: T;
  constructor(elem: T) {
    this.elem = elem;
  }

  /** Sets the stroke color of the SVG element */
  stroke(stroke: string): this {
    this.elem.setAttribute("stroke", stroke);
    return this;
  }
  /** Sets the stroke color of the SVG element */
  s(stroke: string): this {
    this.elem.setAttribute("stroke", stroke);
    return this;
  }

  /** Sets the fill color of the SVG element */
  fill(fill: string): this {
    this.elem.setAttribute("fill", fill);
    return this;
  }
  /** Sets the fill color of the SVG element */
  f(fill: string): this {
    this.elem.setAttribute("fill", fill);
    return this;
  }

  /** Sets the stroke width of the SVG element */
  stroke_width(width: number): this {
    this.elem.setAttribute("stroke-width", String(width));
    return this;
  }
  /** Sets the stroke width of the SVG element */
  sw(width: number): this {
    this.elem.setAttribute("stroke-width", String(width));
    return this;
  }

  /** Adds one or more class names to the SVG element */
  class_list(...class_name: string[]): this {
    this.elem.classList.add(...class_name);
    return this;
  }
  /** Adds one or more class names to the SVG element */
  cl(...class_name: string[]): this {
    this.elem.classList.add(...class_name);
    return this;
  }

  /** Sets an arbitrary attribute on the SVG element */
  attribute(name: string, value: string): this {
    this.elem.setAttribute(name, value);
    return this;
  }
  /** Sets an arbitrary attribute on the SVG element */
  a(name: string, value: string): this {
    this.elem.setAttribute(name, value);
    return this;
  }
}
