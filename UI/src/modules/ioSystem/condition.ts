import { ResultWrapper } from "@libCommon";
import { EventHandler } from "@libEvent";
import { Value } from "@libValues";
import type { ModuleBase, ModuleManagerBase } from "@modCommon";
import { Module } from "@module/module";
import { ModuleWrapper } from "@module/moduleWrapper";

let maxConditions = 20;

/**Defines the server condition*/
type ServerSubCondition = {
  val: number;
  modID: number;
  cond: number;
  next: number;
};
export type ServerCondition = ServerSubCondition[];

/**Converts a server condition to a client condition
 * @param {Condition} condition
 * @param {ServerCondition} serverCondition
 * @param {ModuleManager} manager */
export let serverConditionToCondition = (
  condition: Condition,
  serverCondition: ServerCondition,
  manager: ModuleManagerBase
) => {
  condition.empty();
  for (let i = 0; i < serverCondition.length; i++) {
    if (typeof serverCondition[i].val !== "number") {
      serverCondition[i].val = 0;
      console.warn("Value must be number");
    }
    if (typeof serverCondition[i].cond !== "number") {
      serverCondition[i].cond = ConditionTypesEnum.DISABLED;
      console.warn("Condition must be number");
    }
    if (typeof serverCondition[i].next !== "number") {
      serverCondition[i].next = ConditionNextTypesEnum.AND;
      console.warn("Next must be number");
    }
    let mod = manager.getModuleByUID(serverCondition[i].modID);
    if (mod) {
      condition.addSubCondition(
        new SubCondition({
          module: mod,
          value: serverCondition[i].val,
          condition: serverCondition[i].cond as ConditionTypesEnum,
          next: serverCondition[i].next as ConditionNextTypesEnum,
        })
      );
    } else {
      condition.addSubCondition(
        new SubCondition({
          value: serverCondition[i].val,
          condition: serverCondition[i].cond as ConditionTypesEnum,
          next: serverCondition[i].next as ConditionNextTypesEnum,
        })
      );
    }
  }
};

/**Converts a client condition to a server condition*/
export let conditionToServerCondition = (
  condition: Condition
): ServerCondition => {
  if (!(condition instanceof Condition)) {
    console.warn("None conditon passed");
  }
  let serverCondition: ServerCondition = [];
  let manager: ModuleManagerBase | null = null;
  let subs = condition.subConditions;
  for (let i = 0; i < subs.length; i++) {
    let mod = subs[i].module.get;
    if (mod) {
      if (manager) {
        if (manager !== mod.manager) {
          console.warn("Cross manager condition not supported on server");
          return serverCondition;
        }
      } else {
        manager = mod.manager;
      }
      var uid = mod.uid;
    } else {
      var uid = 0;
    }
    serverCondition.push({
      modID: uid,
      val: subs[i].value.get,
      cond: subs[i].condition.get,
      next: subs[i].next.get,
    });
  }
  return serverCondition;
};

/**All possibles next comparisons for conditions*/
export const ConditionNextTypesEnum = {
  AND: 0,
  OR: 1,
} as const;
export type ConditionNextTypesEnum =
  (typeof ConditionNextTypesEnum)[keyof typeof ConditionNextTypesEnum];
export let conditionNextTypesValues = Object.values(ConditionNextTypesEnum);
export let conditionNextTypesKeys = Object.keys(ConditionNextTypesEnum);
export let conditionNextTypes = [
  { name: "And &&", value: ConditionNextTypesEnum.AND },
  { name: "Or ||", value: ConditionNextTypesEnum.OR },
];

/**Defines enum for condition event types*/
export type ConditionEventTypes = {
  subAdded: { sub: SubCondition; index: number };
  subRemoved: { sub: SubCondition; index: number };
  subMoved: { sub: SubCondition; index: number; oldIndex: number };
};

/**Condition class for storing condition for something */
export class Condition extends Value {
  private _events = new EventHandler<ConditionEventTypes, this>(this);
  events = this._events.consumer;

  private __subConditions: SubCondition[] = [];
  /**Stores all sub condition listeners*/
  private __subConditionListeners: ((val: any) => void)[] = [];
  /**Stores the state of each sub condition*/
  private __subConditionStates: boolean[] = [];
  /**Stores the next type of each sub condition*/
  private __subConditionNexts: ConditionNextTypesEnum[] = [];
  private __listening?: boolean;

  constructor() {
    super(true);
    //@ts-expect-error
    this.initEHandler(conditionEventTypesValues);
  }

  /**Creates a copy of the given condition*/
  static createCopy(condition: Condition): Condition {
    let newCond = new Condition();
    let oldSubs = condition.subConditions;
    for (let i = 0; i < oldSubs.length; i++) {
      newCond.addSubCondition(SubCondition.createCopy(oldSubs[i]));
    }
    return newCond;
  }

  /**Calculates the state of the condition */
  private __calculateState() {
    for (
      let i = 0, n = this.__subConditionStates.length, m = n - 1;
      i < n;
      i++
    ) {
      switch (this.__subConditionNexts[i]) {
        case ConditionNextTypesEnum.AND: {
          if (!this.__subConditionStates[i]) {
            this.set = false;
            return;
          } else if (i == m) {
            this.set = true;
            return;
          }
          break;
        }
        case ConditionNextTypesEnum.OR: {
          if (this.__subConditionStates[i]) {
            this.set = true;
            return;
          } else if (i == m) {
            this.set = false;
            return;
          }
          break;
        }
      }
    }
  }

  /**Adds a sub condition to the condition*/
  addSubCondition(
    sub = new SubCondition({}),
    index = this.__subConditions.length
  ) {
    if (this.__subConditions.length === maxConditions) {
      return new ResultWrapper(
        false,
        `A maximum of ${maxConditions} conditions are allowed`
      );
    }
    if (typeof index !== "number") {
      console.warn("Index must be number");
      return undefined;
    }
    if (index < 0 || index > this.__subConditions.length) {
      console.warn("Index outside bounds");
      return undefined;
    }
    if (sub instanceof SubCondition) {
      //Defines listener function for sub condition state
      let listener = (val: boolean) => {
        this.__subConditionStates[index] = val;
        this.__calculateState();
      };
      if (sub.owner === this) {
        let oldIndex = this.__subConditions.indexOf(sub);
        if (oldIndex < index - 1) {
          index--;
        }
        if (sub === this.__subConditions[index]) {
          return;
        }
        if (this.__listening) {
          sub.removeListener(this.__subConditionListeners[oldIndex]);
        }
        this.__subConditions.splice(oldIndex, 1);
        this.__subConditionListeners.splice(oldIndex, 1);
        let next = this.__subConditionNexts.splice(oldIndex, 1);
        let state = this.__subConditionStates.splice(oldIndex, 1);
        this.__subConditions.splice(index, 0, sub);
        this.__subConditionListeners.splice(index, 0, listener);
        this.__subConditionNexts.splice(index, 0, next[0]);
        this.__subConditionStates.splice(index, 0, state[0]);
        if (this.__listening) {
          sub.addListener(this.__subConditionListeners[index], true);
        }
        this._events.emit("subMoved", { sub, index, oldIndex });
      } else {
        this.__subConditions.splice(index, 0, sub);
        this.__subConditionListeners.splice(index, 0, listener);
        this.__subConditionNexts.splice(index, 0, sub.next.get);
        if (this.__listening) {
          sub.addListener(this.__subConditionListeners[index], true);
        }
        sub.owner = this;
        this._events.emit("subAdded", { sub, index });
      }
    } else {
      console.warn("None subcondition passed");
      return undefined;
    }
    return undefined;
  }

  /**Removes a sub condition from the condition */
  removeSubCondition(sub: SubCondition): number | undefined {
    if (sub instanceof SubCondition) {
      let index = this.__subConditions.indexOf(sub);
      if (index != -1) {
        if (this.__listening) {
          sub.removeListener(this.__subConditionListeners[index]);
        }
        this.__subConditions.splice(index, 1);
        this.__subConditionListeners.splice(index, 1);
        this.__subConditionStates.splice(index, 1);
        this.__subConditionNexts.splice(index, 1);
        this._events.emit("subRemoved", { sub: sub, index: index });
        if (sub.get) {
          //@ts-expect-error
          this.__amountTrue--;
        }
        if (this.__subConditions.length === 0) {
          this.set = true;
        }
        return index;
      } else {
        console.warn("Subcondition not in condition");
        return undefined;
      }
    } else {
      console.warn("None subcondition passed");
      return undefined;
    }
  }

  /** This method can compare a value to the internal value
   * true if different, false if same*/
  compare(val: Condition): boolean {
    if (val instanceof Condition) {
      let subs = val.subConditions;
      if (subs.length !== this.__subConditions.length) {
        return true;
      }
      for (let i = 0; i < this.__subConditions.length; i++) {
        if (this.__subConditions[i].compare(subs[i])) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  /**Overwrite this function to listen to managment events such as when value and unit listeners are added
   * @param type is true on first listener and false on last listener*/
  onListener(type: boolean, _self: Value) {
    /**Stores if the condition is currently listening*/
    this.__listening = type;
    if (type) {
      for (let i = 0, n = this.__subConditions.length; i < n; i++) {
        this.__subConditions[i].addListener(
          this.__subConditionListeners[i],
          true
        );
      }
    } else {
      for (let i = 0, n = this.__subConditions.length; i < n; i++) {
        this.__subConditions[i].removeListener(this.__subConditionListeners[i]);
      }
    }
  }

  /**Returns a copy of all sub conditions*/
  get subConditions(): SubCondition[] {
    return [...this.__subConditions];
  }

  /**Removes all subconditions from the condition */
  empty() {
    for (let i = this.__subConditions.length; 0 < i; i--) {
      this.removeSubCondition(this.__subConditions[i - 1]);
    }
  }

  /**Replaces all subconditions with copies of sub conditions from another condition*/
  replaceSubsFromCondition(condition: Condition) {
    if (condition instanceof Condition) {
      this.empty();
      let newSubs = condition.subConditions;
      for (let i = 0; i < newSubs.length; i++) {
        this.addSubCondition(SubCondition.createCopy(newSubs[i]));
      }
    } else {
      console.warn("None condition passed");
    }
  }

  /**Used by sub condition to update next state in condition buffer*/
  protected __subChangeNext(sub: SubCondition, next: ConditionNextTypesEnum) {
    let index = this.__subConditions.indexOf(sub);
    if (index != -1) {
      this.__subConditionNexts[index] = next;
    }
  }
}

/**All possible condition types*/
export const ConditionTypesEnum = {
  DISABLED: 0,
  ISBIGGERTHAN: 1,
  ISSMALLERTHAN: 2,
  ISEQUAL: 3,
  ISON: 4,
  ISOFF: 5,
  ISINVALID: 6,
  ISDIFFERENT: 7,
  ISBIGGEREQUAL: 8,
  ISSMALLEREQUAL: 9,
} as const;
export type ConditionTypesEnum =
  (typeof ConditionTypesEnum)[keyof typeof ConditionTypesEnum];
export let conditionTypesValues = Object.values(ConditionTypesEnum);
export let conditionTypesKeys = Object.keys(ConditionTypesEnum);
export let conditionTypes = [
  { name: "Disabled", value: ConditionTypesEnum.DISABLED },
  { name: "Is on", value: ConditionTypesEnum.ISON },
  { name: "Is off", value: ConditionTypesEnum.ISOFF },
  { name: "Is bigger than", value: ConditionTypesEnum.ISBIGGERTHAN },
  { name: "Is smaller than", value: ConditionTypesEnum.ISSMALLERTHAN },
  { name: "Is bigger or equal to", value: ConditionTypesEnum.ISBIGGEREQUAL },
  { name: "Is smaller or equal to", value: ConditionTypesEnum.ISSMALLEREQUAL },
  { name: "Is equal to", value: ConditionTypesEnum.ISEQUAL },
  { name: "Is different from", value: ConditionTypesEnum.ISDIFFERENT },
  { name: "Is invalid", value: ConditionTypesEnum.ISINVALID },
];

/**Defines the options for creating a sub condition*/
type SubConditionOptions = {
  /*module to compare*/
  module?: ModuleBase;
  /**how to compare module*/
  condition?: ConditionTypesEnum;
  /**how sub condition relates to next sub condition*/
  next?: ConditionNextTypesEnum;
  /**value to compare module value to*/
  value?: number;
};

/**Sub condition class for storing a sub condition*/
export class SubCondition extends Value {
  module: ModuleWrapper;
  condition: Value;
  next: Value;
  value: Value;
  protected __cond?: Condition;
  /**Listener for module value*/
  private __valueListener?: (value: any) => void;

  constructor(options: SubConditionOptions) {
    super(false);

    this.module = new ModuleWrapper(options.module || undefined);
    this.module.addListener((mod, _self, oldMod) => {
      if (oldMod instanceof Module && this.__valueListener) {
        oldMod.value!.removeListener(this.__valueListener);
      }
      if (mod instanceof Module && this.__valueListener) {
        mod.value!.addListener(this.__valueListener);
      } else {
        this.set = true;
      }
    }, false);

    this.condition = new Value(
      options.condition || ConditionTypesEnum.DISABLED
    );
    this.condition.addListener(() => {
      this.__updateState();
    });
    this.next = new Value(options.next || ConditionNextTypesEnum.AND);
    this.next.addListener((val) => {
      //@ts-expect-error
      this.owner.__subChangeNext(this, val);
      //@ts-expect-error
      this.owner.__calculateState();
    });
    this.value = new Value(options.value || 0);
    this.value.addListener(() => {
      this.__updateState();
    });
  }
  /**Creates a copy of the given condition*/
  static createCopy(sub: SubCondition): SubCondition {
    return new SubCondition({
      module: sub.module.get,
      value: sub.value.get,
      condition: sub.condition.get,
      next: sub.next.get,
    });
  }

  /**Changes the owner condition*/
  set owner(own: Condition) {
    if (own instanceof Condition) {
      this.__cond = own;
    } else {
      console.warn("Owner must be condition");
    }
  }

  /**Returns the owner of the sub condition*/
  get owner(): Condition | undefined {
    return this.__cond;
  }

  /**Removes sub condition from it's owner*/
  remove() {
    if (this.__cond) {
      this.__cond.removeSubCondition(this);
    }
  }

  /**Updates the state of the condition on demand, is used for when conditions are changed */
  private __updateState() {
    if (this.__valueListener) {
      let mod = this.module.get;
      if (mod) {
        this.__valueListener(mod.value!.get);
      }
    }
  }

  /** This method can compare a value to the internal value
   * true if different, false if same*/
  compare(val: SubCondition): boolean {
    if (val instanceof SubCondition) {
      if (val.module.get !== this.module.get) {
        return true;
      }
      if (val.value.get !== this.value.get) {
        return true;
      }
      if (val.condition.get !== this.condition.get) {
        return true;
      }
      if (val.next.get !== this.next.get) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  }

  /**Overwrite this function to listen to managment events such as when value and unit listeners are added
   * @param type is true on first listener and false on last listener*/
  onListener(type: boolean, _self: Value) {
    let mod = this.module.get;
    if (type) {
      this.__valueListener = (value) => {
        switch (this.condition.get) {
          case ConditionTypesEnum.DISABLED: {
            this.set = true;
            break;
          }
          case ConditionTypesEnum.ISBIGGERTHAN: {
            this.set = value > this.value.get;
            break;
          }
          case ConditionTypesEnum.ISSMALLERTHAN: {
            this.set = value < this.value.get;
            break;
          }
          case ConditionTypesEnum.ISEQUAL: {
            this.set = value == this.value.get;
            break;
          }
          case ConditionTypesEnum.ISON: {
            this.set = value == true;
            break;
          }
          case ConditionTypesEnum.ISOFF: {
            this.set = value == false;
            break;
          }
          case ConditionTypesEnum.ISINVALID: {
            break;
          }
          case ConditionTypesEnum.ISDIFFERENT: {
            this.set = value != this.value.get;
            break;
          }
          case ConditionTypesEnum.ISBIGGEREQUAL: {
            this.set = value >= this.value.get;
            break;
          }
          case ConditionTypesEnum.ISSMALLEREQUAL: {
            this.set = value <= this.value.get;
            break;
          }
        }
      };
      if (mod) {
        mod.value!.addListener(this.__valueListener, true);
      } else {
        this.set = true;
      }
    } else {
      if (mod) {
        mod.value!.removeListener(this.__valueListener!);
      }
      delete this.__valueListener;
    }
  }
}
