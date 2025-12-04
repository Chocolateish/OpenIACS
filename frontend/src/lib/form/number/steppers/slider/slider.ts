import { define_element } from "@libBase";
import {
  material_navigation_chevron_left_rounded,
  material_navigation_chevron_right_rounded,
} from "@libIcons";
import type { SVGFunc } from "@libSVG";
import { StepperBase, type StepperBaseOptions } from "../stepperBase";
import "./slider.scss";

/**Slide Selector, displays all options in a slider*/
export class Slider extends StepperBase<number> {
  static element_name() {
    return "slider";
  }
  static element_name_space(): string {
    return "form";
  }

  #iconDec = this._stepperFunc(
    this._body.appendChild(material_navigation_chevron_left_rounded()),
    false
  );
  #slide = this._body.appendChild(document.createElement("div"));
  #legend = this._body.appendChild(document.createElement("span"));
  #iconInc = this._stepperFunc(
    this._body.appendChild(material_navigation_chevron_right_rounded()),
    true
  );
  #slider = this.#slide.appendChild(document.createElement("div"));
  #value_box = this.#slider.appendChild(document.createElement("span"));
  #unit = this.#slider.appendChild(document.createElement("span"));

  constructor(id: string | undefined) {
    super(id);
    this.#slider.setAttribute("tabindex", "0");
    this._body.onpointerdown = (e) => {
      if (e.button === 0) {
        e.stopPropagation();
        this.#slider.classList.add("active");
        let box = this.#slider.getBoundingClientRect();
        let offset =
          e.clientX >= box.x
            ? e.clientX <= box.x + box.width
              ? box.x - e.clientX
              : -box.width
            : 0;
        if (this._min === -Infinity || this._max === Infinity) {
          let value = this.buffer || 0;
          let interval = setInterval(() => {
            if (this._live) {
              this._setValueValidate((value += diff / 50), true);
            } else {
              this.#move_value((value += diff / 50));
            }
          }, 100);
          let diff = this.#x_to_perc(e.clientX + offset) - 50;

          this.#move_slide(this.#x_to_perc(e.clientX + offset));
          this.#slider.setPointerCapture(e.pointerId);
          this.#slider.onpointermove = (ev) => {
            ev.stopPropagation();
            let perc = this.#x_to_perc(ev.clientX + offset);
            diff = perc - 50;
            this.#move_slide(perc);
          };
          this.#slider.onpointerup = (ev) => {
            ev.stopPropagation();
            this.#slider.classList.remove("active");
            this.#slider.releasePointerCapture(e.pointerId);
            this.#slider.onpointermove = null;
            this.#slider.onpointerup = null;
            this.#move_slide(50);
            if (!this._live) {
              this._setValueValidate(value, true);
            }
            clearInterval(interval);
          };
        } else {
          this.#move_absolute(e.clientX + offset, false);
          this.#slider.setPointerCapture(e.pointerId);
          this.#slider.onpointermove = (ev) => {
            ev.stopPropagation();
            this.#move_absolute(ev.clientX + offset, false);
          };
          this.#slider.onpointerup = (ev) => {
            ev.stopPropagation();
            this.#slider.classList.remove("active");
            this.#slider.releasePointerCapture(e.pointerId);
            this.#slider.onpointermove = null;
            this.#slider.onpointerup = null;
            this.#move_absolute(ev.clientX + offset, true);
          };
        }
      }
    };
    this.#slider.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowRight":
          e.stopPropagation();
          this._step_value(true);
          break;
        case "ArrowLeft":
          e.stopPropagation();
          this._step_value(false);
          break;
      }
    };
  }

  set icon_decrease(icon: SVGFunc) {}

  set icon_increase(icon: SVGFunc) {}

  set unit(unit: string | undefined) {
    this.#unit.textContent = unit ?? "";
  }

  #move_absolute(x: number, last: boolean) {
    let perc = this.#x_to_perc(x);
    if (last && !this._live) {
      this._setValueValidate(
        this._valueApplyPrecision(this.#perc_to_value(perc)),
        true
      );
    } else {
      if (this._live) {
        this._setValueValidate(
          this._valueApplyPrecision(this.#perc_to_value(perc)),
          false
        );
      } else {
        this.#move_slide(perc);
        this.#move_value(this._valueApplyPrecision(this.#perc_to_value(perc)));
      }
    }
  }

  /**Calculates the percent from the x value*/
  #x_to_perc(x: number) {
    let box = this.#slide.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((x - box.x) / box.width) * 100));
  }

  #perc_to_value(perc: number) {
    return (perc / 100) * this._span + this._min;
  }
  #value_to_perc(value: number) {
    return Math.min(
      Math.max(((-this._min + value) / this._span) * 100, 0),
      100
    );
  }
  #move_slide(perc: number) {
    this.#slider.style.left = perc + "%";
  }
  #move_value(value: number) {
    this.#value_box.textContent = value.toFixed(this._decimals);
  }

  protected new_value(value: number): void {
    this.#move_value(value);
    this.#move_slide(this.#value_to_perc(value));
  }
  protected new_error(_val: string): void {}
}
define_element(Slider);

export let form_slider = {
  /**Creates a dropdown form element */
  from(options?: StepperBaseOptions): Slider {
    let drop = new Slider(options?.id);
    if (options) StepperBase.apply_options(drop, options);
    return drop;
  },
};
