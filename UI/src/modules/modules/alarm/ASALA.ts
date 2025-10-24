import { alarmBuzzer } from "@alarm/alarmManager";
import { AlarmStates, alarmStatesValues } from "@alarm/types";
import { ConditionEditorOpener } from "@components/conditionEditor";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import {
  Condition,
  conditionToServerCondition,
  serverConditionToCondition,
  type ServerCondition,
} from "@ioSystem/condition";
import { AccessTypes, defineElement } from "@libBase";
import { InputBox, InputBoxTypes, ToggleSwitch, Way } from "@libComponents";
import { EventHandler } from "@libEvent";
import { Err, Ok, type Result } from "@libResult";
import { registerModule } from "@module/module";
import { VABAS } from "../VABAS";
import { ASALL } from "./ASALL";

type ASALAPreConfig = {
  alarmID: number;
  alarmAlert: boolean;
  valID: number;
};

type ASALAEvents = {
  STATE: { state: AlarmStates; oldState: AlarmStates };
};

export class ASALA extends VABAS {
  private _alarmEvents = new EventHandler<ASALAEvents, this>(this);
  readonly alarmEvents = this._alarmEvents.consumer;

  emitTOBEREMOVED<K extends keyof ASALAEvents>(
    eventName: K,
    data: ASALAEvents[K]
  ) {
    this._alarmEvents.emit(eventName, data);
  }

  readonly alarmID: number = NaN;
  readonly alarmAlert: boolean = false;
  readonly valID: number = NaN;

  private __state: AlarmStates = AlarmStates.CLEARED;
  private __trigTime?: Date;

  preConfigTransform(
    configs: Partial<ASALAPreConfig>
  ): Result<ASALAPreConfig, string> {
    if (typeof configs["alarmID"] !== "number")
      return Err("Invalid or missing alarmID");
    if (typeof configs["alarmAlert"] !== "number")
      return Err("Invalid or missing alarmAlert");
    if (typeof configs["valID"] !== "number")
      return Err("Invalid or missing valID");
    //@ts-expect-error
    this.alarmID = configs["alarmID"];
    //@ts-expect-error
    this.alarmAlert = configs["alarmAlert"];
    //@ts-expect-error
    this.valID = configs["valID"];
    return Ok({
      alarmID: configs["alarmID"],
      alarmAlert: configs["alarmAlert"],
      valID: configs["valID"],
    });
  }

  /**Returns if the module has status value to be read*/
  get hasStatusValues(): boolean {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (values: any[]) => {
      return "ID:" + this.alarmID + " " + alarmStatesValues[values[0]];
    };
  }

  /**Returns whether the module has settings*/
  get hasSettings() {
    return true;
  }

  /**Generates an instance of the modules setting content */
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }

  /**Changes the state of the alarm*/
  set state(state: AlarmStates) {
    this.__state = state;
  }

  /**Returns the state of the alarm*/
  get state(): AlarmStates {
    return this.__state;
  }

  /**Changes saved trigger time*/
  set trigTime(time: Date) {
    this.__trigTime = time;
  }

  /**Returns the trigger time of the alarm;*/
  get trigTime(): Date {
    return this.__trigTime || new Date();
  }

  /**Returns wether the alarm is allowed to be acknowledged*/
  get ackAllowed(): boolean {
    return this.parent instanceof ASALL && this.parent.ackAllowed;
  }

  /** Acknowleges the alarm */
  acknowledge() {
    this.manager.sendMessage("AA", this.uid);
    alarmBuzzer.set = false;
  }
}
registerModule("ASALA", ASALA);

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-asala";
  }

  enabled = this.group.addComponent(
    new ToggleSwitch().options({
      id: "enabled",
      text: "Enable Alarm",
      way: Way.LEFT,
      access: this.userAccess,
    })
  );
  alarmAlert = this.group.addComponent(
    new ToggleSwitch().options({
      id: "alarmAlert",
      text: "Alarm/Alert",
      way: Way.LEFT,
      access: this.userAccess,
    })
  );
  trigDelay = this.group.addComponent(
    new InputBox().options({
      id: "trigDelay",
      text: "How long the condition must be true before the alarm is sounded",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 0,
      max: 32760,
      unit: "sec",
      access: this.userAccess,
    })
  );
  clearDelay = this.group.addComponent(
    new InputBox().options({
      id: "clearDelay",
      text: "How long the condition must be false before the alarm is cleared",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 0,
      max: 32760,
      unit: "sec",
      access: this.userAccess,
    })
  );
  reTrigDelay = this.group.addComponent(
    new InputBox().options({
      id: "reTrigDelay",
      text: "How long from the alarm has been acknowledged until the alarm sounds again, set 0 to never retrigger",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 0,
      max: 32760,
      unit: "sec",
      access: this.userAccess,
    })
  );
  condition = this.group.appendChild(
    new ConditionEditorOpener().options({
      id: "condition",
      text: "Conditions to trigger alarm",
      access: AccessTypes.WRITE,
      editorAccess: this.userAccess,
      parent: this,
    })
  );
  private __condition?: Condition;

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
    let saveData: {
      condition?: ServerCondition;
    } = {};
    let cond = this.condition.condition!;
    if (this.__condition!.compare(cond))
      saveData["condition"] = conditionToServerCondition(cond);
    super.__saveSettings(saveData);
  }
}
defineElement(Editor);
