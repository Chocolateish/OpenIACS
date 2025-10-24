import { ModuleAdder } from "@components/moduleAdder";
import { ModuleListEditor } from "@components/moduleListEditor";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { ModuleValueAccessEnum } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ModuleList, moduleListToServerModuleList } from "@module/moduleList";

export class IOSYS extends Module {
  get name() {
    return "General I/O";
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Modbus TCP": () => {
          this.subModuleAdd("MBTCP", {});
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
registerModule("IOSYS", IOSYS);

let generalOutputFilter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "iosys";
  }

  logModules: ModuleListEditor;
  private __moduleList?: ModuleList;
  private __moduleListEdit?: ModuleList;

  constructor() {
    super();
    this.group.addComponent(
      (this.logModules = new ModuleListEditor().options({
        filter: generalOutputFilter,
        addText: "Add Value",
        text: "List of values to log",
        access: this.userAccess,
      }))
    );
  }

  /** Updates special values from the module*/
  protected __newConfigs(val: { [key: string]: any }) {
    this.__moduleList = new ModuleList(val.logModules);
    this.__moduleListEdit = new ModuleList(val.logModules);
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data */
  protected __saveSettings() {
    let saveData: { logModules?: number[] } = {};
    if (this.__moduleList!.compare(this.__moduleListEdit!))
      saveData["logModules"] = moduleListToServerModuleList(
        this.__moduleListEdit!
      );
    super.__saveSettings(saveData);
  }

  protected defaultName(): string {
    return "IO System Editor";
  }
}
defineElement(Editor);
