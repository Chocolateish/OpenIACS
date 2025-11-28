import { Base } from "../base";
import "./option.scss";
import "./shared";

export abstract class ContextMenuLine extends Base {
  /**Returns the name used to define the element */
  static element_name() {
    return "@abstract@";
  }
  /**Returns the namespace override for the element*/
  static element_name_space() {
    return "contextmenu";
  }

  abstract do_focus(dir?: boolean): void;

  /**Changes focus to the next line
   * @param direction false is next sibling, true is previous */
  focus_next(direction?: boolean) {
    if (direction) {
      if (this.previousElementSibling) {
        (this.previousElementSibling as ContextMenuLine).do_focus(true);
      } else if (this.parentElement?.lastElementChild !== this) {
        (this.parentElement?.lastElementChild as ContextMenuLine).do_focus(
          true
        );
      }
    } else {
      if (this.nextElementSibling) {
        (this.nextElementSibling as ContextMenuLine).do_focus();
      } else if (this.parentElement?.firstElementChild !== this) {
        (this.parentElement?.firstElementChild as ContextMenuLine).do_focus();
      }
    }
  }
}
