import { createSVGElement } from "./shared";

/**This draws a triangle*/
export function group(): SVGGElement {
  return createSVGElement("g");
}
