import { defineElement } from "@libBase";
import {
  Button,
  Component,
  TextBoxValue,
  type ComponentBaseOptions,
} from "@libComponents";
import type { ESubscriber } from "@libEvent";
import {
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
  type ListRowOptions,
} from "@libLister";
import { getWindowManagerFromElement, UIWindow } from "@libUI";
import { Module } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import { ModuleList } from "@module/moduleList";
import "./moduleListEditor.scss";
import { ModuleSelector } from "./moduleSelector";

/**Defines options for the module selector component*/
type ModuleListOptions = {
  /**Filter for which modules are allowed */
  filter?: ModuleFilter;
  /**Text in add button */
  addText?: string;
} & ComponentBaseOptions;

export class ModuleListEditor extends Component<ModuleListOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-list-editor";
  }

  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({
      header: ["ID", "Name", "Value", "Remove"],
      sizeable: false,
    })
  );
  private __adder = this.appendChild(
    new Button().options({
      click: async () => {
        if (!this.__selectorOpen) {
          this.__selectorOpen = true;
          let selector = new ModuleSelector().options({
            filter: this.__filter,
          });
          getWindowManagerFromElement(this).appendWindow(
            new UIWindow().options({
              content: selector,
              width: 600,
              height: 600,
            })
          );
          let res = await selector.whenClosed;
          if (res && res instanceof Module) {
            this.__modList!.addModule(res);
          }
          this.__selectorOpen = false;
        }
      },
    })
  );
  private __selectorOpen?: boolean;
  private __filter?: ModuleFilter;
  private __modList?: ModuleList;
  private __listListener?: (mods: any) => void;
  private __text?: HTMLSpanElement;

  /**Attaches access listener when element is attached*/
  connectedCallback() {
    super.connectedCallback();
    if (this.__listListener) {
      this.__modList!.addListener(this.__listListener, true);
    }
  }

  /**Clean up at removal, removes event listener from access if present */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.__listListener) {
      this.__modList!.removeListener(this.__listListener);
    }
  }

  /**Options toggeler*/
  options(options: ModuleListOptions): this {
    super.options(options);
    if (typeof options.addText !== "undefined")
      this.__adder.text = options.addText;
    if (typeof options.filter !== "undefined") this.filter = options.filter;
    return this;
  }

  /**Sets the filter to use for the selector*/
  set filter(fil: ModuleFilter) {
    this.__filter = fil;
  }

  /**Sets the list to edit*/
  set list(list: ModuleList) {
    if (this.__modList) this.__modList.removeListener(this.__listListener!);
    this.__modList = list;
    this.__list.empty();
    let mods = list.get;
    for (let i = 0; i < mods.length; i++) {
      this.__list.addRow(
        new ModuleRow().options({ module: mods[i], top: this })
      );
    }
    this.__listListener = (mods) => {
      this.__list.empty();
      for (let i = 0; i < mods.length; i++) {
        this.__list.addRow(
          new ModuleRow().options({ module: mods[i], top: this })
        );
      }
    };
    if (this.isConnected) {
      this.__modList.addListener(this.__listListener, true);
    }
  }

  set text(text: string) {
    if (typeof text == "string") {
      if (!this.__text) {
        this.__text = this.insertBefore(
          document.createElement("span"),
          this.firstChild
        );
      }
      this.__text.innerHTML = text;
    } else if (this.__text) {
      this.removeChild(this.__text);
      delete this.__text;
    }
  }
}
defineElement(ModuleListEditor);

/**Options for module row*/
type ModuleListRowOptions = {
  top: ModuleListEditor;
  module: Module;
} & ListRowOptions;

class ModuleRow extends ListRow<ModuleListRowOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-list-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __top?: ModuleListEditor;
  private __module?: Module;
  private __updateListener?: ESubscriber<"updated", any, any>;
  private __removeListener?: ESubscriber<"removed", any, any>;

  /**Options toggeler*/
  options(options: ModuleListRowOptions): this {
    super.options(options);
    this.__top = options.top;
    this.module = options.module;
    return this;
  }

  /** Changes the manager for the row*/
  set module(mod: Module) {
    if (mod instanceof Module) {
      if (this.__module) {
        mod.events.off("updated", this.__updateListener!);
        mod.events.off("removed", this.__removeListener!);
      }
      this.__module = mod;
      this.__drawLine();
      this.__updateListener = mod.events.on("updated", () => {
        this.__drawLine();
        return false;
      });
      this.__removeListener = mod.events.on("removed", () => {
        this.remove();
        return false;
      });
    }
  }

  /**This removes all cells from the row and creates them again*/
  __drawLine() {
    this.emptyRow();
    this.addCell(
      new ListCellText().options({
        text: "ID: " + this.__module!.uid + "<br>" + this.__module!.designator,
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          new TextBoxValue().options({
            value: this.__module!.statusText,
            decimals: 500,
          }),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          new TextBoxValue().options({ value: this.__module!.value }),
        ],
      })
    );
    this.addCell(
      new ListCellComponents().options({
        components: [
          new Button().options({
            text: "Remove",
            click: () => {
              // @ts-expect-error
              this.__top.__modList.removeModule(this.__module!);
            },
          }),
        ],
      })
    );
  }
}
defineElement(ModuleRow);
