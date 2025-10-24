import { ModuleAdder } from "@components/moduleAdder";
import { ModuleListEditor } from "@components/moduleListEditor";
import {
  ModuleSettings,
  type ModuleSettingsOptions,
} from "@components/moduleSettings";
import { defineElement } from "@libBase";
import { ToggleSwitch, Way } from "@libComponents";
import { Err, Ok, type Result } from "@libResult";
import { selfClient } from "@modCommon";
import { Module, registerModule } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ModuleList, moduleListToServerModuleList } from "@module/moduleList";
import { DTSCF } from "../system";

/**Stores local cache of self client */
let localSelfClient: DTSCF | null = null;
selfClient.addListener((val) => {
  localSelfClient = val;
});

type ASWUNPreConfig = {
  attended: boolean;
  canChangeWatch: boolean;
  canAck: boolean;
  canHaveWatch: boolean;
  generalBuzzer: boolean;
  buzzWithMaster: boolean;
  buzzOnTransfer: boolean;
  clients: number[];
};

export class ASWUN extends Module {
  readonly attended?: boolean;
  readonly canChangeWatch: boolean = false;
  readonly canAck: boolean = false;
  readonly canHaveWatch?: boolean;
  readonly generalBuzzer?: boolean;
  readonly buzzWithMaster?: boolean;
  readonly buzzOnTransfer?: boolean;
  readonly clients: number[] = [];
  readonly clientsNormal: DTSCF[] = [];

  preConfigTransform(
    configs: Partial<ASWUNPreConfig>
  ): Result<ASWUNPreConfig, string> {
    if (typeof configs["attended"] !== "number")
      return Err("Invalid or missing attended");
    if (typeof configs["canChangeWatch"] !== "number")
      return Err("Invalid or missing canChangeWatch");
    if (typeof configs["canAck"] !== "number")
      return Err("Invalid or missing canAck");
    if (typeof configs["canHaveWatch"] !== "number")
      return Err("Invalid or missing canHaveWatch");
    if (typeof configs["generalBuzzer"] !== "number")
      return Err("Invalid or missing generalBuzzer");
    if (typeof configs["buzzWithMaster"] !== "number")
      return Err("Invalid or missing buzzWithMaster");
    if (typeof configs["buzzOnTransfer"] !== "number")
      return Err("Invalid or missing buzzOnTransfer");
    if (!Array.isArray(configs["clients"]))
      return Err("Invalid or missing clients");
    //@ts-expect-error
    this.attended = configs["attended"];
    //@ts-expect-error
    this.canChangeWatch = configs["canChangeWatch"];
    //@ts-expect-error
    this.canAck = configs["canAck"];
    //@ts-expect-error
    this.canHaveWatch = configs["canHaveWatch"];
    //@ts-expect-error
    this.generalBuzzer = configs["generalBuzzer"];
    //@ts-expect-error
    this.buzzWithMaster = configs["buzzWithMaster"];
    //@ts-expect-error
    this.buzzOnTransfer = configs["buzzOnTransfer"];
    //@ts-expect-error
    this.clients = configs["clients"];

    return Ok({
      attended: configs["attended"],
      canChangeWatch: configs["canChangeWatch"],
      canAck: configs["canAck"],
      canHaveWatch: configs["canHaveWatch"],
      generalBuzzer: configs["generalBuzzer"],
      buzzWithMaster: configs["buzzWithMaster"],
      buzzOnTransfer: configs["buzzOnTransfer"],
      clients: configs["clients"],
    });
  }

  /**This overwriteable method is run after value update, to let module link references to each other
   * During sync, the linking is run after all modules have been synced, to avoid linking to none existing modules*/
  protected __linking() {
    for (let i = 0, m = this.clients.length; i < m; i++) {
      let modBuff = this.manager.getModuleByUID(this.clients[i]);
      if (modBuff instanceof DTSCF) {
        switch (modBuff.designator) {
          case "DTSCF":
            this.clientsNormal.push(modBuff);
            break;
        }
      }
    }
  }

  update() {
    for (let i = 0, m = this.clients.length; i < m; i++) {
      let modBuff = this.manager.getModuleByUID(this.clients[i]);
      if (modBuff instanceof DTSCF) {
        switch (modBuff.designator) {
          case "DTSCF":
            this.clientsNormal.push(modBuff);
            break;
        }
      }
    }
  }

  /**Returns the function used to generate the text*/
  protected ___statusText() {
    return () => {
      return "Watch Group: " + this.name;
    };
  }

  /**Returns wether the given client is in the group, if a client is not provided, the client itself is used*/
  inGroup(client: DTSCF | null | undefined = localSelfClient) {
    if (!client) return false;
    let index = this.clientsNormal.indexOf(client);
    if (index != -1) return true;
    return false;
  }

  /**Whether the module can add sub modules*/
  get canAddSubModules(): boolean {
    return true;
  }

  /**Provides list of sub modules available for the module*/
  subModuleAdder(): ModuleAdder {
    return new ModuleAdder().options({
      subs: {
        "Buzzer Unit": () => {
          this.subModuleAdd("ASBUN", {});
        },
      },
    });
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
registerModule("ASWUN", ASWUN);

let clientFilter = new ModuleFilter({
  designators: { pass: ["DTSCF", "CLIGP"] },
});

class Editor extends ModuleSettings {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-editor-aswun";
  }

  clients: ModuleListEditor;
  private __moduleList?: ModuleList;
  private __moduleListEdit?: ModuleList;

  constructor() {
    super();
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "attended",
        text: 'Wether the group is "attended", other options depend on this',
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "canChangeWatch",
        text: "Wether the group can change who is on watch",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "canAck",
        text: "Wether the group can acknowledge alarms",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "canHaveWatch",
        text: "Wether the group can be given the watch",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );

    this.group.addComponent(
      new ToggleSwitch().options({
        id: "generalBuzzer",
        text: "Should the buzzer sound when watch is not with attended",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "buzzWithMaster",
        text: "Should the buzzer always sound",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "buzzOnTransfer",
        text: "Should buzzer sound at watch transfer",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "globalSilence",
        text: "Silence globally",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      new ToggleSwitch().options({
        id: "globalSilenceWhenWatch",
        text: "Silence globally when on watch",
        way: Way.LEFT,
        access: this.userAccess,
      })
    );
    this.group.addComponent(
      (this.clients = new ModuleListEditor().options({
        text: "Displays in watch group",
        addText: "Add Display",
        access: this.userAccess,
        filter: clientFilter,
      }))
    );
  }

  set module(mod: ASWUN) {
    super.module = mod;
    this.__moduleList = new ModuleList([
      ...(this.__module as ASWUN)!.clientsNormal,
    ]);
    this.__moduleListEdit = new ModuleList([
      ...(this.__module as ASWUN)!.clientsNormal,
    ]);
    this.clients.list = this.__moduleListEdit;
  }

  /**Must be set true to show save button*/
  get canSave(): boolean {
    return true;
  }

  /** Saves the given data*/
  __saveSettings() {
    let saveData: { clients?: number[] } = {};
    if (this.__moduleList!.compare(this.__moduleListEdit!))
      saveData["clients"] = moduleListToServerModuleList(
        this.__moduleListEdit!
      );
    super.__saveSettings(saveData);
  }

  protected defaultName(): string {
    return "Watch Group Editor";
  }
}
defineElement(Editor);
