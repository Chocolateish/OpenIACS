import { defineElement } from "@libBase";
import {
  alarm_enabled_background_color,
  alert_running_color,
  caution_enabled_background_color,
  element_active_color,
  element_active_inverted_color,
  element_neutral_color,
  indent_enabled_background_color,
  instrument_dynamic_color,
  normal_enabled_border_color,
  raised_enabled_background_color,
  warning_enabled_background_color,
} from "@libColors";
import { defineElementValues, rectangle } from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { InstrumentBase, type InstrumentBaseOptions } from "./common";
import "./indicator.scss";

//Override
let overwriteSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let overwriteBox = rectangle(12, 12, 24, 24, 2, "overwriteBox", 1);
overwriteSymbol.classList.add("overwriteSymbol");
overwriteSymbol.setAttribute(
  "d",
  "M7.83464 11.1665V12.8332H16.168V11.1665H7.83464ZM12.0013 3.6665C7.4013 3.6665 3.66797 7.39984 3.66797 11.9998C3.66797 16.5998 7.4013 20.3332 12.0013 20.3332C16.6013 20.3332 20.3346 16.5998 20.3346 11.9998C20.3346 7.39984 16.6013 3.6665 12.0013 3.6665ZM12.0013 18.6665C8.3263 18.6665 5.33464 15.6748 5.33464 11.9998C5.33464 8.32484 8.3263 5.33317 12.0013 5.33317C15.6763 5.33317 18.668 8.32484 18.668 11.9998C18.668 15.6748 15.6763 18.6665 12.0013 18.6665Z"
);
//Blocked
let blockedBox = rectangle(12, 12, 24, 24, 2, "blockedBox", 1);
let blockedSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
blockedSymbol.classList.add("blockedSymbol");
blockedSymbol.setAttribute(
  "d",
  "M16.9987 9.08333H16.1654V7.41667C16.1654 5.11667 14.2987 3.25 11.9987 3.25C9.6987 3.25 7.83203 5.11667 7.83203 7.41667V9.08333H6.9987C6.08203 9.08333 5.33203 9.83333 5.33203 10.75V19.0833C5.33203 20 6.08203 20.75 6.9987 20.75H16.9987C17.9154 20.75 18.6654 20 18.6654 19.0833V10.75C18.6654 9.83333 17.9154 9.08333 16.9987 9.08333ZM9.4987 7.41667C9.4987 6.03333 10.6154 4.91667 11.9987 4.91667C13.382 4.91667 14.4987 6.03333 14.4987 7.41667V9.08333H9.4987V7.41667ZM13.6654 14.9167C13.6654 15.8333 12.9154 16.5833 11.9987 16.5833C11.082 16.5833 10.332 15.8333 10.332 14.9167C10.332 14 11.082 13.25 11.9987 13.25C12.9154 13.25 13.6654 14 13.6654 14.9167Z"
);
//Alarm blocked
let alarmBlockedBox = rectangle(12, 12, 24, 24, 2, "alarmBlockedBox", 1);
let alarmBlockedSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
alarmBlockedSymbol.classList.add("alarmBlockedSymbol");
alarmBlockedSymbol.setAttribute(
  "d",
  "M18.6654 17.5752L8.53203 7.11683L6.39036 4.9085L5.33203 5.96683L7.66536 8.30016V8.3085C7.23203 9.1335 6.9987 10.1085 6.9987 11.1585V15.3252L5.33203 16.9918V17.8252H16.7737L18.4404 19.4918L19.4987 18.4335L18.6654 17.5752ZM11.9987 20.3335C12.9237 20.3335 13.6654 19.5918 13.6654 18.6668H10.332C10.332 19.5918 11.0737 20.3335 11.9987 20.3335ZM16.9987 14.2335V11.1668C16.9987 8.60016 15.632 6.46683 13.2487 5.90016V5.3335C13.2487 4.64183 12.6904 4.0835 11.9987 4.0835C11.307 4.0835 10.7487 4.64183 10.7487 5.3335V5.90016C10.6237 5.92516 10.507 5.96683 10.3987 6.00016C10.3154 6.02516 10.232 6.0585 10.1487 6.09183H10.1404C10.132 6.09183 10.132 6.09183 10.1237 6.10016C9.93203 6.17516 9.74036 6.26683 9.55703 6.3585C9.55703 6.3585 9.5487 6.3585 9.5487 6.36683L16.9987 14.2335Z"
);
//Alarm
let alarmBox = document.createElementNS("http://www.w3.org/2000/svg", "path");
let alarmSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
alarmBox.classList.add("alarmBox");
alarmBox.setAttribute(
  "d",
  "M0.763077 20.5374C0.415721 21.2032 0.89873 22 1.64966 22H22.3503C23.1013 22 23.5843 21.2032 23.2369 20.5374L12.8866 0.699286C12.5127 -0.017293 11.4873 -0.0172909 11.1134 0.699288L0.763077 20.5374Z"
);
alarmSymbol.classList.add("alarmSymbol");
alarmSymbol.setAttribute("d", "M10 14H14V5H10V14ZM10 20H14V16H10V20Z");
//Signal failure
let signalFailure1 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let signalFailure2 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let signalFailure3 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let signalFailure4 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let signalFailure5 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
signalFailure1.classList.add("signalFailure1");
signalFailure1.setAttribute(
  "d",
  "M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
);
signalFailure2.classList.add("signalFailure2");
signalFailure2.setAttribute(
  "d",
  "M23.5 12C23.5 18.3513 18.3513 23.5 12 23.5C5.64873 23.5 0.5 18.3513 0.5 12C0.5 5.64873 5.64873 0.5 12 0.5C18.3513 0.5 23.5 5.64873 23.5 12Z"
);
signalFailure3.classList.add("signalFailure3");
signalFailure3.setAttribute(
  "d",
  "M7.63203 15.4982C6.7237 14.6071 6.16536 13.3695 6.16536 11.9998C6.16536 10.6302 6.7237 9.39258 7.63203 8.50149L8.81536 9.67311C8.20703 10.2672 7.83203 11.0922 7.83203 11.9998C7.83203 12.9074 8.20703 13.7325 8.80703 14.3348L7.63203 15.4982ZM16.3654 15.4982C17.2737 14.6071 17.832 13.3695 17.832 11.9998C17.832 10.6302 17.2737 9.39258 16.3654 8.50149L15.182 9.67311C15.7904 10.2672 16.1654 11.0922 16.1654 11.9998C16.1654 12.9074 15.7904 13.7325 15.1904 14.3348L16.3654 15.4982ZM19.4987 11.9998C19.4987 13.8233 18.7487 15.4734 17.5404 16.6616L18.7237 17.8332C20.232 16.3398 21.1654 14.2771 21.1654 11.9998C21.1654 9.72261 20.232 7.6599 18.7237 6.1665L17.5404 7.33812C18.7487 8.52624 19.4987 10.1764 19.4987 11.9998ZM6.45703 7.33812L5.2737 6.1665C3.76536 7.6599 2.83203 9.72261 2.83203 11.9998C2.83203 14.2771 3.76536 16.3398 5.2737 17.8332L6.45703 16.6616C5.2487 15.4734 4.4987 13.8233 4.4987 11.9998C4.4987 10.1764 5.2487 8.52624 6.45703 7.33812Z"
);
signalFailure4.classList.add("signalFailure4");
signalFailure4.setAttribute(
  "d",
  "M11.9987 18.6668C12.9192 18.6668 13.6654 17.9206 13.6654 17.0002C13.6654 16.0797 12.9192 15.3335 11.9987 15.3335C11.0782 15.3335 10.332 16.0797 10.332 17.0002C10.332 17.9206 11.0782 18.6668 11.9987 18.6668Z"
);
signalFailure5.classList.add("signalFailure5");
signalFailure5.setAttribute(
  "d",
  "M10.332 5.3335H13.6654V14.5002H10.332V5.3335Z"
);
//Auto
let autoSymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
let autoBox = rectangle(12, 12, 24, 24, 2, "autoBox", 1);
autoSymbol.classList.add("autoSymbol");
autoSymbol.setAttribute(
  "d",
  "M5 19L10 5H10.0007H13.5H13.5007L19.0007 19H15.5007L14.3221 16H9.57143L8.5 19H5ZM10.6429 13H13.1435L11.8337 9.66575L10.6429 13Z"
);
//Manuel
let manuelSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let manuelBox = rectangle(12, 12, 24, 24, 2, "manuelBox", 1);
manuelSymbol.classList.add("manuelSymbol");
manuelSymbol.setAttribute(
  "d",
  "M7 5L4 19H7.5546L8.90058 12.6023L10.5 19H13.5L15.1154 12.5385L16.5 19H20L17 5H13.5L12 12L10.5 5H7Z"
);
//Local
let localSymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let localBox = rectangle(12, 12, 24, 24, 2, "localBox", 1);
localSymbol.classList.add("localSymbol");
localSymbol.setAttribute("d", "M6 4V16V20H10L18 20V16H10V4H6Z");
//Manual only
let manualOnlySymbol = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let manualOnlyBox = rectangle(12, 12, 24, 24, 2, "manualOnlyBox", 1);
manualOnlySymbol.classList.add("manualOnlySymbol");
manualOnlySymbol.setAttribute(
  "d",
  "M7 5L4 19H7.5546L8.90058 12.6023L10.5 19H13.5L15.1154 12.5385L16.5 19H20L17 5H13.5L12 12L10.5 5H7Z"
);
//Duty
let dutySymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
let dutyBox = rectangle(12, 12, 24, 24, 2, "dutyBox", 1);
dutySymbol.classList.add("dutySymbol");
dutySymbol.setAttribute("d", "M14 19H10V5H14V19Z");
//Standby
let standbySymbol1 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let standbySymbol2 = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
let standbyBox = rectangle(12, 12, 24, 24, 2, "standbyBox", 1);
standbySymbol1.classList.add("standbySymbol");
standbySymbol2.classList.add("standbySymbol");
standbySymbol1.setAttribute("d", "M10 19H6V5H10V19Z");
standbySymbol2.setAttribute("d", "M18 19H14V5H18V19Z");

addThemeVariable(
  "ElementNeutralColor",
  ["Instruments", "Button"],
  element_neutral_color.day,
  element_neutral_color.dusk
);
addThemeVariable(
  "alertRunningColor",
  ["Instruments", "Button"],
  alert_running_color.day,
  alert_running_color.dusk
);
addThemeVariable(
  "ElementActiveColor",
  ["Instruments", "Button"],
  element_active_color.day,
  element_active_color.dusk
);
addThemeVariable(
  "NormalEnabledBorderColor",
  ["Instruments", "Button"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);
addThemeVariable(
  "CautionEnabledBackgroundColor",
  ["Instruments", "Button"],
  caution_enabled_background_color.day,
  caution_enabled_background_color.dusk
);
addThemeVariable(
  "RaisedEnabledBackgroundColor",
  ["Instruments", "Button"],
  raised_enabled_background_color.day,
  raised_enabled_background_color.dusk
);
addThemeVariable(
  "ElementActiveInvertedColor",
  ["Instruments", "Button"],
  element_active_inverted_color.day,
  element_active_inverted_color.dusk
);
addThemeVariable(
  "InstrumentDynamicColor",
  ["Instruments", "Button"],
  instrument_dynamic_color.day,
  instrument_dynamic_color.dusk
);
addThemeVariable(
  "WarningEnabledBackgroundColor",
  ["Instruments", "Button"],
  warning_enabled_background_color.day,
  warning_enabled_background_color.dusk
);
addThemeVariable(
  "AlarmEnabledBackgroundColor",
  ["Instruments", "Button"],
  alarm_enabled_background_color.day,
  alarm_enabled_background_color.dusk
);
addThemeVariable(
  "IndentEnabledBackgroundColor",
  ["Instruments", "Button"],
  indent_enabled_background_color.day,
  indent_enabled_background_color.dusk
);

/**List of all possible indicators*/
export let InstrIndicatorTypes = {
  OVERRIDE: 0,
  BLOCKED: 1,
  ALARMBLOCKED: 2,
  ALARM: 3,
  SIGNALFAILURE: 4,
  AUTO: 5,
  MANUEL: 6,
  LOCAL: 7,
  MANUELONLY: 8,
  DUTY: 9,
  STANDBY: 10,
};

export type InstrIndicatorTypes = number;

/**Defines options for indicator instrument*/
type InstrIndicatorOptions = {
  /**which indicator to use */
  type?: string;
  /**value */
  value?: boolean;
} & InstrumentBaseOptions;

export class InstrIndicator extends InstrumentBase<InstrIndicatorOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "indicator";
  }

  private ___invalid: boolean = true;
  constructor() {
    super();
    this.classList.add("invalid");
  }

  /**Options toggeler*/
  options(options: InstrIndicatorOptions): this {
    super.options(options);
    if (typeof options.type === "number") this.type = options.type;
    if (typeof options.value !== "undefined") this.value = options.value;
    return this;
  }

  /**Original width of rendered graphics*/
  get renderWidth(): number {
    return 24;
  }
  /**Original height of rendered graphics*/
  get renderHeight(): number {
    return 24;
  }

  private __overwrite() {
    this.__svg.appendChild(overwriteBox.cloneNode(true));
    this.__svg.appendChild(overwriteSymbol.cloneNode(true));
  }
  private __blocked() {
    this.__svg.appendChild(blockedBox.cloneNode(true));
    this.__svg.appendChild(blockedSymbol.cloneNode(true));
  }
  private __alarmBlocked() {
    this.__svg.appendChild(alarmBlockedBox.cloneNode(true));
    this.__svg.appendChild(alarmBlockedSymbol.cloneNode(true));
  }
  private __alarm() {
    this.__svg.appendChild(alarmBox.cloneNode(true));
    this.__svg.appendChild(alarmSymbol.cloneNode(true));
  }
  private __signalFailure() {
    this.__svg.appendChild(signalFailure1.cloneNode(true));
    this.__svg.appendChild(signalFailure2.cloneNode(true));
    this.__svg.appendChild(signalFailure3.cloneNode(true));
    this.__svg.appendChild(signalFailure4.cloneNode(true));
    this.__svg.appendChild(signalFailure5.cloneNode(true));
  }
  private __auto() {
    this.__svg.appendChild(autoBox.cloneNode(true));
    this.__svg.appendChild(autoSymbol.cloneNode(true));
  }
  private __manuel() {
    this.__svg.appendChild(manuelBox.cloneNode(true));
    this.__svg.appendChild(manuelSymbol.cloneNode(true));
  }
  private __local() {
    this.__svg.appendChild(localBox.cloneNode(true));
    this.__svg.appendChild(localSymbol.cloneNode(true));
  }
  private __manualOnly() {
    this.__svg.appendChild(manualOnlyBox.cloneNode(true));
    this.__svg.appendChild(manualOnlySymbol.cloneNode(true));
  }
  private __duty() {
    this.__svg.appendChild(dutyBox.cloneNode(true));
    this.__svg.appendChild(dutySymbol.cloneNode(true));
  }
  private __standby() {
    this.__svg.appendChild(standbyBox.cloneNode(true));
    this.__svg.appendChild(standbySymbol1.cloneNode(true));
    this.__svg.appendChild(standbySymbol2.cloneNode(true));
  }

  set type(type: InstrIndicatorTypes) {
    switch (type) {
      case InstrIndicatorTypes.OVERRIDE: {
        this.__overwrite();
        break;
      }
      case InstrIndicatorTypes.BLOCKED: {
        this.__blocked();
        break;
      }
      case InstrIndicatorTypes.ALARMBLOCKED: {
        this.__alarmBlocked();
        break;
      }
      case InstrIndicatorTypes.ALARM: {
        this.__alarm();
        break;
      }
      case InstrIndicatorTypes.SIGNALFAILURE: {
        this.__signalFailure();
        break;
      }
      case InstrIndicatorTypes.AUTO: {
        this.__auto();
        break;
      }
      case InstrIndicatorTypes.MANUEL: {
        this.__manuel();
        break;
      }
      case InstrIndicatorTypes.LOCAL: {
        this.__local();
        break;
      }
      case InstrIndicatorTypes.MANUELONLY: {
        this.__manualOnly();
        break;
      }
      case InstrIndicatorTypes.DUTY: {
        this.__duty();
        break;
      }
      case InstrIndicatorTypes.STANDBY: {
        this.__standby();
        break;
      }
    }
  }

  set value(val: boolean) {
    val;
  }

  get value(): boolean {
    return false;
  }

  protected $vfvalue(value: boolean) {
    if (typeof value === "object") {
      this.classList.add("invalid");
      this.___invalid = true;
    } else {
      if (value) {
        this.__svg.classList.remove("hide");
      } else {
        this.__svg.classList.add("hide");
      }
      if (this.___invalid) {
        this.classList.remove("invalid");
        this.___invalid = false;
      }
    }
  }
}
defineElement(InstrIndicator);
defineElementValues(InstrIndicator, ["value"]);
