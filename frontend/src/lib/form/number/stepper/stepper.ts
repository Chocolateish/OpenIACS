import { define_element } from "@libBase";
import {
  material_content_add_rounded,
  material_content_remove_rounded,
} from "@libIcons";
import type { SVGFunc } from "@libSVG";
import { FormNumberWrite, type FormStepperBaseOptions } from "../numberBase";
import "./stepper.scss";

/**Slide Selector, displays all options in a slider*/
export class FormStepper extends FormNumberWrite<number> {
  static element_name() {
    return "stepper";
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
  #icon_dec = this._stepper_func(
    this._body.appendChild(material_content_remove_rounded()),
    false
  );
  #text = this._body.appendChild(document.createElement("span"));
  #icon_inc = this._stepper_func(
    this._body.appendChild(material_content_add_rounded()),
    true
  );
  #value_box = this.#text.appendChild(document.createElement("span"));
  #unit_box = this.#text.appendChild(document.createElement("span"));
  #legend = this.#text.appendChild(document.createElement("span"));
  #min_legend = this.#legend.appendChild(document.createElement("span"));
  #max_legend = this.#legend.appendChild(document.createElement("span"));

  constructor(id: string | undefined) {
    super(id);
    this._body.setAttribute("tabindex", "0");

    this.#value_box.setAttribute("tabindex", "-1");
    this.#value_box.contentEditable = "true";

    let dragBlocker = false;

    this.#value_box.onfocus = async () => {
      dragBlocker = true;
      if (this.#value_box.textContent === NoValueText) {
        this.#value_box.textContent = "";
      }
    };
    this.#value_box.onblur = async () => {
      dragBlocker = false;
      setTimeout(() => {
        this._set_value_validate(
          parseFloat(this.#value_box.textContent?.replace(",", ".") || "") || 0,
          true
        );
      }, 0);
    };
    this.#text.onpointerdown = (e) => {
      if (e.button === 0 && (e.target !== this.#value_box || !dragBlocker)) {
        e.stopPropagation();
        let initialVal = this._value || 0;
        let moving = false;
        this.#text.setPointerCapture(e.pointerId);
        this.#text.onpointermove = (ev) => {
          ev.stopPropagation();
          if (moving) {
            this._moveDiff(initialVal + (ev.clientX - e.clientX) / 5, false);
          } else {
            if (Math.abs(e.clientX - ev.clientX) > 5) {
              this.#value_box.contentEditable = "false";
              moving = true;
            }
          }
        };
        this.#text.onpointerup = (ev) => {
          ev.stopPropagation();
          this.#value_box.contentEditable = "true";
          if (!moving && e.target !== this.#value_box) {
            if (this.#value_box.textContent === NoValueText) {
              this.#value_box.focus();
            } else {
              this.#value_box.focus();
              let range = document.createRange();
              range.setStartAfter(<Node>this.#value_box.firstChild);
              let selection = this.ownerDocument?.defaultView?.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          } else {
            moving = false;
            this._moveDiff(initialVal + (ev.clientX - e.clientX) / 5, true);
          }
          this.#text.releasePointerCapture(e.pointerId);
          this.#text.onpointermove = null;
          this.#text.onpointerup = null;
        };
      }
    };

    this._body.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowRight":
          e.stopPropagation();
          this._step_value(true);
          break;
        case "ArrowLeft":
          e.stopPropagation();
          this._step_value(false);
          break;
        default:
          if (
            this.ownerDocument.activeElement !== this.#value_box &&
            /[\d,.-]/g.test(e.key)
          ) {
            this.#value_box.textContent = "";
            this.#value_box.focus();
          }
      }
    };
    this.#value_box.onkeydown = (e) => {
      switch (e.key) {
        case "Enter":
          this.#value_box.blur();
          return;
        case "ArrowRight":
        case "ArrowLeft":
          e.stopPropagation();
          break;
      }
    };
    this.#value_box.onbeforeinput = (e) => {
      switch (e.inputType) {
        case "insertParagraph":
          e.preventDefault();
          break;
      }
      if (e.data) {
        if (!/[\d,.-]/g.test(e.data)) {
          e.preventDefault();
        } else if (/[,.]/g.test(e.data) && this._decimals === 0) {
          e.preventDefault();
        } else if (
          (this._minUsr >= 0 && /-/g.test(e.data)) ||
          this.#value_box.textContent?.includes("-")
        ) {
          e.preventDefault();
        }
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
    this.#update_min();
  }
  #update_min() {
    this.#min_legend.textContent =
      this.#min === -Infinity
        ? ""
        : this.#min.toFixed(this.#decimals) + this.#unit + " :Min";
  }

  set max(max: number | undefined) {
    this.#max = max ?? Infinity;
    this.#update_max();
  }
  #update_max() {
    this.#max_legend.textContent =
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
      this._stepper_func(
        icon ? icon() : material_content_remove_rounded(),
        false
      )
    );
  }

  set icon_increase(icon: SVGFunc | undefined) {
    this._body.replaceChild(
      this.#icon_inc,
      this._stepper_func(icon ? icon() : material_content_add_rounded(), true)
    );
  }

  /**Moves the value to a position by the mouse x coordinates*/
  private _moveDiff(value: number, last: boolean) {
    if (last && !this.#live) {
      this._set_value_validate(this._value_apply_precision(value), true);
    } else {
      if (this.#live)
        this._set_value_validate(this._value_apply_precision(value), false);
      else this._moveValue(this._value_apply_precision(value));
    }
  }

  /**Moves the slider to the given percent position*/
  private _moveValue(value: number) {
    this.#value_box.textContent = Math.min(
      Math.max(value, this.#min),
      this.#max
    ).toFixed(this.#decimals);
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
    if (this.#step === 0) {
      if (this.#decimals === 0) {
        var step = Math.max(1, Math.floor(Math.abs(this.buffer || 0) / 150));
      } else {
        var step = Math.max(
          1 / this.#decimals,
          Math.floor(Math.abs(this.buffer || 0) / 150)
        );
      }
    } else {
      var step = this.#step;
    }
    if (dir) {
      return this._set_value_validate((this.buffer || 0) + step, true);
    } else {
      return this._set_value_validate((this.buffer || 0) - step, true);
    }
  }

  protected _value_apply_precision(value: number) {
    this.set_value(value);
  }

  /**Called when value is changed */
  protected new_value(value: number) {
    this._moveValue(value);
  }

  protected new_error(_val: string): void {}
}
define_element(FormStepper);

export let form_stepper = {
  /**Creates a dropdown form element */
  from(options?: FormStepperBaseOptions): FormStepper {
    let slide = new FormStepper(options?.id);
    if (options) {
      if (options.live) slide.live = options.live;
      if (options.icon_decrease) slide.icon_decrease = options.icon_decrease;
      if (options.icon_increase) slide.icon_increase = options.icon_increase;
      FormNumberWrite.apply_options(slide, options);
    }
    return slide;
  },
};
