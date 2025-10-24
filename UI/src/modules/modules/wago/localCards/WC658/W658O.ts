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
import { MappedCanbusdecodeTypesData } from "./W658I";

type W658OPreConfig = {
  startByte: number;
  bitOffset: number;
  bitSize: number;
};

export class W658O extends VABAS<W658OPreConfig> {
  readonly startByte: number = NaN;
  readonly bitOffset: number = NaN;
  readonly bitSize: number = NaN;

  preConfigTransform(
    configs: Partial<W658OPreConfig>
  ): Result<W658OPreConfig, string> {
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
registerModule("W658O", W658O);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "w658o";
  }

  startByte: InputBox;
  bitOffset: InputBox;
  bitSize: InputBox;
  decode: DropDown;
  sendGroup: InputBox;
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
      (this.sendGroup = new InputBox().options({
        id: "group",
        text: "Which send group the io is part of, use 0 for no send group (for cyclic sending)",
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 8,
        access: this.userAccess,
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
    return "Canbus Output Editor";
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }
}
defineElement(Editor);
