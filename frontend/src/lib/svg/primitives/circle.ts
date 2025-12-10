import { ellipse_arc } from "./ellipse";
import { create_SVG_element } from "./shared";

/**This creates a svg circle
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param radius radius of circle*/
export function circle(
  centerX: number,
  centerY: number,
  radius: number
): SVGCircleElement {
  const circle = create_SVG_element("circle");
  circle.setAttribute("cx", String(centerX));
  circle.setAttribute("cy", String(centerY));
  circle.setAttribute("r", String(radius));
  return circle;
}

/**This draws parts of a circle/ellipse, the circle direction is reversed
 * @param centerX the center point on the x axis
 * @param centerY the center point on the y axis
 * @param radius radius in x axis
 * @param start_angle start angle in radians
 * @param end_angle end anglein  radians*/
export function circle_arc(
  centerX: number,
  centerY: number,
  radius: number,
  start_angle: number,
  end_angle: number
): SVGPathElement {
  return ellipse_arc(centerX, centerY, radius, radius, start_angle, end_angle);
}
