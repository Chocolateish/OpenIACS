import { AccessTypes, defineElement } from "@libBase";
import { svg } from "@libCommon";
import { unfold_more } from "@libIcons";
import {
  type ComponentInternalValue,
  SelectorComponent,
  type SelectorComponentOptions,
} from "./common";
import "./dropDown.scss";

export type DropDownOptions = {
  default?: string;
} & SelectorComponentOptions;

type OptionContainer = {
  value: ComponentInternalValue;
  symbol: SVGSVGElement;
  text: HTMLDivElement;
} & HTMLDivElement;

/**Dropdown box for selecting between multiple choices in a small space*/
export class DropDown extends SelectorComponent<DropDownOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "dropdown";
  }

  private __options: { [key: string]: OptionContainer };
  private __container: HTMLDivElement;
  private __selector: HTMLDivElement;
  private __selIcon: SVGSVGElement;
  private __selText: HTMLDivElement;
  private __dropDown: HTMLSpanElement;
  private __selected?: HTMLDivElement;
  private ___next?: HTMLDivElement;
  private __open: boolean;
  private __text?: HTMLSpanElement;

  constructor() {
    super();
    this.__options = {};
    this.__container = document.createElement("div");
    this.appendChild(this.__container);
    this.__selector = document.createElement("div");
    this.__container.appendChild(this.__selector);
    this.__selector.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.open = !this.open;
    };
    this.__selector.setAttribute("tabindex", "0");
    this.__selector.onkeydown = (e) => {
      switch (e.key) {
        case " ": {
          e.stopPropagation();
          e.preventDefault();
          this.open = true;
          break;
        }
        case "ArrowDown": {
          e.stopPropagation();
          e.preventDefault();
          this.setByOption(
            this.__selected
              ? this.__selected.nextSibling
              : this.__dropDown.children[0]
          );
          break;
        }
        case "ArrowUp": {
          e.stopPropagation();
          e.preventDefault();
          this.setByOption(
            this.__selected
              ? this.__selected.previousSibling
              : this.__dropDown.children[this.__dropDown.children.length - 1]
          );
          break;
        }
      }
    };
    this.__selIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    this.__selector.appendChild(this.__selIcon);
    this.__selText = document.createElement("div");
    this.__selector.appendChild(this.__selText);
    this.__selector.appendChild(unfold_more());
    this.__dropDown = document.createElement("span");
    this.__container.appendChild(this.__dropDown);
    this.__dropDown.setAttribute("tabindex", "0");
    this.__dropDown.onblur = (ev) => {
      if (ev.relatedTarget !== this.__selector) {
        this.open = false;
      }
    };
    this.__dropDown.onkeydown = (e) => {
      e.stopPropagation();
      e.preventDefault();
      switch (e.key) {
        case "Escape": {
          this.open = false;
          this.__selector.focus();
          break;
        }
        case "Enter":
        case " ": {
          this.open = false;
          if (this.___next) {
            this.setByOption(this.___next);
          }
          this.__selector.focus();
          break;
        }
        case "ArrowDown": {
          if (this.___next) {
            this.__next = (
              this.___next.nextSibling
                ? this.___next.nextSibling
                : this.__dropDown.firstChild
            ) as OptionContainer;
          } else {
            this.__next = this.__dropDown.firstChild as OptionContainer;
          }
          break;
        }
        case "ArrowUp": {
          if (this.___next) {
            this.__next = (
              this.___next.previousSibling
                ? this.___next.previousSibling
                : this.__dropDown.lastChild
            ) as OptionContainer;
          } else {
            this.__next = this.__dropDown.lastChild as OptionContainer;
          }
          break;
        }
      }
    };
    this.__dropDown.classList.add("h");
    this.__open = false;
  }

  /**Options toggeler*/
  options(options: DropDownOptions): this {
    super.options(options);
    if (typeof options.default === "string") this.default = options.default;
    else this.default = "Select Item";
    return this;
  }

  /**Sets the next flag on an options used for keyboard usage*/
  private set __next(val: OptionContainer | undefined) {
    if (val && this.__dropDown.contains(val as any)) {
      if (this.___next) this.___next.classList.remove("next");
      this.___next = val;
      this.___next.classList.add("next");
    } else {
      if (this.___next) this.___next.classList.remove("next");
    }
  }

  /**Toggles wether the drop down is open
   * @param tog true is open false is close*/
  set open(tog: boolean) {
    if (tog) {
      this.__dropDown.classList.remove("h");
      this.__dropDown.focus();
      this.__next = undefined;
    } else {
      this.__dropDown.classList.add("h");
    }
    this.__open = Boolean(tog);
  }

  /**Returns wether the dropdown is open/visible*/
  get open(): boolean {
    return this.__open;
  }

  /**See selector base*/
  addOption(
    text: string,
    value: ComponentInternalValue,
    symbol: SVGSVGElement = svg(0, 0, "", "")
  ) {
    if (!(String(value) in this.__options)) {
      let option = this.__dropDown.appendChild(
        document.createElement("div")
      ) as OptionContainer;
      option.value = value;
      option.symbol = option.appendChild(symbol);
      option.text = option.appendChild(document.createElement("div"));
      option.text.innerHTML = text;
      option.onclick = (e) => {
        e.stopPropagation();
        this.open = false;
        this.setByOption(option);
        this.__selector.focus();
      };
      this.__options[String(value)] = option;
      return option;
    } else {
      console.warn("Value already in dropdown");
      return undefined;
    }
  }

  /**Removes option from dropdown*/
  removeOption(option: HTMLElement | number | string) {
    //If value is passed instead of option element
    if (!(option instanceof HTMLElement) && option in this.__options) {
      option = this.__options[option];
    }
    delete this.__options[(option as any).value];
    this.__dropDown.removeChild(option as any);
  }

  /**Sets explaning text for component*/
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.firstChild
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes) {
    switch (a) {
      case AccessTypes.READ: {
        let items = this.querySelectorAll("*[tabindex]");
        for (let i = 0, m = items.length; i < m; i++)
          items[i].setAttribute("tabindex", "-1");
        break;
      }
      case AccessTypes.WRITE: {
        let items = this.querySelectorAll("*[tabindex]");
        for (let i = 0, m = items.length; i < m; i++)
          items[i].setAttribute("tabindex", "0");
        break;
      }
    }
  }

  /**Sets the text displaid when nothing is selected*/
  set default(text: string) {
    if (!this.__selected) this.__selText.innerHTML = text;
  }

  /**Sets the value by using the options element*/
  setByOption(elem: Node | null) {
    if (elem && this.__dropDown.contains(elem))
      this.__setValue((elem as OptionContainer).value);
  }

  /**Internal value setter*/
  protected __newValue(val: ComponentInternalValue) {
    if (String(val) in this.__options) {
      let value = this.__options[String(val)];
      if (this.__selected) this.__selected.classList.remove("sel");
      this.__selected = value;
      this.__selected.classList.add("sel");
      this.__selText.innerHTML = value.text.innerHTML;
      let old = this.__selIcon;
      this.__selector.replaceChild(
        (this.__selIcon = value.symbol
          ? (value.symbol.cloneNode(true) as SVGSVGElement)
          : document.createElementNS("http://www.w3.org/2000/svg", "svg")),
        old
      );
    }
  }
}
defineElement(DropDown);
