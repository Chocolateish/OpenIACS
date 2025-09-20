import { Err, None, Ok, type Option, Some } from "@result";
import { StateBase } from "./stateBase";
import type { StateError, StateHelper, StateResult, StateWrite } from "./types";

export interface StateArrayRead<T> {
  array: readonly T[];
  added?: { index: number; items: readonly T[] };
  removed?: { index: number; items: readonly T[] };
  changed?: { index: number; items: readonly T[] };
}

export interface StateArrayWrite<T> {
  add?: { index: number; items: readonly T[] };
  remove?: { index: number; items: readonly T[] };
  change?: { index: number; items: readonly T[] };
}

export class StateArray<T, L extends {} = any>
  extends StateBase<StateArrayRead<T>>
  implements StateWrite<StateArrayRead<T>, StateArrayWrite<T>, L>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init:
      | StateResult<T[]>
      | Promise<StateResult<{ array: T[] }>>
      | (() => Promise<StateResult<{ array: T[] }>>),
    setter?: (
      value: StateArrayWrite<T>
    ) => Option<StateResult<StateArrayWrite<T>>>,
    helper?: StateHelper<StateArrayWrite<T>, L>
  ) {
    super();
    if (setter) this.write = setter;
    if (helper) this.#helper = helper;
    if (init instanceof Promise) {
      this.then = init.then.bind(init);
      init.then((value) => {
        if (value.ok) {
          this.#value = value.value.array;
          this.#error = undefined;
        } else {
          this.#value = [];
          this.#error = value.error;
        }
        //@ts-expect-error
        delete this.then;
      });
    } else if (typeof init === "function") {
      this.then = async (func) => {
        let promise = init();
        this.then = promise.then;
        promise.then((value) => {
          if (value.ok) {
            this.#value = value.value.array;
            this.#error = undefined;
          } else {
            this.#value = [];
            this.#error = value.error;
          }
          //@ts-expect-error
          delete this.then;
        });
        return promise.then(func);
      };
    } else {
      this.#set(init);
    }
  }

  //Internal Context
  #error?: StateError;
  #value: T[] = [];
  #helper?: StateHelper<StateArrayWrite<T>, L>;

  #set(value: StateResult<T[]>) {
    if (value.ok) {
      this.#value = value.value;
      this.#error = undefined;
    } else {
      this.#value = [];
      this.#error = value.error;
    }
  }

  //Reader Context
  async then<TResult1 = StateArrayRead<T>>(
    func: (
      value: StateResult<StateArrayRead<T>>
    ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#error) return func(Err(this.#error));
    else return func(Ok({ array: this.#value }));
  }

  related(): Option<L> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  write(value: StateArrayWrite<T>): void {
    let change = false;
    if (value.add) {
      this.#value.splice(value.add.index, 0, ...value.add.items);
    }
    if (value.remove) {
      this.#value.splice(value.remove.index, value.remove.items.length);
    }
    if (value.change) {
      for (let i = 0; i < value.change.items.length; i++) {
        this.#value[value.change.index + i] = value.change.items[i];
      }
    }
    if (change) {
      (value as StateArrayRead<T>).array = this.#value;
      this.updateSubscribers(Ok(value as StateArrayRead<T>));
    }
  }

  /**Checks the value against the limit set by the limiter, if no limiter is set, undefined is returned*/
  check(value: StateArrayWrite<T>): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }

  /**Limits the value to the limit set by the limiter, if no limiter is set, the value is returned as is*/
  limit(value: StateArrayWrite<T>): Option<StateArrayWrite<T>> {
    return this.#helper?.limit ? this.#helper.limit(value) : Some(value);
  }

  //Array/Owner Context
  set(value: StateResult<T[]>) {
    this.#set(value);
  }

  get array(): readonly T[] {
    return this.#value;
  }

  get length(): number {
    return this.#value.length;
  }

  push(...items: T[]): number {
    let index = this.#value.length;
    let newLen = this.#value.push(...items);
    this.updateSubscribers(Ok({ array: this.#value, added: { index, items } }));
    return newLen;
  }

  pop(): T | undefined {
    if (this.#value.length > 0) {
      let popped = this.#value.pop();
      this.updateSubscribers(
        Ok({
          array: this.#value,
          removed: { index: this.#value.length, items: [popped!] },
        })
      );
      return popped;
    }
    return undefined;
  }

  shift(): T | undefined {
    if (this.#value.length > 0) {
      let shifted = this.#value.shift();
      this.updateSubscribers(
        Ok({ array: this.#value, removed: { index: 0, items: [shifted!] } })
      );
      return shifted;
    }
    return undefined;
  }

  unshift(...items: T[]): number {
    let newLen = this.#value.unshift(...items);
    this.updateSubscribers(
      Ok({ array: this.#value, added: { index: 0, items } })
    );
    return newLen;
  }

  splice(start: number, deleteCount?: number): T[] {
    let removed = this.#value.splice(start, deleteCount);
    this.updateSubscribers(
      Ok({ array: this.#value, removed: { index: start, items: removed } })
    );
    return removed;
  }
}
