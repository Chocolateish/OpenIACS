import { nodeClone } from "@libCommon";
import type { SVGFunc } from "@libSvg";

export function generateFunction(name: string, icon: string): SVGFunc {
  let svg: SVGSVGElement;
  return function (this: any) {
    if (svg) {
      return nodeClone(svg);
    } else {
      svg = new DOMParser().parseFromString(icon, "image/svg+xml")
        .firstChild as SVGSVGElement;
      svg.setAttribute("icon", name);
      return nodeClone(svg);
    }
  };
}
