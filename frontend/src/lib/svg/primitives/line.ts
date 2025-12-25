import { create_svg_element } from "./shared";

/**This creates a line element
 * @param start_x start point on x axis
 * @param start_y start point on y axis
 * @param end_x end point on x axis
 * @param end_y end point on y axis*/
export function line(
  start_x: number,
  start_y: number,
  end_x: number,
  end_y: number
): SVGLineElement {
  const line = create_svg_element("line");
  line.setAttribute("x1", String(start_x));
  line.setAttribute("y1", String(start_y));
  line.setAttribute("x2", String(end_x));
  line.setAttribute("y2", String(end_y));
  return line;
}
