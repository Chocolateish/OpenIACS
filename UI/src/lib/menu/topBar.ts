import { defineElement, type BaseOptions } from "@libBase";
import { grey } from "@libColors";
import { WebComponent } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import "./topBar.scss";

addThemeVariable("menubarColor", ["UI", "Menubar"], grey["400"], grey["700"]);
addThemeVariable(
  "menubarTextColor",
  ["UI", "Menubar"],
  grey["900"],
  grey["200"]
);
addThemeVariable(
  "menubarIconColor",
  ["UI", "Menubar"],
  grey["900"],
  grey["200"]
);

/**List of sided in topbar*/
export const TopBarSides = {
  LEFT: "L",
  MID: "M",
  RIGHT: "R",
} as const;
export type TopBarSides = (typeof TopBarSides)[keyof typeof TopBarSides];

export class TopBar extends WebComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "menu-top-bar";
  }

  deviderLeft = this.appendChild(document.createElement("div"));
  deviderRight = this.appendChild(document.createElement("div"));

  constructor() {
    super();
    this.deviderLeft.classList.add("devider");
    this.deviderRight.classList.add("devider");
  }

  /**Adds item to top bar*/
  addItem<I extends HTMLElement>(side: TopBarSides, item: I): I {
    switch (side) {
      case TopBarSides.LEFT: {
        this.insertBefore(item, this.deviderLeft);
        break;
      }
      case TopBarSides.MID: {
        this.insertBefore(item, this.deviderRight);
        break;
      }
      case TopBarSides.RIGHT: {
        this.appendChild(item);
        break;
      }
    }
    return item;
  }
}
defineElement(TopBar);

export type TopBarButtonOptions = {
  text?: string;
  /**symbol to use in button */
  symbol?: SVGSVGElement;
  /**function to run on click */
  click?: () => void;
} & BaseOptions;

export class TopBarButton extends WebComponent<TopBarButtonOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "menu-top-bar-button";
  }

  private __text = this.appendChild(document.createElement("div"));
  private __symbol?: SVGSVGElement;

  /**Options toggeler */
  options(options: TopBarButtonOptions): this {
    if (typeof options.text === "string") this.text = options.text;
    if (options.symbol) this.symbol = options.symbol;
    if (typeof options.click === "function") this.onclick = options.click;
    return this;
  }

  /**Sets the text of the button */
  set text(text: string) {
    this.__text.innerHTML = text;
  }

  /**Sets the symbol of the button */
  set symbol(sym: SVGSVGElement | undefined) {
    if (sym) {
      if (this.__symbol) {
        this.replaceChild(sym, this.__symbol);
        this.__symbol = sym;
      } else {
        this.__symbol = this.appendChild(sym);
      }
    } else {
      if (this.__symbol) {
        this.removeChild(this.__symbol);
      }
    }
  }
}
defineElement(TopBarButton);
