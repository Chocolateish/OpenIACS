import { ModuleAdder } from "@components/moduleAdder";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { Module, registerModule } from "@module/module";

export class J19SA extends Module {
  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules() {
    return true;
  }

  subModuleAdder() {
    return new ModuleAdder().options({
      subs: {
        "J1939 PNG": () => {
          this.subModuleAdd("J19PG", {});
        },
      },
    });
  }

  /**Generates an instance of the modules setting content*/
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("J19SA", J19SA);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-j19sa";
  }

  source: InputBox;
  /**Generates an instance of the modules setting content*/
  constructor() {
    super();
    /*
        this.group.addComponent(this.convA = new InputBox().options({ id: 'convA', text: '', type: InputBoxTypes.NUMBER, access: this.access }));
        */
    this.group.addComponent(
      (this.source = new InputBox().options({
        id: "id",
        text: "source",
        type: InputBoxTypes.NUMBER,
        access: this.userAccess,
      }))
    );
  }

  /**Must be set true to show save button */
  get canSave() {
    return true;
  }
}
defineElement(Editor);
