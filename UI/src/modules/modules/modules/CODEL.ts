import { ConditionEditorOpener } from "@components/conditionEditor";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import {
  InputBox,
  InputBoxTypes,
  TextBox,
  ToggleSwitch,
  Way,
} from "@libComponents";
import { registerModule } from "@module/module";
import {
  Condition,
  conditionToServerCondition,
  serverConditionToCondition,
  type ServerCondition,
} from "../../ioSystem/condition";
import { VABAS } from "../VABAS";

export class CODEL extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Condition Delayer";
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
registerModule("CODEL", CODEL);

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "codel";
  }

  private __conditionOn?: Condition;
  private __conditionOff?: Condition;
  conditionOn: ConditionEditorOpener;
  conditionOff: ConditionEditorOpener;
  useOffCondition: ToggleSwitch;
  timeOn: InputBox;
  timeOff: InputBox;

  constructor() {
    super();
    this.group.appendChild(
      new TextBox().options({
        text: "If condition is on for the entire delay without turning off, the state will switch to on, if the condition then is off for the entire delay without turning on, the state will switch to off. Using the off condition, it will instead require the off condition to be on for the entire delay.",
      })
    );
    this.conditionOn = this.group.appendChild(
      new ConditionEditorOpener().options({
        id: "conditionOn",
        text: "Conditions for turning on",
        access: this.userAccess,
        parent: this,
      })
    );
    this.conditionOff = this.group.appendChild(
      new ConditionEditorOpener().options({
        id: "conditionOff",
        text: "Conditions for turning off",
        access: this.userAccess,
        parent: this,
      })
    );
    this.useOffCondition = this.group.addComponent(
      new ToggleSwitch().options({
        id: "useOffCondition",
        text: "Use off condition",
        access: this.userAccess,
        way: Way.RIGHT,
      })
    );
    this.timeOn = this.group.addComponent(
      new InputBox().options({
        id: "timeOn",
        text: "Delay for turning on",
        type: InputBoxTypes.NUMBERPOSITIVE,
        access: this.userAccess,
        unit: "S",
      })
    );
    this.timeOff = this.group.addComponent(
      new InputBox().options({
        id: "timeOff",
        text: "Delay for turning off",
        type: InputBoxTypes.NUMBERPOSITIVE,
        access: this.userAccess,
        unit: "S",
      })
    );
  }

  /** Updates special values from the module*/
  __newConfigs(values: { conditionOn: any; conditionOff: any }) {
    super.__newConfigs(values);
    this.__conditionOn = new Condition();
    serverConditionToCondition(
      this.__conditionOn,
      values["conditionOn"],
      this.__module!.manager
    );
    this.conditionOn.condition = Condition.createCopy(this.__conditionOn);
    this.__conditionOff = new Condition();
    serverConditionToCondition(
      this.__conditionOff,
      values["conditionOff"],
      this.__module!.manager
    );
    this.conditionOff.condition = Condition.createCopy(this.__conditionOff);
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData: {
      conditionOn?: ServerCondition;
      conditionOff?: ServerCondition;
    } = {};
    let condOn = this.conditionOn.condition!;
    if (this.__conditionOn!.compare(condOn)) {
      saveData["conditionOn"] = conditionToServerCondition(condOn);
    }
    let condOff = this.conditionOff.condition!;
    if (this.__conditionOff!.compare(condOff)) {
      saveData["conditionOff"] = conditionToServerCondition(condOff);
    }
    super.__saveSettings(saveData);
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  protected defaultName(): string {
    return "Condition Delayer Editor";
  }
}
defineElement(EDITOR);
