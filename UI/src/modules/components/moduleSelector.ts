import { defineElement } from "@libBase";
import { defineElementValues } from "@libCommon";
import {
  Button,
  TextBoxValue,
  ValueComponent,
  type ValueComponentOptions,
} from "@libComponents";
import type { ESubscriber } from "@libEvent";
import {
  ListCell,
  ListCellComponents,
  ListCellText,
  ListContainer,
  ListRow,
} from "@libLister";
import {
  Content,
  type ContentBaseOptions,
  getWindowManagerFromElement,
  UIWindow,
} from "@libUI";
import { type ModuleBase, type ModuleManagerBase } from "@modCommon";
import { Module } from "@module/module";
import { ModuleFilter } from "@module/moduleFilter";
import type { ModuleValueFormatted } from "@module/moduleValue";
import { ModuleManager } from "@system/moduleManager";
import { getManagerByIP, managers } from "@system/moduleManagerManager";
import "./moduleSelector.scss";

/**Stores the last selected module*/
let lastOpen: Module | null = null;

/***/
export type ModuleSelectorOptions = {
  /**list of managers to select from */
  managers?: ModuleManagerBase[];
  /**sets the filter for the selector */
  filter?: ModuleFilter;
  /**sets the function to run at selection */
  callback?: ModuleSelectorCallback;
} & ContentBaseOptions;

/**Defines the callback function for the selector*/
type ModuleSelectorCallback = (mod: Module) => void;

export class ModuleSelector extends Content<ModuleSelectorOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-selector";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __list = this.appendChild(
    new ListContainer().options({
      header: ["ID", "Sub", "Name", "Value", "Select"],
      sizeable: false,
    })
  );
  private __filter?: ModuleFilter[];
  callback?: ModuleSelectorCallback;

  /**Options toggeler*/
  options(options: ModuleSelectorOptions): this {
    super.options(options);
    if (typeof options.filter !== "undefined") {
      this.filter = options.filter;
    } else {
      this.filter = new ModuleFilter({});
    }
    this.managers = options.managers;
    if (options.callback) this.callback = options.callback;
    return this;
  }

  /**Returns name of content*/
  get name(): string {
    return "Module Selector";
  }

  /**This set the filter to use for the module selection only modules which pass the filter can be selected
   * @param  filter see filter class for more detail*/
  set filter(filter: ModuleFilter | ModuleFilter[]) {
    if (filter instanceof ModuleFilter) this.__filter = [filter];
    else this.__filter = filter;
  }

  /**Checks the filter agains a module*/
  checkFilter(mod: ModuleBase): boolean {
    if (this.__filter!.length === 1) return this.__filter![0].checkModule(mod);
    else {
      for (let i = 0; i < this.__filter!.length; i++)
        if (!this.__filter![i].checkModule(mod)) return false;
      return true;
    }
  }

  /**Sets which managers are displayed in the browser
   * @param  mans set nothing to browse all managers*/
  set managers(mans: ModuleManagerBase[] | undefined) {
    if (!mans) mans = managers();
    for (let i = 0, n = mans.length; i < n; i++)
      this.__list.addRow(new ModuleRow({ module: mans[i].root, top: this }));
    if (lastOpen) this.openToModule = lastOpen;
  }

  /**This opens the module manager to a specific module, or multiple modules*/
  set openToModule(mod: Module | Module[]) {
    if (mod instanceof Module) mod = [mod];
    for (let i = 0; i < mod.length; i++)
      if (mod[i] instanceof Module) {
        let path = mod[i].path;
        let row: ListContainer | ListRow[] = this.__list;
        for (let y = 0; y < path.length - 1; y++) {
          let found = false;
          //@ts-expect-error
          let rows = row.___rows;
          for (let z = 0; z < rows.length; z++) {
            if (rows[z].__module === path[y]) {
              rows[z].open = true;
              row = rows[z];
              found = true;
              break;
            }
          }
          if (!found) break;
        }
      }
  }

  /**Used when sub row selects */
  protected __select(module: Module) {
    lastOpen = module;
    this.close(module);
  }
}
defineElement(ModuleSelector);

/**Options for module row*/
type ModuleSelectorModuleRowOptions = {
  module: ModuleBase;
  top?: ModuleSelector;
};

class ModuleRow extends ListRow {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-selector-row";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __top?: ModuleSelector;
  private __childAddedListener?: ESubscriber<"childAdded", ModuleBase, any>;
  private __childRemovedListener?: ESubscriber<"childRemoved", ModuleBase, any>;
  private __updateListener?: ESubscriber<"updated", ModuleBase, any>;
  private __removeListener?: ESubscriber<"removed", ModuleBase, any>;
  private __module?: ModuleBase;
  private __manager: any;

  constructor(options: ModuleSelectorModuleRowOptions) {
    super();
    this.__top = options.top;
    let mod = options.module;
    if (this.__manager) {
      mod.events.off("childAdded", this.__childAddedListener!);
      mod.events.off("childRemoved", this.__childRemovedListener!);
      mod.events.off("updated", this.__updateListener!);
      mod.events.off("removed", this.__removeListener!);
    }
    this.__module = mod;

    this.openable = mod.amountChildren > 0;

    this.__drawLine();
    mod.events.off("childAdded", (ev) => {
      this.openable = true;
      if (this.open)
        this.addRow(
          new ModuleRow({ module: (ev.data as any).module }),
          (ev.data as any).module.sid
        );
    });
    mod.events.off("childRemoved", (e) => {
      if (e.target.amountChildren == 0) this.openable = false;
    });
    mod.events.off("updated", () => {
      this.__drawLine();
    });
    mod.events.off("removed", () => {
      this.remove();
    });
  }

  /**This removes all cells from the row and creates them again*/
  private __drawLine() {
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
              value: this.__module!.value,
              unit: this.__module!.unit,
            }),
          ],
        })
      );
    } else this.addCell(new ListCell().options({}));
    if (this.__top!.checkFilter(this.__module!)) {
      this.addCell(
        new ListCellComponents().options({
          components: [
            new Button().options({
              text: "Select",
              click: () => {
                //@ts-expect-error
                this.__top!.__select(this.__module!);
              },
            }),
          ],
        })
      );
    } else this.addCell(new ListCell().options({}));
  }

  /**Function to handle opening this module*/
  async openFunc() {
    return this.__module!.children.sort((a, b) => {
      return a.sid - b.sid;
    }).map((e) => {
      return new ModuleRow({ module: e, top: this.__top });
    });
  }
}
defineElement(ModuleRow);

/**Defines options for the module selector component*/
type ModuleSelectorOpenerOptions = {
  /**The filter to use for the selector */
  filter?: ModuleFilter;
  /**The manager to use if only an id is passed */
  manager?: ModuleManager;
  /**The managers to select from */
  managers?: ModuleManager[];
  /**True to use uid instead of module object */
  uidMode?: boolean;
} & ValueComponentOptions;

export class ModuleSelectorOpener extends ValueComponent<ModuleSelectorOpenerOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "module-selector-opener";
  }
  static elementNameSpace() {
    return "lmui";
  }

  private __button = document.createElement("div");
  private __filter?: ModuleFilter;
  private __manager?: ModuleManagerBase;
  private __managers?: ModuleManagerBase[];
  private __uidMode?: boolean;
  private __text?: HTMLSpanElement;
  private __selectorOpen?: boolean;
  private __selector?: ModuleSelector;
  private __moduleName: HTMLDivElement = document.createElement("div");
  private __moduleValue: HTMLDivElement = document.createElement("div");

  constructor() {
    super();
    this.__button.tabIndex = 0;
    //@ts-expect-error
    this.__button.onpasteglobal = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        let text = e.clipboardData.getData("text");
        if (this.__uidMode) this.__setValue(parseInt(text));
        else {
          let split = text.split(":");
          let manger = getManagerByIP(split[0]);
          if (manger) {
            let module = manger.getModuleByUID(parseInt(split[1]));
            if (module) this.__setValue(module as any);
          }
        }
      }
    };
    this.appendChild(this.__button);

    this.__moduleName.innerHTML = "Click to change:";
    this.__button.appendChild(this.__moduleName);
    this.__button.appendChild(this.__moduleValue);
    this.__button.onclick = () => {
      this.selectorOpener();
    };
    this.onkeydown = (e) => {
      switch (e.key) {
        case "Enter":
        case " ": {
          e.stopPropagation();
          this.onkeyup = (e) => {
            switch (e.key) {
              case "Enter":
              case " ": {
                e.stopPropagation();
                this.selectorOpener();
                break;
              }
            }
            this.onkeyup = null;
          };
          break;
        }
      }
    };
  }

  async selectorOpener() {
    if (!this.__selectorOpen) {
      this.__selectorOpen = true;
      this.__selector = new ModuleSelector().options({
        filter: this.__filter,
        managers: this.__managers,
      });
      getWindowManagerFromElement(this).appendWindow(
        new UIWindow().options({
          content: this.__selector,
          width: "80%",
          height: "80%",
        })
      );
      let res = await this.__selector.whenClosed;
      if (res && res instanceof Module) {
        if (this.__uidMode) this.__setValue(res.uid);
        //@ts-expect-error
        else this.__setValue(res);
      }
      this.__selectorOpen = false;
      this.__button.focus();
    }
  }

  /**Options toggeler*/
  options(options: ModuleSelectorOpenerOptions): this {
    if (typeof options.manager !== "undefined") this.manager = options.manager;
    if (typeof options.uidMode !== "undefined") this.uidMode = options.uidMode;
    super.options(options);
    if (options.filter instanceof ModuleFilter) this.filter = options.filter;
    if (typeof options.managers !== "undefined")
      this.managers = options.managers;
    return this;
  }

  //@ts-expect-error
  set value(val: ModuleBase | number | undefined) {
    super.value = val as any;
  }

  /**Sets the filter to use for the selector*/
  set filter(fil: ModuleFilter) {
    if (fil instanceof ModuleFilter) {
      this.__filter = fil;
      if (this.__selectorOpen) this.__selector!.filter = fil;
    }
  }

  /**Sets the default manager to select with*/
  set manager(man: ModuleManagerBase) {
    this.__manager = man;
    if (this.__selectorOpen) this.__selector!.managers = [man];
  }

  /**Sets the managers to limit selection to*/
  set managers(mans: ModuleManagerBase[]) {
    this.__managers = mans.filter((e) => {
      return e instanceof ModuleManager;
    });
    if (this.__selectorOpen) this.__selector!.managers = this.__managers;
  }

  /**Sets the uid mode true or false, mode for using uid instead of object reference*/
  set uidMode(mode: boolean) {
    this.__uidMode = Boolean(mode);
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

  /**This is called when the user sets the value*/
  //@ts-expect-error
  protected __newValue(val: number | ModuleBase) {
    if (this.__uidMode) {
      if (!this.__manager) console.warn("Manager not defined in uid mode");
      var val = this.__manager!.getModuleByUID(val as number)! as
        | number
        | ModuleBase;
      if (!val) return;
    }
    if (val instanceof Module) {
      this.__moduleName.innerHTML = "Click to change: " + val.name;
      if (val.hasValue) this.moduleValue = val.valueFormatted;
    }
  }

  protected set moduleValue(_val: ModuleValueFormatted) {}

  protected $vfmoduleValue(val: number) {
    if (typeof val !== "undefined")
      this.__moduleValue.innerHTML = val.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
  }
}
defineElement(ModuleSelectorOpener);
defineElementValues(ModuleSelectorOpener, ["moduleValue"]);
