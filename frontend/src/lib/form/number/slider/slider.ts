import { define_element } from "@libBase";
import {
  material_navigation_chevron_left_rounded,
  material_navigation_chevron_right_rounded,
} from "@libIcons";
import type { SVGFunc } from "@libSVG";
import { FormNumberWrite, type StepperBaseOptions } from "../numberBase";
import "./slider.scss";

/**Slide Selector, displays all options in a slider*/
export class Slider extends FormNumberWrite<number> {
  static element_name() {
    return "slider";
  }
  static element_name_space(): string {
    return "form";
  }

  #icon_dec = this._stepper_func(
    this._body.appendChild(material_navigation_chevron_left_rounded()),
    false
  );
  #slide = this._body.appendChild(document.createElement("div"));
  #legend = this._body.appendChild(document.createElement("span"));
  #min_leg = this.#legend.appendChild(document.createElement("span"));
  #max_leg = this.#legend.appendChild(document.createElement("span"));
  #icon_inc = this._stepper_func(
    this._body.appendChild(material_navigation_chevron_right_rounded()),
    true
  );
  #slider = this.#slide.appendChild(document.createElement("div"));
  #value_box = this.#slider.appendChild(document.createElement("span"));
  #unit = this.#slider.appendChild(document.createElement("span"));

  constructor(id: string | undefined) {
    super(id);
    this.#slider.setAttribute("tabindex", "0");
    this.#min_leg.textContent = "Min";
    this.#max_leg.textContent = "Max";

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
              this._set_value_validate((value += diff / 50), true);
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
              this._set_value_validate(value, true);
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

  /**Set wether the slider is in live mode*/
  set live(live: boolean | undefined) {
    this._live = live || false;
  }

  set icon_decrease(icon: SVGFunc | undefined) {
    this._body.replaceChild(
      this.#icon_dec,
      this._stepper_func(
        icon ? icon() : material_navigation_chevron_left_rounded(),
        false
      )
    );
  }

  set icon_increase(icon: SVGFunc | undefined) {
    this._body.replaceChild(
      this.#icon_inc,
      this._stepper_func(
        icon ? icon() : material_navigation_chevron_right_rounded(),
        true
      )
    );
  }

  set unit(unit: string | undefined) {
    this.#unit.textContent = unit ?? "";
  }

  #move_absolute(x: number, last: boolean) {
    let perc = this.#x_to_perc(x);
    if (last && !this._live) {
      this._set_value_validate(
        this._value_apply_precision(this.#perc_to_value(perc)),
        true
      );
    } else {
      if (this._live) {
        this._set_value_validate(
          this._value_apply_precision(this.#perc_to_value(perc)),
          false
        );
      } else {
        this.#move_slide(perc);
        this.#move_value(
          this._value_apply_precision(this.#perc_to_value(perc))
        );
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

  protected _stepper_func(icon: SVGSVGElement, dir: boolean) {
    icon.onpointerdown = (e) => {
      if (e.button === 0) {
        e.stopPropagation();
        let interval = 0;
        let scalerInterval = 0;
        let scaler = 200;
        let release = () => {
          clearInterval(interval);
          clearInterval(scalerInterval);
          clearTimeout(timeout);
          icon.onpointerup = null;
          icon.releasePointerCapture(e.pointerId);
          icon.classList.remove("active");
        };
        icon.setPointerCapture(e.pointerId);
        icon.classList.add("active");
        let timeout = setTimeout(() => {
          if (this._step_value(dir)) {
            icon.onpointerup = null;
          } else {
            interval = setInterval(() => {
              if (this._step_value(dir)) {
                release();
              }
            }, scaler);
            scalerInterval = setInterval(() => {
              if (scaler > 20) {
                scaler /= 1.1;
              }
              clearInterval(interval);
              interval = setInterval(() => {
                if (this._step_value(dir)) {
                  release();
                }
              }, scaler);
            }, 200);
          }
        }, 500);
        icon.onpointerup = () => {
          if (interval === 0) {
            this._step_value(dir);
          }
          release();
        };
      }
    };
    return icon;
  }

  /**This steps the slider value in the given direction*/
  protected _step_value(dir: boolean): boolean | void {
    if (this._step === 0) {
      if (this._decimals === 0) {
        var step = Math.max(1, Math.floor(Math.abs(this.buffer || 0) / 150));
      } else {
        var step = Math.max(
          1 / this._decimals,
          Math.floor(Math.abs(this.buffer || 0) / 150)
        );
      }
    } else {
      var step = this._step;
    }
    if (dir) {
      return this._set_value_validate((this.buffer || 0) + step, true);
    } else {
      return this._set_value_validate((this.buffer || 0) - step, true);
    }
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
    let slide = new Slider(options?.id);
    if (options) {
      if (options.live) slide.live = options.live;
      if (options.icon_decrease) slide.icon_decrease = options.icon_decrease;
      if (options.icon_increase) slide.icon_increase = options.icon_increase;
      FormNumberWrite.apply_options(slide, options);
    }
    return slide;
  },
};
