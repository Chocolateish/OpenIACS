import { createSVGElement } from "./shared";

/**This creates a path element*/
export function path(path: string): SVGPathElement {
  let node = createSVGElement("path");
  node.setAttribute("d", path);
  return node;
}

/**This creates a line with a path element
 * @param startX start point on x axis
 * @param startY start point on y axis
 * @param endX end point on x axis
 * @param endY end point on y axis*/
export function pathLine(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SVGPathElement {
  let line = createSVGElement("path");
  line.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
  return line;
}
