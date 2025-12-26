import { define_element } from "@libBase";
import type { SVGFunc } from "@libSVG";
import { FormColors, FormValueWrite, type FormValueOptions } from "../../base";
import "./switch.scss";

interface FormSwitchOptions<ID extends string | undefined>
  extends FormValueOptions<boolean, ID> {
  /**Icon to use for left side*/
  icon?: SVGFunc;
  /**Color when switch is on */
  on_color?: FormColors;
  /**Color when switch is off */
  off_color?: FormColors;
}

export class FormSwitch<ID extends string | undefined> extends FormValueWrite<
  boolean,
  ID
> {
  static element_name() {
    return "switch";
  }
  static element_name_space(): string {
    return "form";
  }

  #switch: HTMLDivElement = this._body.appendChild(
    document.createElement("div")
  );
  #icon: SVGSVGElement | undefined;
  #preventClick: boolean = false;

  constructor(id?: ID) {
    super(id);

    this._body.appendChild(this.warn_input);
    this.#switch.setAttribute("tabindex", "0");
    this.#switch.onkeydown = (e) => {
      switch (e.key) {
        case "Enter":
        case " ": {
          e.stopPropagation();
          e.preventDefault();
          this.onkeyup = (e) => {
            switch (e.key) {
              case "Enter":
              case " ": {
                e.stopPropagation();
                e.preventDefault();
                this.set_value_check(!this.buffer);
                break;
              }
            }
            this.onkeyup = null;
          };
          break;
        }
      }
    };

    this.#switch.onpointerdown = (e) => {
      if (e.button === 0) {
        e.stopPropagation();
        this.#switch.classList.add("active");
        this.#switch.setPointerCapture(e.pointerId);
        let has_moved = false;
        this.#switch.onpointermove = (ev) => {
          ev.stopPropagation();
          if (has_moved) {
            const box = this.#switch.getBoundingClientRect();
            const mid_cord = box.x + box.width / 2;
            if (ev.clientX > mid_cord) {
              if (!this.buffer) this.set_value_check(true);
            } else {
              if (this.buffer) this.set_value_check(false);
            }
          } else if (
            Math.abs(e.clientX - ev.clientX) > 10 ||
            Math.abs(e.clientY - ev.clientY) > 10
          ) {
            has_moved = true;
          }
        };
        this.#switch.onpointerup = (ev) => {
          ev.stopPropagation();
          this.#switch.classList.remove("active");
          if (!has_moved) this.set_value_check(!this.buffer);
          this.#switch.releasePointerCapture(e.pointerId);
          this.#switch.onpointerup = null;
          this.#switch.onpointermove = null;
        };
      }
    };

    this.#switch.onclick = (e) => e.stopPropagation();

    this._body.onclick = (e) => {
      e.stopPropagation();
      if (this.#preventClick) return (this.#preventClick = false);
      this.set_value_check(!this.buffer);
    };
  }

  /**Changes the icon of the switch*/
  set icon(icon: SVGFunc | undefined) {
    if (icon) this.#icon = this._body.insertBefore(icon(), this.#switch);
    else if (this.#icon) {
      this._body.removeChild(this.#icon);
      this.#icon = undefined;
    }
  }

  set on_color(color: FormColors) {
    if (color === FormColors.None) this.#switch.removeAttribute("on-color");
    else this.#switch.setAttribute("on-color", color);
  }
  set off_color(color: FormColors) {
    if (color === FormColors.None) this.#switch.removeAttribute("on-color");
    else this.#switch.setAttribute("off-color", color);
  }

  /**Called when value is changed */
  protected new_value(value: boolean) {
    if (value) this.#switch.classList.add("on");
    else this.#switch.classList.remove("on");
  }

  protected clear_value(): void {
    this.new_value(false);
  }

  protected new_error(err: string): void {
    console.error(err);
  }
}
define_element(FormSwitch);

export const form_switch = {
  /**Creates a switch form element */
  from<ID extends string | undefined>(
    options?: FormSwitchOptions<ID>
  ): FormSwitch<ID> {
    const swit = new FormSwitch<ID>(options?.id);
    if (options) {
      if (options.icon) swit.icon = options.icon;
      if (options.on_color) swit.on_color = options.on_color;
      if (options.off_color) swit.off_color = options.off_color;
      FormValueWrite.apply_options(swit, options);
    }
    return swit;
  },
};
