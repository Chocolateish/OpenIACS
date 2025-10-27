import { createSVGElement } from "./shared";

/**This creates a line element
 * @param startX start point on x axis
 * @param startY start point on y axis
 * @param endX end point on x axis
 * @param endY end point on y axis*/
export function line(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SVGLineElement {
  let line = createSVGElement("line");
  line.setAttribute("x1", String(startX));
  line.setAttribute("y1", String(startY));
  line.setAttribute("x2", String(endX));
  line.setAttribute("y2", String(endY));
  return line;
}
