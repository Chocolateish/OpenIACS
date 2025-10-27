import { createSVGElement } from "./shared";

/** This returns an empty svg element
 * @param  width width of svg
 * @param  height height of svg
 * @param  viewbox viewbox of svg*/
export function svg(
  width: number,
  height: number,
  viewbox: string = `0 0 ${width} ${height}`
): SVGSVGElement {
  let svg = createSVGElement("svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", String(viewbox));
  return svg;
}
