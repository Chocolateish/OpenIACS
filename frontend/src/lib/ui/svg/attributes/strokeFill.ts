//Modifies the stroke color of a svg element
export let stroke = (stroke: string, elem: SVGElement) => {
  elem.setAttribute("stroke", stroke);
  return elem;
};

//Modifies the stroke-width of a svg element
export let strokeWidth = (width: number, elem: SVGElement) => {
  elem.setAttribute("stroke-width", String(width));
  return elem;
};

//Modifies the stroke and stroke-width of a svg element
export let strokeAndWidth = (
  stroke: string,
  width: number,
  elem: SVGElement
) => {
  elem.setAttribute("stroke", stroke);
  elem.setAttribute("stroke-width", String(width));
  return elem;
};

//Modifies the fill color of a svg element
export let fill = (fill: string, elem: SVGElement) => {
  elem.setAttribute("fill", fill);
  return elem;
};

//Modifies the stroke and fill color of a svg element
export let strokeFill = (stroke: string, fill: string, elem: SVGElement) => {
  elem.setAttribute("stroke", stroke);
  elem.setAttribute("fill", fill);
  return elem;
};

//Modifies the stroke, fill and stroke-width of a svg element
export let strokeFillWidth = (
  stroke: string,
  fill: string,
  width: number,
  elem: SVGElement
) => {
  elem.setAttribute("stroke", stroke);
  elem.setAttribute("fill", fill);
  elem.setAttribute("stroke-width", String(width));
  return elem;
};
