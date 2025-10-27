import { nameSpace } from "../shared";

type SVGElements = {
  ellipse: SVGEllipseElement;
  circle: SVGCircleElement;
  path: SVGPathElement;
  line: SVGLineElement;
  rect: SVGRectElement;
  text: SVGTextElement;
  g: SVGGElement;
  svg: SVGSVGElement;
  foreignObject: SVGForeignObjectElement;
};

export function createSVGElement<K extends keyof SVGElements>(
  name: K
): SVGElements[K] {
  return document.createElementNS(nameSpace, name) as SVGElements[K];
}
