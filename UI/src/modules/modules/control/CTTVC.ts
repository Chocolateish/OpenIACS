import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes } from "@libComponents";
import { registerModule } from "@module/module";
import { VABAS } from "../VABAS";

export class CTTVC extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Trolling Valve";
    };
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
    return new EDITOR().options(options);
  }
}
registerModule("CTTVC", CTTVC);

//let filterOut = new ModuleFilter({ feature: { value: ModuleValueTypes.OUTPUT } });

class EDITOR extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "cttvc";
  }

  forwardValveId = this.group.addComponent(
    new ModuleSelectorOpener().options({
      access: this.userAccess,
      text: "forwardValveId",
    })
  );
  backwardsValveId = this.group.addComponent(
    new ModuleSelectorOpener().options({
      access: this.userAccess,
      text: "backwardsValveId",
    })
  );
  gearSetpointId = this.group.addComponent(
    new ModuleSelectorOpener().options({
      access: this.userAccess,
      text: "gearSetpointId",
    })
  );
  rpmSetpointId = this.group.addComponent(
    new ModuleSelectorOpener().options({
      access: this.userAccess,
      text: "rpmSetpointId",
    })
  );
  gearFeedbackId = this.group.addComponent(
    new ModuleSelectorOpener().options({
      access: this.userAccess,
      text: "gearFeedbackId",
    })
  );
  rpmFeedbackId = this.group.addComponent(
    new ModuleSelectorOpener().options({
      access: this.userAccess,
      text: "rpmFeedbackId",
    })
  );
  setMaxFroward = this.group.addComponent(
    new InputBox().options({
      id: "maxRPMForward",
      text: "Max RPM Forward",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );
  setMaxBackward = this.group.addComponent(
    new InputBox().options({
      id: "maxRpmBackwards",
      text: "Max RPM Backward",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );
  setChangerateRPM = this.group.addComponent(
    new InputBox().options({
      id: "RPMChangeRate",
      text: "Change Rate RPM",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );
  percFullClutch = this.group.addComponent(
    new InputBox().options({
      id: "percFullClutch",
      text: "Percentage for full clutchin",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );
  feedbackFullCluth = this.group.addComponent(
    new InputBox().options({
      id: "feedbackFullCluth",
      text: "Clutch Feedback befor RPM increase",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );
  rpmLimForClutch = this.group.addComponent(
    new InputBox().options({
      id: "rpmLimForClutch",
      text: "RPM limit for clutch decrease",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );

  feedbackNoClutch = this.group.addComponent(
    new InputBox().options({
      id: "feedbackNoClutch",
      text: "Feedback lilit for clutchout",
      type: InputBoxTypes.NUMBER,
      min: -32768,
      max: 32768,
      access: this.userAccess,
    })
  );

  /** Updates special values from the module*/
  __newConfigs(values: { [key: string]: any }) {
    super.__newConfigs(values);

    this.forwardValveId.value = this.__module!.manager.getModuleByUID(
      values["forwardValveId"]
    );
    this.backwardsValveId.value = this.__module!.manager.getModuleByUID(
      values["backwardsValveId"]
    );
    this.gearSetpointId.value = this.__module!.manager.getModuleByUID(
      values["gearSetpointId"]
    );
    this.rpmSetpointId.value = this.__module!.manager.getModuleByUID(
      values["rpmSetpointId"]
    );
    this.gearFeedbackId.value = this.__module!.manager.getModuleByUID(
      values["gearFeedbackId"]
    );
    this.rpmFeedbackId.value = this.__module!.manager.getModuleByUID(
      values["rpmFeedbackId"]
    );
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData = {};

    let forwardValveIdChange = this.forwardValveId.changed;
    let backwardsValveIdChange = this.backwardsValveId.changed;
    let gearSetpointIdChange = this.gearSetpointId.changed;
    let rpmSetpointIdChange = this.rpmSetpointId.changed;
    let rpmFeedbackIdChange = this.rpmFeedbackId.changed;
    let gearFeedbackIdChange = this.gearFeedbackId.changed;

    if (forwardValveIdChange)
      //@ts-expect-error
      saveData["forwardValveId"] = forwardValveIdChange.uid;

    if (backwardsValveIdChange)
      //@ts-expect-error
      saveData["backwardsValveId"] = backwardsValveIdChange.uid;

    if (gearSetpointIdChange)
      //@ts-expect-error
      saveData["gearSetpointId"] = gearSetpointIdChange.uid;

    if (rpmSetpointIdChange)
      //@ts-expect-error
      saveData["rpmSetpointId"] = rpmSetpointIdChange.uid;

    if (gearFeedbackIdChange)
      //@ts-expect-error
      saveData["gearFeedbackId"] = gearFeedbackIdChange.uid;

    if (rpmFeedbackIdChange)
      //@ts-expect-error
      saveData["rpmFeedbackId"] = rpmFeedbackIdChange.uid;

    super.__saveSettings(saveData);
  }

  protected defaultName(): string {
    return "TrollingValveControl-Editor";
  }
}
defineElement(EDITOR);
