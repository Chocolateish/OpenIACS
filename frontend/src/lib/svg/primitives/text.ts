import { SVGAnchorPoint } from "../util/anchorPoint";
import { createSVGElement } from "./shared";

/**Creates a text nodes for an svg
 * @param x x coordinate of text
 * @param y y coordinate of text
 * @param text text
 * @param size size of text in px
 * @param anchor anchor point of text*/
export function text(
  x: number,
  y: number,
  text: string,
  size: number,
  anchor: SVGAnchorPoint
): SVGTextElement {
  let textElem = createSVGElement("text");
  textElem.setAttribute("x", String(x));
  textElem.setAttribute("y", String(y));
  textElem.setAttribute("font-size", String(size));
  textElem.innerHTML = text;
  switch (anchor) {
    case SVGAnchorPoint.bottomLeft:
    case SVGAnchorPoint.middleLeft:
    case SVGAnchorPoint.topLeft: {
      textElem.setAttribute("text-anchor", "start");
      break;
    }
    case SVGAnchorPoint.topCenter:
    case SVGAnchorPoint.bottomCenter:
    case SVGAnchorPoint.middleCenter: {
      textElem.setAttribute("text-anchor", "middle");
      break;
    }
    case SVGAnchorPoint.topRight:
    case SVGAnchorPoint.middleRight:
    case SVGAnchorPoint.bottomRight: {
      textElem.setAttribute("text-anchor", "end");
      break;
    }
  }
  switch (anchor) {
    case SVGAnchorPoint.bottomLeft:
    case SVGAnchorPoint.bottomRight:
    case SVGAnchorPoint.bottomCenter: {
      textElem.setAttribute("dominant-baseline", "auto");
      break;
    }
    case SVGAnchorPoint.middleLeft:
    case SVGAnchorPoint.middleRight:
    case SVGAnchorPoint.middleCenter: {
      textElem.setAttribute("dominant-baseline", "central");
      break;
    }
    case SVGAnchorPoint.topLeft:
    case SVGAnchorPoint.topCenter:
    case SVGAnchorPoint.topRight: {
      textElem.setAttribute("dominant-baseline", "hanging");
      break;
    }
  }
  return textElem;
}

/**Creates a text nodes for an svg
 * @param x x coordinate of text
 * @param y y coordinate of text
 * @param width width of text
 * @param height height of text
 * @param text text
 * @param size size of text in px
 * @param anchor anchor point of */
export function multiLineText(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  size: number,
  anchor: SVGAnchorPoint
): SVGForeignObjectElement {
  let textElement = createSVGElement("foreignObject");
  let textDiv = textElement.appendChild(document.createElement("div"));
  textElement.setAttribute("width", String(width));
  textElement.setAttribute("height", String(height));
  textElement.setAttribute("x", String(x));
  textElement.setAttribute("y", String(y));
  textDiv.style.fontSize = size + "px";
  textDiv.style.width = "100%";
  textDiv.style.height = "100%";
  textDiv.style.display = "flex";
  textDiv.innerHTML = text;
  switch (anchor) {
    case SVGAnchorPoint.bottomLeft:
    case SVGAnchorPoint.middleLeft:
    case SVGAnchorPoint.topLeft: {
      textDiv.style.textAlign = "start";
      textDiv.style.justifyContent = "flex-start";
      break;
    }
    case SVGAnchorPoint.topCenter:
    case SVGAnchorPoint.bottomCenter:
    case SVGAnchorPoint.middleCenter: {
      textDiv.style.textAlign = "center";
      textDiv.style.justifyContent = "center";
      break;
    }
    case SVGAnchorPoint.topRight:
    case SVGAnchorPoint.middleRight:
    case SVGAnchorPoint.bottomRight: {
      textDiv.style.textAlign = "end";
      textDiv.style.justifyContent = "flex-end";
      break;
    }
  }
  switch (anchor) {
    case SVGAnchorPoint.bottomLeft:
    case SVGAnchorPoint.bottomRight:
    case SVGAnchorPoint.bottomCenter: {
      textDiv.style.alignItems = "flex-end";
      break;
    }
    case SVGAnchorPoint.middleLeft:
    case SVGAnchorPoint.middleRight:
    case SVGAnchorPoint.middleCenter: {
      textDiv.style.alignItems = "center";
      break;
    }
    case SVGAnchorPoint.topLeft:
    case SVGAnchorPoint.topCenter:
    case SVGAnchorPoint.topRight: {
      textDiv.style.alignItems = "flex-start";
      break;
    }
  }
  return textElement;
}
