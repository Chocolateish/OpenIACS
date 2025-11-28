import { degrees_to_radians } from "@libMath";
import { createSVGElement } from "./shared";

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
  let ellipse = createSVGElement("ellipse");
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
 * @param startAngle start angle in radians
 * @param endAngle end anglein  radians*/
export function ellipseArc(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  endAngle: number
): SVGPathElement {
  let circArc = createSVGElement("path");
  let startRadian = degrees_to_radians(startAngle);
  endAngle = degrees_to_radians(endAngle - startAngle);
  let sX = radiusX * Math.cos(startRadian) + centerX;
  let sY = radiusY * Math.sin(startRadian) + centerY;
  let eX = radiusX * Math.cos(startRadian + endAngle) + centerX;
  let eY = radiusY * Math.sin(startRadian + endAngle) + centerY;
  let fA = endAngle > Math.PI ? 1 : 0;
  let fS = endAngle > 0 ? 1 : 0;
  circArc.setAttribute(
    "d",
    `M ${sX} ${sY} A ${radiusX} ${radiusY} 0 ${fA} ${fS} ${eX} ${eY}`
  );
  return circArc;
}
