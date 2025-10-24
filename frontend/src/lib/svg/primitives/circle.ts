import { nameSpace } from "../shared";

/**This creates a svg circle
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param radius radius of circle*/
export let circle = (centerX: number, centerY: number, radius: number) => {
  let circle = document.createElementNS(
    nameSpace,
    "circle"
  ) as SVGCircleElement;
  circle.setAttribute("cx", String(centerX));
  circle.setAttribute("cy", String(centerY));
  circle.setAttribute("r", String(radius));
  return circle;
};
