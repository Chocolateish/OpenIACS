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
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

/**Decode Types
 * @enum */
export let ModbusTypes = {
  COIL: 0,
  DISCRETEINPUT: 1,
  INPUTREGISTER: 3,
  HOLDINGREGISTER: 4,
};
export let modbusTypes = [
  { text: "Coils (Digital RW)", value: ModbusTypes.COIL, short: "CO" },
  {
    text: "Discrete Inputs (Digital RO)",
    value: ModbusTypes.DISCRETEINPUT,
    short: "DI",
  },
  {},
  {
    text: "Input Registers (Analogue RO)",
    value: ModbusTypes.INPUTREGISTER,
    short: "IR",
  },
  {
    text: "Holding Registers (Analogue RW)",
    value: ModbusTypes.HOLDINGREGISTER,
    short: "HR",
  },
];

let updateRates = ["100ms", "500ms", "1000ms"];
/**Decode Types
 * @enum */
export let DecodeTypes = {
  DIGITAL: 0,
  INTEGER: 1,
  UNSIGNED: 2,
  FLOAT: 3,
  INTEGERCONV: 4,
  UNSIGNEDCONV: 5,
  FLOATCONV: 6,
};
export let decodeTypesData = [
  {
    text: "Digital (Anything else than 0 is true/on)",
    value: DecodeTypes.DIGITAL,
  },
  { text: "Integer (with negative values)", value: DecodeTypes.INTEGER },
  {
    text: "Unsigned Integer (Only positive values)",
    value: DecodeTypes.UNSIGNED,
  },
  { text: "Floating Point (All real numbers)", value: DecodeTypes.FLOAT },
  { text: "Integer with conversion", value: DecodeTypes.INTEGERCONV },
  { text: "Unsigned Integer with conversion", value: DecodeTypes.UNSIGNEDCONV },
  { text: "Floating Point with conversion", value: DecodeTypes.FLOATCONV },
];

/**Address Sizes
 * @enum */
export let AddressSizes = {
  Bit16_LSB: 0,
  Bit32_LSB_LSW: 1,
  Bit64_LSB_LSW: 2,
  Bit16_MSB: 3,
  Bit32_LSB_MSW: 4,
  Bit32_MSB_LSW: 5,
  Bit32_MSB_MSW: 6,
  Bit64_LSB_MSW: 7,
  Bit64_MSB_LSW: 8,
  Bit64_MSB_MSW: 9,
};
export let addressSizes = [
  { text: "16Bit LSB", value: AddressSizes.Bit16_LSB },
  { text: "32Bit LSB LSW", value: AddressSizes.Bit32_LSB_LSW },
  { text: "64Bit LSB LSW", value: AddressSizes.Bit64_LSB_LSW },
  { text: "16Bit MSB", value: AddressSizes.Bit16_MSB },
  { text: "32Bit LSB MSW", value: AddressSizes.Bit32_LSB_MSW },
  { text: "32Bit MSB LSW", value: AddressSizes.Bit32_MSB_LSW },
  { text: "32Bit MSB MSW", value: AddressSizes.Bit32_MSB_MSW },
  { text: "64Bit LSB MSW", value: AddressSizes.Bit64_LSB_MSW },
  { text: "64Bit MSB LSW", value: AddressSizes.Bit64_MSB_LSW },
  { text: "64Bit MSB MSW", value: AddressSizes.Bit64_MSB_MSW },
];

type MBIOVConfig = {
  type: number;
  address: number;
  modbusUnit: number;
  size: number;
  readWrite: boolean;
  updateRate: number;
  decode: number;
  convA: number;
  convB: number;
};

export class MBIOV extends VABAS<{}, MBIOVConfig> {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return async () => {
      let con = await this.configs;
      if (con.ok)
        return `${(modbusTypes[con.value["type"]] || {}).short}:${
          con.value["address"]
        } Unit:${con.value["modbusUnit"]} Rate:${
          updateRates[con.value["updateRate"]]
        } Size:${(addressSizes[con.value["size"]] || {}).text}`;
      else return "Modbus IO N/A";
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
    return new EDITOR().options(options);
  }
}
registerModule("MBIOV", MBIOV);

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "mbiov";
  }

  convA = this.group.addComponent(
    new InputBox().options({
      id: "convA",
      text: "A Value",
      type: InputBoxTypes.NUMBER,
      access: this.userAccess,
    })
  );
  convB = this.group.addComponent(
    new InputBox().options({
      id: "convB",
      text: "B Value",
      type: InputBoxTypes.NUMBER,
      access: this.userAccess,
    })
  );
  unit = this.group.addComponent(
    new UnitSelectorOpener().options({ id: "unit", access: this.userAccess })
  );
  decode = this.group.addComponent(
    new DropDown().options({
      id: "decode",
      text: "How to decode value, (Use Unsigned or Unsigned with conversion if nothing is specified)",
      access: this.userAccess,
      options: decodeTypesData,
      change: (val) => {
        switch (val) {
          case DecodeTypes.FLOATCONV:
          case DecodeTypes.INTEGERCONV:
          case DecodeTypes.UNSIGNEDCONV:
            this.convA.accessByState(this.userAccess);
            this.convB.accessByState(this.userAccess);
            break;
          default:
            this.convA.access = AccessTypes.NONE;
            this.convB.access = AccessTypes.NONE;
            break;
        }
      },
    })
  );
  modbusType = this.group.addComponent(
    new DropDown().options({
      id: "type",
      text: "Modbus data type",
      options: [
        { text: "Holding Registers (Analogue RW)", value: 4 },
        { text: "Input Registers (Analogue RO)", value: 3 },
        { text: "Discrete Inputs (Digital RO)", value: 1 },
        { text: "Coils (Digital RW)", value: 0 },
      ],
      value: 4,
      change: () => {
        this.updateAccesses();
      },
    })
  );
  modbusAddress = this.group.addComponent(
    new InputBox().options({
      id: "address",
      text: "Modbus address (1-465536)",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 1,
      max: 465536,
      value: 1,
      change: (val) => {
        val = String(val);
        if (val.length > 5) {
          this.modbusType.value = val[0];
          this.updateAccesses();
        }
      },
    })
  );
  modbusUnit = this.group.addComponent(
    new InputBox().options({
      id: "modbusUnit",
      text: "Modbus Unit, this is primarily used for TCP/RTU converters",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 0,
      max: 255,
      value: 0,
    })
  );
  size = this.group.addComponent(
    new DropDown().options({
      id: "size",
      text: "Size of value",
      options: addressSizes,
      value: 0,
    })
  );
  readWrite = this.group.addComponent(
    new ToggleSwitch().options({
      id: "readWrite",
      text: "Write/Output functionality",
      way: Way.LEFT,
      value: false,
    })
  );
  updateRate = this.group.addComponent(
    new DropDown().options({
      id: "updateRate",
      text: "Update rate for value",
      options: [
        { text: "Fast (100ms)", value: 0 },
        { text: "Medium (500ms)", value: 1 },
        { text: "Slow (1000ms)", value: 2 },
      ],
      value: 2,
    })
  );

  constructor() {
    super();
    this.updateAccesses();
  }

  updateAccesses() {
    let type = this.modbusType.value;
    let inputs = type == 3 || type == 1;
    let registers = type == 4 || type == 3;
    this.readWrite.access = inputs ? AccessTypes.NONE : AccessTypes.WRITE;
    if (registers) {
      this.size.access = AccessTypes.WRITE;
      this.decode.value = DecodeTypes.UNSIGNED;
    } else {
      this.size.access = AccessTypes.NONE;
      this.decode.value = DecodeTypes.DIGITAL;
    }
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Modbus IO Editor";
  }
}
defineElement(EDITOR);
