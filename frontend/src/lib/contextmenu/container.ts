import { Base, define_element } from "../base";
import "./container.scss";
import { ContextMenu } from "./menu";

const CONTAINER_Z_INDEX = "99999999";

export class Container extends Base {
  #activeElementBuffer: HTMLOrSVGElement | null | undefined;

  /**Returns the name used to define the element */
  static element_name() {
    return "container";
  }
  /**Returns the namespace override for the element*/
  static element_name_space() {
    return "contextmenu";
  }

  constructor() {
    super();
    this.tabIndex = -1;
    const preventer = (e: Event) => {
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
    this.style.zIndex = CONTAINER_Z_INDEX;
  }

  /**Attaches a menu to the container */
  attach_menu(menu: ContextMenu) {
    menu.container = this;
    this.#activeElementBuffer = this.ownerDocument
      .activeElement as HTMLOrSVGElement | null;
    this.replaceChildren(menu);
    return menu;
  }

  /**Closes open context menu */
  close_up() {
    if (this.#activeElementBuffer) {
      this.#activeElementBuffer.focus();
      if (
        (this.ownerDocument.activeElement as any) !== this.#activeElementBuffer
      ) {
        this.focus();
      }
      this.#activeElementBuffer = undefined;
    } else {
      this.focus();
    }
  }
}
define_element(Container);
