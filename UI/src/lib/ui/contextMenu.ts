import { Base, defineElement } from "@libBase";
import { blue, grey } from "@libColors";
import {
  attachClickListener,
  isPromise,
  ResultWrapper,
  WebComponent,
} from "@libCommon";
import { hourglass_empty } from "@libIcons";
import { addThemeVariable } from "@libTheme";
import { Content, ContentContainer, type ContentBaseOptions } from "./content";
import "./contextMenu.scss";
import { UIWindow } from "./windows";

addThemeVariable(
  "contextMenuBackgroundColor",
  ["UI", "Context Menu"],
  grey["50"],
  grey["900"]
);
addThemeVariable(
  "contextMenuTextColor",
  ["UI", "Context Menu"],
  grey["900"],
  grey["50"]
);
addThemeVariable(
  "contextMenuHoverColor",
  ["UI", "Context Menu"],
  blue["300"],
  blue["600"]
);
addThemeVariable(
  "contextMenuHoverTextColor",
  ["UI", "Context Menu"],
  grey["900"],
  grey["50"]
);
addThemeVariable(
  "contextMenuDeviderColor",
  ["UI", "Context Menu"],
  grey["600"],
  grey["500"]
);
addThemeVariable(
  "contextMenuIconColor",
  ["UI", "Context Menu"],
  grey["900"],
  grey["50"]
);

/**Defines options for a context menu line*/
export type ContextMenuLineSetup = {
  /**text for the line */
  text: string;
  /**icon of the line */
  symbol?: SVGElement;
  /**function to run for the line */
  func?: () => void;
  /**shortcut extra text to describe a shortcut */
  shortcut?: string;
  /**sub menu with more options, can be function returning array or just array with same rules as this array */
  subMenu?: ContextMenuLineTypes[] | (() => ContextMenuLineTypes[]);
};

/**Defines the context menu line types
 * Option can be either a number or and ContextMenuLine
 * the following numbers mean
 * 0 = devider line*/
export type ContextMenuLineTypes =
  | ContextMenuLineSetup
  | number
  | Promise<ContextMenuLineSetup | number>
  | (() => ContextMenuLineSetup | number | Promise<ContextMenuLineSetup>);

/**Defines the context menu content type*/
export type ContextMenuLines =
  | ContextMenuLineTypes[]
  | Promise<ContextMenuLineTypes[]>;

/**Defines options for context menu component*/
export type ContextMenuOptions = {
  /**default context to use as primary context */
  top?: ContextMenu;
  /**lines to put in context menu */
  lines: ContextMenuLines;
} & ContentBaseOptions;

export class ContextMenu extends Content<ContextMenuOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "context-menu";
  }
  private __top: ContextMenu;
  private __sizeContainer: HTMLElement;

  /**Options toggeler*/
  constructor(options: ContextMenuOptions) {
    super();
    super.options(options);
    this.__top = options.top || this;
    this.__sizeContainer = this.appendChild(document.createElement("div"));
    if (typeof options.lines === "object") {
      if (isPromise(options.lines)) {
        let waiter = this.__sizeContainer.appendChild(new ContextMenuWaiter());
        // @ts-expect-error
        options.lines.then((lines) => {
          waiter.remove();
          this.generateContent(lines);
        });
      } else {
        // @ts-expect-error
        this.generateContent(options.lines);
      }
    } else {
      console.warn("Context Lines must be array or promise of array");
    }
  }

  /**This adds a line to the context menu*/
  addLine(
    symbol: SVGSVGElement,
    text: string,
    func: () => void,
    shortcut: string
  ) {
    this.__sizeContainer.appendChild(
      new ContextMenuLine({
        symbol,
        text,
        shortText: shortcut,
        func,
        top: this.__top,
      })
    );
  }

  /**This adds a line to the context menu*/
  addSubMenu(
    symbol: SVGSVGElement,
    text: string,
    sub: ContextMenuLines | (() => ContextMenuLines)
  ) {
    this.__sizeContainer.appendChild(
      new ContextMenuSubMenu({ symbol, text, sub, top: this.__top })
    );
  }

  /**This adds a devider to the context menu */
  addDevider() {
    this.__sizeContainer.appendChild(new ContextMenuDevider());
  }

  /**Generates a context menu from the line types*/
  generateContent(content: ContextMenuLineTypes[]) {
    for (let i = 0, m = content.length; i < m; i++) {
      let cont = content[i];
      switch (typeof cont) {
        case "function":
          let con = cont();
          if (isPromise(con)) {
            let waiter = this.__sizeContainer.appendChild(
              new ContextMenuWaiter()
            );
            // @ts-expect-error
            con.then((line) => {
              if (line.subMenu) {
                waiter.replaceWith(
                  new ContextMenuSubMenu({
                    symbol: line.symbol,
                    text: line.text,
                    sub: line.subMenu,
                    top: this.__top,
                  })
                );
              } else {
                waiter.replaceWith(
                  new ContextMenuLine({
                    symbol: line.symbol,
                    text: line.text,
                    shortText: line.shortcut,
                    func: line.func,
                    top: this.__top,
                  })
                );
              }
            });
          }
          break;
        case "object":
          // @ts-expect-error
          if (cont.subMenu) {
            this.addSubMenu(
              // @ts-expect-error
              content[i].symbol,
              // @ts-expect-error
              content[i].text,
              // @ts-expect-error
              content[i].subMenu
            );
          } else {
            this.addLine(
              // @ts-expect-error
              content[i].symbol,
              // @ts-expect-error
              content[i].text,
              // @ts-expect-error
              content[i].func,
              // @ts-expect-error
              content[i].shortcut
            );
          }
          break;
        case "number":
          if (i != m - 1) {
            this.addDevider();
          }
          break;
      }
    }
    if (content.length > 0) {
      // @ts-expect-error
      this.__sizeContainer.firstChild.focus();
    }
  }

  /**Handler for keyboard event*/
  __keyboard(e: KeyboardEvent) {
    e.stopPropagation();
    let line = e.target;
    switch (e.key) {
      case "Escape":
        this.__top.close();
        break;
      case "Enter":
        // @ts-expect-error
        if ("openSub" in line) {
          // @ts-expect-error
          if (line.open) {
            // @ts-expect-error
            line.open = false;
            // @ts-expect-error
            line.closeSub();
          } else {
            // @ts-expect-error
            line.openSub();
            // @ts-expect-error
            line.sub.firstChild.firstChild.focus();
            // @ts-expect-error
            line.open = true;
          }
        } else {
          // @ts-expect-error
          line.click();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (e.target instanceof ContextMenu) {
          // @ts-expect-error
          this.lastChild.focus(true);
          // @ts-expect-error
        } else if (e.target == e.target.parentElement.firstChild) {
          // @ts-expect-error
          e.target.parentElement.lastChild.focus(true);
        } else {
          // @ts-expect-error
          e.target.previousSibling.focus(true);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (e.target instanceof ContextMenu) {
          // @ts-expect-error
          this.firstChild.focus(false);
          // @ts-expect-error
        } else if (e.target == e.target.parentElement.lastChild) {
          // @ts-expect-error
          e.target.parentElement.firstChild.focus(false);
        } else {
          // @ts-expect-error
          e.target.nextSibling.focus(false);
        }
        break;
      case "ArrowLeft":
        // @ts-expect-error
        let par = line.parentElement.parentElement.parentElement;
        if (!(par instanceof UIWindow) && !(e.target instanceof ContextMenu)) {
          par.open = false;
          par.closeSub();
        }
        break;
      case "ArrowRight":
        // @ts-expect-error
        if ("openSub" in line) {
          // @ts-expect-error
          if (line.open) {
            // @ts-expect-error
            line.open = false;
            // @ts-expect-error
            line.closeSub();
          } else {
            // @ts-expect-error
            line.openSub();
            // @ts-expect-error
            line.___sub.firstChild.firstChild.focus();
            // @ts-expect-error
            line.open = true;
          }
        }
        break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          if (e.target instanceof ContextMenu) {
            // @ts-expect-error
            this.lastChild.focus(true);
            // @ts-expect-error
          } else if (e.target == e.target.parentElement.firstChild) {
            // @ts-expect-error
            e.target.parentElement.lastChild.focus(true);
          } else {
            // @ts-expect-error
            e.target.previousSibling.focus(true);
          }
        } else {
          if (e.target instanceof ContextMenu) {
            // @ts-expect-error
            this.firstChild.focus(false);
            // @ts-expect-error
          } else if (e.target == e.target.parentElement.lastChild) {
            // @ts-expect-error
            e.target.parentElement.firstChild.focus(false);
          } else {
            // @ts-expect-error
            e.target.nextSibling.focus(false);
          }
        }
    }
  }
}
defineElement(ContextMenu);

class ContextMenuWaiter extends WebComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "context-menu-waiter";
  }

  constructor() {
    super();
    this.appendChild(hourglass_empty()).classList.add("waiting");
  }
}
defineElement(ContextMenuWaiter);

class ContextMenuLine extends WebComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "context-menu-line";
  }

  __top: ContextMenu;
  __func?: () => void;
  textNode: HTMLElement;
  shortText: HTMLElement;

  constructor(options: {
    symbol?: SVGElement;
    text?: string;
    shortText?: string;
    func?: () => void;
    top: ContextMenu;
  }) {
    super();
    this.setAttribute("tabindex", "0");
    this.appendChild(
      document.createElementNS("http://www.w3.org/2000/svg", "svg")
    );
    this.textNode = this.appendChild(document.createElement("div"));
    this.shortText = this.appendChild(document.createElement("div"));

    attachClickListener(this, () => {
      this.click();
    });

    this.onpointerup = (e) => {
      e.stopPropagation();
    };

    this.__top = options.top;
    if (options.func) this.__func = options.func;
    if (options.symbol instanceof SVGElement)
      this.replaceChild(options.symbol, this.firstChild!);
    if (options.text) this.textNode.innerHTML = options.text;
    if (options.shortText) this.shortText.innerHTML = options.shortText;
  }

  /**Runs the stored function for the line and closes menu */
  click() {
    try {
      if (this.__func) this.__func();
    } catch (error) {
      console.warn("Error while running line function", error);
    }
    this.__top.close();
  }

  /**This sends the focus on to the next*/
  focus() {
    super.focus();
  }
}
defineElement(ContextMenuLine);

class ContextMenuSubMenu extends ContextMenuLine {
  /**Returns the name used to define the element */
  static elementName() {
    return "submenu";
  }

  __sub: ContextMenuLines | (() => ContextMenuLines);
  // @ts-expect-error
  ___sub: HTMLElement;
  // @ts-expect-error
  open: boolean;

  constructor(options: {
    symbol?: SVGElement;
    text?: string;
    sub: ContextMenuLines | (() => ContextMenuLines);
    top: ContextMenu;
    shortText?: string;
    func?: () => void;
  }) {
    super(options);
    this.shortText.innerHTML = ">";
    this.onpointerenter = (e) => {
      if (e.pointerType != "touch") {
        this.openSub();
      }
    };
    this.onpointerleave = (e) => {
      if (e.pointerType != "touch") {
        this.closeSub();
      }
    };
    this.onpointerup = (e) => {
      if (e.pointerType == "touch") {
        if (this.open) {
          this.open = false;
          this.closeSub();
          this.open = true;
        } else {
          this.openSub();
        }
      }
    };

    this.__top = options.top;
    this.__sub = options.sub;
    if (options.symbol instanceof SVGElement)
      this.replaceChild(options.symbol, this.firstChild!);
    if (options.text) this.textNode.innerHTML = options.text;
  }

  /**Runs the stored function for the line and closes menu */
  click() {
    this.open = !this.open;
  }

  closeSub() {
    if (!this.open) {
      this.removeChild(this.___sub);
    }
    this.focus();
  }
  openSub() {
    if (!this.open) {
      let box = this.getBoundingClientRect();
      let win = this.ownerDocument.defaultView!;
      let lines;
      if (typeof this.__sub == "function") lines = this.__sub();
      else lines = this.__sub;

      let cont = new ContextMenu({ lines, top: this.__top });
      //@ts-expect-error
      cont.parent = this;
      this.___sub = this.insertBefore(
        new ContentContainer().options({ content: cont }),
        this.firstChild
      );
      // @ts-expect-error
      cont.__top = this.__top;
      if (box.left + box.width / 2 >= win.innerWidth / 2)
        this.___sub.style["right"] =
          win.innerWidth - box.right + box.width + "px";
      else this.___sub.style["left"] = box.left + box.width + "px";
      if (box.top >= win.innerHeight / 2)
        this.___sub.style["bottom"] = win.innerHeight - box.bottom + "px";
      else this.___sub.style["top"] = box.top + "px";
    }
  }
}
defineElement(ContextMenuSubMenu);

class ContextMenuDevider extends Base {
  /**Returns the name used to define the element */
  static elementName() {
    return "context-menu-devider";
  }

  /**This sends the focus on to the next
   * @param way false is next true is previous */
  focusDevider(way: boolean, starter?: any) {
    if (this == starter) {
      return;
    }
    if (way) {
      // @ts-expect-error
      if (this == this.parentElement.firstChild) {
        // @ts-expect-error
        this.parentElement.lastChild.focus(way);
      } else {
        // @ts-expect-error
        this.previousSibling.focus(way);
      }
    } else {
      // @ts-expect-error
      if (this == this.parentElement.lastChild) {
        // @ts-expect-error
        this.parentElement.firstChild.focus(way);
      } else {
        // @ts-expect-error
        this.nextSibling.focus(way);
      }
    }
  }
}
defineElement(ContextMenuDevider);

/**Defines the context menu content type
 * @typedef {[ContextMenuLineTypes]|Content|Promise<[ContextMenuLineTypes]|(elem:WebComponent,x:number,y:number)=>Content|[ContextMenuLineTypes]|Promise<[ContextMenuLineTypes]>} ContextSummonerContent */
export type ContextSummonerContent = number;

/**Opens the context menu at a given position*/
export let summonContextMenu = (
  elem: HTMLElement,
  content: ContextMenuLines | (() => ContextMenuLines),
  x: number,
  y: number
) => {
  switch (typeof content) {
    case "function":
      // @ts-expect-error
      content = content(elem, x, y);
      break;
    case "object":
      break;
    default: {
      return new ResultWrapper(false, "Invalid content value passed", true);
    }
  }

  let cont: ContextMenu | undefined;
  if (!(content instanceof Content)) {
    if (content instanceof Array && content.length == 0) {
      return;
    }
    cont = new ContextMenu({ lines: content });
    if (!(cont instanceof Content)) {
      return new ResultWrapper(false, "ContextMenu creation failed", true);
    }
  }

  let pos: {
    windowRight?: number;
    windowLeft?: number;
    windowTop?: number;
    windowBottom?: number;
  } = {};
  let doc = elem.ownerDocument;
  let win = doc.defaultView!;
  if (x >= win.innerWidth / 2) pos.windowRight = win.innerWidth - x;
  else pos.windowLeft = x;
  if (y >= win.innerHeight / 2) pos.windowBottom = win.innerHeight - y;
  else pos.windowTop = y;

  let wind = new UIWindow().options({
    sizeable: false,
    layer: 9999,
    title: false,
    tabs: false,
    autoClose: true,
    height: "content",
    width: "content",
    content: cont,
    ...pos,
  });
  doc.windowManager.appendWindow(wind);
  return undefined;
};

/**Attaches a context menu to the element, which works with right click for mouse and holding for touch*/
export let attachContextMenu = (
  elem: HTMLElement,
  content: ContextMenuLines
) => {
  //@ts-expect-error
  let con = (elem.__contextMenu__ = {
    pointDown: null,
    pointUp: null,
    standard: null,
    timeOut: 0,
  });
  elem.addEventListener(
    "pointerdown",
    // @ts-expect-error
    (con.pointDown = (e) => {
      if (e.pointerType == "touch") {
        elem.addEventListener("pointermove", (ev) => {
          if (
            ev.clientX > e.clientX + 15 ||
            ev.clientX < e.clientX - 15 ||
            ev.clientY > e.clientY + 15 ||
            ev.clientY < e.clientY - 15
          ) {
            clearTimeout(con.timeOut);
          }
        });
        con.timeOut = window.setTimeout(() => {
          summonContextMenu(elem, content, e.clientX, e.clientY);
        }, 700);
      }
    }),
    { passive: true }
  );
  // @ts-expect-error
  con.pointUp = () => {
    if (con.timeOut != 0) {
      clearTimeout(con.timeOut);
    }
  };
  // @ts-expect-error
  elem.addEventListener("pointerup", con.pointUp, { passive: true });
  // @ts-expect-error
  elem.addEventListener("pointerleave", con.pointUp, { passive: true });
  elem.addEventListener(
    "contextmenu",
    // @ts-expect-error
    (con.standard = (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimeout(con.timeOut);
      summonContextMenu(elem, content, e.clientX, e.clientY);
    })
  );
};

/**Removes the context menu attachment to the element*/
export let dettachContextMenu = (elem: HTMLElement) => {
  if ("__contextMenu__" in elem) {
    // @ts-expect-error
    elem.removeEventListener("pointerdown", elem.__contextMenu__.pointDown);
    // @ts-expect-error
    elem.removeEventListener("pointerup", elem.__contextMenu__.pointUp);
    // @ts-expect-error
    elem.removeEventListener("pointerleave", elem.__contextMenu__.pointUp);
    // @ts-expect-error
    elem.removeEventListener("contextmenu", elem.__contextMenu__.standard);
    delete elem.__contextMenu__;
  }
};
