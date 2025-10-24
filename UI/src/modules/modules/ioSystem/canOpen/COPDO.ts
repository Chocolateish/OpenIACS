import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { UnitSelectorOpener } from "@components/unitSelector";
import { AccessTypes, defineElement } from "@libBase";
import {
  DropDown,
  InputBox,
  InputBoxTypes,
  ToggleSwitch,
  Way,
} from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";
import { pdoOptionsData } from "./CONOD";

/**Decode Types
 * @enum */
let DecodeTypes = {
  DIGITAL: 0,
  SIGNED32: 1,
  UNSIGNED32: 2,
  FLOAT32: 3,
  SIGNED32CONV: 4,
  UNSIGNED32CONV: 5,
  FLOAT32CONV: 6,
};
let decodeTypesData = [
  {
    text: "Digital (Anything else than 0 is true/on)",
    value: DecodeTypes.DIGITAL,
  },
  {
    text: "Signed Integer (with negative values)",
    value: DecodeTypes.SIGNED32,
  },
  {
    text: "Unsigned Integer (only positive values)",
    value: DecodeTypes.UNSIGNED32,
  },
  { text: "Floating Point (all real numbers)", value: DecodeTypes.FLOAT32 },
  { text: "Signed Integer with conversion", value: DecodeTypes.SIGNED32CONV },
  {
    text: "Unsigned Integer with conversion",
    value: DecodeTypes.UNSIGNED32CONV,
  },
  { text: "Floating Point with conversion", value: DecodeTypes.FLOAT32CONV },
];

type COPDOPreConfig = {
  pdo: number;
  byteOffset: number;
  bitOffset: number;
  bitSize: number;
};

export class COPDO extends VABAS<COPDOPreConfig> {
  readonly pdo: number = NaN;
  readonly byteOffset: number = NaN;
  readonly bitOffset: number = NaN;
  readonly bitSize: number = NaN;

  preConfigTransform(
    configs: Partial<COPDOPreConfig>
  ): Result<COPDOPreConfig, string> {
    if (typeof configs["pdo"] !== "number")
      return Err("Invalid or missing pdo");
    if (typeof configs["byteOffset"] !== "number")
      return Err("Invalid or missing byteOffset");
    if (typeof configs["bitOffset"] !== "number")
      return Err("Invalid or missing bitOffset");
    if (typeof configs["bitSize"] !== "number")
      return Err("Invalid or missing bitSize");
    //@ts-expect-error
    this.pdo = configs["pdo"];
    //@ts-expect-error
    this.byteOffset = configs["byteOffset"];
    //@ts-expect-error
    this.bitOffset = configs["bitOffset"];
    //@ts-expect-error
    this.bitSize = configs["bitSize"];
    return Ok({
      pdo: configs["pdo"],
      byteOffset: configs["byteOffset"],
      bitOffset: configs["bitOffset"],
      bitSize: configs["bitSize"],
    });
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return `PDO:${this.pdo} Byte:${this.byteOffset} Bit:${this.bitOffset} Size:${this.bitSize}`;
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("COPDO", COPDO);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "copdo";
  }

  pdo: DropDown;
  variableAccess: DropDown;
  convA: InputBox;
  convB: InputBox;
  unit: UnitSelectorOpener;
  decode: DropDown;
  byteOffset: InputBox;
  bitOffset: InputBox;
  bitSize: InputBox;
  reset: ToggleSwitch;

  constructor() {
    super();
    this.group.addComponent(
      (this.pdo = new DropDown().options({
        id: "pdo",
        text: "Which PDO",
        access: this.userAccess,
        options: pdoOptionsData,
        default: "Select PDO",
      }))
    );
    this.group.addComponent(
      (this.variableAccess = new DropDown().options({
        id: "variableAccess",
        text: "Access to pdo variable",
        access: this.userAccess,
        options: [
          { text: "Read Only", value: 1 },
          { text: "Write Only", value: 2 },
          { text: "Read Write", value: 3 },
        ],
      }))
    );
    this.group.addComponent(
      (this.convA = new InputBox().options({
        id: "convA",
        text: "A Value",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.convB = new InputBox().options({
        id: "convB",
        text: "B Value",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.unit = new UnitSelectorOpener().options({
        id: "unit",
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.decode = new DropDown().options({
        id: "decode",
        text: "How to decode value, (Use Unsigned or Unsigned with conversion if nothing is specified)",
        access: this.userAccess,
        options: decodeTypesData,
        change: (val) => {
          switch (val) {
            case DecodeTypes.FLOAT32CONV:
            case DecodeTypes.SIGNED32CONV:
            case DecodeTypes.UNSIGNED32CONV:
              this.convA.accessByState(this.userAccess);
              this.convB.accessByState(this.userAccess);
              break;
            default:
              this.convA.accessByState(undefined);
              this.convB.accessByState(undefined);
              this.convA.access = AccessTypes.NONE;
              this.convB.access = AccessTypes.NONE;
              break;
          }
        },
      }))
    );
    this.group.addComponent(
      (this.byteOffset = new InputBox().options({
        id: "byteOffset",
        text: "Value byte offset in pdo data 0-7",
        access: this.userAccess,
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 7,
        value: 0,
        change: (val) => {
          this.bitSize.max = 64 - (Number(this.bitOffset.value!) + val * 8);
        },
      }))
    );
    this.group.addComponent(
      (this.bitOffset = new InputBox().options({
        id: "bitOffset",
        text: "Value bit offset in pdo data 0-7",
        access: this.userAccess,
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 7,
        value: 0,
        change: (val) => {
          this.bitSize.max = 64 - (val + Number(this.byteOffset.value!) * 8);
        },
      }))
    );
    this.group.addComponent(
      (this.bitSize = new InputBox().options({
        id: "bitSize",
        text: "Value bit size 1-64",
        access: this.userAccess,
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 1,
        max: 64,
        value: 8,
      }))
    );
    this.group.addComponent(
      (this.reset = new ToggleSwitch().options({
        id: "reset",
        text: "Reset variable after write",
        access: this.userAccess,
        way: Way.LEFT,
      }))
    );
  }

  __updateModuleValue() {
    this.pdo.value = (this.__module! as COPDO).pdo!;
    this.byteOffset.value = (this.__module! as COPDO).byteOffset!;
    this.bitOffset.value = (this.__module! as COPDO).bitOffset!;
    this.bitSize.value = (this.__module! as COPDO).bitSize!;
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "PDO RX Editor";
  }
}
defineElement(Editor);
