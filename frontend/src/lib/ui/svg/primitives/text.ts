import { nameSpace } from "../shared";
import { AnchorPoint } from "../util/anchorPoint";

/**Creates a text nodes for an svg
 * @param x x coordinate of text
 * @param y y coordinate of text
 * @param text text
 * @param size size of text in px
 * @param anchor anchor point of text*/
export let text = (
  x: number,
  y: number,
  text: string,
  size: number,
  anchor: AnchorPoint
) => {
  let textElem = document.createElementNS(nameSpace, "text") as SVGTextElement;
  textElem.setAttribute("x", String(x));
  textElem.setAttribute("y", String(y));
  textElem.setAttribute("font-size", String(size));
  textElem.innerHTML = text;
  switch (anchor) {
    case AnchorPoint.bottomLeft:
    case AnchorPoint.middleLeft:
    case AnchorPoint.topLeft: {
      textElem.setAttribute("text-anchor", "start");
      break;
    }
    case AnchorPoint.topCenter:
    case AnchorPoint.bottomCenter:
    case AnchorPoint.middleCenter: {
      textElem.setAttribute("text-anchor", "middle");
      break;
    }
    case AnchorPoint.topRight:
    case AnchorPoint.middleRight:
    case AnchorPoint.bottomRight: {
      textElem.setAttribute("text-anchor", "end");
      break;
    }
  }
  switch (anchor) {
    case AnchorPoint.bottomLeft:
    case AnchorPoint.bottomRight:
    case AnchorPoint.bottomCenter: {
      textElem.setAttribute("dominant-baseline", "auto");
      break;
    }
    case AnchorPoint.middleLeft:
    case AnchorPoint.middleRight:
    case AnchorPoint.middleCenter: {
      textElem.setAttribute("dominant-baseline", "central");
      break;
    }
    case AnchorPoint.topLeft:
    case AnchorPoint.topCenter:
    case AnchorPoint.topRight: {
      textElem.setAttribute("dominant-baseline", "hanging");
      break;
    }
  }
  return textElem;
};

/**Creates a text nodes for an svg
 * @param x x coordinate of text
 * @param y y coordinate of text
 * @param width width of text
 * @param height height of text
 * @param text text
 * @param size size of text in px
 * @param anchor anchor point of */
export let multiLineText = (
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  size: number,
  anchor: AnchorPoint
) => {
  let text2 = document.createElementNS(
    nameSpace,
    "foreignObject"
  ) as SVGForeignObjectElement;
  let textDiv = text2.appendChild(document.createElement("div"));
  text2.setAttribute("width", String(width));
  text2.setAttribute("height", String(height));
  text2.setAttribute("x", String(x));
  text2.setAttribute("y", String(y));
  textDiv.style.fontSize = size + "px";
  textDiv.style.width = "100%";
  textDiv.style.height = "100%";
  textDiv.style.display = "flex";
  textDiv.innerHTML = text;
  switch (anchor) {
    case AnchorPoint.bottomLeft:
    case AnchorPoint.middleLeft:
    case AnchorPoint.topLeft: {
      textDiv.style.textAlign = "start";
      textDiv.style.justifyContent = "flex-start";
      break;
    }
    case AnchorPoint.topCenter:
    case AnchorPoint.bottomCenter:
    case AnchorPoint.middleCenter: {
      textDiv.style.textAlign = "center";
      textDiv.style.justifyContent = "center";
      break;
    }
    case AnchorPoint.topRight:
    case AnchorPoint.middleRight:
    case AnchorPoint.bottomRight: {
      textDiv.style.textAlign = "end";
      textDiv.style.justifyContent = "flex-end";
      break;
    }
  }
  switch (anchor) {
    case AnchorPoint.bottomLeft:
    case AnchorPoint.bottomRight:
    case AnchorPoint.bottomCenter: {
      textDiv.style.alignItems = "flex-end";
      break;
    }
    case AnchorPoint.middleLeft:
    case AnchorPoint.middleRight:
    case AnchorPoint.middleCenter: {
      textDiv.style.alignItems = "center";
      break;
    }
    case AnchorPoint.topLeft:
    case AnchorPoint.topCenter:
    case AnchorPoint.topRight: {
      textDiv.style.alignItems = "flex-start";
      break;
    }
  }
  return text2;
};
