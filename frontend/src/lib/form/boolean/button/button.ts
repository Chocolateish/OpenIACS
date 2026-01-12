import { define_element } from "@libBase";
import type { SVGFunc } from "@libSVG";
import {
  FormColors,
  FormValue,
  FormValueWrite,
  type FormValueOptions,
} from "../../base";
import "../../shared";
import "./button.scss";

interface FormButtonOptions<ID extends string | undefined>
  extends FormValueOptions<boolean, ID> {
  /**Buttons text */
  text?: string;
  /**Icon for button */
  icon?: SVGFunc;
  /**Function to call on button click */
  on_click?: () => void;
  /**Set true to make button toggle on click instead of normal */
  toggle?: boolean;
  /**Changes the buttons color */
  color?: FormColors;
}

class FormButton<ID extends string | undefined> extends FormValueWrite<
  boolean,
  ID
> {
  static element_name() {
    return "button";
  }
  static element_name_space(): string {
    return "form";
  }

  #text: HTMLSpanElement = this.appendChild(document.createElement("span"));
  #on_click?: () => void;
  #toggle?: boolean;
  #icon?: SVGSVGElement;

  constructor(id?: ID) {
    super(id);

    this.appendChild(this.warn_input);
    this.setAttribute("tabindex", "0");
    this.onclick = () => {
      if (this.#on_click) this.#on_click();
    };
    this.onpointerdown = (e) => {
      if (e.pointerType !== "touch" && e.button === 0) {
        e.stopPropagation();
        this.setPointerCapture(e.pointerId);
        if (!this.#toggle) this.set_value_check(true);
        this.onpointerup = (ev) => {
          ev.stopPropagation();
          this.releasePointerCapture(ev.pointerId);
          if (this.#toggle) this.set_value_check(!this.buffer);
          else this.set_value_check(false);
          this.onpointerup = null;
        };
      }
    };
    this.ontouchstart = (e) => {
      e.stopPropagation();
      if (!this.#toggle) this.set_value_check(true);
      this.ontouchend = (ev) => {
        ev.stopPropagation();
        if (ev.targetTouches.length === 0) {
          if (this.#toggle) this.set_value_check(!this.buffer);
          else this.set_value_check(false);
          this.ontouchend = null;
        }
      };
    };
    this.onkeydown = (e) => {
      switch (e.key) {
        case " ":
        case "Enter": {
          e.stopPropagation();
          e.preventDefault();
          if (!this.#toggle) this.set_value_check(true);
          this.onkeyup = (e) => {
            switch (e.key) {
              case "Enter":
              case " ": {
                e.stopPropagation();
                e.preventDefault();
                if (this.#toggle) this.set_value_check(!this.buffer);
                else this.set_value_check(false);
                if (this.#on_click) this.#on_click();
                break;
              }
            }
            this.onkeyup = null;
          };
          break;
        }
      }
    };
  }

  /**Sets the current text of the button*/
  set text(label: string) {
    this.#text.textContent = label;
  }
  get text() {
    return this.#text.textContent;
  }

  /**Changes the icon of the button*/
  set icon(icon: SVGFunc | undefined) {
    if (icon) this.#icon = this.insertBefore(icon(), this.#text);
    else if (this.#icon) {
      this.removeChild(this.#icon);
      this.#icon = undefined;
    }
  }

  /**Function to call on button click*/
  set on_click(func: (() => void) | undefined) {
    this.#on_click = func;
  }
  get on_click() {
    return this.#on_click;
  }

  /**Changes the color of the button*/
  set color(color: FormColors) {
    if (color === FormColors.None) this.removeAttribute("color");
    else this.setAttribute("color", color);
  }

  /**Called when value is changed */
  protected new_value(value: boolean) {
    if (value) this.classList.add("active");
    else this.classList.remove("active");
  }

  protected clear_value(): void {
    this.new_value(false);
  }

  protected new_error(err: string): void {
    console.error("TODO", err);
  }

  /**Changes whether the button is maintained or momentary*/
  set toggle(toggle: boolean | undefined) {
    this.#toggle = Boolean(toggle);
  }
  get toggle() {
    return this.#toggle;
  }
}
define_element(FormButton);

/**Creates a button form element */
export function form_button<ID extends string | undefined>(
  options?: FormButtonOptions<ID>
): FormButton<ID> {
  const butt = new FormButton<ID>(options?.id);
  if (options) {
    if (options.text) butt.text = options.text;
    if (options.icon) butt.icon = options.icon;
    if (options.on_click) butt.on_click = options.on_click;
    if (options.toggle) butt.toggle = options.toggle;
    if (options.color) butt.color = options.color;
    FormValue.apply_options(butt, options);
  }
  return butt;
}
