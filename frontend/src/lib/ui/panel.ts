import { Base, define_element } from "@libBase";
import { px_to_rem } from "@libTheme";
import "./panel.scss";

export const PanelPositioning = {
  screen: "screen",
  box: "box",
} as const;
export type PanelPositioning =
  (typeof PanelPositioning)[keyof typeof PanelPositioning];

type PS = "n" | "s" | "e" | "w";

export type PanelSizers =
  | boolean
  | `${PS}`
  | `${PS}${PS}`
  | `${PS}${PS}${PS}`
  | `${PS}${PS}${PS}${PS}`;
export interface PanelOptions {
  layer?: number;
  show_titlebar?: boolean;
  closeable?: boolean;

  //Positioning
  moveable?: boolean;
  vcenter?: boolean;
  hcenter?: boolean;
  positioning?: PanelPositioning;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;

  //Sizing
  sizeable?: boolean;
  width?: number;
  height?: number;
}

export interface PanelContainer {}

export class Panel extends Base {
  static element_name() {
    return "panel";
  }
  static element_name_space() {
    return "ui";
  }

  readonly layer: number;
  #container: PanelContainer;

  #titlebar: HTMLDivElement;
  #content: HTMLDivElement;
  #sizer: HTMLDivElement;

  constructor(
    container: PanelContainer,
    options: PanelOptions & { layer: number }
  ) {
    super();
    this.#titlebar = this.appendChild(document.createElement("div"));
    this.#titlebar.tabIndex = 0;
    this.#titlebar.onpointerdown = (e) => {
      if (!this.#moveable) return;
      this.#titlebar.setPointerCapture(e.pointerId);
      this.#titlebar.classList.add("moving");
      const start_x = e.clientX;
      const start_y = e.clientY;
      const orig_left = this.getBoundingClientRect().left;
      const orig_top = this.getBoundingClientRect().top;

      this.#titlebar.onpointermove = (e: PointerEvent) => {
        const delta_x = e.clientX - start_x;
        const delta_y = e.clientY - start_y;
        const width = this.width;
        const height = this.height;
        this.style.left =
          Math.max(-(width / 2), px_to_rem(orig_left + delta_x)) + "rem";
        this.style.top = Math.max(0, px_to_rem(orig_top + delta_y)) + "rem";
      };
      this.#titlebar.onpointerup = (e: PointerEvent) => {
        this.#titlebar.releasePointerCapture(e.pointerId);
        this.#titlebar.classList.remove("moving");
        this.#titlebar.onpointermove = null;
        this.#titlebar.onpointerup = null;
      };
    };

    this.#content = this.appendChild(document.createElement("div"));
    this.#sizer = this.appendChild(document.createElement("div"));
    this.#sizer.tabIndex = 0;

    this.#container = container;
    this.layer = options.layer;

    //Positioning
    this.#positioning = options.positioning ?? PanelPositioning.box;
    this.#moveable = options.moveable ?? true;
    if (options.top !== undefined) this.top = options.top;
    if (options.bottom !== undefined) this.bottom = options.bottom;
    if (options.left !== undefined) this.left = options.left;
    if (options.right !== undefined) this.right = options.right;

    //Sizing
    this.#sizeable = options.sizeable ?? true;
    this.width = options.width;
    this.height = options.height;
  }

  //      _____   ____   _____ _____ _______ _____ ____  _   _ _____ _   _  _____
  //     |  __ \ / __ \ / ____|_   _|__   __|_   _/ __ \| \ | |_   _| \ | |/ ____|
  //     | |__) | |  | | (___   | |    | |    | || |  | |  \| | | | |  \| | |  __
  //     |  ___/| |  | |\___ \  | |    | |    | || |  | | . ` | | | | . ` | | |_ |
  //     | |    | |__| |____) |_| |_   | |   _| || |__| | |\  |_| |_| |\  | |__| |
  //     |_|     \____/|_____/|_____|  |_|  |_____\____/|_| \_|_____|_| \_|\_____|
  #positioning: PanelPositioning;
  #moveable: boolean;
  #top?: number;
  #bottom?: number;
  #left?: number;
  #right?: number;

  set positioning(value: PanelPositioning) {
    if (value === PanelPositioning.screen) this.style.position = "fixed";
    else this.style.position = "absolute";
    this.#positioning = value;
  }
  get positioning(): PanelPositioning {
    return this.#positioning;
  }

  set moveable(value: boolean) {
    this.#moveable = value;
  }
  get moveable(): boolean {
    return this.#moveable;
  }

  set top(value: number) {
    this.#top = value;
    this.style.top = value + "rem";
    this.style.bottom = "";
  }
  get top(): number {
    return this.#top ?? px_to_rem(this.getBoundingClientRect().top);
  }

  set bottom(value: number) {
    this.#bottom = value;
    this.style.bottom = value + "rem";
    this.style.top = "";
  }
  get bottom(): number {
    return this.#bottom ?? px_to_rem(this.getBoundingClientRect().bottom);
  }

  set left(value: number) {
    this.#left = value;
    this.style.left = value + "rem";
    this.style.right = "";
  }
  get left(): number {
    return this.#left ?? px_to_rem(this.getBoundingClientRect().left);
  }

  set right(value: number) {
    this.#right = value;
    this.style.right = value + "rem";
    this.style.left = "";
  }
  get right(): number {
    return this.#right ?? px_to_rem(this.getBoundingClientRect().right);
  }

  //       _____ _____ ___________ _   _  _____
  //      / ____|_   _|___  /_   _| \ | |/ ____|
  //     | (___   | |    / /  | | |  \| | |  __
  //      \___ \  | |   / /   | | | . ` | | |_ |
  //      ____) |_| |_ / /__ _| |_| |\  | |__| |
  //     |_____/|_____/_____|_____|_| \_|\_____|
  #sizeable: PanelSizers;
  #width?: number;
  #height?: number;

  set sizeable(value: PanelSizers) {
    this.#sizeable = value;
  }
  get sizeable(): PanelSizers {
    return this.#sizeable;
  }

  /**Sets the width of the panel, undefined means the panel uses css fit-content */
  set width(value: number | undefined) {
    this.style.width = value + "rem";
    this.#width = value;
  }
  get width(): number {
    return this.#width ?? px_to_rem(this.getBoundingClientRect().width);
  }

  set height(value: number | undefined) {
    this.style.height = value + "rem";
    this.#height = value;
  }
  get height(): number {
    return this.#height ?? px_to_rem(this.getBoundingClientRect().height);
  }
}
define_element(Panel);
