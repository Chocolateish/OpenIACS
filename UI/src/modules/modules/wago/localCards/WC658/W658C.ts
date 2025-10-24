import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  DropDown,
  InputBox,
  InputBoxTypes,
  TextBox,
  Way,
} from "@libComponents";
import { registerModule } from "@module/module";
import { VABAS } from "../../../VABAS";

export class W658C extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: string[]) => {
      return `Can Open Master`;
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
registerModule("W658C", W658C);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "w658c";
  }

  baudrate: DropDown;
  addNode: ComponentGroup;
  nodeID: InputBox;

  /**Generates an instance of the modules setting content*/
  constructor() {
    super();
    this.group.addComponent(
      (this.baudrate = new DropDown().options({
        id: "baudrate",
        text: "Baudrate for canbus communication",
        access: this.userAccess,
        options: [
          { text: "10 kBit/s", value: 10000 },
          { text: "20 kBit/s", value: 20000 },
          { text: "50 kBit/s", value: 50000 },
          { text: "125 kBit/s", value: 125000 },
          { text: "250 kBit/s", value: 250000 },
          { text: "500 kBit/s", value: 500000 },
          { text: "800 kBit/s", value: 800000 },
          { text: "1000 kBit/s", value: 1000000 },
          { text: "Auto", value: 0 },
        ],
      }))
    );
    this.group.addComponent(
      new TextBox().options({
        text: "Use the options below to add canbus nodes to the system",
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      (this.addNode = new ComponentGroup().options({
        border: ComponentGroupBorderStyle.OUTSET,
        way: Way.LEFT,
      }))
    );
    this.addNode.addComponent(
      (this.nodeID = new InputBox().options({
        id: "id",
        text: "Can Open Node ID",
        access: this.userAccess,
        type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
        min: 0,
        max: 127,
        value: 0,
      }))
    );
    this.addNode.addComponent(
      new Button().options({
        text: "Add Node",
        access: this.userAccess,
        click: () => {
          let values = this.addNode.values;
          if (this.__module) this.__module.command({ addNode: values });
        },
      })
    );
  }

  defaultName() {
    return "Can Open Editor";
  }

  /**Must be set true to show save button*/
  get canSave() {
    return true;
  }
}
defineElement(Editor);
