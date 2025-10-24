import { ModuleListEditor } from "@components/moduleListEditor";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";

import { defineElement } from "@libBase";
import { defineElementValues } from "@libCommon";
import {
  ComponentGroup,
  InputBox,
  InputBoxTypes,
  TextBox,
  ToggleSwitch,
  Way,
} from "@libComponents";
import {
  ModuleList,
  moduleListToServerModuleList,
  serverModuleListToModuleList,
} from "@module/moduleList";

export class W8217 extends Module {
  get name() {
    return "SMS Module";
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
registerModule("W8217", W8217);

let alarmFilter = new ModuleFilter({
  designators: { pass: ["ASALL", "ASALA"] },
});

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "w8217";
  }

  private __numberGroup: ComponentGroup;
  boxes: InputBox[];
  list: ModuleListEditor;
  private __moduleList?: ModuleList;
  private __moduleListEdit?: ModuleList;

  constructor() {
    super();
    this.__numberGroup = new ComponentGroup().options({ way: Way.LEFT });
    this.group.addComponent(this.__numberGroup);
    this.__numberGroup.addComponent(
      new TextBox().options({
        text: "Phone numbers to update with system events",
      })
    );
    this.boxes = [];
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "blockPass",
        way: Way.LEFT,
        text: "Off means alarms on list are not sent over SMS, On means that only alarms on list are sent over SMS",
      })
    );
    this.group.addComponent(
      (this.list = new ModuleListEditor().options({
        text: "Alarms or alarm lists to apply rule to",
        addText: "Add Alarm or Alarm list",
        filter: alarmFilter,
      }))
    );
  }

  /** Updates special values from the module */
  __newConfigs(values: {
    maxAmount: number;
    clients: string[];
    list: any[];
    blockPass: boolean;
  }) {
    super.__newConfigs(values);
    for (let i = 0; i < this.boxes.length; i++) this.boxes[i].remove();
    this.boxes = [];
    for (let i = 0; i < values["maxAmount"]; i++) {
      this.boxes[i] = new InputBox().options({
        type: InputBoxTypes.TEL,
        access: this.userAccess,
        value: values["clients"][i],
      });
      this.__numberGroup.addComponent(this.boxes[i]);
    }
    this.__moduleList = serverModuleListToModuleList(
      values["list"],
      this.__module!.manager
    );
    this.__moduleListEdit = serverModuleListToModuleList(
      values["list"],
      this.__module!.manager
    );
    this.list.list = this.__moduleListEdit;
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData: {
      clients?: string[];
      list?: number[];
    } = {};
    let clients: string[] = [];
    for (let i = 0; i < this.boxes.length; i++) {
      let chang = this.boxes[i].value;
      if (chang) clients.push(String(chang));
    }
    if (clients.length) saveData["clients"] = clients;
    else saveData["clients"] = [];
    if (this.__moduleList!.compare(this.__moduleListEdit!))
      saveData["list"] = moduleListToServerModuleList(this.__moduleListEdit!);
    super.__saveSettings(saveData);
  }
}
defineElement(Editor);
defineElementValues(Editor, ["settings"]);
