import { Value } from "@libValues";
import type { ModuleBase } from "@modCommon";
import { Module } from "./module";

/**Defines the Listener for the moduel wrapper*/
export type ModuleWrapperListener = (
  value: ModuleBase,
  self: ModuleWrapper,
  oldValue: ModuleBase
) => void;

/**The value class is a container for a value which can have events listeners registered*/
export class ModuleWrapper extends Value {
  /**The initial value can be passed at creation*/
  constructor(init: ModuleBase | undefined) {
    super(init);
  }

  /**This adds a function as an event listener to the value*/
  //@ts-expect-error
  addListener(
    func: ModuleWrapperListener,
    run: boolean
  ): ModuleWrapperListener {
    //@ts-expect-error
    return super.addListener(func, run);
  }

  /**This removes a function as an event listener from the value*/
  //@ts-expect-error
  removeListener(func: ModuleWrapperListener): ModuleWrapperListener {
    //@ts-expect-error
    return super.removeListener(func);
  }

  /** This get the curent value */
  get get(): Module {
    return super.get;
  }

  /** This sets the value and dispatches an event*/
  set set(val: Module) {
    if (val instanceof Module) super.set = val;
  }

  /** This sets the value and dispatches an event, if the skip variable is set to a function, if that event listener is registered it will be skipped*/
  setSkip(val: Module, skip: ModuleWrapperListener) {
    if (val instanceof Module)
      //@ts-expect-error
      super.setSkip(val, skip);
  }

  /** This sets the value without dispatching an event
   * It should only be used by the owner of the value*/
  set setSilent(val: Module) {
    if (val instanceof Module) {
      //@ts-expect-error
      super.setSilent = val;
    }
  }

  /** This method can compare a value to the internal value
   *  true if different, false if same*/
  compare(val: Module): boolean {
    return super.compare(val);
  }
}
