import { AccessTypes, defineElement } from "@libBase";
import {
  DropDown,
  InputBox,
  InputBoxTypes,
  ValueComponent,
  type ValueComponentOptions,
} from "@libComponents";
import { ModuleValueAccessEnum, type ModuleManagerBase } from "@modCommon";
import { Module } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import "./automationOutputSignal.scss";
import { ModuleSelectorOpener } from "./moduleSelector";

/**Defines options for the module selector component*/
export type AutomationOutputSignalOptions = {
  /**The manager to use if only an id is passed */
  manager: ModuleManagerBase;
} & ValueComponentOptions;

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

export class AutomationOutputSignal extends ValueComponent<AutomationOutputSignalOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "automation-output-signal";
  }

  static elementNameSpace() {
    return "lmui";
  }

  private __container = this.appendChild(document.createElement("div"));
  private __selector = this.__container.appendChild(
    new ModuleSelectorOpener().options({
      text: "Value Selection",
      uidMode: true,
      filter: filter,
    })
  );
  private __mode = this.__container.appendChild(
    new DropDown().options({
      text: "Mode",
      options: [
        { text: "Fixed On", value: 0 },
        { text: "Fixed Off", value: 1 },
        { text: "On Pulse", value: 2 },
        { text: "Off Pulse", value: 3 },
        { text: "On Until Feedback Changes", value: 4 },
        { text: "Off Until Feedback Changes", value: 5 },
      ],
      value: 0,
      change: (val) => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, mode: val });
        this.__update();
      },
    })
  );
  private __time = this.__container.appendChild(
    new InputBox().options({
      text: "Pulse time",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      unit: "ms",
      min: 0,
      max: 65535,
      change: (val) => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, time: val });
      },
    })
  );
  private __text?: HTMLSpanElement;

  constructor() {
    super();
    //@ts-expect-error
    this.__selector.__setValue = (val) => {
      //@ts-expect-error
      this.__setValue({ ...this.__valueBuffer, uid: val });
    };
    //@ts-expect-error
    this.__mode.__setValue = (val) => {
      //@ts-expect-error
      this.__setValue({ ...this.__valueBuffer, mode: val });
      this.__update();
    };
    //@ts-expect-error
    this.__container.__setValue = (val) => {
      //@ts-expect-error
      this.__setValue({ ...this.__valueBuffer, time: val });
    };
    this.__update();
  }

  __update() {
    switch (this.__mode.value) {
      case 2:
      case 3:
        this.__time.access = AccessTypes.WRITE;
        break;
      default:
        this.__time.access = AccessTypes.NONE;
        break;
    }
  }

  /**Options toggeler*/
  options(options: AutomationOutputSignalOptions): this {
    super.options(options);
    if (typeof options.manager !== "undefined") this.manager = options.manager;
    return this;
  }

  /**Sets the default manager to select with*/
  set manager(man: ModuleManagerBase) {
    this.__selector.manager = man;
  }

  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.firstChild
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }

  /**This is called when the user sets the value*/
  //@ts-expect-error
  protected __newValue(val: Module) {
    if (typeof val === "object") {
      //@ts-expect-error
      if (typeof val.mode !== "undefined") {
        //@ts-expect-error
        this.__mode.value = val.mode;
      }
      if (typeof val.uid !== "undefined") {
        this.__selector.value = val.uid;
      }
      //@ts-expect-error
      if (typeof val.time !== "undefined") {
        //@ts-expect-error
        this.__time.value = val.time;
      }
    }
  }
}
defineElement(AutomationOutputSignal);
