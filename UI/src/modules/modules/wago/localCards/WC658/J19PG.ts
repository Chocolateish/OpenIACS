import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { VABAS } from "../../../VABAS";

export class J19PG extends VABAS {
  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  get name() {
    return "J1939 PGN";
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("J19PG", J19PG);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-j19pg";
  }

  source: InputBox;

  /**Generates an instance of the modules setting content*/
  constructor() {
    super();
    this.group.addComponent(
      (this.source = new InputBox().options({
        id: "PGNNumber",
        text: "PGNNumber",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.source = new InputBox().options({
        id: "writeInterval",
        text: "writeInterval",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      }))
    );
  }

  /**Must be set true to show save button*/
  get canSave() {
    return true;
  }
}
defineElement(Editor);
