import { px_to_rem } from "@libTheme";
import "./container.scss";
import { Panel, type PanelOptions, type PanelContainer as PC } from "./panel";

declare global {
  interface Document {
    panel_container: PanelContainer;
  }
}

interface Layer {
  box: HTMLDivElement;
  panels: Panel[];
}

class PanelContainer implements PC {
  #active_panel?: Panel;
  get active_panel(): Panel | undefined {
    return this.#active_panel;
  }
  #layers: Layer[] = [];
  #box: HTMLElement;
  #width: number;
  get width(): number {
    return this.#width;
  }
  #height: number;
  get height(): number {
    return this.#height;
  }
  #window_width: number;
  get window_width(): number {
    return this.#window_width;
  }
  #window_height: number;
  get window_height(): number {
    return this.#window_height;
  }

  constructor(box: HTMLElement) {
    this.#box = box;
    this.#box.tabIndex = -1;
    const { width, height } = this.#box.getBoundingClientRect();
    this.#width = px_to_rem(width);
    this.#height = px_to_rem(height);
    const window = this.#box.ownerDocument.defaultView!;
    this.#window_width = window.innerWidth;
    this.#window_height = window.innerHeight;
    window.addEventListener("resize", () => {
      const { width, height } = this.#box.getBoundingClientRect();
      this.#width = px_to_rem(width);
      this.#height = px_to_rem(height);
      this.#window_width = window.innerWidth;
      this.#window_height = window.innerHeight;
      for (let l = 0; l < this.#layers.length; l++) {
        for (let p = 0; p < this.#layers[l].panels.length; p++) {
          const panel = this.#layers[l].panels[p];
          panel.enforce_limits();
          panel.width = Math.min(panel.width, this.#width);
          panel.height = Math.min(panel.height, this.#height);
        }
      }
    });
  }

  get_layer(layer: number): Layer {
    if (!this.#layers[layer]) {
      this.#layers[layer] = {
        box: this.#box.appendChild(document.createElement("div")),
        panels: [],
      };
      this.#layers[layer].box.style.zIndex = layer.toString();
    }
    return this.#layers[layer];
  }

  create_panel(options: PanelOptions): Panel {
    options.layer ??= 0;
    const layer = this.get_layer(options.layer);
    const panel = new Panel(this, options as PanelOptions & { layer: number });
    layer.box.appendChild(panel);
    layer.panels.push(panel);
    panel.style.zIndex = layer.panels.length.toString();
    return panel;
  }

  addopt_panel(panel: Panel): void {}
}

function create_panel_container(parent: HTMLElement): PanelContainer {
  const box = document.createElement("ui-panelcontainer");
  parent.appendChild(box);
  return new PanelContainer(box);
}

export const main_panel_container = create_panel_container(
  document.documentElement
);
document.panel_container = main_panel_container;
