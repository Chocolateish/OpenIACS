import { Base, define_element } from "@libBase";
import { svg } from "@libSVG";
import "./viewport.scss";

export class Viewport extends Base {
  static element_name(): string {
    return "viewport";
  }
  static element_name_space(): string {
    return "editor";
  }

  #px_with: number = 0;
  #px_height: number = 0;
  #resize_observer = new ResizeObserver((a) => {
    this.#px_with = a[0].contentRect.width;
    this.#px_height = a[0].contentRect.height;
    this.#root.setAttribute(
      "viewBox",
      `0 0 ${this.#px_with} ${this.#px_height}`,
    );
  });
  #root = this.appendChild(svg.create("svg").elem);
  #canvas = this.#root.appendChild(svg.svg(100, 100, "0 0 100 100").elem);
  #canvas_x = 0;
  #canvas_y = 0;
  #canvas_width = 100;
  #canvas_height = 100;
  #canvas_scale = 1;
  #background = this.#canvas.appendChild(
    svg
      .create("rect")
      .attribute("x", "0")
      .attribute("y", "0")
      .attribute("width", "100%")
      .attribute("height", "100%")
      .fill("white").elem,
  );

  constructor() {
    super();
    this.#resize_observer.observe(this);
    this.#canvas.appendChild(
      svg.rectangle_from_center(50, 50, 30, 30, 5).f("red").elem,
    );

    this.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "mouse" || e.button !== 1) return;
        e.preventDefault();
        e.stopPropagation();
        this.setPointerCapture(e.pointerId);
        const x = this.#canvas_x;
        const y = this.#canvas_y;
        this.onpointermove = (ev) => {
          this.canvas_x = x + (ev.offsetX - e.offsetX) / this.#canvas_scale;
          this.canvas_y = y + (ev.offsetY - e.offsetY) / this.#canvas_scale;
        };
        this.onpointerup = (ev) => {
          this.onpointermove = null;
          this.onpointerup = null;
          this.releasePointerCapture(ev.pointerId);
        };
        console.error(e);
      },
      { capture: true },
    );
    this.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const scale = this.#canvas_scale * (1 - e.deltaY * 0.001);
        this.canvas_scale = Math.max(0.1, Math.min(10, scale));
      },
      { capture: true },
    );
  }

  set canvas_width(value: number) {
    this.#canvas.setAttribute("width", value.toString());
    this.#canvas.setAttribute("viewBox", `0 0 ${value} ${this.#canvas_height}`);
  }
  set canvas_height(value: number) {
    this.#canvas.setAttribute("height", value.toString());
    this.#canvas.setAttribute("viewBox", `0 0 ${this.#canvas_width} ${value}`);
  }
  set canvas_x(value: number) {
    this.#canvas.setAttribute("x", value.toFixed(2));
    this.#canvas_x = value;
  }
  set canvas_y(value: number) {
    this.#canvas.setAttribute("y", value.toFixed(2));
    this.#canvas_y = value;
  }
  set canvas_scale(value: number) {
    this.#canvas.style.scale = value.toString();
    this.#canvas_scale = value;
  }
}
define_element(Viewport);
