import { Base } from "../base";
import "./option.scss";
import "./shared";

export abstract class ContextMenuLine extends Base {
  /**Returns the name used to define the element */
  static elementName() {
    return "@abstract@";
  }
  /**Returns the namespace override for the element*/
  static elementNameSpace() {
    return "contextmenu";
  }

  abstract doFocus(dir?: boolean): void;

  /**Changes focus to the next line
   * @param direction false is next sibling, true is previous */
  focusNext(direction?: boolean) {
    if (direction) {
      if (this.previousElementSibling) {
        (this.previousElementSibling as ContextMenuLine).doFocus(true);
      } else if (this.parentElement?.lastElementChild !== this) {
        (this.parentElement?.lastElementChild as ContextMenuLine).doFocus(true);
      }
    } else {
      if (this.nextElementSibling) {
        (this.nextElementSibling as ContextMenuLine).doFocus();
      } else if (this.parentElement?.firstElementChild !== this) {
        (this.parentElement?.firstElementChild as ContextMenuLine).doFocus();
      }
    }
  }
}
