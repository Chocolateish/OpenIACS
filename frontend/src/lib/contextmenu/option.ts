import { define_element } from "../base";
import { ContextMenuLine } from "./line";
import { ContextMenu } from "./menu";
import "./option.scss";

export class ContextMenuOption extends ContextMenuLine {
  readonly func: () => void;

  /**Returns the name used to define the element */
  static element_name() {
    return "option";
  }

  constructor(
    text: string,
    func: () => void,
    icon?: SVGSVGElement,
    shortcut?: string,
    checkmark?: boolean
  ) {
    super();
    this.func = func;
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
    if (shortcut) {
      shortcutBox.innerHTML = shortcut;
    }
    shortcutBox.className = "shortcut";
    let checkMarkBox = this.appendChild(document.createElement("div"));
    if (checkmark) {
      checkMarkBox.innerHTML = "✓";
    }
    checkMarkBox.className = "checkmark";

    this.onclick = (e) => {
      e.stopPropagation();
      this.func();
      navigator?.vibrate(25);
      (this.parentElement as ContextMenu).close_up();
    };

    this.onkeydown = (e) => {
      switch (e.code) {
        case "Tab":
        case "ArrowUp":
        case "ArrowDown":
          this.focus_next(e.shiftKey || e.code === "ArrowUp");
          break;
        case "Enter":
        case "Space":
          this.func();
          (this.parentElement as ContextMenu).close_up();
          break;
        case "ArrowLeft":
        case "Escape":
          return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
  }

  do_focus(): void {
    this.focus();
  }
}
define_element(ContextMenuOption);

export function context_line(
  text: string,
  func: () => void,
  icon?: SVGSVGElement,
  shortcut?: string,
  checkmark?: boolean
) {
  return new ContextMenuOption(text, func, icon, shortcut, checkmark);
}
