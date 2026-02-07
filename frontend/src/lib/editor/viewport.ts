import { svg } from "@chocbite/ts-lib-svg";
import { Base, define_element } from "@libBase";
import { array_from_range_inclusive } from "@libCommon";
import "./viewport.scss";

export class Viewport extends Base {
  static element_name(): string {
    return "viewport";
  }
  static element_name_space(): string {
    return "editor";
  }

  #viewport_width: number = 0;
  #viewport_width_half: number = 0;
  #viewport_height: number = 0;
  #viewport_height_half: number = 0;
  #resize_observer = new ResizeObserver((a) => {
    this.#viewport_width = a[0].contentRect.width;
    this.#viewport_width_half = this.#viewport_width / 2;
    this.#viewport_height = a[0].contentRect.height;
    this.#viewport_height_half = this.#viewport_height / 2;
    this.canvas_x =
      this.#mover_x + (a[0].contentRect.width - this.#viewport_width) / 2;
    this.canvas_y =
      this.#mover_y + (a[0].contentRect.height - this.#viewport_height) / 2;

    this.#root.setAttribute(
      "viewBox",
      `0 0 ${this.#viewport_width} ${this.#viewport_height}`,
    );
  });
  #root = this.appendChild(svg.create("svg").elem);
  #mover;
  #mover_x = 0;
  #mover_y = 0;
  #zoomer;
  #zoomer_scale = 1;
  #canvas;
  #canvas_width;
  #canvas_height;

  constructor(
    canvas_width: number,
    canvas_height: number,
    infinite_canvas: boolean = false,
  ) {
    super();
    this.#resize_observer.observe(this);
    this.#canvas_width = canvas_width;
    this.#canvas_height = canvas_height;
    //Mover
    this.#mover = this.#root.appendChild(
      svg
        .create("svg")
        .a("width", canvas_width.toString())
        .a("height", canvas_height.toString()).elem,
    );
    //Zoomer
    this.#zoomer = this.#mover.appendChild(
      svg
        .create("svg")
        .a("x", "-50%")
        .a("y", "-50%")
        .a("width", canvas_width.toString())
        .a("height", canvas_height.toString()).elem,
    );
    //Background
    (infinite_canvas ? this.#root : this.#zoomer).prepend(
      svg
        .create("rect")
        .attribute("x", "0")
        .attribute("y", "0")
        .attribute("width", "100%")
        .attribute("height", "100%")
        .fill("white").elem,
    );
    //Canvas
    this.#canvas = this.#zoomer.appendChild(
      svg.svg(
        canvas_width,
        canvas_height,
        `0 0 ${canvas_width} ${canvas_height}`,
      ).elem,
    );

    this.#canvas.replaceChildren(
      svg.rectangle_from_center(50, 50, 30, 30, 5).f("red").elem,
      ...array_from_range_inclusive(0, 20, (i) => i).flatMap((i) => {
        return array_from_range_inclusive(
          0,
          20,
          (j) =>
            svg
              .rectangle_from_center(i * 50, j * 50, 50, 50, 0)
              .s("blue")
              .f("none")
              .sw(1).elem,
        );
      }),
    );
    let count = 0;
    let mover_x = 0;
    let mover_y = 0;
    let initial_x = 0;
    let initial_y = 0;
    let initial_id = 0;
    let second_initial_x = 0;
    let second_initial_y = 0;
    let second_initial_id = 0;

    //Middle Mouse
    let double_click = 0;
    this.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "mouse" || e.button !== 1) return;
        const now = performance.now();
        if (now - double_click < 300) {
          this.canvas_x = 0;
          this.canvas_y = 0;
          this.canvas_scale = 1;
          return;
        }
        double_click = now;
        e.preventDefault();
        e.stopPropagation();
        this.setPointerCapture(e.pointerId);
        if (count === 0) {
          mover_x = this.#mover_x;
          mover_y = this.#mover_y;
          initial_x = e.offsetX;
          initial_y = e.offsetY;
          initial_id = e.pointerId;
        }
        count++;
      },
      { capture: true },
    );
    //Touch
    this.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      e.preventDefault();
      e.stopPropagation();
      // if (count_touch === 3) {
      //   this.canvas_x = 0;
      //   this.canvas_y = 0;
      //   this.canvas_scale = 1;
      //   return;
      // }
      this.setPointerCapture(e.pointerId);
      if (count === 0) {
        mover_x = this.#mover_x;
        mover_y = this.#mover_y;
        initial_x = e.offsetX;
        initial_y = e.offsetY;
        initial_id = e.pointerId;
      } else if (count === 1) {
        second_initial_x = e.offsetX;
        second_initial_y = e.offsetY;
        second_initial_id = e.pointerId;
      }
      count++;
      console.error(count, e);
    });
    this.onpointermove = (ev) => {
      if (count === 0) return;
      if (ev.pointerId === initial_id) {
        if (count === 2) {
        }
        this.canvas_x = mover_x + (ev.offsetX - initial_x);
        this.canvas_y = mover_y + (ev.offsetY - initial_y);
      } else if (ev.pointerId === second_initial_id) {
        if (count < 2) return;
        console.error(
          ev.offsetX - second_initial_x,
          ev.offsetY - second_initial_y,
        );
      }
    };
    this.onpointerup = (ev) => {
      if (this.hasPointerCapture(ev.pointerId)) {
        this.releasePointerCapture(ev.pointerId);
        count--;
      }
    };
    //Wheel
    this.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const move_scale = e.shiftKey
          ? e.altKey
            ? 0.01
            : 0.05
          : e.altKey
            ? 2
            : 0.5;
        if (e.ctrlKey) {
          this.canvas_y = this.#mover_y - e.deltaY * move_scale;
        } else {
          const scale_scale = e.shiftKey
            ? e.altKey
              ? 0.00005
              : 0.0001
            : e.altKey
              ? 0.005
              : 0.001;
          const scale = this.#zoomer_scale * (1 - e.deltaY * scale_scale);
          this.#zoom_coordinates(
            scale,
            e.offsetX - this.#viewport_width / 2,
            e.offsetY - this.#viewport_height / 2,
          );
        }
        this.canvas_x = this.#mover_x - e.deltaX * move_scale;
      },
      { capture: true },
    );
  }

  /**Zooms coordinate aware to offset canvas position so hover position stays
   * coordinates are relative to the center
   */
  #zoom_coordinates(scale: number, x: number, y: number) {
    scale = Math.max(0.001, Math.min(10000, scale));
    const zoom_factor = scale / this.#zoomer_scale;
    this.canvas_x = this.#mover_x * zoom_factor + x * (1 - zoom_factor);
    this.canvas_y = this.#mover_y * zoom_factor + y * (1 - zoom_factor);
    this.#zoomer.style.scale = scale.toString();
    this.#zoomer_scale = scale;
  }

  set canvas_width(value: number) {
    this.#canvas.setAttribute("width", value.toString());
    this.#canvas.setAttribute("viewBox", `0 0 ${value} ${this.#canvas_height}`);
    this.#zoomer.setAttribute("width", value.toString());
    this.#canvas_width = value;
  }
  get canvas_width(): number {
    return this.#canvas_width;
  }
  set canvas_height(value: number) {
    this.#canvas.setAttribute("height", value.toString());
    this.#canvas.setAttribute("viewBox", `0 0 ${this.#canvas_width} ${value}`);
    this.#zoomer.setAttribute("height", value.toString());
    this.#canvas_height = value;
  }
  get canvas_height(): number {
    return this.#canvas_height;
  }
  set canvas_x(x: number) {
    console.error();

    this.#mover.setAttribute("x", (this.#viewport_width_half + x).toFixed(0));
    this.#mover_x = x;
  }
  get canvas_x(): number {
    return this.#mover_x;
  }
  set canvas_y(y: number) {
    this.#mover.setAttribute("y", (this.#viewport_height_half + y).toFixed(0));
    this.#mover_y = y;
  }
  get canvas_y(): number {
    return this.#mover_y;
  }
  set canvas_scale(value: number) {
    this.#zoom_coordinates(value, 0, 0);
  }
  get canvas_scale(): number {
    return this.#zoomer_scale;
  }
}
define_element(Viewport);
