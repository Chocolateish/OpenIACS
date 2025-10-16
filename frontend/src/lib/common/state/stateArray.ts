import { Err, None, Ok, type Option, Some } from "@libResult";
import { StateBase } from "./stateBase";
import type {
  StateError,
  StateHelper,
  StateRead,
  StateResult,
  StateWrite,
} from "./types";

/**Enum of possible access types for base element*/
const StateArrayReadType = {
  none: "none",
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;
type StateArrayReadType =
  (typeof StateArrayReadType)[keyof typeof StateArrayReadType];

/**Enum of possible access types for base element*/
const StateArrayWriteType = {
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;
type StateArrayWriteType =
  (typeof StateArrayWriteType)[keyof typeof StateArrayWriteType];

export interface StateArrayRead<T> {
  array: readonly T[];
  type: StateArrayReadType;
  index: number;
  items: readonly T[];
}

export interface StateArrayWrite<T> {
  type: StateArrayWriteType;
  index: number;
  items: readonly T[];
}

///Applies a read from a state array to another array
export function stateArrayApplyReadToArray<T>(
  array: T[],
  read: StateArrayRead<T>
): T[] {
  switch (read.type) {
    case "none":
      return [...read.array];
    case "added":
      array.splice(read.index, 0, ...read.items);
      return array;
    case "removed":
      array.splice(read.index, read.items.length);
      return array;
    case "changed":
      for (let i = 0; i < read.items.length; i++)
        array[read.index + i] = read.items[i];
      return array;
  }
}
///Applies a read from a state array to another array
export function stateArrayApplyReadToArrayTransform<T, B>(
  array: B[],
  read: StateArrayRead<T>,
  transform: (value: T, index: number, array: readonly T[]) => B
): B[] {
  switch (read.type) {
    case "none":
      return [...read.array.map(transform)];
    case "added":
      array.splice(read.index, 0, ...read.items.map(transform));
      return array;
    case "removed":
      array.splice(read.index, read.items.length);
      return array;
    case "changed":
      for (let i = 0; i < read.items.length; i++)
        array[read.index + i] = transform(read.items[i], i, read.items);
      return array;
  }
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
    init?:
      | StateResult<T[]>
      | (() => Promise<
          StateResult<{ array: T[]; type: "none"; index: 0; items: [] }>
        >),
    setter?: (
      value: StateArrayWrite<T>
    ) => Option<StateResult<StateArrayWrite<T>>>,
    helper?: StateHelper<StateArrayWrite<T>, L>
  ) {
    super();
    if (setter) this.write = setter;
    if (helper) this.#helper = helper;
    if (typeof init === "function") {
      this.then = async (func) => {
        let promise = init();
        this.then = promise.then;
        promise.then((value) => {
          if (value.ok) {
            this.#array = value.value.array;
            this.#error = undefined;
          } else {
            this.#array = [];
            this.#error = value.error;
          }
          //@ts-expect-error
          delete this.then;
        });
        return promise.then(func);
      };
    } else if (init) {
      this.set(init);
    } else {
      this.set(Ok([]));
    }
  }

  //Internal Context
  #error?: StateError;
  #array: T[] = [];
  #helper?: StateHelper<StateArrayWrite<T>, L>;

  //Reader Context
  async then<TResult1 = StateArrayRead<T>>(
    func: (
      value: StateResult<StateArrayRead<T>>
    ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#error) return func(Err(this.#error));
    else
      return func(
        Ok({ array: this.#array, type: "none", index: 0, items: this.#array })
      );
  }

  related(): Option<L> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  write(value: StateArrayWrite<T>): void {
    let change = false;
    switch (value.type) {
      case "added":
        this.#array.splice(value.index, 0, ...value.items);
        break;
      case "removed":
        this.#array.splice(value.index, value.items.length);
        break;
      case "changed":
        for (let i = 0; i < value.items.length; i++)
          this.#array[value.index + i] = value.items[i];
        break;
    }

    if (change) {
      (value as StateArrayRead<T>).array = this.#array;
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
    if (value.ok) {
      this.#array = value.value;
      this.#error = undefined;
    } else {
      this.#array = [];
      this.#error = value.error;
    }
    this.updateSubscribers(
      Ok({
        array: this.#array,
        type: "none",
        index: 0,
        items: this.#array,
      })
    );
  }

  get array(): readonly T[] {
    return this.#array;
  }

  get length(): number {
    return this.#array.length;
  }

  push(...items: T[]): number {
    let index = this.#array.length;
    let newLen = this.#array.push(...items);
    this.updateSubscribers(
      Ok({ array: this.#array, type: "added", index, items })
    );
    return newLen;
  }

  pop(): T | undefined {
    if (this.#array.length > 0) {
      let popped = this.#array.pop();
      this.updateSubscribers(
        Ok({
          array: this.#array,
          type: "removed",
          index: this.#array.length,
          items: [popped!],
        })
      );
      return popped;
    }
    return undefined;
  }

  shift(): T | undefined {
    if (this.#array.length > 0) {
      let shifted = this.#array.shift();
      this.updateSubscribers(
        Ok({ array: this.#array, type: "removed", index: 0, items: [shifted!] })
      );
      return shifted;
    }
    return undefined;
  }

  unshift(...items: T[]): number {
    let newLen = this.#array.unshift(...items);
    this.updateSubscribers(
      Ok({ array: this.#array, type: "added", index: 0, items })
    );
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    let removed = this.#array.splice(start, deleteCount!, ...items);
    if (removed.length > 0)
      this.updateSubscribers(
        Ok({
          array: this.#array,
          type: "removed",
          index: start,
          items: removed,
        })
      );
    if (items.length > 0)
      this.updateSubscribers(
        Ok({ array: this.#array, type: "added", index: start, items: items })
      );
    return removed;
  }

  /// Removes all instances of a value in the array
  removeAllOf(val: T) {
    for (let i = 0; i < this.#array.length; i++) {
      if ((this.#array[i] = val)) {
        this.updateSubscribers(
          Ok({ array: this.#array, type: "removed", index: i, items: [val] })
        );
        i--;
      }
    }
  }

  ///Helps apply the changes from one state array to another
  applyStateArrayRead<B>(
    result: StateResult<StateArrayRead<B>>,
    transform: (val: readonly B[], type: StateArrayReadType) => T[]
  ) {
    if (result.err) return this.set(result);
    let value = result.value;
    let trans = transform(value.items, value.type);
    switch (value.type) {
      case "none":
        this.set(Ok(trans));
        return;
      case "added":
        this.#array.splice(value.index, 0, ...trans);
        break;
      case "removed":
        this.#array.splice(value.index, trans.length);
        break;
      case "changed":
        for (let i = 0; i < value.items.length; i++)
          this.#array[value.index + i] = trans[i];
        break;
    }
    this.updateSubscribers(
      Ok({
        array: this.#array,
        type: value.type,
        index: value.index,
        items: trans,
      })
    );
  }

  //Type
  get readable() {
    return this as StateRead<StateArrayRead<T>, L>;
  }

  get writeable() {
    return this as StateWrite<StateArrayRead<T>, StateArrayWrite<T>, L>;
  }
}
