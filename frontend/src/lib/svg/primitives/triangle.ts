import { create_SVG_element } from "./shared";

/**This draws a triangle
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param width width
 * @param height height*/
export function isosceles_triangle(
  centerX: number,
  centerY: number,
  width: number,
  height: number
): SVGPathElement {
  let trig = create_SVG_element("path");
  let halfW = width / 2;
  let halfH = height / 2;
  trig.setAttribute(
    "d",
    "M" +
      (centerX - halfW) +
      "," +
      (centerY + halfH) +
      " " +
      (centerX + halfW) +
      "," +
      (centerY + halfH) +
      " " +
      centerX +
      "," +
      (centerY - halfH) +
      "Z"
  );
  return trig;
}
