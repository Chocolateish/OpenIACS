import {
  material_content_add_rounded,
  material_content_remove_rounded,
} from "@chocolatelibui/icons";
import { define_element } from "@libBase";
import { NoValueText } from "../../base";
import { StepperBase } from "../steppers/stepperBase";
import "./stepper.scss";

/**Slide Selector, displays all options in a slider*/
export class Stepper extends StepperBase {
  private _text: HTMLSpanElement;
  private _valueBox: HTMLSpanElement;
  private _legend: HTMLSpanElement;

  /**Returns the name used to define the element*/
  static elementName() {
    return "stepper";
  }

  constructor() {
    super();
    this._body.setAttribute("tabindex", "0");
    this._iconDec = this._stepper_func(
      this._body.appendChild(material_content_remove_rounded()),
      false
    );
    this._text = this._body.appendChild(document.createElement("span"));
    this._valueBox = this._text.appendChild(document.createElement("span"));
    this._valueBox.setAttribute("tabindex", "-1");
    this._valueBox.contentEditable = "true";
    this._valueBox.textContent = NoValueText;
    this._text.appendChild(this._unit);
    this._iconInc = this._stepper_func(
      this._body.appendChild(material_content_add_rounded()),
      true
    );
    this._legend = this._text.appendChild(document.createElement("span"));
    this._legend.append(this._minLegend, this._maxLegend);

    let dragBlocker = false;

    this._valueBox.onfocus = async () => {
      dragBlocker = true;
      if (this._valueBox.textContent === NoValueText) {
        this._valueBox.textContent = "";
      }
    };
    this._valueBox.onblur = async () => {
      dragBlocker = false;
      setTimeout(() => {
        this._set_value_validate(
          parseFloat(this._valueBox.textContent?.replace(",", ".") || "") || 0,
          true
        );
      }, 0);
    };
    this._text.onpointerdown = (e) => {
      if (e.button === 0 && (e.target !== this._valueBox || !dragBlocker)) {
        e.stopPropagation();
        let initialVal = this._value || 0;
        let moving = false;
        this._text.setPointerCapture(e.pointerId);
        this._text.onpointermove = (ev) => {
          ev.stopPropagation();
          if (moving) {
            this._moveDiff(initialVal + (ev.clientX - e.clientX) / 5, false);
          } else {
            if (Math.abs(e.clientX - ev.clientX) > 5) {
              this._valueBox.contentEditable = "false";
              moving = true;
            }
          }
        };
        this._text.onpointerup = (ev) => {
          ev.stopPropagation();
          this._valueBox.contentEditable = "true";
          if (!moving && e.target !== this._valueBox) {
            if (this._valueBox.textContent === NoValueText) {
              this._valueBox.focus();
            } else {
              this._valueBox.focus();
              let range = document.createRange();
              range.setStartAfter(<Node>this._valueBox.firstChild);
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
          this._text.releasePointerCapture(e.pointerId);
          this._text.onpointermove = null;
          this._text.onpointerup = null;
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
            this.ownerDocument.activeElement !== this._valueBox &&
            /[\d,.-]/g.test(e.key)
          ) {
            this._valueBox.textContent = "";
            this._valueBox.focus();
          }
      }
    };
    this._valueBox.onkeydown = (e) => {
      switch (e.key) {
        case "Enter":
          this._valueBox.blur();
          return;
        case "ArrowRight":
        case "ArrowLeft":
          e.stopPropagation();
          break;
      }
    };
    this._valueBox.onbeforeinput = (e) => {
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
          this._valueBox.textContent?.includes("-")
        ) {
          e.preventDefault();
        }
      }
    };
  }

  /**Moves the value to a position by the mouse x coordinates*/
  private _moveDiff(value: number, last: boolean) {
    if (last && !this._live) {
      this._set_value_validate(this._value_apply_precision(value), true);
    } else {
      if (this._live) {
        this._set_value_validate(this._value_apply_precision(value), false);
      } else {
        this._moveValue(this._value_apply_precision(value));
      }
    }
  }

  /**Moves the slider to the given percent position*/
  private _moveValue(value: number) {
    this._valueBox.textContent = Math.min(
      Math.max(value, this._min),
      this._max
    ).toFixed(this._decimals);
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

  /**Called when value is changed */
  protected _valueUpdate(value: number) {
    this._moveValue(value);
  }

  /**Called when value cleared */
  protected _valueClear() {
    this._valueBox.textContent = NoValueText;
  }
}
define_element(Stepper);
