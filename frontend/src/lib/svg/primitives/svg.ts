import { SVGAttributes } from "../attributes";
import { create_svg_element } from "./shared";

/** This returns an empty svg element
 * @param  width width of svg
 * @param  height height of svg
 * @param  viewbox viewbox of svg*/
export function svg(
  width: number,
  height: number,
  viewbox: string = `0 0 ${width} ${height}`,
): SVGAttributes<SVGSVGElement> {
  const svg = create_svg_element("svg");
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", String(viewbox));
  return new SVGAttributes(svg);
}
