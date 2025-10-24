import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { AccessTypes, defineElement } from "@libBase";
import { objectEquals } from "@libCommon";
import { Button, InputBox, InputBoxTypes } from "@libComponents";
import {
  Content,
  mainWindowManager,
  UIWindow,
  type ContentBaseOptions,
} from "@libUI";
import { ModuleValueAccessEnum, type ModuleManagerBase } from "@modCommon";
import { registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { VABAS } from "../VABAS";

export class CTACT extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: any[]) => {
      return "Actuator Controll";
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

  /**Generates an instance of the modules setting content */
  async generateSettingsContent(
    options: ModuleSettingsOptions
  ): Promise<ModuleSettings> {
    //@ts-expect-error
    return new Editor().options(options);
  }
}
registerModule("CTACT", CTACT);

//let filterOut = new ModuleFilter({ feature: { value: ModuleValueTypes.OUTPUT } });

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "ctact";
  }

  moveForwardId: ModuleSelectorOpener;
  moveBackwardId: ModuleSelectorOpener;
  pulsFast: InputBox;
  pulsMedium: InputBox;
  pulsSlow: InputBox;
  diffFast: InputBox;
  diffMedium: InputBox;
  diffSlow: InputBox;
  deadzone: InputBox;
  offTime: InputBox;
  actuatorSetup: Button;
  actuatorSetupResult: {} = {};
  actuatorSetupCopi: {} = {};

  constructor() {
    super();
    this.group.addComponent(
      (this.moveForwardId = new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "moveForwardId",
      }))
    );
    this.group.addComponent(
      (this.moveBackwardId = new ModuleSelectorOpener().options({
        access: this.userAccess,
        text: "moveBackwardId",
      }))
    );

    this.group.addComponent(
      (this.pulsFast = new InputBox().options({
        id: "pulsFast",
        text: "Time of pulse when lage diff",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.pulsMedium = new InputBox().options({
        id: "pulsMedium",
        text: "Time of pulse when medium diff",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.pulsSlow = new InputBox().options({
        id: "pulsSlow",
        text: "Time of pulse when small diff",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );

    this.group.addComponent(
      (this.diffFast = new InputBox().options({
        id: "diffFast",
        text: "Diff to be considerd lage",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.diffMedium = new InputBox().options({
        id: "diffMedium",
        text: "Diff to be considerd medium",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.diffSlow = new InputBox().options({
        id: "diffSlow",
        text: "Diff to be considerd small",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.deadzone = new InputBox().options({
        id: "deadzone",
        text: "Diff to be considerd on point",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.offTime = new InputBox().options({
        id: "offTime",
        text: "offTime",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.offTime = new InputBox().options({
        id: "stallTimerDeadzone",
        text: "stallTimerDeadzone",
        type: InputBoxTypes.NUMBER,
        min: -32768,
        max: 32768,
        access: this.userAccess,
      }))
    );
    this.group.addComponent(
      (this.actuatorSetup = new Button().options({
        text: "ActuatorSetup",
        click: async () => {
          this.actuatorSetupResult = (await this.__actuatorSetupEdit(
            "actuatorSetupResult",
            "actuatorSetup"
          )) as any;
        },
      }))
    );
  }

  /** Updates special values from the module*/
  __newConfigs(values: {
    moveForwardId: number;
    moveBackwardId: number;
    actuatorSetup: {};
  }) {
    super.__newConfigs(values);
    this.moveForwardId.value = this.__module!.manager.getModuleByUID(
      values["moveForwardId"]
    );
    this.moveBackwardId.value = this.__module!.manager.getModuleByUID(
      values["moveBackwardId"]
    );
    this.actuatorSetupCopi = { ...values["actuatorSetup"] };
    this.actuatorSetupResult = values["actuatorSetup"];
  }

  /**Must be set true to show save button */
  get canSave() {
    return true;
  }

  /** Saves the given data */
  __saveSettings() {
    let saveData: {
      moveForwardId?: number;
      moveBackwardId?: number;
      actuatorSetup?: {};
    } = {};
    let moveForwardIdChange = this.moveForwardId.changed as any;
    let moveBackwardIdChange = this.moveBackwardId.changed as any;

    if (moveForwardIdChange)
      saveData["moveForwardId"] = moveForwardIdChange.uid;
    if (moveBackwardIdChange)
      saveData["moveBackwardId"] = moveBackwardIdChange.uid;

    if (!objectEquals(this.actuatorSetupResult, this.actuatorSetupCopi))
      saveData["actuatorSetup"] = this.actuatorSetupResult;

    super.__saveSettings(saveData);
  }

  async __actuatorSetupEdit(key: keyof typeof this, nameActuatorSetup: string) {
    let actuatorSetup = new ActuatorSetupEdit({
      data: this[key] as any,
      nameArray: nameActuatorSetup,
      manager: this.__module!.manager,
    });
    mainWindowManager.appendWindow(
      new UIWindow().options({
        content: actuatorSetup,
        width: 800,
        height: 600,
      })
    );
    let result = await actuatorSetup.whenClosed;
    if (result) {
      return result;
    } else {
      return this[key];
    }
  }

  defaultName() {
    return "Control-Editor";
  }
}
defineElement(Editor);

let filter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.INPUT },
});

/**Defines base options for creating content*/
type ActuatorSetupEditOptions = {
  data: {
    maxValue: number;
    midValue: number;
    minValue: number;
    FBVal: number;
  };
  nameArray: string;
  manager: ModuleManagerBase;
} & ContentBaseOptions;

class ActuatorSetupEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-ctact-actuator-setup";
  }
  static elementNameSpace() {
    return "lmui";
  }

  feedback: InputBox;

  /**This creates an instance of the editor*/
  constructor(options: ActuatorSetupEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue = [] as any;

    this.appendChild(
      (this.feedback = new InputBox().options({
        text: "Actuator Feedback",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        access: AccessTypes.READ,
      }))
    );
    this.appendChild(
      (dataValue["maxValue"] = new InputBox().options({
        text: "Actuator Maximum value",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["maxValue"],
      }))
    );
    this.appendChild(
      (dataValue["midValue"] = new InputBox().options({
        text: "Actuator mid value (zero means not used) ",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["midValue"],
      }))
    );
    this.appendChild(
      (dataValue["minValue"] = new InputBox().options({
        text: "Actuator minimum value",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["minValue"],
      }))
    );

    let FBValue = options.manager.getModuleByUID(options.data["FBVal"]);
    if (FBValue) {
      this.feedback.value = FBValue.value;
    }
    this.appendChild(
      new Button().options({
        text: "Set Actuator Maximum Value",
        click: async () => {
          dataValue["maxValue"].value = this.feedback.value;
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Actuator Mid Value",
        click: async () => {
          dataValue["midValue"].value = this.feedback.value;
        },
      })
    );

    this.appendChild(
      new Button().options({
        text: "Set Actuator Minimum value",
        click: async () => {
          dataValue["minValue"].value = this.feedback.value;
        },
      })
    );
    this.appendChild(
      (dataValue["FBVal"] = new ModuleSelectorOpener().options({
        filter: filter,
        text: "Actuator Feedback",
        value: options.manager.getModuleByUID(options.data["FBVal"]) as any,
        change: (FBVal) => {
          this.feedback.value = FBVal.value;
        },
      }))
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["maxValue"].value) {
            options.data["maxValue"] = dataValue["maxValue"].value;
          }
          if (dataValue["minValue"].value) {
            options.data["minValue"] = dataValue["minValue"].value;
          }

          if (dataValue["FBVal"].value) {
            options.data["FBVal"] = dataValue["FBVal"].value.uid;
          }

          this.close(options.data);
        },
      })
    );
  }
}
defineElement(ActuatorSetupEdit);
