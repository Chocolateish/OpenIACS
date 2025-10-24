import { ConditionEditorOpener } from "@components/conditionEditor";
import { ModuleAdder } from "@components/moduleAdder";
import { ModuleListEditor } from "@components/moduleListEditor";
import { ModuleSelectorOpener } from "@components/moduleSelector";
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
import { DropDown, TextBox } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { ModuleValueAccessEnum, selfClient } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ModuleList, moduleListToServerModuleList } from "@module/moduleList";
import { DTSCF } from "../system";

/**Stores local cache of self client */
let localSelfClient: DTSCF | null = null;
selfClient.addListener((val) => {
  localSelfClient = val;
});

type ASALLPreConfig = {
  passBlockListMode: number;
  clients: number[];
};

export class ASALL extends Module<{}, ASALLPreConfig> {
  readonly passBlockListMode: number = NaN;
  readonly clients: DTSCF[] = [];
  private __doLink?: boolean;
  private clientsForLinking: number[] = [];
  clientsNormal: DTSCF[] = [];

  preConfigTransform(
    configs: Partial<ASALLPreConfig>
  ): Result<ASALLPreConfig, string> {
    if (typeof configs["passBlockListMode"] !== "number")
      return Err("Invalid or missing passBlockListMode");
    if (typeof configs["clients"] !== "number")
      return Err("Invalid or missing clients");
    //@ts-expect-error
    this.passBlockListMode = configs["passBlockListMode"];
    //@ts-expect-error
    this.clients = configs["clients"];
    return Ok({
      passBlockListMode: configs["passBlockListMode"],
      clients: configs["clients"],
    });
  }

  /**This overwriteable method is run after value update, to let module link references to each other
   * During sync, the linking is run after all modules have been synced, to avoid linking to none existing modules*/
  protected __linking() {
    if (this.__doLink) {
      for (let i = 0, m = this.clients.length; i < m; i++) {
        let modBuff = this.manager.getModuleByUID(this.clientsForLinking[i]);
        if (modBuff) {
          this.clients[i] = modBuff as DTSCF;
          switch (modBuff.designator) {
            case "DTSCF":
              this.clientsNormal.push(modBuff as DTSCF);
              break;
          }
        }
      }
      delete this.__doLink;
    }
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Alarm List: " + this.name;
    };
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        Alarm: () => {
          this.subModuleAdd("ASALA", {});
        },
      },
    });
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
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

  /**Returns wether the given client is in the group, if a client is not provided, the client itself is used */
  inGroup(client: DTSCF | null | undefined = localSelfClient) {
    if (!client) return false;
    let index = this.clientsNormal.indexOf(client);
    if (index != -1) return true;
    return false;
  }

  /**Returns wether the alarm list can be acknowledged*/
  get ackAllowed(): boolean {
    switch (this.passBlockListMode) {
      case 1:
        return this.inGroup();
      case 2:
        return !this.inGroup();
      default:
        return true;
    }
  }
}
registerModule("ASALL", ASALL);

let clientFilter = new ModuleFilter({
  designators: { pass: ["DTSCF", "CLIGP"] },
});
let generalOutputFilter = new ModuleFilter({
  feature: { value: ModuleValueAccessEnum.OUTPUT },
});

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-asall";
  }

  passBlockListMode: DropDown;
  clients: ModuleListEditor;
  generalOutput: ModuleSelectorOpener;
  private __moduleList?: ModuleList;
  private __moduleListEdit?: ModuleList;
  condition: import("@components/conditionEditor").ConditionEditorOpener;

  constructor() {
    super();
    this.group.addComponent(
      new TextBox().options({
        text: "Using the below options, you can control which displays can acknowledge alarms on this list",
      })
    );
    this.passBlockListMode = this.group.addComponent(
      new DropDown().options({
        id: "passBlockListMode",
        text: "Blocklist or Passlist",
        access: this.userAccess,
        options: [
          { text: "Disabled", value: 0 },
          { text: "Allow Acknowledge", value: 1 },
          { text: "Block Acknowledge", value: 2 },
        ],
      })
    );
    this.clients = this.group.addComponent(
      new ModuleListEditor().options({
        filter: clientFilter,
        addText: "Add Display",
        text: "List of Displays",
        access: this.userAccess,
      })
    );
    this.generalOutput = this.group.addComponent(
      new ModuleSelectorOpener().options({
        id: "generalOutput",
        text: "General alarm output",
        filter: generalOutputFilter,
        access: this.userAccess,
        uidMode: true,
      })
    );
    this.condition = this.group.appendChild(
      new ConditionEditorOpener().options({
        id: "condition",
        text: "Interlock condition for alarms in list",
        access: AccessTypes.WRITE,
        editorAccess: this.userAccess,
        parent: this,
      })
    );
  }
  private __condition?: Condition;

  set module(mod: Module) {
    super.module = mod;
    this.generalOutput.manager = this.__module!.manager;
    this.generalOutput.managers = [this.__module!.manager];
  }

  __newConfigs(configs: { [key: string]: any }) {
    super.__newConfigs(configs);
    //@ts-expect-error
    this.__moduleList = new ModuleList([...(this.__module as ASALL)!.clients]);
    this.__moduleListEdit = new ModuleList([
      //@ts-expect-error
      ...(this.__module as ASALL)!.clients,
    ]);
    this.clients.list = this.__moduleListEdit;
    this.__condition = new Condition();
    serverConditionToCondition(
      this.__condition,
      configs["condition"],
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
      clients?: number[];
      condition?: ServerCondition;
    } = {};
    if (this.__moduleList!.compare(this.__moduleListEdit!))
      saveData["clients"] = moduleListToServerModuleList(
        this.__moduleListEdit!
      );

    let cond = this.condition.condition!;
    if (this.__condition!.compare(cond))
      saveData["condition"] = conditionToServerCondition(cond);
    super.__saveSettings(saveData);
  }

  protected defaultName(): string {
    return "Alarm List Editor";
  }
}
defineElement(Editor);
