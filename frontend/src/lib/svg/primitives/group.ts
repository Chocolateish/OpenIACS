import { create_SVG_element } from "./shared";

/**This draws a triangle*/
export function group(): SVGGElement {
  return create_SVG_element("g");
}
