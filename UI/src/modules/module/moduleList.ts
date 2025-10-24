import { Value } from "@libValues";
import type { ModuleManagerBase } from "@modCommon";
import { Module } from "./module";

/**This converts a server module list to a client module list*/
export function serverModuleListToModuleList(
  list: number[],
  manager: ModuleManagerBase
): ModuleList {
  let modList = new ModuleList();
  for (let i = 0; i < list.length; i++) {
    let mod = manager.getModuleByUID(list[i]);
    if (mod) {
      //@ts-expect-error
      modList.__addModule(mod);
    }
  }
  return modList;
}

/**This converts a client module list to a server module list*/
export function moduleListToServerModuleList(list: ModuleList): number[] {
  let result: number[] = [];
  let listBuff = list.get;
  let manager: ModuleManagerBase | null = null;
  for (let i = 0; i < listBuff.length; i++) {
    if (manager) {
      if (manager !== listBuff[i].manager) {
        console.warn("Cross manager lists are not supported on the server");
        return result;
      }
    } else {
      manager = listBuff[i].manager;
    }
    result.push(listBuff[i].uid);
  }
  return result;
}

/**Defines the Listener for the moduel wrapper */

type ModuleListListener = (value: Module[], self: ModuleList) => void;

/**The value class is a container for a value which can have events listeners registered*/
export class ModuleList extends Value {
  /**The initial value can be passed at creation*/
  constructor(init?: Module[]) {
    super(init || []);
  }

  /**This adds a function as an event listener to the value*/
  //@ts-expect-error
  addListener(func: ModuleListListener, run?: boolean): ModuleListListener {
    //@ts-expect-error
    return super.addListener(func, run);
  }

  /**This removes a function as an event listener from the value*/
  //@ts-expect-error
  removeListener(func: ModuleListListener): ModuleListListener {
    //@ts-expect-error
    return super.removeListener(func);
  }

  /** This get the curent value*/
  get get(): Module[] {
    return super.get;
  }

  /** This sets the value and dispatches an event */
  set set(val: Module[]) {
    let newList: Module[] = [];
    for (let i = 0; i < val.length; i++) {
      if (val[i] instanceof Module) {
        newList.push(val[i]);
      } else {
        console.warn("None module passed");
        return;
      }
    }
    super.set = newList;
  }

  /** This sets the value and dispatches an event, if the skip variable is set to a function, if that event listener is registered it will be skipped*/
  setSkip(val: Module[], skip: ModuleListListener) {
    let newList: Module[] = [];
    for (let i = 0; i < val.length; i++) {
      if (val[i] instanceof Module) {
        newList.push(val[i]);
      } else {
        console.warn("None module passed");
        return;
      }
    }
    //@ts-expect-error
    super.setSkip(newList, skip);
  }

  /** This sets the value without dispatching an event
   * It should only be used by the owner of the value*/
  set setSilent(val: Module[]) {
    let newList: Module[] = [];
    for (let i = 0; i < val.length; i++) {
      if (val[i] instanceof Module) {
        newList.push(val[i]);
      } else {
        console.warn("None module passed");
        return;
      }
    }
    //@ts-expect-error
    super.setSilent = newList;
  }

  /**Adds the given module to the list */
  addModule(mod: Module) {
    if (mod instanceof Module) {
      this.__addModule(mod);
      this.update();
    } else {
      console.warn("None module passed");
    }
  }

  /**Adds the given module to the list without checks and update*/
  private __addModule(mod: Module) {
    this.___value.push(mod);
  }

  /**Removes the given module from the list*/
  removeModule(mod: Module) {
    let index = this.___value.indexOf(mod);
    if (index != -1) {
      this.___value.splice(index, 1);
      this.update();
    } else {
      console.warn("None module passed");
    }
  }

  /** Removes all modules from the list */
  empty() {
    this.__empty();
    this.update();
  }

  /** Removes all modules from the list*/
  private __empty() {
    this.___value = [];
  }

  /** This method can compare a value to the internal value
   * @returns true if different, false if same*/
  compare(val: ModuleList): boolean {
    if (val instanceof ModuleList) {
      if (val.___value.length === this.___value.length) {
        for (let i = 0; i < this.___value.length; i++) {
          if (val.___value[i] !== this.___value[i]) {
            return true;
          }
        }
      } else {
        return true;
      }
      return false;
    } else {
      return true;
    }
  }
}
