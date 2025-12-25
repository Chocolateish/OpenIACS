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

  constructor(box: HTMLElement) {
    this.#box = box;
    this.#box.tabIndex = -1;
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
