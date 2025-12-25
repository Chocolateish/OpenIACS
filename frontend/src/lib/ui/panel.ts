import { Base, define_element } from "@libBase";
import { px_to_rem, rem_to_px } from "@libTheme";
import "./panel.scss";

const MIN_WIDTH = 4; //rem
const MIN_HEIGHT = 4; //rem

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

export interface PanelContainer {
  readonly width: number;
  readonly height: number;
  readonly window_width: number;
  readonly window_height: number;
}

export class Panel extends Base {
  static element_name() {
    return "panel";
  }
  static element_name_space() {
    return "ui";
  }

  readonly layer: number;
  #container: PanelContainer;
  get #container_height(): number {
    return this.#positioning === PanelPositioning.screen
      ? this.#container.window_height
      : this.#container.height;
  }
  get #container_width(): number {
    return this.#positioning === PanelPositioning.screen
      ? this.#container.window_width
      : this.#container.width;
  }
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

      this.#titlebar.onpointermove = (ev: PointerEvent) => {
        const delta_x = ev.clientX - start_x;
        const delta_y = ev.clientY - start_y;
        const window = this.ownerDocument.defaultView!;
        const width = this.width;
        const px_width = rem_to_px(width);
        if (this.left + width / 2 > this.#container_width / 2)
          this.right = px_to_rem(
            window.innerWidth - (orig_left + delta_x + px_width)
          );
        else this.left = px_to_rem(orig_left + delta_x);
        const height = this.height;
        const px_height = rem_to_px(height);
        if (this.top + height / 2 > this.#container_height / 2)
          this.bottom = px_to_rem(
            window.innerHeight - (orig_top + delta_y + px_height)
          );
        else this.top = px_to_rem(orig_top + delta_y);
      };
      this.#titlebar.onpointerup = (ev: PointerEvent) => {
        this.#titlebar.releasePointerCapture(ev.pointerId);
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
    let pos = 0;
    if (options.top !== undefined) this.top = options.top;
    else if (options.bottom !== undefined) this.bottom = options.bottom;
    else pos++;
    if (options.left !== undefined) this.left = options.left;
    else if (options.right !== undefined) this.right = options.right;
    else pos++;
    if (pos === 2) this.center = true;

    //Sizing
    this.sizeable = options.sizeable ?? true;
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

  //**Makes sure the panel is within the container boundaries */
  enforce_limits() {
    if (this.#top !== undefined) this.top = this.#top;
    if (this.#bottom !== undefined) this.bottom = this.#bottom;
    if (this.#left !== undefined) this.left = this.#left;
    if (this.#right !== undefined) this.right = this.#right;
  }

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

  set center(value: boolean) {
    if (value && !this.center) {
      this.#top = undefined;
      this.#bottom = undefined;
      this.#left = undefined;
      this.#right = undefined;
      this.style.top = "";
      this.style.bottom = "";
      this.style.left = "";
      this.style.right = "";
    } else if (!value && this.center) {
      this.top = this.top;
      this.left = this.left;
    }
  }
  get center(): boolean {
    return (
      this.#top === undefined &&
      this.#bottom === undefined &&
      this.#left === undefined &&
      this.#right === undefined
    );
  }

  set top(value: number) {
    this.#top = Math.max(Math.min(value, this.#container_height - 2), 0);
    this.#bottom = undefined;
    this.style.top = this.#top + "rem";
    this.style.bottom = "";
  }
  get top(): number {
    return this.#top ?? px_to_rem(this.getBoundingClientRect().top);
  }

  set bottom(value: number) {
    const height = this.height;
    this.#bottom = Math.max(
      Math.min(value, this.#container_height - height),
      -height + 2
    );
    this.#top = undefined;
    this.style.bottom = this.#bottom + "rem";
    this.style.top = "";
  }
  get bottom(): number {
    return (
      this.#bottom ??
      this.#container_height - px_to_rem(this.getBoundingClientRect().bottom)
    );
  }

  set left(value: number) {
    this.#left = Math.max(
      Math.min(value, this.#container_width - this.width / 2),
      -(this.width / 2)
    );
    this.#right = undefined;
    this.style.left = this.#left + "rem";
    this.style.right = "";
  }
  get left(): number {
    return this.#left ?? px_to_rem(this.getBoundingClientRect().left);
  }

  set right(value: number) {
    this.#right = Math.max(
      Math.min(value, this.#container_width - this.width / 2),
      -(this.width / 2)
    );
    this.#left = undefined;
    this.style.right = this.#right + "rem";
    this.style.left = "";
  }
  get right(): number {
    return (
      this.#right ??
      this.#container_width - px_to_rem(this.getBoundingClientRect().right)
    );
  }

  //       _____ _____ ___________ _   _  _____
  //      / ____|_   _|___  /_   _| \ | |/ ____|
  //     | (___   | |    / /  | | |  \| | |  __
  //      \___ \  | |   / /   | | | . ` | | |_ |
  //      ____) |_| |_ / /__ _| |_| |\  | |__| |
  //     |_____/|_____/_____|_____|_| \_|\_____|
  #sizeable: PanelSizers = true;
  #width?: number;
  #height?: number;

  set sizeable(value: PanelSizers) {
    if (value === false) {
      if (this.#sizer.children.length === 0) this.#sizer.remove();
      return;
    } else if (value === true && this.#sizer.children.length === 8) return;
    this.#sizeable = value;
    if (typeof value === "string") this.#sizer.classList.add("visible");
    else this.#sizer.classList.remove("visible");
    if (value === true) value = "nsew";
    this.#sizer.replaceChildren();
    const sizers = value.split("");
    if (sizers.includes("n") && sizers.includes("e")) sizers.push("ne");
    if (sizers.includes("n") && sizers.includes("w")) sizers.push("nw");
    if (sizers.includes("s") && sizers.includes("e")) sizers.push("se");
    if (sizers.includes("s") && sizers.includes("w")) sizers.push("sw");
    for (const sizer of sizers) {
      const div = this.#sizer.appendChild(document.createElement("div"));
      div.classList.add(sizer);
      const north = sizer.includes("n");
      const south = sizer.includes("s");
      const east = sizer.includes("e");
      const west = sizer.includes("w");
      const vert = north || south;
      const horz = east || west;
      div.onpointerdown = (e) => {
        this.#sizer.setPointerCapture(e.pointerId);
        const start_x = e.clientX;
        const start_y = e.clientY;
        const top = this.#top;
        const bottom = this.#bottom;
        const left = this.#left;
        const right = this.#right;
        if (!this.center) {
          if (east) this.left = this.left;
          if (west) this.right = this.right;
          if (north) this.bottom = this.bottom;
          if (south) this.top = this.top;
        }
        const orig_width = horz ? this.width : 0;
        const orig_height = vert ? this.height : 0;

        this.#sizer.onpointermove = (ev: PointerEvent) => {
          const center = this.center ? 2 : 1;
          const delta_x = px_to_rem(ev.clientX - start_x);
          if (east) this.width = orig_width + delta_x * center;
          else if (west) this.width = orig_width - delta_x * center;
          const delta_y = px_to_rem(ev.clientY - start_y);
          if (south) this.height = orig_height + delta_y * center;
          else if (north) this.height = orig_height - delta_y * center;
        };
        this.#sizer.onpointerup = (ev: PointerEvent) => {
          this.#sizer.releasePointerCapture(ev.pointerId);
          this.#sizer.onpointermove = null;
          this.#sizer.onpointerup = null;
          if (top) this.top = this.top;
          if (bottom) this.bottom = this.bottom;
          if (left) this.left = this.left;
          if (right) this.right = this.right;
        };
      };
    }
  }
  get sizeable(): PanelSizers {
    return this.#sizeable;
  }

  /**Sets the width of the panel, undefined means the panel uses css fit-content */
  set width(value: number | undefined) {
    if (value === undefined) {
      this.#width = undefined;
      this.style.width = "";
      return;
    }
    this.#width = Math.min(Math.max(value, MIN_WIDTH), this.#container_width);
    this.style.width = this.#width + "rem";
  }
  get width(): number {
    return this.#width ?? px_to_rem(this.getBoundingClientRect().width);
  }

  set height(value: number | undefined) {
    if (value === undefined) {
      this.#height = undefined;
      this.style.height = "";
      return;
    }
    this.#height = Math.min(
      Math.max(value, MIN_HEIGHT),
      this.#container_height
    );
    this.style.height = this.#height + "rem";
  }
  get height(): number {
    return this.#height ?? px_to_rem(this.getBoundingClientRect().height);
  }
}
define_element(Panel);
