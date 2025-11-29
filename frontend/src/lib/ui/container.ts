import { Base, define_element } from "@libBase";

declare global {
  interface Document {
    panels: Container;
  }
}

export class Container extends Base {
  #active_panel: HTMLOrSVGElement | null | undefined;

  /**Returns the name used to define the element */
  static element_name() {
    return "container";
  }
  /**Returns the namespace override for the element*/
  static element_name_space() {
    return "panel";
  }

  constructor() {
    super();
    this.tabIndex = -1;
    let preventer = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    this.oncontextmenu = preventer;
    this.onpointerdown = preventer;
    this.onpointerup = preventer;
    this.onpointercancel = preventer;
    this.onpointerenter = preventer;
    this.onpointerleave = preventer;
    this.onpointermove = preventer;
    this.onpointerout = preventer;
    this.onpointerout = preventer;
    this.onclick = preventer;
  }
}
define_element(Container);
