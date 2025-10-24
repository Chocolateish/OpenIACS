import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { WCARD } from "./generics";

export class WC626 extends WCARD {
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
registerModule("WC626", WC626);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "wc626";
  }

  constructor() {
    super();
    this.group.addComponent(
      new InputBox().options({
        id: "onTime",
        text: "How long to run the ground fault test",
        type: InputBoxTypes.NUMBER,
        unit: "s",
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new InputBox().options({
        id: "offTime",
        text: "How long to wait between ground fault tests",
        type: InputBoxTypes.NUMBER,
        unit: "s",
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new InputBox().options({
        id: "offTimeFault",
        text: "How long to wait between ground fault tests when a fault is present",
        type: InputBoxTypes.NUMBER,
        unit: "s",
        access: this.userAccess,
      })
    );
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Editor";
  }
}
defineElement(Editor);
