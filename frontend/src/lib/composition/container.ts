import { px_to_rem } from "@libTheme";
import "./container.scss";
import { Panel, type PanelOptions, type PanelContainer as PC } from "./panel";
import "./shared";

interface Layer {
  box: HTMLDivElement;
  panels: Panel[];
}

interface PanelContainer {
  /**The currently active panel in the panel container */
  readonly active_panel?: Panel;
  /**Creates a panel in the panel container */
  create_panel(options: PanelOptions): Panel;
  /**Addopts a panel from another panel container */
  addopt_panel(panel: Panel): void;
}

class InternalPanelContainer implements PC, PanelContainer {
  #active_panel?: Panel;
  get active_panel(): Panel | undefined {
    return this.#active_panel;
  }

  #layers: Layer[] = [];
  #box: HTMLElement;
  #box_width: number;
  get width(): number {
    return this.#box_width;
  }
  #box_height: number;
  get height(): number {
    return this.#box_height;
  }

  constructor(parent: HTMLElement) {
    this.#box = document.createElement("ui-panelcontainer");
    parent.appendChild(this.#box);
    const { width, height } = this.#box.getBoundingClientRect();
    this.#box_width = px_to_rem(width);
    this.#box_height = px_to_rem(height);

    window.addEventListener("resize", () => {
      const { width, height } = this.#box.getBoundingClientRect();
      this.#box_width = px_to_rem(width);
      this.#box_height = px_to_rem(height);
      for (let l = 0; l < this.#layers.length; l++)
        for (let p = 0; p < this.#layers[l].panels.length; p++)
          this.#layers[l].panels[p].enforce_limits();
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

  set_layer(panel: Panel, layer: number): void {
    const old_layer = this.get_layer(panel.layer);
    const panel_index = old_layer.panels.indexOf(panel);
    if (panel_index !== -1) old_layer.panels.splice(panel_index, 1);
    const new_layer = this.get_layer(layer);
    new_layer.box.appendChild(panel);
    new_layer.panels.push(panel);
  }

  focus_panel(panel: Panel): void {
    this.#active_panel = panel;
    const layer = this.get_layer(panel.layer);
    const panel_index = layer.panels.indexOf(panel);
    if (panel_index !== -1) layer.panels.splice(panel_index, 1);
    layer.box.appendChild(panel);
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

  addopt_panel(_panel: Panel): void {}
}

function create_panel_container(parent: HTMLElement): PanelContainer {
  return new InternalPanelContainer(parent) as PanelContainer;
}

declare global {
  interface Document {
    panel_container: PanelContainer;
  }
}

export const main_panel_container = create_panel_container(
  document.documentElement
);
document.panel_container = main_panel_container;
