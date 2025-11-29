import { Listener, Value } from "@chocolatelib/value";
import { defineElement } from "@chocolatelibui/core";
import { BasicColors, FormBaseRead, FormValueOptions } from "../base";
import "./lamp.scss";

interface LampOptions extends FormValueOptions<number | boolean> {
  /**Lamp text */
  text?: string;
  /**Icon for lamp */
  icon?: SVGSVGElement;
  /**Sets the lamp colors */
  colors?: BasicColors[];
}

/**Lamp for clicking*/
export class Lamp extends FormBaseRead<number | boolean> {
  private _text: HTMLSpanElement = this._body.appendChild(
    document.createElement("span")
  );
  private _textListener: Listener<string> | undefined;
  private _icon: SVGSVGElement | undefined;
  private _colors: BasicColors[] = [];

  /**Returns the name used to define the element*/
  static elementName() {
    return "lamp";
  }

  /**Sets options for the lamp*/
  options(options: LampOptions) {
    super.options(options);
    if (options.text) {
      this.text = options.text;
    }
    if (options.icon) {
      this.icon = options.icon;
    }
    this.colors = options.colors;
    return this;
  }

  /**Gets the current text of the button*/
  get text() {
    return this._text.innerHTML;
  }
  /**Sets the current text of the button*/
  set text(value: Value<string> | string | undefined) {
    if (this._textListener) {
      this.dettachValue(this._textListener);
      delete this._textListener;
    }
    if (typeof value === "object" && value instanceof Value) {
      this._textListener = this.attachValue(value, (val) => {
        if (val) {
          this._text.innerHTML = val;
        } else {
          this._text.innerHTML = "";
        }
      });
    } else if (value) {
      this._text.innerHTML = value;
    } else {
      this._text.innerHTML = "";
    }
  }

  /**Returns current icon of lamp*/
  get icon() {
    return this._icon;
  }
  /**Changes the icon of the lamp*/
  set icon(icon: SVGSVGElement | undefined) {
    if (icon) {
      if (this._icon) {
        this._body.replaceChild(icon, this._icon);
        this._icon = icon;
      } else {
        this._icon = this._body.insertBefore(icon, this._body.firstChild);
      }
    } else if (this._icon) {
      this._body.removeChild(this._icon);
      delete this._icon;
    }
  }

  /** Sets the background color of the lamp*/
  set colors(colors: BasicColors[] | undefined) {
    if (colors instanceof Array) {
      this._colors = colors;
    } else {
      this._colors = [BasicColors.Black];
    }
  }
  /**Called when Value is changed */
  protected _ValueUpdate(value: Value<number | boolean>) {
    value;
  }
  /**Called when the form element is set to not use a Value anymore*/
  protected _ValueClear() {}
  /**Called when value is changed */
  protected _valueUpdate(value: number | boolean) {
    let color = this._colors[Number(value)];
    if (color) {
      this._body.setAttribute("color", <string>color);
    } else {
      this._body.removeAttribute("color");
    }
  }
  /**Called when value cleared */
  protected _valueClear() {
    this.removeAttribute("color");
  }
}
defineElement(Lamp);
