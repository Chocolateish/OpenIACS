import { define_element } from "@libBase";
import {
  FormSelectorBase,
  type FormSelectorBaseOptions,
  type FormSelectorOption,
} from "../selectorBase";
import "./toggleButton.scss";

interface SelOptions {
  top: HTMLDivElement;
  bot: HTMLDivElement;
}

/**Toggle buttons, displays all options in a multi toggler*/
export class FormToggleButton<RT> extends FormSelectorBase<RT> {
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

  set selections(selections: FormSelectorOption<RT>[] | undefined) {
    if (this.#map.size > 0) {
      this.#map.clear();
      this.#values = [];
      this.#selected = -1;
    }
    for (let i = 0; selections && i < selections.length; i++) {
      let { value } = selections[i];
      this.#map.set(value, this.#add_selection(selections[i]));
      this.#values.push(selections[i].value);
    }
    if (this.buffer) this.new_value(this.buffer);
  }

  #add_selection(selection: FormSelectorOption<RT>) {
    let top = this._body.appendChild(document.createElement("div"));
    top.tabIndex = 0;
    let bot = this._body.appendChild(document.createElement("div"));
    if (selection.icon) {
      top.appendChild(selection.icon());
      bot.textContent = selection.text;
    } else top.textContent = selection.text;
    let click = () => {
      top.appendChild(this.warn_input);
      this.set_value(selection.value);
    };
    top.onclick = click;
    bot.onclick = click;
    top.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") this.set_value(selection.value);
      else if (e.key === "ArrowRight") this.#select_adjacent(true);
      else if (e.key === "ArrowLeft") this.#select_adjacent(false);
      else return;
      e.preventDefault();
      e.stopPropagation();
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

  protected new_value(value: RT): void {
    let prev = this.#map.get(this.#values[this.#selected]);
    if (prev) {
      prev.top.classList.remove("selected");
      prev.bot.classList.remove("selected");
    }
    let opt = this.#map.get(value)!;
    if (opt) {
      opt.top.classList.add("selected");
      opt.bot.classList.add("selected");
      this.#selected = this.#values.indexOf(value);
      if (this.contains(document.activeElement)) {
        opt.top.focus();
      }
    }
  }

  protected new_error(_val: string): void {}
}
define_element(FormToggleButton);

export let form_toggle_button = {
  /**Creates a toggle button form element */
  from<RT>(options?: FormSelectorBaseOptions<RT>): FormToggleButton<RT> {
    let togg = new FormToggleButton<RT>(options?.id);
    if (options) FormSelectorBase.apply_options(togg, options);
    return togg;
  },
};
