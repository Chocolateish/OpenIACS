//Modifies the stroke color of a svg element
export function stroke<T extends SVGElement>(elem: T, stroke: string): T {
  elem.setAttribute("stroke", stroke);
  return elem;
}

//Modifies the stroke-width of a svg element
export function stroke_width<T extends SVGElement>(elem: T, width: number): T {
  elem.setAttribute("stroke-width", String(width));
  return elem;
}

//Modifies the stroke and stroke-width of a svg element
export function stroke_and_width<T extends SVGElement>(
  elem: T,
  stroke: string,
  width: number
): T {
  elem.setAttribute("stroke", stroke);
  elem.setAttribute("stroke-width", String(width));
  return elem;
}

//Modifies the fill color of a svg element
export function fill<T extends SVGElement>(elem: T, fill: string): T {
  elem.setAttribute("fill", fill);
  return elem;
}

//Modifies the stroke and fill color of a svg element
export function stroke_fill<T extends SVGElement>(
  elem: T,
  stroke: string,
  fill: string
): T {
  elem.setAttribute("stroke", stroke);
  elem.setAttribute("fill", fill);
  return elem;
}

//Modifies the stroke, fill and stroke-width of a svg element
export function stroke_fill_width<T extends SVGElement>(
  elem: T,
  stroke: string,
  fill: string,
  width: number
): T {
  elem.setAttribute("stroke", stroke);
  elem.setAttribute("fill", fill);
  elem.setAttribute("stroke-width", String(width));
  return elem;
}
