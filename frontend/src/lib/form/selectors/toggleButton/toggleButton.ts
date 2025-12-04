import { define_element } from "@libBase";
import { SelectorBase, SelectorOption } from "../selectorBase";
import "./toggleButton.scss";

interface SelOptions {
  top: HTMLDivElement;
  bot: HTMLDivElement;
}

/**Toggle buttons, displays all options in a multi toggler*/
export class ToggleButton<RT> extends SelectorBase<RT> {
  /**Returns the name used to define the element*/
  static element_name() {
    return "togglebutton";
  }
  static element_name_space(): string {
    return "form";
  }

  #map: Map<RT, SelOptions> = new Map();
  #values: RT[] = [];
  #selected: number = -1;

  set selections(selections: SelectorOption<RT>[] | undefined) {
    if (this.#map.size > 0) {
      this.#map.clear();
      this.#values = [];
      this.#selected = -1;
    }
    for (let i = 0; selections && i < selections.length; i++) {
      let { value, text, icon } = selections[i];
      this.#map.set(value, { text, icon });
      this.#values.push(selections[i].value);
    }
    if (this.buffer) this.new_value(this.buffer);
  }

  protected _add_selection(selection: SelectorOption<RT>, index: number) {
    let top = this._body.appendChild(document.createElement("div"));
    top.tabIndex = 0;
    let bot = this._body.appendChild(document.createElement("div"));
    if (selection.icon) {
      top.appendChild(selection.icon);
      bot.textContent = selection.text;
    } else {
      top.textContent = selection.text;
    }
    let click = () => {
      this.set_value(selection.value);
    };
    top.onclick = click;
    bot.onclick = click;
    top.onkeydown = (e) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          this.set_value(selection.value);
          break;
        case "ArrowRight":
          e.stopPropagation();
          this._selectAdjacent(true);
          break;
        case "ArrowLeft":
          e.stopPropagation();
          this._selectAdjacent(false);
          break;
      }
    };
    return { top, bot };
  }

  /**Selects the previous or next selection in the element
   * @param dir false is next true is previous*/
  #select_adjacent(dir: boolean) {
    let y = Math.min(
      this.#values.length - 1,
      Math.max(0, dir ? this.#selected + 1 : this.#selected - 1)
    );
    if (y !== this.#selected) this.set_value(this.#values[y]);
  }

  protected _clear_selections() {
    this._body.replaceChildren();
  }

  protected _set_selection(selection: SelOptions<RT>) {
    selection.top.classList.add("selected");
    selection.bot.classList.add("selected");
  }

  protected _clear_selection(selection: SelOptions<RT>) {
    selection.top.classList.remove("selected");
    selection.bot.classList.remove("selected");
  }

  protected _focus_selection(selection: SelOptions<RT>) {
    selection.top.focus();
  }

  protected new_value(value: RT): void {
    let opt = this.#map.get(value)!;
    this.#selected = this.#values.indexOf(value);
  }

  protected new_error(val: string): void {}
}
define_element(ToggleButton);
