import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { ModuleValueAccessEnum } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
export class MOVER extends Module {
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
registerModule("MOVER", MOVER);

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "mover";
  }

  private __selector: ModuleSelectorOpener;

  constructor() {
    super();
    this.group.addComponent(
      (this.__selector = new ModuleSelectorOpener().options({
        id: "destination",
        uidMode: true,
        text: "Module to move value to",
        filter: filter,
        access: this.userAccess,
      }))
    );
  }

  set module(mod: Module) {
    super.module = mod;
    this.__selector.manager = this.__module!.manager;
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Mover Editor";
  }
}
defineElement(EDITOR);
