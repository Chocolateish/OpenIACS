import { createSVGElement } from "./shared";

/**This creates a rectangle with teh center as origin
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param width width
 * @param height height
 * @param cornerRadius radius of corner*/
export function rectangleFromCenter(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  cornerRadius: number
): SVGRectElement {
  let circle = createSVGElement("rect");
  circle.setAttribute("x", String(centerX - width / 2));
  circle.setAttribute("y", String(centerY - height / 2));
  circle.setAttribute("width", String(width));
  circle.setAttribute("height", String(height));
  circle.setAttribute("rx", String(cornerRadius));
  return circle;
}

/**This creates a rectangle with teh center as origin
 * @param startX x coordinate of center
 * @param startY y coordinate of center
 * @param width width
 * @param height height
 * @param cornerRadius radius of corner*/
export function rectangleFromCorner(
  startX: number,
  startY: number,
  width: number,
  height: number,
  cornerRadius: number
): SVGRectElement {
  let circle = createSVGElement("rect");
  circle.setAttribute("x", String(startX));
  circle.setAttribute("y", String(startY));
  circle.setAttribute("width", String(width));
  circle.setAttribute("height", String(height));
  circle.setAttribute("rx", String(cornerRadius));
  return circle;
}
