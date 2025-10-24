import { nameSpace } from "../shared";

/** This returns an empty svg element
 * @param {number} width width of svg
 * @param {number} height height of svg
 * @param {string} viewbox viewbox of svg*/
export let svg = (
  width: number,
  height: number,
  viewbox: string = `0 0 ${width} ${height}`
) => {
  let svg = document.createElementNS(nameSpace, "svg") as SVGSVGElement;
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", String(viewbox));
  return svg;
};
