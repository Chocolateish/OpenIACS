import { defineElement } from "../base";
import { material_navigation_chevron_right_rounded } from "../icons";
import { ContextMenuLine } from "./line";
import { ContextMenu } from "./menu";
import "./submenu.scss";

export class ContextMenuSub extends ContextMenuLine {
  #menu: ContextMenu;
  #isOpen?: boolean;
  #hoverTime?: number;
  #blockTime?: number;

  /**Returns the name used to define the element */
  static elementName() {
    return "submenu";
  }

  constructor(text: string, menu: ContextMenu, icon?: SVGSVGElement) {
    super();
    this.#menu = menu;
    this.tabIndex = 0;
    let iconBox = this.appendChild(document.createElement("div"));
    iconBox.className = "icon";
    if (icon) {
      iconBox.appendChild(icon);
    }
    let textBox = this.appendChild(document.createElement("div"));
    textBox.innerHTML = text;
    textBox.className = "text";
    let shortcutBox = this.appendChild(document.createElement("div"));
    shortcutBox.className = "shortcut";
    let chevronBox = this.appendChild(document.createElement("div"));
    chevronBox.appendChild(material_navigation_chevron_right_rounded());
    chevronBox.className = "chevron";

    this.onclick = (e) => {
      e.stopPropagation();
      if (!this.#blockTime) {
        navigator?.vibrate(25);
        if (this.#isOpen) {
          this.closeDown();
        } else {
          this.open();
        }
      }
    };

    this.onpointerenter = (e) => {
      if (e.pointerType !== "touch" && !this.#isOpen) {
        this.#hoverTime = window.setTimeout(() => {
          this.open();
          this.#blockTime = window.setTimeout(() => {
            this.#blockTime = 0;
          }, 500);
        }, 300);
      }
    };
    this.onpointerleave = () => {
      clearTimeout(this.#hoverTime);
    };
    this.onkeydown = (e) => {
      switch (e.code) {
        case "Tab":
        case "ArrowUp":
        case "ArrowDown":
          this.focusNext(e.shiftKey || e.code === "ArrowUp");
          break;
        case "ArrowRight":
        case "Enter":
        case "Space":
          this.open();
          this.#menu.focusNext(false);
          break;
        case "ArrowLeft":
        case "Escape":
          return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
  }

  /**Opens the sub menu */
  open() {
    if ((this.parentElement as any).submenu) {
      (this.parentElement as any).submenu.closeDown();
    }
    (this.parentElement as any).submenu = this;
    this.appendChild(this.#menu);
    this.#menu.setPosition(0, 0, this);
    this.#isOpen = true;
  }

  doFocus(): void {
    this.focus();
  }

  /**Closes menu by calling parent*/
  close() {
    this.focus();
    (this.parentElement as any).submenu = undefined;
    this.removeChild(this.#menu);
    this.#isOpen = false;
  }

  /**Closes the context menu down the tree*/
  closeDown() {
    this.#menu.closeDown();
    this.close();
  }

  /**Closes the context menu up the tree to the root*/
  closeUp() {
    this.close();
    (this.parentElement as any).closeUp();
  }
}
defineElement(ContextMenuSub);

export function contextSub(
  text: string,
  menu: ContextMenu,
  icon?: SVGSVGElement
) {
  return new ContextMenuSub(text, menu, icon);
}
