import { ellipseArc } from "./ellipse";
import { createSVGElement } from "./shared";

/**This creates a svg circle
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param radius radius of circle*/
export function circle(
  centerX: number,
  centerY: number,
  radius: number
): SVGCircleElement {
  let circle = createSVGElement("circle");
  circle.setAttribute("cx", String(centerX));
  circle.setAttribute("cy", String(centerY));
  circle.setAttribute("r", String(radius));
  return circle;
}

/**This draws parts of a circle/ellipse, the circle direction is reversed
 * @param centerX the center point on the x axis
 * @param centerY the center point on the y axis
 * @param radius radius in x axis
 * @param startAngle start angle in radians
 * @param endAngle end anglein  radians*/
export function circleArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): SVGPathElement {
  return ellipseArc(centerX, centerY, radius, radius, startAngle, endAngle);
}
