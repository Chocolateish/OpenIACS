import { ModuleAdder } from "@components/moduleAdder";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { Module, registerModule } from "@module/module";

export class CTELE extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Control Elements";
    };
  }
  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  subModuleAdder() {
    return new ModuleAdder().options({
      subs: {
        DP: () => {
          this.subModuleAdd("CRLDP");
        },
        Actuator: () => {
          this.subModuleAdd("CTACT");
        },
        TrollingValveControl: () => {
          this.subModuleAdd("CTTVC");
        },
        "Analog Control": () => {
          this.subModuleAdd("CTALC");
        },
      },
    });
  }
  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Returns whether the module has settings*/
  get hasSettingsValues() {
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
registerModule("CTELE", CTELE);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "ctele";
  }

  /** Updates special values from the module*/
  __newConfigs(_values: {}) {}

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {}

  protected defaultName(): string {
    return "Control-Editor";
  }
}

defineElement(Editor);
