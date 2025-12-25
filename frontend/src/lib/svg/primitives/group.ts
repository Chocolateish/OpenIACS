import { create_svg_element } from "./shared";

/**This draws a triangle*/
export function group(): SVGGElement {
  return create_svg_element("g");
}
