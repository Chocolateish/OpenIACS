import { nameSpace } from "../shared";

/**This draws a triangle*/
export let group = () => {
  return document.createElementNS(nameSpace, "g") as SVGGElement;
};
