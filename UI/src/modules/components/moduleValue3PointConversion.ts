import { AccessTypes, defineElement } from "@libBase";
import { defineElementValues } from "@libCommon";
import {
  Button,
  InputBox,
  InputBoxTypes,
  Slider,
  ValueComponent,
  type ValueComponentOptions,
} from "@libComponents";
import { ModuleValueAccessEnum, type ModuleManagerBase } from "@modCommon";
import { Module } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ModuleSelectorOpener } from "./moduleSelector";
import "./moduleValue3PointConversion.scss";

/**Defines options for the module selector component*/
export type ModuleValue3PointConversionOptions = {
  /**the manager to use if only an id is passed*/
  manager: ModuleManagerBase;
  /**minimum value for conversion*/
  min: number;
  /**middle value for conversion*/
  mid: number;
  /**maximum value for conversion*/
  max: number;
  /**unit for converted value*/
  unit: string;
  /**false means only input is needed true means output is needed*/
  inOut: boolean;
  /**mode where only two points are used*/
  twoMode: boolean;
} & ValueComponentOptions;

let filterIn = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});
let filterOut = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

export class ModuleValue3PointConversion extends ValueComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-value-3-point-conversion";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __container = this.appendChild(document.createElement("div"));
  private __selector: ModuleSelectorOpener;
  private __valueShow: Slider;
  private __container2: HTMLDivElement;
  private __containerMin: HTMLDivElement;
  private __minButt: Button;
  private __min: InputBox;
  private __containerMid: HTMLDivElement;
  private __midButt: Button;
  private __mid: InputBox;
  private __containerMax: HTMLDivElement;
  private __maxButt: Button;
  private __max: InputBox;
  private __minY: number;
  private __midY: number;
  private __maxY: number;
  private __manager?: ModuleManagerBase;
  private __text?: HTMLSpanElement;

  constructor(options: ModuleValue3PointConversionOptions) {
    super();
    this.__selector = new ModuleSelectorOpener().options({
      text: "Value Selection",
      uidMode: true,
      filter: options.inOut ? filterOut : filterIn,
    });
    //@ts-expect-error
    this.__selector.__setValue = (val) => {
      //@ts-expect-error
      this.__setValue({ ...this.__valueBuffer, uid: val });
    };
    this.__container.appendChild(this.__selector);
    this.__valueShow = new Slider().options({
      text: "Converted Value",
      access: options.inOut ? AccessTypes.NONE : AccessTypes.READ,
      min: options.min,
      max: options.max,
      unit: options.unit || "%",
    });
    this.__container.appendChild(this.__valueShow);

    this.__container2 = document.createElement("div");
    this.__container.appendChild(this.__container2);

    this.__containerMin = document.createElement("div");
    this.__container2.appendChild(this.__containerMin);
    this.__minButt = new Button().options({
      text: "Set Min",
      click: () => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, min: this.$vbmodule });
      },
    });
    this.__containerMin.appendChild(this.__minButt);
    this.__min = new InputBox().options({
      type: InputBoxTypes.NUMBER,
      change: (val) => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, min: val });
      },
    });
    this.__containerMin.appendChild(this.__min);

    this.__containerMid = document.createElement("div");
    this.__container2.appendChild(this.__containerMid);
    this.__midButt = new Button().options({
      text: "Set Mid",
      click: () => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, mid: this.$vbmodule });
      },
    });
    this.__containerMid.appendChild(this.__midButt);
    this.__mid = new InputBox().options({
      type: InputBoxTypes.NUMBER,
      change: (val) => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, mid: val });
      },
    });
    this.__containerMid.appendChild(this.__mid);

    this.__containerMax = document.createElement("div");
    this.__container2.appendChild(this.__containerMax);
    this.__maxButt = new Button().options({
      text: "Set Max",
      click: () => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, max: this.$vbmodule });
      },
    });
    this.__containerMax.appendChild(this.__maxButt);
    this.__max = new InputBox().options({
      type: InputBoxTypes.NUMBER,
      change: (val) => {
        //@ts-expect-error
        this.__setValue({ ...this.__valueBuffer, max: val });
      },
    });
    this.__containerMax.appendChild(this.__max);

    this.__minY = options.min;
    this.__midY = options.mid;
    this.__maxY = options.max;
  }

  /**Options toggeler*/
  options(options: ModuleValue3PointConversionOptions): this {
    super.options(options);
    if (typeof options.manager !== "undefined") this.manager = options.manager;

    if (typeof options.twoMode === "boolean") this.twoMode = options.twoMode;
    return this;
  }

  /**Sets the default manager to select with*/
  set manager(man: ModuleManagerBase) {
    this.__manager = man;
    this.__selector.manager = man;
  }

  /**Toggle if the 3 point conversion should only show 2 points*/
  set twoMode(mode: boolean) {
    if (mode) {
      this.__containerMin.classList.add("h");
      this.__midButt.text = "Set Min";
    } else {
      this.__containerMin.classList.remove("h");
      this.__midButt.text = "Set Mid";
    }
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
      if (typeof val.uid !== "undefined") {
        this.__selector.value = val.uid;
        //@ts-expect-error
        let mod = this.__manager.getModuleByUID(val.uid);
        if (mod) {
          //@ts-expect-error
          this.module = mod.value;
          this.__min.unit = mod.unit;
          this.__mid.unit = mod.unit;
          this.__max.unit = mod.unit;
        }
      }
      //@ts-expect-error
      if (typeof val.min !== "undefined") {
        //@ts-expect-error
        this.__min.value = val.min;
      }
      //@ts-expect-error
      if (typeof val.mid !== "undefined") {
        //@ts-expect-error
        this.__mid.value = val.mid;
      }
      //@ts-expect-error
      if (typeof val.max !== "undefined") {
        //@ts-expect-error
        this.__max.value = val.max;
      }
    }
    this.__updateVal();
  }

  protected $vfmodule() {
    this.__updateVal();
  }

  protected __updateVal() {
    //@ts-expect-error
    let val = this.$vbmodule;
    //@ts-expect-error
    if (this.__max.value > this.__min.value) {
      //@ts-expect-error
      if (val <= this.__mid.value) {
        let a =
          //@ts-expect-error
          this.__mid.value - this.__min.value == 0
            ? 0
            : (this.__midY - this.__minY) /
              //@ts-expect-error
              (this.__mid.value - this.__min.value);
        //@ts-expect-error
        this.__valueShow.value = a * val + (this.__minY - a * this.__min.value);
      } else {
        let a =
          //@ts-expect-error
          this.__max.value - this.__mid.value == 0
            ? 0
            : (this.__maxY - this.__midY) /
              //@ts-expect-error
              (this.__max.value - this.__mid.value);
        //@ts-expect-error
        this.__valueShow.value = a * val + (this.__midY - a * this.__mid.value);
      }
    } else {
      //@ts-expect-error
      if (val >= this.__mid.value) {
        let a =
          //@ts-expect-error
          this.__mid.value - this.__min.value == 0
            ? 0
            : (this.__midY - this.__minY) /
              //@ts-expect-error
              (this.__mid.value - this.__min.value);
        //@ts-expect-error
        this.__valueShow.value = a * val + (this.__minY - a * this.__min.value);
      } else {
        let a =
          //@ts-expect-error
          this.__max.value - this.__mid.value == 0
            ? 0
            : (this.__maxY - this.__midY) /
              //@ts-expect-error
              (this.__max.value - this.__mid.value);
        //@ts-expect-error
        this.__valueShow.value = a * val + (this.__midY - a * this.__mid.value);
      }
    }
  }
}
defineElement(ModuleValue3PointConversion);
defineElementValues(ModuleValue3PointConversion, ["module"]);
