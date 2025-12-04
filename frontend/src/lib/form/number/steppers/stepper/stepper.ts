import { defineElement } from "@chocolatelibui/core";
import {
  material_content_add_rounded,
  material_content_remove_rounded,
} from "@chocolatelibui/icons";
import { NoValueText } from "../../../base";
import { StepperBase } from "../stepperBase";
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
    this._iconDec = this._stepperFunc(
      this._body.appendChild(material_content_remove_rounded()),
      false
    );
    this._text = this._body.appendChild(document.createElement("span"));
    this._valueBox = this._text.appendChild(document.createElement("span"));
    this._valueBox.setAttribute("tabindex", "-1");
    this._valueBox.contentEditable = "true";
    this._valueBox.textContent = NoValueText;
    this._text.appendChild(this._unit);
    this._iconInc = this._stepperFunc(
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
        this._setValueValidate(
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
      this._setValueValidate(this._valueApplyPrecision(value), true);
    } else {
      if (this._live) {
        this._setValueValidate(this._valueApplyPrecision(value), false);
      } else {
        this._moveValue(this._valueApplyPrecision(value));
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

  /**Called when value is changed */
  protected _valueUpdate(value: number) {
    this._moveValue(value);
  }

  /**Called when value cleared */
  protected _valueClear() {
    this._valueBox.textContent = NoValueText;
  }
}
defineElement(Stepper);
