import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { ModuleValueAccessEnum } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";

export class ASBUN extends Module {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Buzzer Unit:" + this.name;
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
registerModule("ASBUN", ASBUN);

let inputFilter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});
let outputFilter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-asbun";
  }

  buzzer = this.group.addComponent(
    new ModuleSelectorOpener().options({
      text: "Buzzer Module",
      access: this.userAccess,
      filter: outputFilter,
    })
  );
  button = this.group.addComponent(
    new ModuleSelectorOpener().options({
      text: "Button Module",
      access: this.userAccess,
      filter: inputFilter,
    })
  );
  light = this.group.addComponent(
    new ModuleSelectorOpener().options({
      text: "Light Module",
      access: this.userAccess,
      filter: outputFilter,
    })
  );

  /** Updates special values from the module*/
  __newConfigs(values: { buzzer: any; button: any; light: any }) {
    this.buzzer.value = this.__module!.manager.getModuleByUID(values["buzzer"]);
    this.button.value = this.__module!.manager.getModuleByUID(values["button"]);
    this.light.value = this.__module!.manager.getModuleByUID(values["light"]);
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData = {};
    let buzzer = this.buzzer.changed;
    //@ts-expect-error
    if (buzzer) saveData["buzzer"] = buzzer.uid;
    let button = this.button.changed;
    //@ts-expect-error
    if (button) saveData["button"] = button.uid;
    let light = this.light.changed;
    //@ts-expect-error
    if (light) saveData["light"] = light.uid;
    this.__saveSend(saveData);
  }

  protected defaultName(): string {
    return "Buzzer Unit Editor";
  }
}
defineElement(EDITOR);
