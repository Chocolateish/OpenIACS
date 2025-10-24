import { ModuleAdder } from "@components/moduleAdder";
import { ModuleSelectorOpener } from "@components/moduleSelector";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { InputBox, InputBoxTypes, ToggleSwitch, Way } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import {
  ModuleValueAccessEnum,
  type ModuleBaseFixedConfigs,
  type ModuleBasePreConfigs,
  type ModuleManagerBase,
} from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ASWUN } from "./ASWUN";

type ASREGPreConfig = {
  watchSystem: boolean;
};

/** Module for alarm system */
export class ASREG extends Module<{}, ASREGPreConfig> {
  readonly watchSystem: boolean = false;

  constructor(
    manager: ModuleManagerBase,
    baseFixed: ModuleBaseFixedConfigs,
    basePre: ModuleBasePreConfigs,
    preConfigs: ASREGPreConfig
  ) {
    super(manager, baseFixed, basePre, preConfigs);
    let stor = manager.getPluginStorage("ALARM");
    stor.asreg = this;
  }

  preConfigTransform(
    configs: Partial<ASREGPreConfig>
  ): Result<ASREGPreConfig, string> {
    if (typeof configs["watchSystem"] !== "number")
      return Err("Invalid or missing watchSystem");
    //@ts-expect-error
    this.watchSystem = configs["watchSystem"];
    return Ok({
      watchSystem: configs["watchSystem"],
    });
  }

  get watchSystemEnabled() {
    return this.watchSystem;
  }

  get name() {
    return "Alarm System";
  }

  /**Returns if the module has status value to be read*/
  get hasStatusValues(): boolean {
    return true;
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return (values: any[]) => {
      return (
        "Alarm System, triggered:" + values[0] + " acknowledged:" + values[1]
      );
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

  /**Whether the module can add sub modules */
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    let subs: {
      "Alarm List": () => void;
      "Global Buzzer Unit": () => void;
      "Alarm Watch Unit"?: () => void;
    } = {
      "Alarm List": () => {
        this.subModuleAdd("ASALL", {});
      },
      "Global Buzzer Unit": () => {
        this.subModuleAdd("ASBUN", {});
      },
    };
    if (this.watchSystemEnabled) {
      subs["Alarm Watch Unit"] = () => {
        this.subModuleAdd("ASWUN", {});
      };
    }
    return new ModuleAdder().options({ subs });
  }
}
registerModule("ASREG", ASREG);

let watchGroupFilter = new ModuleFilter({
  designators: { pass: [ASWUN.name] },
});
let outputFilter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-asreg";
  }

  globalSilence = this.group.addComponent(
    new ToggleSwitch().options({
      id: "globalSilence",
      text: "Enable Global Silence",
      way: Way.LEFT,
      access: this.userAccess,
    })
  );
  watchSystemEnable = this.group.addComponent(
    new ToggleSwitch().options({
      id: "watchSystem",
      text: "Enable Watch System",
      way: Way.LEFT,
      access: this.userAccess,
    })
  );
  watchAckNeeded = this.group.addComponent(
    new ToggleSwitch().options({
      id: "watchAckNeeded",
      text: "Require watch group to accept to recieve watch",
      way: Way.LEFT,
      access: this.userAccess,
    })
  );
  watchSystemAckTime = this.group.addComponent(
    new InputBox().options({
      id: "watchAckTime",
      text: "Time before global buzzer is sounded if alarm is not acknowledged",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 1,
      max: 32760,
      unit: "sec",
      access: this.userAccess,
    })
  );
  watchTimeOut = this.group.addComponent(
    new InputBox().options({
      id: "watchTimeOut",
      text: "Time before a watch change request is canceled",
      type: InputBoxTypes.NUMBERWHOLEPOSITIVE,
      min: 1,
      max: 32760,
      unit: "sec",
      access: this.userAccess,
    })
  );
  defaultWatchGroup = this.group.addComponent(
    new ModuleSelectorOpener().options({
      id: "defaultWatchGroup",
      text: "Watch group on watch after reboot",
      filter: watchGroupFilter,
      access: this.userAccess,
      uidMode: true,
    })
  );
  generalOutput = this.group.addComponent(
    new ModuleSelectorOpener().options({
      id: "generalOutput",
      text: "General alarm output",
      filter: outputFilter,
      access: this.userAccess,
      uidMode: true,
    })
  );

  protected defaultName(): string {
    return "Editor";
  }

  set module(mod: Module) {
    super.module = mod;
    this.defaultWatchGroup.manager = this.__module!.manager;
    this.defaultWatchGroup.managers = [this.__module!.manager];
    this.generalOutput.manager = this.__module!.manager;
    this.generalOutput.managers = [this.__module!.manager];
  }

  get canSave() {
    return true;
  }
}
defineElement(Editor);
