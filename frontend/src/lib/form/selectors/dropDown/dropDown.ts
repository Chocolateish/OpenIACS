import { Base, define_element } from "@libBase";
import {
  material_navigation_unfold_less_rounded,
  material_navigation_unfold_more_rounded,
} from "@libIcons";
import { FormValue } from "../../base";
import {
  SelectorBase,
  type SelectionBase,
  type SelectorBaseOptions,
  type SelectorOption,
} from "../selectorBase";
import "./dropDown.scss";

interface Selection<T> extends SelectionBase<T> {
  line: HTMLDivElement;
}

export interface DropDownOptions<T> extends SelectorBaseOptions<T> {
  /**Default text displayed*/
  default?: string;
}

/**Dropdown box for selecting between multiple choices in a small space*/
export class DropDown<T> extends SelectorBase<T, Selection<T>> {
  static element_name() {
    return "dropdown";
  }
  static element_name_space(): string {
    return "form";
  }

  #box: HTMLDivElement = document.createElement("div");
  #icon: HTMLDivElement = document.createElement("div");
  #text: HTMLDivElement = document.createElement("div");
  #default: Text = document.createTextNode("Select something");
  #open: HTMLDivElement = document.createElement("div");
  #keyCombo: string = "";
  #keyIndex: number = 0;
  #keyTimeout: number = 0;
  #keyTimeoutIndex: number = 0;

  constructor(id: string | undefined) {
    super(id);
    this._body.tabIndex = 0;
    this._body.onclick = () => (this.open = true);
    this._body.onpointerdown = (e) => {
      if (e.pointerType === "mouse") {
        this.open = true;
        e.preventDefault();
      }
    };
    this._body.onkeydown = (e) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          this.open = true;
          break;
        case "ArrowDown":
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          this._selectAdjacent(e.key === "ArrowDown");
          break;
      }
      if (e.key.length === 1) {
        const combo = (this.#keyCombo += e.key).toLowerCase();
        clearTimeout(this.#keyTimeout);
        clearTimeout(this.#keyTimeoutIndex);
        this.#keyTimeout = setTimeout(() => {
          this.#keyCombo = "";
        }, 200);
        this.#keyTimeout = setTimeout(() => {
          this.#keyIndex = 0;
        }, 2000);
        let keyIndex = this.#keyIndex;
        for (let i = this.#keyIndex; i < this.#selections.length; i++) {
          const selection = this.#selections[i].selection;
          if (selection.text.toLowerCase().startsWith(combo)) {
            this.set_value(selection.value);
            this.#keyIndex = i + 1;
            return;
          }
        }
        if (keyIndex) {
          for (let i = 0; i < keyIndex; i++) {
            const selection = this.#selections[i].selection;
            if (selection.text.toLowerCase().startsWith(combo)) {
              this.set_value(selection.value);
              this.#keyIndex = i + 1;
              return;
            }
          }
        }
      }
    };
    let line = this._body.appendChild(document.createElement("div"));
    line.appendChild(this.#icon);
    line.appendChild(this.#text);
    this.#text.appendChild(this.#default);
    line.appendChild(this.#open);
    this.#open.appendChild(material_navigation_unfold_more_rounded());
  }

  /**Gets the default text displayed when nothing has been selected yet */
  get default() {
    return this.#default.nodeValue || "";
  }

  /**Sets the default text displayed when nothing has been selected yet */
  set default(def: string) {
    this.#default.nodeValue = def;
  }

  protected _add_selection(selection: SelectorOption<T>, index: number) {
    let line = document.createElement("div");
    let icon = line.appendChild(document.createElement("div"));
    if (selection.icon) icon.appendChild(selection.icon());
    let text = line.appendChild(document.createElement("div"));
    text.textContent = selection.text;
    line.onpointerup = (e) => {
      if (e.pointerType !== "touch") this.set_value(selection.value);
    };
    line.onclick = () => this.set_value(selection.value);
    line.tabIndex = 0;
    line.onkeydown = (e) => {
      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          this.set_value(selection.value);
          break;
      }
    };
    this.#box.appendChild(line);
    return { line, index, selection };
  }

  protected _clear_selections() {
    this.#box.replaceChildren();
  }

  protected _set_selection(selection: Selection<T>) {
    selection.line.classList.add("selected");
    if (selection.selection.icon)
      this.#icon.replaceChildren(selection.selection.icon());
    else this.#icon.replaceChildren();
    this.#text.textContent = selection.selection.text;
  }

  protected _clear_selection(selection: Selection<T>) {
    selection.line.classList.remove("selected");
    this.#icon.replaceChildren();
    this.#text.textContent = selection.selection.text;
  }

  protected _focus_selection(selection: Selection<T>) {
    selection;
  }

  set open(open: boolean) {
    if (open)
      this.#open.replaceChildren(material_navigation_unfold_less_rounded());
    else this.#open.replaceChildren(material_navigation_unfold_more_rounded());
    box.openMenu(this.#box, this, this._body);
  }

  focus() {
    this._body.focus();
  }
}
define_element(DropDown);

export let form_dropDown = {
  /**Creates a button form element */
  from<T>(options?: DropDownOptions<T>): DropDown<T> {
    let drop = new DropDown<T>(options?.id);
    if (options) {
      if (options.default) drop.default = options.default;
      SelectorBase.apply_options(drop, options);
      FormValue.apply_options(drop, options);
    }
    return drop;
  },
};

///##################################################################################################
class DropDownBox extends Base {
  static element_name() {
    return "dropdownbox";
  }
  static element_name_space(): string {
    return "form";
  }

  private _container: HTMLDivElement = this.appendChild(
    document.createElement("div")
  );
  private _box: HTMLDivElement = this._container.appendChild(
    document.createElement("div")
  );
  private _dropdown: DropDown<any> | undefined;
  private _resizeListener = () => this.closeMenu();

  constructor() {
    super();
    this._box.tabIndex = 0;
    this.onclick = () => this.closeMenu();
    this.ontouchend = (e) => {
      if (e.target === this) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        this.closeMenu();
      }
    };
    this.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        e.pointerType === "touch" &&
        (e.target === this || e.target === this._container)
      ) {
        this.closeMenu();
      }
    };
    this.onpointerup = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target !== this && e.pointerType !== "touch") {
        this.closeMenu();
      }
    };
    this.addEventListener("focusout", (e) => {
      if (e.relatedTarget === null) {
        this.closeMenu();
      }
    });
    this.onwheel = (e) => {
      e.preventDefault();
    };
    this._box.onwheel = (e) => {
      if (this._box.scrollHeight !== this._box.clientHeight)
        e.stopPropagation();
    };
    this.onkeydown = (e) => {
      switch (e.key) {
        case "Escape":
          this.closeMenu();
          e.stopPropagation();
          break;
        case " ":
        case "Enter":
          e.stopPropagation();
          this.closeMenu();
          break;
        case "Tab":
        case "ArrowUp":
        case "ArrowDown":
          if (this.ownerDocument.activeElement === this._box) {
            if (e.shiftKey || e.code === "ArrowUp") {
              //@ts-expect-error
              (this._dropdown._box.lastChild as HTMLElement)?.focus();
            } else {
              //@ts-expect-error
              (this._dropdown._box.firstChild as HTMLElement)?.focus();
            }
          } else {
            if (e.shiftKey || e.code === "ArrowUp") {
              (
                this.ownerDocument.activeElement
                  ?.previousElementSibling as HTMLElement
              )?.focus();
            } else {
              (
                this.ownerDocument.activeElement
                  ?.nextElementSibling as HTMLElement
              )?.focus();
            }
          }
          e.preventDefault();
          break;
      }
    };
  }

  openMenu(box: HTMLDivElement, parent: DropDown<any>, ref: HTMLDivElement) {
    let inner_height = this.ownerDocument.defaultView?.innerHeight || 0;
    this.classList.add("open");
    this._box.replaceChildren(box);
    let bounds = ref.getBoundingClientRect();
    if (bounds.y + bounds.height / 2 < inner_height / 2) {
      let top = bounds.y + bounds.height;
      this._container.style.top = top + "px";
      this._container.style.bottom = "";
      this._container.style.height = inner_height - top - 20 + "px";
      this._container.style.flexDirection = "column";
    } else {
      let bottom = inner_height - bounds.y;
      this._container.style.top = "";
      this._container.style.bottom = bottom + "px";
      this._container.style.height = inner_height - bottom - 20 + "px";
      this._container.style.flexDirection = "column-reverse";
    }
    this._container.style.left = bounds.x + "px";
    this._container.style.width = bounds.width + "px";
    this._dropdown = parent;

    if (this._box.scrollHeight > this._box.clientHeight)
      this._box.classList.add("scroll");
    else this._box.classList.remove("scroll");

    this.ownerDocument.defaultView?.addEventListener(
      "resize",
      this._resizeListener
    );
  }

  closeMenu() {
    this.classList.remove("open");
    if (this._dropdown) {
      //@ts-expect-error
      this._dropdown._doOpen = false;
      this._dropdown.focus();
    }
    this.ownerDocument.defaultView?.removeEventListener(
      "resize",
      this._resizeListener
    );
  }
}
define_element(DropDownBox);
let box = document.documentElement.appendChild(new DropDownBox());
