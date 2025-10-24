import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { UnitSelectorOpener } from "@components/unitSelector";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { VABAS } from "../../VABAS";

type BITACConfig = {
  bitSize: number;
  bitOffset: number;
};

export class BITAC extends VABAS<{}, BITACConfig> {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return async () => {
      let con = await this.configs;
      if (con.err) return "Bit Access N/A";
      return `Bit access size:${con.value["bitSize"]} offset:${con.value["bitOffset"]}`;
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Generates an instance of the modules setting content */
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("BITAC", BITAC);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "bitac";
  }

  constructor() {
    super();
    this.group.addComponent(
      new InputBox().options({
        id: "bitSize",
        text: "Amount of bits to look at",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new InputBox().options({
        id: "bitOffset",
        text: "Bit offset in value",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new UnitSelectorOpener().options({ id: "unit", access: this.userAccess })
    );
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Bit Access Editor";
  }
}
defineElement(Editor);
