import { Base, defineElement } from "../base";
import { material_navigation_close_rounded } from "../icons";
import { Buffer } from "./buffer";
import { Container } from "./container";
import { ContextMenuLine } from "./line";
import "./menu.scss";
import { ContextMenuOption } from "./option";
import "./shared";
import { ContextMenuSub } from "./submenu";

export type ContextMenuLines = ContextMenuLine[];

export class ContextMenu extends Base {
  /**Returns the name used to define the element */
  static elementName() {
    return "menu";
  }
  /**Returns the namespace override for the element*/
  static elementNameSpace() {
    return "contextmenu";
  }

  #submenu: ContextMenu | undefined;
  #closer: ContextMenuOption | undefined;
  #x: number | undefined;
  #y: number | undefined;
  #element: Element | undefined;
  #focusOutHandler = (e: FocusEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.relatedTarget || !this.contains(e.relatedTarget as Node))
      this.closeUp();
  };
  #windowResizeHandler = () => {
    this.setPosition(this.#x, this.#y, this.#element);
  };

  constructor(
    lines:
      | (
          | (ContextMenuLine | undefined)[]
          | Promise<(ContextMenuLine | undefined)[]>
        )
      | (() =>
          | (ContextMenuLine | undefined)[]
          | Promise<(ContextMenuLine | undefined)[]>)
  ) {
    super();
    lines = typeof lines === "function" ? lines() : lines;
    if (lines instanceof Promise) {
      let buffer = this.appendChild(new Buffer());
      lines.then((line) => {
        buffer.remove();
        this.lines = line;
        this.setPosition(this.#x, this.#y, this.#element);
      });
    } else this.lines = lines;
    this.tabIndex = 0;
    this.onscroll = () => {
      this.closeDown();
    };
    this.onkeydown = (e) => {
      switch (e.code) {
        case "Tab":
        case "ArrowUp":
        case "ArrowDown":
          this.focusNext(e.shiftKey || e.code === "ArrowUp");
          break;
        case "ArrowLeft":
          if (!(this.parentElement instanceof Container)) {
            (this.parentElement as any).focus();
            (this.parentElement as any).closeDown();
          }
          break;
        case "Escape":
          this.closeUp();
          break;
      }
      e.preventDefault();
      e.stopPropagation();
    };
  }

  protected connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("focusout", this.#focusOutHandler, { capture: true });
    this.ownerDocument.defaultView?.addEventListener(
      "resize",
      this.#windowResizeHandler,
      { passive: true }
    );
  }

  protected disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ownerDocument.defaultView?.removeEventListener(
      "resize",
      this.#windowResizeHandler
    );
  }

  /**Sets the lines of the context menu */
  set lines(lines: (ContextMenuLine | undefined)[]) {
    this.replaceChildren();
    if (this.#closer) this.appendChild(this.#closer);
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line) this.appendChild(line);
    }
  }

  /**Changes focus to the next line
   * @param direction false is first child, true is last child */
  focusNext(direction: boolean) {
    if (direction) (this.lastChild as ContextMenuLine)?.doFocus();
    else (this.firstChild as any)?.doFocus({});
  }

  set closer(closer: boolean) {
    if (closer && !this.#closer) {
      this.classList.add("closer");
      this.#closer = new ContextMenuOption(
        "Close",
        () => {},
        material_navigation_close_rounded()
      );
      this.#closer.onclick = (e) => {
        e.stopPropagation();
        if (this.parentElement instanceof ContextMenuSub) {
          this.parentElement.closeDown();
        } else {
          this.closeUp();
        }
      };
      this.prepend(this.#closer);
    } else if (!closer && this.#closer) {
      this.classList.remove("closer");
      this.#closer.remove();
      this.#closer = undefined;
    }
  }

  /**Sets the context menu to fullscreen mode in x directino */
  set fullscreenx(full: boolean) {
    if (full) this.classList.add("fullscreen-x");
    else this.classList.remove("fullscreen-x");
  }

  /**Sets the context menu to fullscreen mode in y direction */
  set fullscreeny(full: boolean) {
    if (full) this.classList.add("fullscreen-y");
    else this.classList.remove("fullscreen-y");
  }

  /**Closes the context menu down the tree*/
  closeDown() {
    if (this.#submenu) this.#submenu.closeDown();
    this.#submenu = undefined;
  }

  /**Closes the context menu up the tree to the root*/
  closeUp() {
    this.closeDown();
    this.removeEventListener("focusout", this.#focusOutHandler, {
      capture: true,
    });
    (this.parentElement as any)?.closeUp(this);
    this.remove();
  }

  /**Updates the position of the menu
   * @param x x coordinate for menu, this will be ignored if needed for contextmenu to fit
   * @param y y coordinate for menu, this will be ignored if needed for contextmenu to fit
   * @param element element to use instead of coordinates, the contextemenu will avoid covering the element if possible*/
  setPosition(x: number = 0, y: number = 0, element?: Element) {
    this.#x = x;
    this.#y = y;
    this.#element = element;
    let box = this.getBoundingClientRect();
    let boxArea = box.width * box.height;
    let window = this.ownerDocument.defaultView;
    let html = this.ownerDocument.documentElement;
    let htmlArea = html.clientWidth * html.clientHeight;
    this.closer = boxArea > htmlArea * 0.5;
    box = this.getBoundingClientRect();
    let top = NaN;
    let bottom = NaN;
    let left = NaN;
    let right = NaN;
    if (window) {
      if (element) {
        var subBox = element.getBoundingClientRect();

        if (subBox.x + subBox.width + box.width > window.innerWidth) {
          x = subBox.x;
          if (box.width < x) right = window.innerWidth - x;
          else right = window.innerWidth - (subBox.x + subBox.width);
        } else x = subBox.x + subBox.width;

        y = subBox.y + subBox.height;

        if (y + box.height >= window.innerHeight) {
          if (y >= box.height) bottom = window.innerHeight - subBox.y;
          else top = window.innerHeight - box.height;
        } else top = y;
      } else {
        if (y + box.height >= window.innerHeight) {
          if (y >= box.height) bottom = window.innerHeight - y;
          else top = window.innerHeight - box.height;
        } else top = y;

        if (box.width >= window.innerWidth) {
          right = 0;
        } else if (x + box.width >= window.innerWidth) {
          if (x >= box.width) right = window.innerWidth - x;
          else left = window.innerWidth - box.width;
        } else left = x;
      }
      this.fullscreenx = box.width === html.clientWidth;
      this.fullscreeny = box.height >= html.clientHeight;
    } else {
      top = 0;
      left = 0;
    }
    this.style.top = top === top ? top + "px" : "";
    this.style.bottom = bottom === bottom ? bottom + "px" : "";
    this.style.left = left === left ? left + "px" : "";
    this.style.right = right === right ? right + "px" : "";
    this.focus();
  }
}
defineElement(ContextMenu);

export function contextMenu(
  lines:
    | (
        | (ContextMenuLine | undefined)[]
        | Promise<(ContextMenuLine | undefined)[]>
      )
    | (() => (ContextMenuLine | undefined)[])
    | (() => Promise<(ContextMenuLine | undefined)[]>)
): ContextMenu {
  return new ContextMenu(lines);
}
