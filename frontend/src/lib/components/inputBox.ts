import { AccessTypes, defineElement } from "@libBase";
import { edit_calendar, schedule } from "@libOldIcons";
import { stringByteLength } from "@libString";
import { ValueComponent, type ValueComponentOptions } from "./common";
import "./inputBox.scss";

/**List of all available types for the input box*/
export const InputBoxTypes = {
  BASE64: "base64",
  ASCII: "ascii",
  DATE: "date",
  TIMEMINUTE: "timemin",
  TIMESECOND: "timesec",
  DATETIMEMINUTE: "dtmin",
  DATETIMESECOND: "dtsec",
  TEXT: "text",
  NUMBER: "number",
  NUMBERPOSITIVE: "numberPositive",
  NUMBERWHOLE: "numberWhole",
  NUMBERWHOLEPOSITIVE: "numberWholePositive",
  TEL: "tel",
  EMAIL: "email",
  PASSCODE: "passcode",
  PASSWORD: "password",
  IP: "ip",
  COLOR: "color",
  File: "file",
  URL: "url",
} as const;
export type InputBoxTypes = (typeof InputBoxTypes)[keyof typeof InputBoxTypes];

/**Defines options for inputBox component*/
export type InputBoxOptions = {
  /**unit to use for component */
  unit?: string;
  /**lower limit for number values */
  min?: number;
  /**upper limit for number values */
  max?: number;
  /**text to display when nothing is entered */
  placeholder?: string;
  /**type of value to process */
  type: InputBoxTypes;
  /**max length of text */
  length?: number;
  /**max byte length of text */
  byteLength?: number;
} & ValueComponentOptions;

/**Input box, for inputting values*/
export class InputBox extends ValueComponent<InputBoxOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "input-box";
  }

  private __cont = this.appendChild(document.createElement("div"));
  private __input = this.__cont.appendChild(document.createElement("input"));
  private __unit = this.__cont.appendChild(document.createElement("div"));
  private __min = -Infinity;
  private __max = Infinity;
  private ___lastValue = "";
  private __text?: HTMLSpanElement;
  private ___byteMax?: number;
  private ___maxLength?: number;
  private __type?: InputBoxTypes;
  private __icon: any;

  constructor() {
    super();
    this.__unit.appendChild(document.createTextNode(""));

    let reset = 0;
    this.__input.onblur = (ev) => {
      if (reset >= 1) {
        if (reset >= 2) {
          if (ev.relatedTarget) {
            (ev.relatedTarget as HTMLElement).focus();
          }
          reset = 0;
          this.__input.value = String(this.__valueBuffer || "");
        } else {
          reset++;
        }
      } else {
        reset = 0;
      }
    };

    this.__input.onchange = (ev) => {
      ev.stopPropagation();
      let val = (this.__input.value = this.___limit(this.__input.value));
      let res = this.___update(val);
      if (res) {
        this.__input.setCustomValidity(res);
        this.__input.reportValidity();
        reset = 1;
      } else {
        this.__input.setCustomValidity("");
        this.__setValue(val);
        reset = 0;
      }
    };

    this.__input.onkeydown = (ev) => {
      if (ev.key === "Enter") {
        let val = (this.__input.value = this.___limit(this.__input.value));
        let res = this.___update(val);
        if (res) {
          this.__input.setCustomValidity(res);
          this.__input.reportValidity();
          reset = 1;
        } else {
          this.__input.setCustomValidity("");
          this.__setValue(val);
          reset = 0;
        }
      }
    };

    this.__input.addEventListener("wheel", (ev) => {
      if (this.ownerDocument.activeElement === this.__input) {
        ev.stopPropagation();
        ev.preventDefault();
        this.___wheel(ev.deltaY < 0);
      }
    });

    this.__input.addEventListener("beforeinput", (ev) => {
      ev.stopPropagation();
      let res;
      switch (ev.inputType) {
        case "insertLineBreak":
        case "deleteContentBackward":
        case "deleteContentForward":
        case "deleteWordBackward":
        case "deleteWordForward": {
          break;
        }
        case "insertFromPaste":
        case "insertText": {
          res = this.___insertText(ev, ev.data || "");
          break;
        }
        default: {
          ev.preventDefault();
          break;
        }
      }
      if (res) {
        this.__input.setCustomValidity(res);
        this.__input.reportValidity();
      } else {
        this.__input.setCustomValidity("");
      }
    });

    this.__input.addEventListener("input", () => {
      let res = this.___input(
        this.__input.value,
        this.__input.selectionStart,
        this.__input.selectionEnd
      );
      this.___lastValue = this.__input.value;
      if (res) {
        console.warn(res);
        this.__input.setCustomValidity(res);
        this.__input.reportValidity();
      } else {
        this.__input.setCustomValidity("");
      }
    });
  }

  /**Options toggeler*/
  options(options: InputBoxOptions): this {
    super.options(options);
    if (options.type) this.type = options.type;
    if (typeof options.unit !== "undefined") this.unit = options.unit;
    if (typeof options.min === "number") this.min = options.min;
    if (typeof options.max === "number") this.max = options.max;
    if (options.placeholder) this.placeholder = options.placeholder;
    if (typeof options.length === "number") this.length = options.length;
    if (typeof options.byteLength === "number")
      this.byteLength = options.byteLength;
    return this;
  }

  /**Method to focus input box */
  focus() {
    this.__input.focus();
  }

  /**Sets the minimum value for input, only works with some types*/
  set min(val: number) {
    switch (typeof val) {
      case "number": {
        if (val === val) {
          this.__min = val;
        }
        break;
      }
      case "undefined":
        this.__min = -Infinity;
        break;
      default:
        console.warn("None number passed");
        break;
    }
  }

  /**Sets the maximum value for input, only works with some types*/
  set max(val: number) {
    switch (typeof val) {
      case "number": {
        if (val === val) {
          this.__max = val;
        }
        break;
      }
      case "undefined":
        this.__max = Infinity;
        break;
      default:
        console.warn("None number passed");
        break;
    }
  }

  /**Changes the text of the input box*/
  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.__cont
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**Changes the placeholder text of the box*/
  set placeholder(text: string) {
    this.__input.placeholder = text;
  }

  /**Sets the max lenght of the text*/
  set length(len: number | undefined) {
    if (typeof len === "number") {
      this.___maxLength = len;
    } else {
      delete this.___maxLength;
    }
  }

  /**Sets the max byte lenght of the text*/
  set byteLength(len: number | undefined) {
    if (typeof len === "number") {
      this.___byteMax = len;
    } else {
      delete this.___byteMax;
    }
  }

  /**Sets which filetypes are allowed, using mime types*/
  set fileTypes(types: string[] | undefined) {
    if (types instanceof Array) {
      this.__input.accept = types.join(",");
    } else {
      this.__input.accept = "";
    }
  }

  /**Internal access call*/
  __onAccess(a: AccessTypes) {
    switch (a) {
      case AccessTypes.READ:
        this.__input.setAttribute("readonly", "");
        break;
      case AccessTypes.WRITE:
        this.__input.removeAttribute("readonly");
        break;
    }
  }

  /**Internal value setter*/
  __newValue(val: any) {
    this.__input.value = String(val);
    this.___lastValue = this.__input.value;
  }

  /**Sets the unit of the inputbox*/
  set unit(_unit: string | undefined) {}

  /**Returns the current unit*/
  get unit() {
    return "";
  }

  /**Internal unit setter*/
  //@ts-expect-error
  private $vfunit(val: string) {
    this.__unit.firstChild!.nodeValue = val;
  }

  /** This sets the type of the input box*/
  set type(type: InputBoxTypes) {
    switch (this.__type) {
      case InputBoxTypes.DATE:
      case InputBoxTypes.TIMEMINUTE:
      case InputBoxTypes.TIMESECOND:
      case InputBoxTypes.DATETIMEMINUTE:
      case InputBoxTypes.DATETIMESECOND:
        this.__cont.removeChild(this.__icon);
        break;
    }
    switch (type) {
      case InputBoxTypes.IP:
      case InputBoxTypes.TEXT:
      case InputBoxTypes.ASCII:
      case InputBoxTypes.URL:
      case InputBoxTypes.BASE64: {
        this.__input.type = "text";
        break;
      }
      case InputBoxTypes.DATE:
        this.__input.type = "date";
        (this.__icon = this.__cont.insertBefore(
          edit_calendar(),
          this.__unit
        )).onclick = () => {
          this.__input.showPicker();
        };
        break;
      //@ts-expect-error
      case InputBoxTypes.TIMESECOND:
        this.__input.step = "1";
      case InputBoxTypes.TIMEMINUTE:
        this.__input.type = "time";
        (this.__icon = this.__cont.insertBefore(
          schedule(),
          this.__unit
        )).onclick = () => {
          this.__input.showPicker();
        };
        break;
      //@ts-expect-error
      case InputBoxTypes.DATETIMESECOND:
        this.__input.step = "1";
      case InputBoxTypes.DATETIMEMINUTE:
        this.__input.type = "datetime-local";
        (this.__icon = this.__cont.insertBefore(
          edit_calendar(),
          this.__unit
        )).onclick = () => {
          this.__input.showPicker();
        };
        break;
      case InputBoxTypes.EMAIL: {
        this.__input.type = "email";
        break;
      }
      case InputBoxTypes.NUMBER:
      case InputBoxTypes.NUMBERPOSITIVE:
      case InputBoxTypes.NUMBERWHOLE:
      case InputBoxTypes.NUMBERWHOLEPOSITIVE: {
        this.__input.type = "number";
        break;
      }
      case InputBoxTypes.PASSCODE:
      case InputBoxTypes.PASSWORD: {
        this.__input.type = "password";
        break;
      }
      case InputBoxTypes.TEL: {
        this.__input.type = "tel";
        break;
      }
      case InputBoxTypes.COLOR: {
        this.__input.type = "color";
        break;
      }
      case InputBoxTypes.File: {
        this.__input.type = "file";
        break;
      }
      default:
        console.warn("Invalid inputbox type");
        return;
    }
    this.__type = type;
  }

  /**Updates internal variables*/
  private ___limit(val: any): any {
    switch (this.__type) {
      case InputBoxTypes.NUMBER:
      case InputBoxTypes.NUMBERPOSITIVE:
      case InputBoxTypes.NUMBERWHOLE:
      case InputBoxTypes.NUMBERWHOLEPOSITIVE:
        return Math.min(this.__max, Math.max(this.__min, val));
      default:
        return val;
    }
  }

  /**Updates internal variables*/
  private ___update(val: any): any {
    switch (this.__type) {
      case InputBoxTypes.BASE64: {
        try {
          window.atob(val);
          return;
        } catch (e) {
          return "Invalid base 64";
        }
      }
      case InputBoxTypes.URL: {
        try {
          new URL(val);
        } catch (e) {
          return "Invalid URL";
        }
        break;
      }
      case InputBoxTypes.IP: {
        if (!/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/g.test(val)) {
          return "Invalid IP Address";
        }
      }
    }
  }

  /**Called when new data is entered */
  private ___input(
    val: string,
    _start: number | null,
    _end: number | null
  ): string | false {
    switch (this.__type) {
      case InputBoxTypes.BASE64:
      case InputBoxTypes.ASCII:
      case InputBoxTypes.TEXT:
      case InputBoxTypes.EMAIL:
      case InputBoxTypes.TEL:
      case InputBoxTypes.PASSCODE:
      case InputBoxTypes.PASSWORD: {
        let bytes = stringByteLength(val);
        if (this.___byteMax! > 0 && bytes > this.___byteMax!) {
          this.__input.value = this.___lastValue;
          return "Maximum of " + this.___byteMax + " bytes";
        }
        if (this.___maxLength! > 0 && val.length > this.___maxLength!) {
          this.__input.value = this.___lastValue;
          return "Maximum of " + this.___maxLength + " characters";
        }
        break;
      }
      case InputBoxTypes.IP: {
        let parts = val.split(".");
        for (let i = 0; i < parts.length; i++) {
          let part = parseInt(parts[i]);
          if (i < parts.length - 1 || i == 3) {
            if (part > 255) {
              parts[i] = "255";
              continue;
            }
          } else {
            if (parts[i].length > 3 && i == parts.length - 1) {
              parts[i + 1] = parts[i].substring(3);
              parts[i] = parts[i].substring(0, 3);
              continue;
            }
            if (part > 255) {
              parts[i + 1] = parts[i].substring(2);
              parts[i] = parts[i].substring(0, 2);
              continue;
            }
          }
        }
        parts.length = Math.min(parts.length, 4);
        this.__input.value = parts.join(".");
        break;
      }
    }
    return false;
  }

  /**Method handling newly added text*/
  private ___insertText(ev: InputEvent, text: string): string | false {
    switch (this.__type) {
      case InputBoxTypes.BASE64:
        if (text.search(/[^-A-Za-z0-9+/=]|=[^=]|={3,}$/gm) !== -1) {
          ev.preventDefault();
          return text + " is not valid BASE64";
        }
        break;
      case InputBoxTypes.ASCII:
        if (text.search(/[^ -~]/g) !== -1) {
          ev.preventDefault();
          return text + " is not valid ASCII";
        }
        break;
      case InputBoxTypes.IP:
        if (text.search(/[^\d\.]/g) !== -1) {
          ev.preventDefault();
          return text + " is not valid for and IP address";
        }
        break;
      case InputBoxTypes.NUMBERPOSITIVE:
        if (text.search(/[^\d\.,]/g) !== -1) {
          ev.preventDefault();
          return "Only positive numbers allowed";
        }
        break;
      case InputBoxTypes.NUMBERWHOLE:
        if (text.search(/[^-\d]/g) !== -1) {
          ev.preventDefault();
          return "Only whole numbers allowed";
        }
        break;
      case InputBoxTypes.NUMBERWHOLEPOSITIVE:
        if (text.search(/[^\d]/g) !== -1) {
          ev.preventDefault();
          return "Only whole positive numbers allowed";
        }
        break;
      case InputBoxTypes.PASSCODE:
        if (text.search(/[^\d]/g) !== -1) {
          ev.preventDefault();
        }
        break;
      case InputBoxTypes.TEL: {
        if (text.search(/[^\+\d]/g) !== -1) {
          ev.preventDefault();
          return text + " is not valid for a phone number";
        }
        break;
      }
      case InputBoxTypes.URL: {
        if (
          text.search(
            /[^A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=%]|%([^0-9A-F]{2}|[^0-9A-F][0-9A-F]|[0-9A-F][^0-9A-F])/g
          ) !== -1
        ) {
          ev.preventDefault();
          return text + " is not valid for a URL";
        }
        break;
      }
      default:
        return false;
    }
    return false;
  }

  /**Method handling newly added text*/
  private ___wheel(way: boolean) {
    switch (this.__type) {
      case InputBoxTypes.NUMBER:
      case InputBoxTypes.NUMBERPOSITIVE:
      case InputBoxTypes.NUMBERWHOLE:
      case InputBoxTypes.NUMBERWHOLEPOSITIVE:
        let old = Number(this.__valueBuffer);
        if (old !== old) {
          old = 0;
        }
        this.__setValue(way ? old + 1 : old - 1);
        break;
    }
  }

  /**Returns the inputbox type used*/
  get type(): InputBoxTypes {
    return this.__type || InputBoxTypes.TEXT;
  }
}
defineElement(InputBox);
