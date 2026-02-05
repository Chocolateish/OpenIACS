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
  });
  #root = this.appendChild(
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  );

  constructor() {
    super();
    this.#resize_observer.observe(this);

    this.#root.appendChild(
      svg.rectangle_from_center(50, 50, 30, 30, 5).f("red").elem,
    );
  }
}
define_element(Viewport);
