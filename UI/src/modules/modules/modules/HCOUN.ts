import { ConditionEditorOpener } from "@components/conditionEditor";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { Button, InputBox, InputBoxTypes } from "@libComponents";
import { Module, registerModule } from "@module/module";
import {
  Condition,
  conditionToServerCondition,
  serverConditionToCondition,
  type ServerCondition,
} from "../../ioSystem/condition";

export class HCOUN extends Module {
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
registerModule("HCOUN", HCOUN);

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "hcoun";
  }

  condition = this.group.appendChild(
    new ConditionEditorOpener().options({
      id: "condition",
      text: "Conditions for counting hours",
      access: this.userAccess,
      parent: this,
    })
  );
  newLicSend = this.group.addComponent(
    new Button().options({
      text: "Reset To Zero",
      click: () => {
        this.__module!.command({ reset: true });
      },
      access: this.userAccess,
    })
  );
  private __hours = this.group.addComponent(
    new InputBox().options({
      text: "Hours to set counter to",
      type: InputBoxTypes.NUMBERPOSITIVE,
      access: this.userAccess,
    })
  );
  private __condition?: Condition;

  constructor() {
    super();
    this.group.addComponent(
      new Button().options({
        text: "Set Counter",
        click: () => {
          this.__module!.command({ set: (this.__hours.value as any) * 3600 });
        },
        access: this.userAccess,
      })
    );
  }

  /** Updates special values from the module*/
  __newConfigs(values: { condition: any }) {
    super.__newConfigs(values);
    this.__condition = new Condition();
    serverConditionToCondition(
      this.__condition,
      values["condition"],
      this.__module!.manager
    );
    this.condition.condition = Condition.createCopy(this.__condition);
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData: { condition?: ServerCondition } = {};
    let cond = this.condition.condition!;
    if (this.__condition!.compare(cond)) {
      saveData["condition"] = conditionToServerCondition(cond);
    }
    super.__saveSettings(saveData);
  }

  protected defaultName(): string {
    return "Hour Counter Setup";
  }
}
defineElement(EDITOR);
