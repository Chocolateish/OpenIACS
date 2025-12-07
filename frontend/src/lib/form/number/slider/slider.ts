import { define_element } from "@libBase";
import {
  material_content_add_rounded,
  material_content_remove_rounded,
} from "@libIcons";
import type { SVGFunc } from "@libSVG";
import { FormNumberWrite, type FormStepperBaseOptions } from "../numberBase";
import "./slider.scss";

/**Slide Selector, displays all options in a slider*/
export class FormSlider extends FormNumberWrite<number> {
  static element_name() {
    return "slider";
  }
  static element_name_space(): string {
    return "form";
  }

  #unit: string = "";
  #decimals: number = 0;
  #min: number = -Infinity;
  #max: number = Infinity;
  #span: number = Infinity;
  #step: number = 0;
  #start: number = 0;
  #live: boolean = false;
  #icon_dec = this.#stepper_func(
    this._body.appendChild(material_content_remove_rounded()),
    false
  );
  #slide = this._body.appendChild(document.createElement("div"));
  #legend = this._body.appendChild(document.createElement("span"));
  #left_legend = this.#legend.appendChild(document.createElement("span"));
  #right_legend = this.#legend.appendChild(document.createElement("span"));
  #icon_inc = this.#stepper_func(
    this._body.appendChild(material_content_add_rounded()),
    true
  );
  #slider = this.#slide.appendChild(document.createElement("div"));
  #value_box = this.#slider.appendChild(document.createElement("span"));
  #unit_box = this.#slider.appendChild(document.createElement("span"));

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
        if (this.#min === -Infinity || this.#max === Infinity) {
          let value = this.buffer || 0;
          let interval = setInterval(() => {
            if (this.#live) this.set_value((value += diff / 50));
            else this.#move_value((value += diff / 50));
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
            if (!this.#live) this.set_value(value);
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
          this.#step_value(true);
          break;
        case "ArrowLeft":
          e.stopPropagation();
          this.#step_value(false);
          break;
      }
    };
  }

  set unit(unit: string | undefined) {
    this.#unit = unit || "";
    this.#unit_box.textContent = this.#unit;
    this.#update_min();
    this.#update_max();
  }

  set min(min: number | undefined) {
    this.#min = min ?? -Infinity;
    this.#span = this.#max - this.#min;
    this.#update_min();
  }
  #update_min() {
    this.#left_legend.textContent =
      this.#min === -Infinity
        ? ""
        : "Min: " + this.#min.toFixed(this.#decimals) + this.#unit;
  }

  set max(max: number | undefined) {
    this.#max = max ?? Infinity;
    this.#span = this.#max - this.#min;
    this.#update_max();
  }
  #update_max() {
    this.#right_legend.textContent =
      this.#max === Infinity
        ? ""
        : this.#max.toFixed(this.#decimals) + this.#unit + " :Max";
  }

  set decimals(dec: number | undefined) {
    this.#decimals = dec || 0;
    this.#update_min();
    this.#update_max();
  }

  set step(step: number | undefined) {
    this.#step = step || 0;
  }

  set start(step: number | undefined) {
    this.#start = step || 0;
  }

  /**Set wether the slider is in live mode*/
  set live(live: boolean | undefined) {
    this.#live = live || false;
  }

  set icon_decrease(icon: SVGFunc | undefined) {
    this._body.replaceChild(
      this.#icon_dec,
      this.#stepper_func(
        icon ? icon() : material_content_remove_rounded(),
        false
      )
    );
  }

  set icon_increase(icon: SVGFunc | undefined) {
    this._body.replaceChild(
      this.#icon_inc,
      this.#stepper_func(icon ? icon() : material_content_add_rounded(), true)
    );
  }

  protected new_value(value: number): void {
    this.#move_value(value);
    this.#move_slide(
      Math.min(Math.max(((-this.#min + value) / this.#span) * 100, 0), 100)
    );
  }

  protected new_error(_val: string): void {}

  /**This steps the slider value in the given direction*/
  #step_value(dir: boolean) {
    let step =
      this.#step ||
      Math.max(
        this.#decimals ? 1 / this.#decimals : 1,
        Math.floor(Math.abs(this.buffer || 0) / 150)
      );

    return this.set_value((this.buffer || 0) + (dir ? step : -step));
  }

  #x_to_perc(x: number) {
    let box = this.#slide.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((x - box.x) / box.width) * 100));
  }

  #perc_to_value(perc: number) {
    return (perc / 100) * this.#span + this.#min;
  }

  #move_absolute(x: number, last: boolean) {
    let perc = this.#x_to_perc(x);
    if (last && !this.#live) {
      this.set_value(this.#perc_to_value(perc));
    } else {
      if (this.#live) {
        this.set_value(this.#perc_to_value(perc));
      } else {
        this.#move_slide(perc);
        this.#move_value(this.#perc_to_value(perc));
      }
    }
  }

  /**Attaches click action to over time increase speed of stepping when holding step buttons */
  #stepper_func(icon: SVGSVGElement, dir: boolean) {
    icon.onpointerdown = (e) => {
      if (e.button === 0) {
        e.stopPropagation();
        let interval = 0;
        let scalerInterval = 0;
        let scaler = 250;
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
          this.#step_value(dir);
          interval = setInterval(() => this.#step_value(dir), scaler);
          scalerInterval = setInterval(() => {
            if (scaler > 20) scaler /= 1.1;
            clearInterval(interval);
            interval = setInterval(() => this.#step_value(dir), scaler);
          }, 1000);
        }, 500);
        icon.onpointerup = () => {
          if (interval === 0) this.#step_value(dir);
          release();
        };
      }
    };
    return icon;
  }

  /**Calculates the percent from the x value*/

  #move_slide(perc: number) {
    this.#slider.style.left = perc + "%";
  }
  #move_value(value: number) {
    this.#value_box.textContent = value.toFixed(this.#decimals);
  }
}
define_element(FormSlider);

export let form_slider = {
  /**Creates a dropdown form element */
  from(options?: FormStepperBaseOptions): FormSlider {
    let slide = new FormSlider(options?.id);
    if (options) {
      if (options.live) slide.live = options.live;
      if (options.icon_decrease) slide.icon_decrease = options.icon_decrease;
      if (options.icon_increase) slide.icon_increase = options.icon_increase;
      FormNumberWrite.apply_options(slide, options);
    }
    return slide;
  },
};
