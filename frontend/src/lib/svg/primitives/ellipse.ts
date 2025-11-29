import { degrees_to_radians } from "@libMath";
import { create_SVG_element } from "./shared";

/**This creates a svg ellipse
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param radiusX x radius of circle
 * @param radiusY y radius of circle*/
export function ellipse(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): SVGEllipseElement {
  let ellipse = create_SVG_element("ellipse");
  ellipse.setAttribute("cx", String(centerX));
  ellipse.setAttribute("cy", String(centerY));
  ellipse.setAttribute("rx", String(radiusX));
  ellipse.setAttribute("ry", String(radiusY));
  return ellipse;
}

/**This draws parts of a circle/ellipse, the circle direction is reversed
 * @param centerX the center point on the x axis
 * @param centerY the center point on the y axis
 * @param radiusX radius in x axis
 * @param radiusY radius in y axis
 * @param start_angle start angle in radians
 * @param end_angle end anglein  radians*/
export function ellipse_arc(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  start_angle: number,
  end_angle: number
): SVGPathElement {
  let circ_arc = create_SVG_element("path");
  let start_radian = degrees_to_radians(start_angle);
  end_angle = degrees_to_radians(end_angle - start_angle);
  let sX = radiusX * Math.cos(start_radian) + centerX;
  let sY = radiusY * Math.sin(start_radian) + centerY;
  let eX = radiusX * Math.cos(start_radian + end_angle) + centerX;
  let eY = radiusY * Math.sin(start_radian + end_angle) + centerY;
  let fA = end_angle > Math.PI ? 1 : 0;
  let fS = end_angle > 0 ? 1 : 0;
  circ_arc.setAttribute(
    "d",
    `M ${sX} ${sY} A ${radiusX} ${radiusY} 0 ${fA} ${fS} ${eX} ${eY}`
  );
  return circ_arc;
}
