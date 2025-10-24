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

export class CTALC extends VABAS {
  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (_values: any[]) => {
      return "Analog Controll";
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
registerModule("CTALC", CTALC);

//let filterOut = new ModuleFilter({ feature: { value: ModuleValueTypes.OUTPUT } });

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "ctalc";
  }

  analogSetup: Button;
  analogSetupResult: {} = {};
  analogSetupCopi: {} = {};

  constructor() {
    super();
    this.analogSetup = this.group.addComponent(
      new Button().options({
        text: "analogSetup",
        click: async () => {
          this.analogSetupResult = (await this.__analogSetupEdit(
            "analogSetupResult",
            "analogSetup"
          )) as any;
        },
      })
    );
  }

  /** Updates special values from the module */
  __newConfigs(values: any) {
    super.__newConfigs(values);
    this.analogSetupCopi = { ...values["analogSetup"] };
    this.analogSetupResult = values["analogSetup"];
  }

  /**Must be set true to show save button*/
  get canSave() {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData: {
      analogSetup?: {};
    } = {};
    if (!objectEquals(this.analogSetupResult, this.analogSetupCopi)) {
      saveData["analogSetup"] = this.analogSetupResult;
    }
    super.__saveSettings(saveData);
  }
  async __analogSetupEdit(key: keyof typeof this, nameanalogSetup: string) {
    let analogSetup = new AnalogSetupEdit({
      data: this[key] as any,
      nameArray: nameanalogSetup,
      manager: this.__module!.manager,
    });
    mainWindowManager.appendWindow(
      new UIWindow().options({ content: analogSetup, width: 800, height: 600 })
    );
    let result = await analogSetup.whenClosed;
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
type AnalogSetupEditOptions = {
  /**The array to be edited*/
  data: {
    maxValue: number;
    midValue: number;
    minValue: number;
    outputID: number;
  };
  /**name of the array*/
  nameArray: string;
  /**Manager */
  manager: ModuleManagerBase;
} & ContentBaseOptions;

class AnalogSetupEdit extends Content {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings-ctalc-analog-setup";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private output: InputBox;

  /**This creates an instance of the editor*/
  constructor(options: AnalogSetupEditOptions) {
    super();
    this.name = options.nameArray;
    let dataValue: {
      maxValue?: InputBox;
      midValue?: InputBox;
      minValue?: InputBox;
      outputID?: ModuleSelectorOpener;
      maxValueSP?: any;
      midValueSP?: any;
      minValueSP?: any;
    } = {};

    this.output = this.appendChild(
      new InputBox().options({
        text: "Analog Output",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        access: AccessTypes.READ,
      })
    );
    dataValue["maxValue"] = this.appendChild(
      new InputBox().options({
        text: "Maximum value",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["maxValue"],
      })
    );
    dataValue["midValue"] = this.appendChild(
      new InputBox().options({
        text: "Mid value (zero means not used) ",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["midValue"],
      })
    );
    this.appendChild(
      (dataValue["minValue"] = new InputBox().options({
        text: "Minimum value",
        type: InputBoxTypes.NUMBER,
        min: 0,
        max: 32760,
        unit: "V",
        value: options.data["minValue"],
      }))
    );

    let outputValue = options.manager.getModuleByUID(options.data["outputID"]);
    if (outputValue) this.output.value = outputValue.value;

    this.appendChild(
      new Button().options({
        text: "Set Actuator Setpoint Maximum Value",
        click: async () => {
          dataValue["maxValueSP"].value = this.output.value;
        },
      })
    );
    this.appendChild(
      new Button().options({
        text: "Set Actuator Setpoint Mid Value",
        click: async () => {
          dataValue["midValueSP"].value = this.output.value;
        },
      })
    );

    this.appendChild(
      new Button().options({
        text: "Set Actuator Minimum Setpoint value",
        click: async () => {
          dataValue["minValueSP"].value = this.output.value;
        },
      })
    );
    dataValue["outputID"] = this.appendChild(
      new ModuleSelectorOpener().options({
        filter: filter,
        text: "Analog Feedback",
        value: options.manager.getModuleByUID(options.data["outputID"]) as any,
        change: (outputValue) => {
          this.output.value = outputValue.value;
        },
      })
    );

    this.appendChild(
      new Button().options({
        text: "Save and Close",
        click: () => {
          if (dataValue["maxValue"]!.value)
            options.data["maxValue"] = dataValue["maxValue"]!.value as number;
          if (dataValue["minValue"]!.value)
            options.data["minValue"] = dataValue["minValue"]!.value as number;
          if (dataValue["outputID"]!.value)
            options.data["outputID"] = (
              dataValue["outputID"]!.value as any
            ).uid;
          this.close(options.data);
        },
      })
    );
  }
}
defineElement(AnalogSetupEdit);
