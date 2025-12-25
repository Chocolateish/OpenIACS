import { degrees_to_radians } from "@libMath";
import { create_svg_element } from "./shared";

/**This creates a svg ellipse
 * @param center_x x coordinate of center
 * @param center_y y coordinate of center
 * @param radius_x x radius of circle
 * @param radius_y y radius of circle*/
export function ellipse(
  center_x: number,
  center_y: number,
  radius_x: number,
  radius_y: number
): SVGEllipseElement {
  const ellipse = create_svg_element("ellipse");
  ellipse.setAttribute("cx", String(center_x));
  ellipse.setAttribute("cy", String(center_y));
  ellipse.setAttribute("rx", String(radius_x));
  ellipse.setAttribute("ry", String(radius_y));
  return ellipse;
}

/**This draws parts of a circle/ellipse, the circle direction is reversed
 * @param center_x the center point on the x axis
 * @param center_y the center point on the y axis
 * @param radius_x radius in x axis
 * @param radius_y radius in y axis
 * @param start_angle start angle in radians
 * @param end_angle end anglein  radians*/
export function ellipse_arc(
  center_x: number,
  center_y: number,
  radius_x: number,
  radius_y: number,
  start_angle: number,
  end_angle: number
): SVGPathElement {
  const circ_arc = create_svg_element("path");
  const start_radian = degrees_to_radians(start_angle);
  end_angle = degrees_to_radians(end_angle - start_angle);
  const s_x = radius_x * Math.cos(start_radian) + center_x;
  const s_y = radius_y * Math.sin(start_radian) + center_y;
  const e_x = radius_x * Math.cos(start_radian + end_angle) + center_x;
  const e_y = radius_y * Math.sin(start_radian + end_angle) + center_y;
  const f_a = end_angle > Math.PI ? 1 : 0;
  const f_s = end_angle > 0 ? 1 : 0;
  circ_arc.setAttribute(
    "d",
    `M ${s_x} ${s_y} A ${radius_x} ${radius_y} 0 ${f_a} ${f_s} ${e_x} ${e_y}`
  );
  return circ_arc;
}
