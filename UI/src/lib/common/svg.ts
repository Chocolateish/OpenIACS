let matrixTimes = (
  [[a, b], [c, d]]: [[number, number], [number, number]],
  [x, y]: [number, number]
): [number, number] => [a * x + b * y, c * x + d * y];

let vecAdd = (
  [a1, a2]: [number, number],
  [b1, b2]: [number, number]
): [number, number] => [a1 + b1, a2 + b2];

let rotateMatrix = (x: number): [[number, number], [number, number]] => {
  let cosx = Math.cos(x);
  let sinx = Math.sin(x);
  return [
    [cosx, -sinx],
    [sinx, cosx],
  ];
};

let svgEllipseArc = (
  [cx, cy]: [number, number],
  [rx, ry]: [number, number],
  [t1, Δ]: [number, number],
  φ: number
): [
  string,
  number,
  string,
  number,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number
] => {
  Δ = Δ % (2 * Math.PI);
  let rotMatrix = rotateMatrix(φ);
  let [sX, sY] = vecAdd(
    matrixTimes(rotMatrix, [rx * Math.cos(t1), ry * Math.sin(t1)]),
    [cx, cy]
  );
  let [eX, eY] = vecAdd(
    matrixTimes(rotMatrix, [rx * Math.cos(t1 + Δ), ry * Math.sin(t1 + Δ)]),
    [cx, cy]
  );
  let fA = Δ > Math.PI ? 1 : 0;
  let fS = Δ > 0 ? 1 : 0;
  return [
    " M ",
    sX,
    " ",
    sY,
    " A ",
    rx,
    ry,
    (φ / Math.PI) * 180,
    fA,
    fS,
    eX,
    eY,
  ];
};

/**Finds a point on a circle
 * @param  centerX x coordinate of circle center
 * @param  centerY y coordinate of circle center
 * @param  radius radius of circle
 * @param  angle angle of point in radians
 * @returns x,y coordinates of point*/
export let pointOnCircle = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
): [number, number] => {
  return [
    radius * Math.cos(angle) + centerX,
    radius * Math.sin(angle) + centerY,
  ];
};

/**Converts an angle to an anchor point
 * @param  angle angle in radians
 * @returns  anchor point*/
export let angleToAnchorPoint = (angle: number): SVGAnchor => {
  let sec =
    angle >= 0
      ? angle % 6.283185307179586476925286766559
      : -(angle % 6.283185307179586476925286766559);
  if (sec > 5.934119456780720561540546) return 5;
  else if (sec > 4.9741883681838392942325165) return 4;
  else if (sec > 4.4505895925855404211554095) return 3;
  else if (sec > 3.49065850398865915384738) return 2;
  else if (sec > 2.792526803190927323077904) return 1;
  else if (sec > 1.8325957145940460557698745) return 0;
  else if (sec > 1.3089969389957471826927675) return 7;
  else if (sec > 0.349065850398865915384738) return 6;
  else return 5;
};

/** This returns an empty svg element
 * @param  width width of svg
 * @param  height height of svg
 * @param  viewbox viewbox of svg
 * @param  className class or class list to pass to svg*/
export let svg = (
  width?: number,
  height?: number,
  viewbox?: string,
  className?: string | string[]
): SVGSVGElement => {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (typeof width !== "undefined") svg.setAttribute("width", String(width));
  if (typeof height !== "undefined") svg.setAttribute("height", String(height));
  if (viewbox) svg.setAttribute("viewBox", String(viewbox));
  if (className) svg.classList.add(String(className));
  return svg;
};

/**This creates a line element
 * @param  startX start point on x axis
 * @param  startY start point on y axis
 * @param  endX end point on x axis
 * @param  endY end point on y axis
 * @param  className class name
 * @param  strokeWidth stroke width*/
export let line = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  className?: string,
  strokeWidth: number = 1
): SVGPathElement => {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(startX));
  line.setAttribute("x2", String(endX));
  line.setAttribute("y1", String(startY));
  line.setAttribute("y2", String(endY));
  if (className) line.classList.add(className);
  line.setAttribute("stroke-width", String(strokeWidth || 1));
  return line;
};

/**This creates a line element
 * @param  startX start point on x axis
 * @param  startY start point on y axis
 * @param  endX end point on x axis
 * @param  endY end point on y axis
 * @param  className class name
 * @param  strokeWidth stroke width*/
export let svgLinePath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  className?: string,
  strokeWidth: number = 1
): SVGPathElement => {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", ["M", startX, startY, "L", endX, endY].join(" "));
  if (className) line.classList.add(className);
  line.setAttribute("stroke-width", String(strokeWidth || 1));
  return line;
};

/**This creates a line element
 * @param  path start point on x axis
 * @param  className class name
 * @param  strokeWidth stroke width */
export let path = (
  path: string,
  className?: string,
  strokeWidth: number = 1
): SVGPathElement => {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", path);
  if (className) line.classList.add(className);
  line.setAttribute("stroke-width", String(strokeWidth || 1));
  return line;
};

/**This draws parts of a circle/ellipse, the circle direction is reversed
 * @param  centerX the center point on the x axis
 * @param  centerY the center point on the y axis
 * @param  radiusX radius in x axis
 * @param  radiusY radius in y axis
 * @param  startAngle start angle in radians
 * @param  distance distance/amount of radians in circle
 * @param  offset offset of circle part on circle in radians
 * @param  className class name
 * @param  strokeWidth stroke width */
export let circleArc = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  distance: number,
  offset: number,
  className: string,
  strokeWidth: number = 1
): SVGPathElement => {
  let circArc = document.createElementNS("http://www.w3.org/2000/svg", "path");
  circArc.setAttribute(
    "d",
    svgEllipseArc(
      [centerX, centerY],
      [radiusX, radiusY],
      [startAngle, distance],
      offset
    ).join(" ")
  );
  if (className) circArc.classList.add(className);
  circArc.setAttribute("stroke-width", String(strokeWidth || 1));
  return circArc;
};

/**This creates a svg circle
 * @param centerX x coordinate of center
 * @param centerY y coordinate of center
 * @param radius radius of circle
 * @param className class
 * @param strokeWidth width of stroke
 * @returns*/
export let circle = (
  centerX: number,
  centerY: number,
  radius: number,
  className: string,
  strokeWidth: number = 1
) => {
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", String(centerX));
  circle.setAttribute("cy", String(centerY));
  circle.setAttribute("r", String(radius));
  if (className) circle.classList.add(className);
  circle.setAttribute("stroke-width", String(strokeWidth || 1));
  return circle;
};

/**This creates a rectangle
 * @param  centerX x coordinate of center
 * @param  centerY y coordinate of center
 * @param  width width
 * @param  height height
 * @param cornerRadius radius of corner
 * @param  className class
 * @param  strokeWidth width of stroke*/
export let rectangle = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  cornerRadius: number,
  className?: string,
  strokeWidth: number = 1
): SVGRectElement => {
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  circle.setAttribute("x", String(centerX - width / 2));
  circle.setAttribute("y", String(centerY - height / 2));
  circle.setAttribute("width", String(width));
  circle.setAttribute("height", String(height));
  circle.setAttribute("rx", String(cornerRadius));
  if (className) circle.classList.add(className);
  circle.setAttribute("stroke-width", String(strokeWidth || 1));
  return circle;
};

/**This draws a triangle
 * @param  centerX x coordinate of center
 * @param  centerY y coordinate of center
 * @param  width width
 * @param height height
 * @param  className class
 * @param  strokeWidth width of stroke*/
export let triangle = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  className: string,
  strokeWidth: number = 1
): SVGPathElement => {
  let trig = document.createElementNS("http://www.w3.org/2000/svg", "path");
  trig.setAttribute(
    "d",
    "M" +
      (centerX - width / 2) +
      "," +
      (centerY - height / 2) +
      " " +
      (centerX + width / 2) +
      "," +
      (centerY - height / 2) +
      " " +
      centerX +
      "," +
      (centerY + height / 2) +
      "Z"
  );
  if (className) trig.classList.add(className);
  trig.setAttribute("stroke-width", String(strokeWidth || 1));
  return trig;
};

/**This creates a svg gruop*/
export let svgGroup = (): SVGGElement => {
  return document.createElementNS("http://www.w3.org/2000/svg", "g");
};

export const SVGAnchor = {
  bottomLeft: 0,
  middleLeft: 1,
  topLeft: 2,
  topCenter: 3,
  topRight: 4,
  middleRight: 5,
  bottomRight: 6,
  bottomCenter: 7,
  middleCenter: 8,
} as const;
export type SVGAnchor = (typeof SVGAnchor)[keyof typeof SVGAnchor];

/**Creates a text nodes for an svg
 * @param  x x coordinate of text
 * @param  y y coordinate of text
 * @param  text text
 * @param  size size of text in px
 * @param  className class name
 * @param  anchor anchor point of text*/
export let svgText = (
  x: number,
  y: number,
  text: string,
  size: number,
  className: string,
  anchor: SVGAnchor
): SVGTextElement => {
  let textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElem.setAttribute("x", String(x));
  textElem.setAttribute("y", String(y));
  textElem.setAttribute("font-size", String(size));
  textElem.classList.add(className);
  textElem.innerHTML = text;
  switch (anchor) {
    case 0:
    case 1:
    case 2: {
      textElem.setAttribute("text-anchor", "start");
      break;
    }
    case 3:
    case 7:
    case 8: {
      textElem.setAttribute("text-anchor", "middle");
      break;
    }
    case 4:
    case 5:
    case 6: {
      textElem.setAttribute("text-anchor", "end");
      break;
    }
  }
  switch (anchor) {
    case 0:
    case 6:
    case 7: {
      textElem.setAttribute("dominant-baseline", "auto");
      break;
    }
    case 1:
    case 5:
    case 8: {
      textElem.setAttribute("dominant-baseline", "central");
      break;
    }
    case 2:
    case 3:
    case 4: {
      textElem.setAttribute("dominant-baseline", "hanging");
      break;
    }
  }
  return textElem;
};

/**Creates a text nodes for an svg
 * @param  x x coordinate of text
 * @param  y y coordinate of text
 * @param  width width of text
 * @param  height height of text
 * @param  text text
 * @param  size size of text in px
 * @param  className class name
 * @param  anchor anchor point of text 0 = bottom left 1 = middle left 2 = top left 3 = top center 4 = top right 5 = middle right 6 = bottom right  7 = bottom center 8 = middle center*/
export let svgMultiLineText = (
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  size: number,
  className: string,
  anchor: SVGAnchor
): SVGForeignObjectElement => {
  let text2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  let textDiv = text2.appendChild(document.createElement("div"));
  text2.setAttribute("width", String(width));
  text2.setAttribute("height", String(height));
  text2.setAttribute("x", String(x));
  text2.setAttribute("y", String(y));
  textDiv.style.fontSize = size + "px";
  textDiv.style.width = "100%";
  textDiv.style.height = "100%";
  textDiv.style.display = "flex";
  textDiv.classList.add(className);
  textDiv.innerHTML = text;
  switch (anchor) {
    case 0:
    case 1:
    case 2: {
      textDiv.style.textAlign = "start";
      textDiv.style.justifyContent = "flex-start";
      break;
    }
    case 3:
    case 7:
    case 8: {
      textDiv.style.textAlign = "center";
      textDiv.style.justifyContent = "center";
      break;
    }
    case 4:
    case 5:
    case 6: {
      textDiv.style.textAlign = "end";
      textDiv.style.justifyContent = "flex-end";
      break;
    }
  }
  switch (anchor) {
    case 0:
    case 6:
    case 7: {
      textDiv.style.alignItems = "flex-end";
      break;
    }
    case 1:
    case 5:
    case 8: {
      textDiv.style.alignItems = "center";
      break;
    }
    case 2:
    case 3:
    case 4: {
      textDiv.style.alignItems = "flex-start";
      break;
    }
  }
  return text2;
};
