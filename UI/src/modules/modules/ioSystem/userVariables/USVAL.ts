import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { UnitSelectorOpener } from "@components/unitSelector";
import { defineElement } from "@libBase";
import { DropDown, InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { ModuleValueTypeShort } from "@module/types";
import { VABAS } from "../../VABAS";

type USVALConfig = {
  type: ModuleValueTypeShort;
  min: number;
  max: number;
};

export class USVAL extends VABAS<{}, USVALConfig> {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return async () => {
      let con = await this.configs;
      if (con.ok)
        return `Type:${con.value["type"]} min:${con.value["min"]} max:${con.value["max"]}`;
      else return "User Value N/A";
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
registerModule("USVAL", USVAL);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "usval";
  }

  constructor() {
    super();
    this.group.addComponent(
      new DropDown().options({
        id: "type",
        text: "Value type",
        access: this.userAccess,
        options: Object.keys(ModuleValueTypeShort).map((e) => {
          return {
            text: e,
            //@ts-expect-error
            value: ModuleValueTypeShort[e],
          };
        }),
      })
    );
    this.group.addComponent(
      new InputBox().options({
        id: "min",
        text: "Minimum Value allowed",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new InputBox().options({
        id: "max",
        text: "Maximum value allowed",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new UnitSelectorOpener().options({
        text: "Unit",
        id: "unit",
        access: this.userAccess,
      })
    );
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "User Value Editor";
  }
}
defineElement(Editor);
