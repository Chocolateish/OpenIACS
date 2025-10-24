import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { UnitSelectorOpener } from "@components/unitSelector";
import { defineElement } from "@libBase";
import { DropDown, InputBox, InputBoxTypes } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { registerModule } from "@module/module";
import { VABAS } from "../../../VABAS";

/**Decode Types*/
export let MappedCanbusDecodeTypes = {
  DIGITAL: 0,
  INTEGER: 1,
  UNSIGNED: 2,
  FLOAT: 3,
  INTEGERCONV: 4,
  UNSIGNEDCONV: 5,
  FLOATCONV: 6,
};
export let MappedCanbusdecodeTypesData = [
  {
    text: "Digital (Anything else than 0 is true/on)",
    value: MappedCanbusDecodeTypes.DIGITAL,
  },
  {
    text: "Integer (with negative values)",
    value: MappedCanbusDecodeTypes.INTEGER,
  },
  {
    text: "Unsigned Integer (Only positive values)",
    value: MappedCanbusDecodeTypes.UNSIGNED,
  },
  {
    text: "Floating Point (All real numbers)",
    value: MappedCanbusDecodeTypes.FLOAT,
  },
  {
    text: "Integer with conversion",
    value: MappedCanbusDecodeTypes.INTEGERCONV,
  },
  {
    text: "Unsigned Integer with conversion",
    value: MappedCanbusDecodeTypes.UNSIGNEDCONV,
  },
  {
    text: "Floating Point with conversion",
    value: MappedCanbusDecodeTypes.FLOATCONV,
  },
];

type W658IPreConfig = {
  startByte: number;
  bitOffset: number;
  bitSize: number;
};

export class W658I extends VABAS {
  readonly startByte: number = 0;
  readonly bitOffset: number = 0;
  readonly bitSize: number = 1;

  /**Updates the existing values in the module from the given options*/

  preConfigTransform(
    configs: Partial<W658IPreConfig>
  ): Result<W658IPreConfig, string> {
    if (typeof configs["startByte"] !== "number")
      return Err("Invalid or missing startByte");
    if (typeof configs["bitOffset"] !== "number")
      return Err("Invalid or missing bitOffset");
    if (typeof configs["bitSize"] !== "number")
      return Err("Invalid or missing bitSize");
    //@ts-expect-error
    this.startByte = configs["startByte"];
    //@ts-expect-error
    this.bitOffset = configs["bitOffset"];
    //@ts-expect-error
    this.bitSize = configs["bitSize"];
    return Ok({
      startByte: configs["startByte"],
      bitOffset: configs["bitOffset"],
      bitSize: configs["bitSize"],
    });
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: string[]) => {
      return `Byte:${this.startByte} Offset:${this.bitOffset} Size:${this.bitSize} ${this.name}`;
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
registerModule("W658I", W658I);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "w658i";
  }

  startByte: InputBox;
  bitOffset: InputBox;
  bitSize: InputBox;
  decode: DropDown;
  convA: InputBox;
  convB: InputBox;
  unit: UnitSelectorOpener;

  /**Generates an instance of the modules setting content*/
  constructor() {
    super();
    this.group.addComponent(
      (this.startByte = new InputBox().options({
        id: "startByte",
        text: "Which byte in the mapped data, the input starts",
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 47,
        access: this.userAccess,
      }))
    );

    this.group.addComponent(
      (this.bitOffset = new InputBox().options({
        id: "bitOffset",
        text: "Value bit offset in address 0-7",
        access: this.userAccess,
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 7,
        change: (val) => {
          if (val > 0) {
            if (Number(this.bitSize.value) > 8 - val) {
              this.bitSize.value = 8 - val;
              this.bitSize.max = 8 - val;
            }
          } else {
            this.bitSize.max = 32;
          }
        },
      }))
    );
    this.group.addComponent(
      (this.bitSize = new InputBox().options({
        id: "bitSize",
        text: "Value bit size 1-32",
        access: this.userAccess,
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 1,
        max: 32,
      }))
    );
    this.group.addComponent(
      (this.decode = new DropDown().options({
        id: "decode",
        text: "How to decode value, (Use Unsigned or Unsigned with conversion if nothing is specified)",
        access: this.userAccess,
        options: MappedCanbusdecodeTypesData,
      }))
    );

    this.group.addComponent(
      (this.convA = new InputBox().options({
        id: "convA",
        text: "",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.convB = new InputBox().options({
        id: "convB",
        text: "",
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
  }

  defaultName() {
    return "Canbus Input Editor";
  }

  /**Must be set true to show save button */
  get canSave() {
    return true;
  }
}
defineElement(Editor);
