import { defineElement } from "@libBase";
import { defineElementValues } from "@libCommon";
import { Button, TextBoxValue } from "@libComponents";
import type { ESubscriber } from "@libEvent";
import {
  ListCell,
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
  type ListRowOptions,
} from "@libLister";
import { PromptInfo, promptInfo } from "@libPrompts";
import type { StateSubscriber } from "@libState";
import {
  Content,
  type ContentBaseOptions,
  type ContextMenuLines,
  UIWindow,
  attachContextMenu,
} from "@libUI";
import { type ModuleBase, ModuleValueAccessEnum } from "@modCommon";
import { Module } from "@module/module";
import { managerListEvents, managers } from "@system/moduleManagerManager";
import "./moduleBrowser.scss";
import { ModuleValueChanger } from "./moduleValueChanger";

let moduleBrowserCustomScript = (_module: ModuleBase) => {};

export function setModuleBrowserCustomScript(
  func: (module: ModuleBase) => void
) {
  moduleBrowserCustomScript = func;
}

/** */
type ModuleBrowserOptions = {
  /**list of managers to open */
  managers?: undefined;
} & ContentBaseOptions;

export class ModuleBrowser extends Content<ModuleBrowserOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-browser";
  }

  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({
      header: ["ID", "Sub", "Name", "Value", "Status", "Actions", "Access"],
    })
  );

  /**Options toggeler*/
  options(options: ModuleBrowserOptions): this {
    super.options(options);
    this.managers = options.managers;
    return this;
  }

  /**Sets which managers are displayed in the browser*/
  set managers(_mansnot: undefined) {
    let mans = managers();
    managerListEvents.on("created", (ev) => {
      this.__list.addRow(
        new ModuleRow().options({ module: ev.data.manager.root, top: this })
      );
    });
    for (let i = 0, n = mans.length; i < n; i++) {
      this.__list.addRow(
        new ModuleRow().options({ module: mans[i].root, top: this })
      );
    }
  }

  /**Name of content*/
  get name(): string {
    return "System Browser";
  }
}
defineElement(ModuleBrowser);

/**Options for module row*/
export type ModuleBrowserModuleRowOptions = {
  /**Module to display */
  module: ModuleBase;
  top?: ModuleBrowser;
} & ListRowOptions;

class ModuleRow extends ListRow<ModuleBrowserModuleRowOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-browser-module-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __module?: ModuleBase;
  private __top?: ModuleBrowser;
  private __childAddedListener?: ESubscriber<"childAdded", any, any>;
  private __childRemovedListener?: ESubscriber<"childRemoved", any, any>;
  private __removeListener?: ESubscriber<"removed", any, any>;

  /**Options toggeler*/
  options(options: ModuleBrowserModuleRowOptions): this {
    super.options(options);
    this.module = options.module;
    this.__top = options.top;
    return this;
  }

  async openSettings() {
    //@ts-expect-error
    if (this.__module.hasSettings) {
      //@ts-expect-error
      let settings = this.__module.generateSettingsContent().options({
        module: this.__module!,
        parent: this.__top,
      });
      this.ownerDocument.windowManager.appendWindow(
        new UIWindow().options({
          content: await settings,
          width: 600,
          height: "content",
          maxHeight: "80%",
        })
      );
      return (await settings).whenClosed;
    }
    return undefined;
  }
  async openAddModule() {
    if (this.__module!.canAddSubModules) {
      let adder = this.__module!.subModuleAdder({});
      this.ownerDocument.windowManager.appendWindow(
        new UIWindow().options({
          content: adder,
          width: 600,
          height: "content",
          maxHeight: "60%",
        })
      );
      return adder.whenClosed;
    }
    return undefined;
  }
  async openValueChanger() {
    if (this.__module!.valueAccess >= ModuleValueAccessEnum.OUTPUT) {
      let changer = new ModuleValueChanger().options({
        module: this.__module!,
        parent: this.__top,
      });
      this.ownerDocument.windowManager.appendWindow(
        new UIWindow().options({
          content: changer,
          width: 400,
          height: "content",
          maxHeight: 200,
        })
      );
      return changer.whenClosed;
    }
    return undefined;
  }
  /** Changes the manager for the row*/
  set module(mod: ModuleBase) {
    if (mod instanceof Module) {
      if (this.__module) {
        mod.events.off("childAdded", this.__childAddedListener!);
        mod.events.off("childRemoved", this.__childRemovedListener!);
        mod.events.off("removed", this.__removeListener!);
      }
      this.__module = mod;

      this.config = mod.configs;

      this.onkeydown = async (e: KeyboardEvent) => {
        if (!e.ctrlKey) return;
        if (["e", "r", "a", "z", "x", "b"].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }
        let configs = (await mod.configs!).unwrap;
        switch (e.key) {
          case "e":
            await this.openSettings();
            break;
          case "r":
            if (configs["nt"]) {
              await mod.rename(this.__top);
            }
            break;
          case "a":
            await this.openAddModule();
            break;
          case "z":
            await mod.reaccess(this.__top);
            break;
          case "x":
            if (configs["cd"]) {
              await mod.deleteWithWarning();
            }
            this.previous.focus();
            return;
          case "b":
            await this.openValueChanger();
            break;
          case "q":
            moduleBrowserCustomScript(this.__module!);
            break;
          default:
            return;
        }
        this.focus();
      };

      //@ts-expect-error
      attachContextMenu(this, async () => {
        let configs = (await mod.configs!).unwrap;
        let lines: ContextMenuLines = [];
        if (configs["nt"]) {
          lines.push({
            text: "Rename",
            func: async () => {
              await mod.rename(this.__top);
              this.focus();
            },
          });
        }
        if (mod.canAddSubModules) {
          lines.push({
            text: "Add Sub Module",
            func: async () => {
              await this.openAddModule();
              this.focus();
            },
          });
        }
        if (configs["cd"]) {
          lines.push({
            text: "Delete",
            func: async () => {
              mod.deleteWithWarning();
              this.previous.focus();
            },
          });
        }
        if (mod.hasSettings) {
          lines.push({
            text: "Settings",
            func: async () => {
              await this.openSettings();
              this.focus();
            },
          });
        }
        if (mod.valueAccess >= ModuleValueAccessEnum.OUTPUT) {
          lines.push({
            text: "Change Value",
            func: async () => {
              await this.openValueChanger();
              this.focus();
            },
          });
        }
        lines.push({
          text: "Change Access",
          func: async () => {
            await mod.reaccess(this.__top);
            this.focus();
          },
        });
        return lines;
      });

      this.openable = mod.amountChildren > 0;

      this.__childAddedListener = mod.events.on("childAdded", (ev) => {
        this.openable = true;
        if (this.open) {
          this.addRow(
            new ModuleRow().options({ module: ev.data.module }),
            ev.data.module.sid
          );
        }
        return false;
      });
      this.__childRemovedListener = mod.events.on("childRemoved", (e) => {
        if (e.target.amountChildren == 0) {
          this.openable = false;
        }
        return false;
      });
      this.__removeListener = mod.events.on("removed", () => {
        this.remove();
        return false;
      });
    }
  }
  onpasteglobal = async (e: ClipboardEvent) => {
    let text = e.clipboardData!.getData("text");
    if (text.includes("\n")) {
      let texts = text.replace("\r", "").split("\n");
      if (texts.length > 1 && texts[texts.length - 1] == "") {
        texts.pop();
      }
      let children = this.__module!.parent!.children;
      let indexOfSelf = children.indexOf(this.__module!);
      let slice = children.slice(indexOfSelf);
      for (let i = 0; i < Math.min(slice.length, texts.length); i++) {
        if (texts[i] !== undefined) {
          slice[i].___rename(texts[i]);
        }
        await new Promise((a) => {
          setTimeout(a, 250);
        });
      }
    } else {
      if (e.clipboardData!.getData("text")) {
        this.__module!.___rename(e.clipboardData!.getData("text"));
      }
    }
  };
  oncopyglobal = (e: ClipboardEvent) => {
    e.preventDefault();
    e.clipboardData!.setData(
      "text/plain",
      String(this.__module!.manager.ipAddress) +
        ":" +
        String(this.__module!.uid)
    );
  };

  set config(_config: any) {}

  $vfconfig() {
    this.emptyRow();
    this.addCell(
      new ListCellText().options({
        text: "ID: " + this.__module!.uid + "<br>" + this.__module!.designator,
      })
    );
    this.addCell(
      new ListCellText().options({ text: String(this.__module!.sid) })
    );
    this.addCell(new ListCellText().options({ text: this.__module!.name }));
    if (this.__module!.hasValue) {
      this.addCell(
        new ListCellComponents().options({
          components: [
            new TextBoxValue().options({
              value: this.__module!.valueFormatted,
              unit: this.__module!.unit,
            }),
          ],
        })
      );
    } else {
      this.addCell(new ListCell().options({}));
    }
    this.addCell(
      new ListCellComponents().options({
        components: [
          new TextBoxValue().options({
            value: this.__module!.statusText!,
            decimals: false,
          }),
        ],
      })
    );
    //@ts-expect-error
    if (this.__module!.__proto__.hasOwnProperty("browserActions")) {
      this.addCell(
        new ListCellComponents().options({
          components: this.__module!.browserActions.map((act) => {
            return new Button().options({ text: act.text, click: act.action });
          }),
        })
      );
    } else {
      this.addCell(new ListCellText().options({ text: "" }));
    }

    this.addCell(
      new ListCellText().options({
        text: `${
          this.__module!.manager.getUserById(this.__module!.user)?.name ??
          "None"
        }<br>${
          this.__module!.manager.getUserById(this.__module!.user2)?.name ??
          "None"
        }`,
      })
    );
  }

  /**Function to handle opening this module*/
  async openFunc() {
    let sortedChildren = this.__module!.children.sort((a, b) => {
      return a.sid - b.sid;
    });
    let loadPrompt: undefined | PromptInfo;
    let promptTimeout = setTimeout(() => {
      loadPrompt = promptInfo({
        container: this.___top,
        parent: this.__top,
        title: "Loading...",
        text: ".",
      });
    }, 2000);
    let tempListeners = [] as StateSubscriber<{}>[];
    for (let i = 0; i < sortedChildren.length; i++) {
      let prom = sortedChildren[i].configs;
      tempListeners.push(
        sortedChildren[i].configs.subscribe(() => {
          if (loadPrompt) {
            loadPrompt.text =
              i +
              1 +
              " out of " +
              sortedChildren.length +
              " " +
              (((i + 1) / sortedChildren.length) * 100).toFixed(1) +
              "%";
          }
        })
      );
      await prom;
    }
    setTimeout(() => {
      sortedChildren.forEach((e, i) => {
        e.configs.unsubscribe(tempListeners[i]);
      });
    }, 3000);
    clearTimeout(promptTimeout);
    if (loadPrompt) {
      loadPrompt.close();
    }
    return sortedChildren.map((e) => {
      return new ModuleRow().options({ module: e, top: this.__top });
    });
  }
}
defineElement(ModuleRow);
defineElementValues(ModuleRow, ["config"]);
