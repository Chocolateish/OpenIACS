import { AccessTypes, defineElement } from "@libBase";
import { objectEmpty } from "@libCommon";
import {
  Button,
  ComponentGroup,
  ComponentGroupBorderStyle,
  Way,
} from "@libComponents";
import { promptButtons } from "@libPrompts";
import { Ok } from "@libResult";
import { stateOk } from "@libState";
import { Content, type ContentBaseOptions } from "@libUI";
import { ValueProxy } from "@libValues";
import type { ModuleBase } from "@modCommon";
import { ConfigWrapper } from "../module/configWrapper";
import "./moduleSettings.scss";

export type ModuleSettingsOptions = {
  module: ModuleBase;
} & ContentBaseOptions;

export class ModuleSettings extends Content<ModuleSettingsOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-settings";
  }
  static elementNameSpace() {
    return "lmui";
  }

  userAccess = stateOk<AccessTypes>(Ok(AccessTypes.NONE));
  adminAccess = stateOk<AccessTypes>(Ok(AccessTypes.NONE));

  status = new ValueProxy();
  group = this.appendChild(new ComponentGroup().options({ way: Way.LEFT }));
  save = this.appendChild(
    new ComponentGroup().options({
      way: Way.UP,
      position: Way.DOWN,
      border: ComponentGroupBorderStyle.OUTSET,
    })
  );
  protected __module?: ModuleBase;
  private saveAndCloseWaitingPromise?: (value: unknown) => void;

  constructor() {
    super();
    this.name = this.defaultName();
    this.classList.add("moduleSettings");
    if (this.canSave) {
      this.save.addComponent(
        new Button().options({
          text: "Save And Close",
          click: () => {
            this.__saveAndCloseSettings();
          },
          access: this.access,
        })
      );
      this.save.addComponent(
        new Button().options({
          text: "Save",
          click: () => {
            this.__saveSettings();
          },
          access: this.access,
        })
      );
    }
    this.save.addComponent(
      new Button().options({
        text: "Close",
        click: () => {
          this.close();
        },
      })
    );
  }

  /**Options toggeler*/
  options(options: ModuleSettingsOptions): this {
    super.options(options);
    this.module = options.module;
    return this;
  }

  /**Sets the module for the setting*/
  set module(module: ModuleBase) {
    this.__module = module;
    this.name = module.name + " | " + this.defaultName();
    this.attachState(this.__module.accessConfig, (val) => {
      this.userAccess.set(val);
    });
    this.attachState(this.__module.manager.adminAccess, (val) => {
      this.adminAccess.set(val);
    });
    this.status.proxy = this.__module.status!;
    this.classList.add("waiting");
    this.attachState(this.__module.configs, (val) => {
      this.__newConfigs(val);
      this.classList.remove("waiting");
      if (typeof this.saveAndCloseWaitingPromise === "function") {
        this.saveAndCloseWaitingPromise(undefined);
      }
    });
  }

  /** Cleanup when content is closed */
  async onClose() {
    if (this.__valuesChanged()) {
      let prompt = promptButtons({
        title: "Unsaved Changes",
        text: "Do you want to close anyway",
        buttons: [
          { text: "<b>Y</b>es", value: false, key: "y" },
          { text: "<b>N</b>o", value: true, key: "n" },
        ],
      });
      let confirm = await prompt.promise;
      if (confirm.data) {
        return true;
      }
      this.focus();
    }
    return undefined;
  }

  /** Updates special values from the module */
  protected __newConfigs(values: { [key: string]: any }) {
    this.group.values = values;
  }

  /** Should return true if values are changed*/
  protected __valuesChanged(): boolean {
    return this.group.hasChangedValue;
  }

  /**Must be set true to show save button */
  get canSave(): boolean {
    return false;
  }

  /** Saves the given data*/
  protected __saveSettings(values?: {}) {
    let saveData = { ...this.group.changedValues, ...values };
    this.__saveSend(saveData);
  }

  /** Saves the given data*/
  async __saveAndCloseSettings() {
    this.__saveSettings();
    await Promise.race([
      new Promise((a) => {
        setTimeout(a, 2500);
      }),
      new Promise((a) => {
        this.saveAndCloseWaitingPromise = a;
      }),
    ]);
    this.close();
  }

  /** Saves the given data*/
  __saveSend(values: { [key: string]: any }) {
    if (!objectEmpty(values)) {
      this.__module!.manager.sendMessage("SC", {
        modID: this.__module!.uid,
        num: this.__module!.manager.messageID,
        data: values,
      });
    }
  }

  set configs(_configs: ConfigWrapper | undefined) {}

  protected defaultName(): string {
    return "Settings";
  }
}
defineElement(ModuleSettings);
