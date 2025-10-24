import { ModuleAdder } from "@components/moduleAdder";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { AccessTypes, defineElement } from "@libBase";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  DropDown,
  InputBox,
  InputBoxTypes,
  ToggleSwitch,
  Way,
} from "@libComponents";
import {
  Content,
  type ContentBaseOptions,
  getWindowManagerFromElement,
  UIWindow,
} from "@libUI";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";
import { addressSizes, DecodeTypes, decodeTypesData } from "./MBIOV";

export class MBSER extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return `Modbus Server: ${this.name}`;
    };
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    let adder = new ModuleAdder().options({
      subs: {
        "Modbus Address": () => {
          getWindowManagerFromElement(adder).appendWindow(
            new UIWindow().options({
              content: new Adder({ parent: adder.parent, module: this }),
              width: "60%",
              height: "80%",
            })
          );
        },
        "Linear Converter": () => {
          this.subModuleAdd("LICON", {});
        },
        "Table Converter": () => {
          this.subModuleAdd("TABCO", {});
        },
        Filter: () => {
          this.subModuleAdd("FILTE", {});
        },
        Mover: () => {
          this.subModuleAdd("VALMO", {});
        },
      },
    });
    return adder;
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
registerModule("MBSER", MBSER);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "mbser";
  }

  timeOut = this.group.addComponent(
    new InputBox().options({
      id: "timeOut",
      text: "Timeout time (Watchdog time), how long without a response from the server to wait, before connection is restarted",
      unit: "ms",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 0,
      max: 65535,
      access: this.userAccess,
    })
  );
  startAtZero = this.group.addComponent(
    new ToggleSwitch().options({
      id: "startAtZero",
      text: "Addresses starts at 0",
      way: Way.LEFT,
      access: this.userAccess,
    })
  );

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  defaultName() {
    return "Modbus Connection Editor";
  }
}
defineElement(Editor);

type AdderOptions = {
  parent?: Content;
  module: MBSER;
} & ContentBaseOptions;

class Adder extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-adder-mbser";
  }
  static elementNameSpace() {
    return "lmui";
  }

  group = this.appendChild(new ComponentGroup().options({ way: Way.LEFT }));
  add = this.appendChild(
    new ComponentGroup().options({
      way: Way.UP,
      position: Way.DOWN,
      border: ComponentGroupBorderStyle.OUTSET,
    })
  );
  modbusType: DropDown;
  modbusAddress: InputBox;
  modbusUnit: InputBox;
  size: DropDown;
  decode: DropDown;
  readWrite: ToggleSwitch;

  constructor(options: AdderOptions) {
    super();
    this.add.addComponent(
      new Button().options({
        text: "Add",
        click: () => {
          let vals = this.group.values;
          options.module.subModuleAdd("MBIOV", { ...vals, updateRate: 0 });
        },
      })
    );
    this.add.addComponent(
      new Button().options({
        text: "Close",
        click: () => {
          this.close();
        },
      })
    );

    this.group.addComponent(
      (this.modbusType = new DropDown().options({
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
          updateAccesses();
        },
      }))
    );
    this.group.addComponent(
      (this.modbusAddress = new InputBox().options({
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
            updateAccesses();
          }
        },
      }))
    );
    this.group.addComponent(
      (this.modbusUnit = new InputBox().options({
        id: "modbusUnit",
        text: "Modbus Unit",
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 255,
        value: 0,
      }))
    );
    this.group.addComponent(
      (this.size = new DropDown().options({
        id: "size",
        text: "Size of value",
        options: addressSizes,
        value: 0,
      }))
    );
    this.group.addComponent(
      (this.decode = new DropDown().options({
        id: "decode",
        text: "How to decode value, (Use Unsigned or Unsigned with conversion if nothing is specified)",
        options: decodeTypesData,
        value: 2,
      }))
    );
    this.group.addComponent(
      (this.readWrite = new ToggleSwitch().options({
        id: "readWrite",
        text: "Write/Output functionality",
        way: Way.LEFT,
        value: false,
      }))
    );
    let updateAccesses = () => {
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
    };
    updateAccesses();
  }
}
defineElement(Adder);
