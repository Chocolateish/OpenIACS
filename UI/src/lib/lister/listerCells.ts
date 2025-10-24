import { defineElement, type BaseOptions } from "@libBase";
import { WebComponent } from "@libCommon";
import {
  Component,
  ComponentGroup,
  type GroupComponentOptions,
} from "@libComponents";
import "@libTheme";
import "./listerCells.scss";

//###########################################
//#    _      _     _      _____     _ _    #
//#   | |    (_)   | |    / ____|   | | |   #
//#   | |     _ ___| |_  | |     ___| | |   #
//#   | |    | / __| __| | |    / _ \ | |   #
//#   | |____| \__ \ |_  | |___|  __/ | |   #
//#   |______|_|___/\__|  \_____\___|_|_|   #
//###########################################
export class ListCell<
  Options extends BaseOptions = BaseOptions
> extends WebComponent<Options> {
  /**Returns the name used to define the element */
  static elementName() {
    return "lister-cell";
  }

  ___par?: any;

  constructor() {
    super();
    this.classList.add("lister-cell");
  }
}
defineElement(ListCell);

/**Defines options for list container*/
type ListCellTextOptions = {
  /**Text for cell */
  text: string;
} & BaseOptions;

export class ListCellText extends ListCell<ListCellTextOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "text";
  }

  /**Options toggeler*/
  options(options: ListCellTextOptions): this {
    if (typeof options.text !== "undefined") this.text = options.text;
    return this;
  }

  /**Set text of cell*/
  set text(text: string) {
    this.innerHTML = text;
  }
}
defineElement(ListCellText);

/**Defines options for list container*/
type ListCellSymbolOptions = {
  /**SVG element for cell */
  symbol: SVGSVGElement;
} & BaseOptions;

export class ListCellSymbol extends ListCell<ListCellSymbolOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "symbol";
  }

  private __symbolDiv = this.appendChild(document.createElement("div"));
  private __symbol: SVGSVGElement | undefined;
  constructor() {
    super();
  }

  /**Options toggeler*/
  options(options: ListCellSymbolOptions): this {
    if (typeof options.symbol !== "undefined") this.symbol = options.symbol;
    return this;
  }

  /**Sets symbol of cell*/
  set symbol(sym: SVGSVGElement | undefined) {
    if (sym instanceof SVGSVGElement) {
      if (this.__symbol) {
        this.__symbolDiv.replaceChild(sym, this.__symbol);
      } else {
        this.__symbolDiv.appendChild(sym);
      }
      this.__symbol = sym;
    } else {
      console.warn("None symbol passed");
    }
  }
}
defineElement(ListCellSymbol);

/**A list cell with components added */
export class ListCellComponents extends ListCell<GroupComponentOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "components";
  }

  /**Stores group internally*/
  private __group: ComponentGroup;

  constructor() {
    super();
    this.__group = this.appendChild(new ComponentGroup());
  }

  options(options: GroupComponentOptions): this {
    super.options(options);
    this.__group.options(options);
    return this;
  }

  /**This adds the component to the group*/
  addComponent(comp: Component): Component {
    return this.__group.addComponent(comp);
  }
}
defineElement(ListCellComponents);
