import { create_svg_element } from "./shared";

/**This creates a rectangle with teh center as origin
 * @param center_x x coordinate of center
 * @param center_y y coordinate of center
 * @param width width
 * @param height height
 * @param corner_radius radius of corner*/
export function rectangle_from_center(
  center_x: number,
  center_y: number,
  width: number,
  height: number,
  corner_radius: number
): SVGRectElement {
  const circle = create_svg_element("rect");
  circle.setAttribute("x", String(center_x - width / 2));
  circle.setAttribute("y", String(center_y - height / 2));
  circle.setAttribute("width", String(width));
  circle.setAttribute("height", String(height));
  circle.setAttribute("rx", String(corner_radius));
  return circle;
}

/**This creates a rectangle with teh center as origin
 * @param start_x x coordinate of center
 * @param start_y y coordinate of center
 * @param width width
 * @param height height
 * @param corner_radius radius of corner*/
export function rectangle_from_corner(
  start_x: number,
  start_y: number,
  width: number,
  height: number,
  corner_radius: number
): SVGRectElement {
  const circle = create_svg_element("rect");
  circle.setAttribute("x", String(start_x));
  circle.setAttribute("y", String(start_y));
  circle.setAttribute("width", String(width));
  circle.setAttribute("height", String(height));
  circle.setAttribute("rx", String(corner_radius));
  return circle;
}
