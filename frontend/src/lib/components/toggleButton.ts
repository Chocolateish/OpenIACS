import { AccessTypes, defineElement } from "@libBase";
import { svg_primitives } from "@libSVG";
import {
  type ComponentValue,
  SelectorComponent,
  type SelectorComponentOptions,
  Way,
} from "./common";
import "./toggleButton.scss";

/**Defines options for toggle button component*/
export type ToggleButtonOptions = {} & SelectorComponentOptions;

type Option = {
  text: HTMLDivElement;
  sym: SVGSVGElement;
  value: ComponentValue;
} & HTMLTableCellElement;

/**Toggle buttons, displays all options in a multi toggler*/
export class ToggleButton extends SelectorComponent<ToggleButtonOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "toggle-button";
  }

  private __buttons = this.appendChild(document.createElement("table"));
  private __buttonsRow = this.__buttons.appendChild(
    document.createElement("tr")
  );
  private __options: { [key: string]: Option } = {};
  private __text?: HTMLSpanElement;
  private __selected: any;
  private __symbols?: boolean;
  private __textRow: HTMLTableRowElement = document.createElement("tr");

  constructor() {
    super();
    this.__buttonsRow.classList.add("br");
    this.onkeyup = this.__keyUp;
  }

  /**This adds an option to the selector component
   * @param  text text for options
   * @param  value value for options
   * @param  symbol symbol to display
   * @returns link to the option*/
  addOption(
    text: string,
    value: ComponentValue,
    symbol?: SVGSVGElement
  ): HTMLDivElement {
    if (symbol && !this.__symbols) this.symbols = true;
    if (!symbol) symbol = svg_primitives.createSVGElement("svg");
    var opt = this.__buttonsRow.appendChild(
      document.createElement("td")
    ) as Option;
    this.__options[String(value)] = opt;
    opt.onclick = () => {
      this.setByOption(opt);
    };
    opt.text = document.createElement("div");
    opt.text.appendChild(document.createTextNode(text));
    opt.sym = symbol;
    opt.value = value;
    opt.setAttribute("tabindex", "0");
    if (this.__symbols) {
      opt.appendChild(symbol);
      let txt = this.__textRow.appendChild(document.createElement("td"));
      txt.onclick = opt.onclick;
      txt.appendChild(opt.text);
    } else opt.appendChild(opt.text);
    this.__buttons.style.minWidth =
      this.__buttonsRow.children.length * 3 + "rem";
    return opt;
  }

  /**Updates text of component */
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.__buttons
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.__text.remove;
      delete this.__text;
    }
  }

  /**This sets if the selector uses symbols */
  set symbols(sym: boolean) {
    if (sym && !this.__symbols) {
      if (this.__way == 0)
        this.__buttons.insertBefore(this.__textRow, this.__buttonsRow);
      else this.__buttons.appendChild(this.__textRow);
      for (let i = 0, n = this.__buttonsRow.children.length; i < n; i++) {
        this.__buttonsRow.children[i].appendChild(
          (this.__buttonsRow.children[i] as Option).sym
        );
        let txt = this.__textRow.appendChild(document.createElement("td"));
        txt.appendChild((this.__buttonsRow.children[i] as Option).text);
      }
    } else if (!sym && this.__symbols) {
      for (let i = 0, n = this.__buttonsRow.children.length; i < n; i++) {
        this.__buttonsRow.children[i].innerHTML = "";
        this.__buttonsRow.children[i].appendChild(
          (this.__buttonsRow.children[i] as Option).text
        );
      }
      this.__textRow.remove();
    }
    this.__symbols = sym;
  }

  /**Keyboard handling*/
  private __keyUp(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter": {
        this.setByOption(e.target as HTMLDivElement);
        break;
      }
      case "ArrowRight":
      case "ArrowDown": {
        if (this.__selected) this.setByOption(this.__selected.nextSibling);
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        if (this.__selected) this.setByOption(this.__selected.previousSibling);
        break;
      }
      default: {
        return;
      }
    }
    e.stopPropagation();
  }

  /**Internal way call*/
  protected __onWay(ways: Way) {
    switch (ways) {
      case Way.UP:
        if (this.__textRow)
          this.__buttons.insertBefore(this.__textRow, this.__buttonsRow);
        break;
      case Way.DOWN:
        if (this.__textRow) this.__buttons.appendChild(this.__textRow);

        break;
    }
  }

  /**Internal access call*/
  protected __onAccess(a: AccessTypes) {
    if (a == AccessTypes.READ) {
      let items = this.querySelectorAll("*[tabindex]");
      for (let i = 0, m = items.length; i < m; i++)
        items[i].setAttribute("tabindex", "-1");
    } else if (a == AccessTypes.WRITE) {
      let items = this.querySelectorAll("*[tabindex]");
      for (let i = 0, m = items.length; i < m; i++)
        items[i].setAttribute("tabindex", "0");
    }
  }

  /**Sets the value by using the options element*/
  setByOption(elem: HTMLDivElement) {
    if (
      elem instanceof HTMLTableCellElement &&
      this.__buttonsRow.contains(elem)
    ) {
      this.__setValue((elem as Option).value);
      this.__selected.focus();
    }
  }

  /**Internal value setter*/
  protected __newValue(val: number) {
    if (val in this.__options) {
      if (this.__selected) {
        this.__selected.classList.remove("selected");
        this.__selected.text.parentElement.classList.remove("selected");
      }
      this.__selected = this.__options[val];
      this.__selected.classList.add("selected");
      this.__selected.text.parentElement.classList.add("selected");
    }
  }
}
defineElement(ToggleButton);
