import { create_SVG_element } from "./shared";

/**This creates a path element*/
export function path(path: string): SVGPathElement {
  const node = create_SVG_element("path");
  node.setAttribute("d", path);
  return node;
}

/**This creates a line with a path element
 * @param startX start point on x axis
 * @param startY start point on y axis
 * @param endX end point on x axis
 * @param endY end point on y axis*/
export function path_line(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SVGPathElement {
  const line = create_SVG_element("path");
  line.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
  return line;
}
