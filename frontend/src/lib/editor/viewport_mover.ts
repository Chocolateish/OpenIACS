import { svg } from "@chocbite/ts-lib-svg";
import type { ViewportElement } from "@libEditor";
import "./viewport.scss";

export class ViewportMover {
  #canvas: SVGSVGElement = svg.svg(0, 0, "0 0 0 0").elem;
  #outline: SVGRectElement = svg.rectangle_from_corner(0, 0, 1, 1, 0).elem;
  #nw_corner: SVGCircleElement = svg.circle(0, 0, 5).elem;
  #ne_corner: SVGCircleElement = svg.circle(0, 0, 5).elem;
  #sw_corner: SVGCircleElement = svg.circle(0, 0, 5).elem;
  #se_corner: SVGCircleElement = svg.circle(0, 0, 5).elem;

  attach_to_element(element: ViewportElement) {
    this.#canvas.setAttribute("x", element.position_x.toString());
    this.#canvas.setAttribute("y", element.position_y.toString());
  }
}
