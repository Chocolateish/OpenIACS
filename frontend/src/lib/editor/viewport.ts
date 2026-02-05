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

  #viewport_width: number = 0;
  #viewport_height: number = 0;
  #resize_observer = new ResizeObserver((a) => {
    this.#viewport_width = a[0].contentRect.width;
    this.#viewport_height = a[0].contentRect.height;
    this.#root.setAttribute(
      "viewBox",
      `0 0 ${this.#viewport_width} ${this.#viewport_height}`,
    );
  });
  #root = this.appendChild(svg.create("svg").elem);
  #mover = this.#root.appendChild(
    svg
      .create("svg")
      .a("x", "50%")
      .a("y", "50%")
      .a("width", "100")
      .a("height", "100").elem,
  );
  #mover_x = 0;
  #mover_y = 0;
  #zoomer = this.#mover.appendChild(
    svg
      .create("svg")
      .a("x", "-50%")
      .a("y", "-50%")
      .a("width", "100")
      .a("height", "100").elem,
  );
  #zoomer_scale = 1;
  #canvas = this.#zoomer.appendChild(svg.svg(100, 100, "0 0 100 100").elem);
  #canvas_width = 100;
  #canvas_height = 100;
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
        const x = this.#mover_x;
        const y = this.#mover_y;
        this.onpointermove = (ev) => {
          this.canvas_x = x + (ev.offsetX - e.offsetX);
          this.canvas_y = y + (ev.offsetY - e.offsetY);
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
        const scale = this.#zoomer_scale * (1 - e.deltaY * 0.001);
        this.canvas_scale = Math.max(0.1, Math.min(10, scale));
      },
      { capture: true },
    );
  }

  set canvas_width(value: number) {
    this.#canvas.setAttribute("width", value.toString());
    this.#canvas.setAttribute("viewBox", `0 0 ${value} ${this.#canvas_height}`);
    this.#zoomer.setAttribute("width", value.toString());
  }
  set canvas_height(value: number) {
    this.#canvas.setAttribute("height", value.toString());
    this.#canvas.setAttribute("viewBox", `0 0 ${this.#canvas_width} ${value}`);
  }
  set canvas_x(value: number) {
    this.#mover.setAttribute("x", value.toFixed(2));
    this.#mover_x = value;
  }
  set canvas_y(value: number) {
    this.#mover.setAttribute("y", value.toFixed(2));
    this.#mover_y = value;
  }
  set canvas_scale(value: number) {
    this.#zoomer.style.scale = value.toString();
    this.#zoomer_scale = value;
  }
}
define_element(Viewport);
