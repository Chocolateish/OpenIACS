import { Base, define_element } from "@libBase";
import {
  material_navigation_close_rounded,
  material_navigation_unfold_less_rounded,
  material_navigation_unfold_more_rounded,
} from "@libIcons";
import type { SVGFunc } from "@libSVG";
import { FormValue } from "../../base";
import {
  SelectorBase,
  type SelectorBaseOptions,
  type SelectorOption,
} from "../selectorBase";
import "./dropDown.scss";

interface SelOptions {
  text: string;
  icon?: SVGFunc;
}

export interface DropDownOptions<T> extends SelectorBaseOptions<T> {
  /**Default text displayed*/
  default?: string;
  /**Default icon displayed*/
  defaultIcon?: SVGFunc;
}

/**Dropdown box for selecting between multiple choices in a small space*/
export class Dropdown<RT> extends SelectorBase<RT> {
  static element_name() {
    return "dropdown";
  }
  static element_name_space(): string {
    return "form";
  }

  #map: Map<RT, SelOptions> = new Map();
  #values: RT[] = [];
  #selected: number = -1;

  #icon?: SVGSVGElement;
  #default: Text = document.createTextNode("Select something");
  #defaultIcon?: SVGFunc;
  #text: HTMLDivElement = document.createElement("div");
  #open: SVGSVGElement = material_navigation_unfold_more_rounded();
  private is_open: boolean = false;

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
          this.#select_adjacent(e.key === "ArrowDown");
          break;
      }
    };
    this._body.appendChild(this.#text);
    this.#text.append(this.#default);
    this._body.appendChild(this.#open);
  }

  /**Gets the default text displayed when nothing has been selected yet */
  get default() {
    return this.#default.nodeValue || "";
  }

  /**Sets the default text displayed when nothing has been selected yet */
  set default(def: string) {
    this.#default.nodeValue = def;
  }

  /**Sets the default text displayed when nothing has been selected yet */
  set default_icon(def: SVGFunc | undefined) {
    this.#defaultIcon = def;
    if (def && this.#selected === -1) this.#set_icon = def;
  }

  set selections(selections: SelectorOption<RT>[] | undefined) {
    this.open = false;
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

  set open(open: boolean) {
    if (open && !this.is_open) {
      this.#open.replaceChildren(material_navigation_unfold_less_rounded());
      box.open_menu(this.#map, this, this._body, this.buffer);
    } else if (!open && this.is_open) {
      this.#open.replaceChildren(material_navigation_unfold_more_rounded());
      box.close_menu();
    }
    this.is_open = open;
  }

  /**Changes the icon of the button*/
  set #set_icon(icon: SVGFunc | undefined) {
    if (icon) {
      let i = icon();
      if (this.#icon) this._body.replaceChild(i, this.#icon);
      else this._body.insertBefore(i, this.#text);
      this.#icon = i;
    } else if (this.#icon) {
      this._body.removeChild(this.#icon);
      this.#icon = undefined;
    }
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

  // protected _set_selection(selection: Selection) {
  //   selection.line.classList.add("selected");
  //   if (selection.icon) this.#icon.replaceChildren(selection.icon());
  //   else this.#icon.replaceChildren();
  //   this.#text.textContent = selection.text;
  // }

  #clear() {
    this.#defaultIcon
      ? (this.#set_icon = this.#defaultIcon)
      : (this.#set_icon = undefined);
    this.#text.replaceChildren(this.#default);
  }

  /**Called when Value is changed */
  protected new_value(value: RT) {
    if (!this.#map.has(value)) {
      this.#clear();
      this.#selected = -1;
      return;
    }
    let opt = this.#map.get(value)!;
    this.#text.innerText = opt.text;
    this.#selected = this.#values.indexOf(value);
    if (opt.icon) this.#set_icon = opt.icon;
    else this.#set_icon = undefined;
  }

  protected new_error(_val: string): void {}

  focus() {
    this._body.focus();
  }
}
define_element(Dropdown);

export let form_dropDown = {
  /**Creates a button form element */
  from<T>(options?: DropDownOptions<T>): Dropdown<T> {
    let drop = new Dropdown<T>(options?.id);
    if (options) {
      if (options.default) drop.default = options.default;
      if (options.defaultIcon) drop.default_icon = options.defaultIcon;
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

  #closer: HTMLDivElement = document.createElement("div");
  #container: HTMLDivElement = this.appendChild(document.createElement("div"));
  #scroll: HTMLDivElement = this.#container.appendChild(
    document.createElement("div")
  );
  #table: HTMLDivElement = this.#scroll.appendChild(
    document.createElement("div")
  );
  #dropdown: Dropdown<any> | undefined;
  #focus_out_handler = (e: FocusEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.relatedTarget || !this.contains(e.relatedTarget as Node))
      this.close_menu();
  };
  #window_resize_handler = () => this.close_menu();
  #is_open: boolean = false;

  constructor() {
    super();
    this.#container.tabIndex = 0;
    this.#container.onkeydown = (e) => {
      if (e.key === "Escape") this.close_menu();
      else if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
        var elem =
          e.target === this.#container
            ? this.#table.lastElementChild
            : (e.target as HTMLElement).previousElementSibling;
        if (elem) (elem as HTMLElement).focus();
      } else if (e.key === "ArrowDown" || e.key === "Tab") {
        var elem =
          e.target === this.#container
            ? this.#table.firstElementChild
            : (e.target as HTMLElement).nextElementSibling;
        if (elem) (elem as HTMLElement).focus();
      } else {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
    };

    this.#closer
      .appendChild(document.createElement("div"))
      .appendChild(material_navigation_close_rounded());
    this.#closer.appendChild(document.createElement("div")).innerHTML = "Close";
    this.#closer.tabIndex = 0;
    this.#closer.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.close_menu();
    };
    this.#closer.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.stopPropagation();
        e.preventDefault();
        this.close_menu();
      }
    };

    this.addEventListener("focusout", this.#focus_out_handler, {
      capture: true,
    });
  }

  #set_value(value: any) {
    //@ts-expect-error
    if (this.#dropdown) this.#dropdown.set_value(value);
    this.close_menu();
  }

  open_menu(
    map: Map<any, SelOptions>,
    parent: Dropdown<any>,
    ref: HTMLDivElement,
    value: any
  ) {
    let inner_height = this.ownerDocument.defaultView?.innerHeight || 0;
    this.classList.add("open");
    let bounds = ref.getBoundingClientRect();
    if (bounds.y + bounds.height / 2 < inner_height / 2) {
      let top = bounds.y + bounds.height;
      this.#container.style.top = top + "px";
      this.#container.style.bottom = "";
      this.#container.style.maxHeight = inner_height - top - 10 + "px";
      this.#container.style.flexDirection = "column";
    } else {
      let bottom = inner_height - bounds.y;
      this.#container.style.top = "";
      this.#container.style.bottom = bottom + "px";
      this.#container.style.maxHeight = inner_height - bottom - 10 + "px";
      this.#container.style.flexDirection = "column-reverse";
    }
    this.#container.style.left = bounds.x + "px";
    this.#container.style.width = bounds.width + "px";
    this.#dropdown = parent;

    if (this.#scroll.scrollHeight > this.#scroll.clientHeight)
      this.#scroll.classList.add("scroll");
    else this.#scroll.classList.remove("scroll");

    let focus: HTMLElement | undefined = undefined as HTMLElement | undefined;
    this.#table.replaceChildren(
      ...Array.from(map).map(([val, opt]) => {
        let line = document.createElement("div");
        let icon = line.appendChild(document.createElement("div"));
        if (opt.icon) icon.appendChild(opt.icon());
        let text = line.appendChild(document.createElement("div"));
        text.textContent = opt.text;
        line.onpointerup = (e) => {
          if (e.pointerType !== "touch") this.#set_value(val);
        };
        line.onclick = () => this.#set_value(val);
        line.tabIndex = 0;
        line.onkeydown = (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            this.#set_value(val);
          }
        };
        if (val === value) focus = line;
        return line;
      })
    );

    //Show closer or not
    let box = this.#scroll.getBoundingClientRect();
    let boxArea = box.width * box.height;
    let html = this.ownerDocument.documentElement;
    let htmlArea = html.clientWidth * html.clientHeight;
    if (boxArea > htmlArea * 0.5) {
      this.#table.prepend(this.#closer);
    }

    if (focus) {
      focus.focus();
      focus.classList.add("selected");
    } else this.#container.focus();

    this.ownerDocument.defaultView?.addEventListener(
      "resize",
      this.#window_resize_handler,
      { passive: true }
    );
    this.#is_open = true;
  }

  close_menu() {
    if (!this.#is_open) return;
    this.#is_open = false;
    this.classList.remove("open");
    this.#table.replaceChildren();
    if (this.#dropdown) {
      this.#dropdown.focus();
      //@ts-expect-error
      this.#dropdown.is_open = false;
    }
    this.ownerDocument.defaultView?.removeEventListener(
      "resize",
      this.#window_resize_handler
    );
  }
}
define_element(DropDownBox);
let box = document.documentElement.appendChild(new DropDownBox());
