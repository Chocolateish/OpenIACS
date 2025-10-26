import { Err, None, Ok, type Option, type Result, Some } from "@libResult";
import { StateBase } from "./stateBase";
import type { StateError, StateHelper, StateWriteBase } from "./types";

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

export interface StateArrayRead<TYPE> {
  array: readonly TYPE[];
  type: StateArrayReadType;
  index: number;
  items: readonly TYPE[];
}

export interface StateArrayWrite<TYPE> {
  type: StateArrayWriteType;
  index: number;
  items: readonly TYPE[];
}

/** Applies a read from a state array to another array
 * @template TYPE - Types allowed in both arrays.*/
export function stateArrayApplyReadToArray<TYPE>(
  array: TYPE[],
  read: StateArrayRead<TYPE>
): TYPE[] {
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
/** Applies a read from a state array to another array with a transform function
 * @template INPUT - Types allowed in state array.
 * @template OUTPUT - Types allowed in array to modify.*/
export function stateArrayApplyReadToArrayTransform<INPUT, OUTPUT>(
  array: OUTPUT[],
  read: StateArrayRead<INPUT>,
  transform: (value: INPUT, index: number, array: readonly INPUT[]) => OUTPUT
): OUTPUT[] {
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

/** Represents a state storing an array with subscription and related utilities, and mutation methods.
 * @template TYPE - Types allowed in the state array.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template OK - Indicates if state can have erroneous values (true = no errors).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export class StateArray<
    TYPE,
    SYNC extends boolean = false,
    RELATED extends {} = {}
  >
  extends StateBase<Result<StateArrayRead<TYPE>, StateError>, SYNC, RELATED>
  implements
    StateWriteBase<
      Result<StateArrayRead<TYPE>, StateError>,
      SYNC,
      RELATED,
      StateArrayWrite<TYPE>
    >
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init: Result<TYPE[], StateError> | (() => Result<TYPE[], StateError>),
    setter?: (
      value: StateArrayWrite<TYPE>
    ) => Option<Result<StateArrayWrite<TYPE>, StateError>>,
    helper?: StateHelper<StateArrayWrite<TYPE>, RELATED>
  ) {
    super();
    if (setter) this.write = setter;
    if (helper) this.#helper = helper;
    if (typeof init === "function") {
      let clean = (): Result<StateArrayRead<TYPE>, StateError> => {
        //@ts-expect-error
        delete this.then;
        //@ts-expect-error
        delete this.get;
        //@ts-expect-error
        delete this.write;
        let value = init();
        if (value.ok) {
          this.#array = value.value;
          this.#error = undefined;
          return Ok({
            array: this.#array,
            type: "none",
            index: 0,
            items: this.#array,
          });
        } else {
          this.#array = [];
          this.#error = value.error;
          return Err(this.#error);
        }
      };
      this.then = <TResult1 = StateArrayRead<TYPE>>(
        func: (
          value: Result<StateArrayRead<TYPE>, StateError>
        ) => TResult1 | PromiseLike<TResult1>
      ): Promise<TResult1> => {
        return func(clean()) as Promise<TResult1>;
      };
      this.get = () => {
        return clean() as any;
      };
      this.write = (value) => {
        clean();
        this.write(value);
      };
    } else if (init) {
      this.set(init);
    } else {
      this.set(Ok([]));
    }
  }

  //Internal Context
  #error?: StateError;
  #array: TYPE[] = [];
  #helper?: StateHelper<StateArrayWrite<TYPE>, RELATED>;

  //Reader Context
  async then<TResult1 = Result<StateArrayRead<TYPE>, StateError>>(
    func: (
      value: Result<StateArrayRead<TYPE>, StateError>
    ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#error) return func(Err(this.#error));
    else
      return func(
        Ok({ array: this.#array, type: "none", index: 0, items: this.#array })
      );
  }

  get(): SYNC extends true
    ? Result<StateArrayRead<TYPE>, StateError>
    : unknown {
    if (this.#error) return Err(this.#error) as any;
    return Ok({
      array: this.#array,
      type: "none",
      index: 0,
      items: this.#array,
    }) as any;
  }

  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  write(value: StateArrayWrite<TYPE>): void {
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
      (value as StateArrayRead<TYPE>).array = this.#array;
      this.updateSubscribers(Ok(value as StateArrayRead<TYPE>));
    }
  }

  /**Checks the value against the limit set by the limiter, if no limiter is set, undefined is returned*/
  check(value: StateArrayWrite<TYPE>): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }

  /**Limits the value to the limit set by the limiter, if no limiter is set, the value is returned as is*/
  limit(value: StateArrayWrite<TYPE>): Option<StateArrayWrite<TYPE>> {
    return this.#helper?.limit ? this.#helper.limit(value) : Some(value);
  }

  get writeable(): StateWriteBase<
    Result<StateArrayRead<TYPE>, StateError>,
    SYNC,
    RELATED,
    StateArrayWrite<TYPE>
  > {
    return this;
  }

  //Array/Owner Context
  set(value: Result<TYPE[], StateError>) {
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

  get array(): readonly TYPE[] {
    return this.#array;
  }

  get length(): number {
    return this.#array.length;
  }

  push(...items: TYPE[]): number {
    let index = this.#array.length;
    let newLen = this.#array.push(...items);
    this.updateSubscribers(
      Ok({ array: this.#array, type: "added", index, items })
    );
    return newLen;
  }

  pop(): TYPE | undefined {
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

  shift(): TYPE | undefined {
    if (this.#array.length > 0) {
      let shifted = this.#array.shift();
      this.updateSubscribers(
        Ok({ array: this.#array, type: "removed", index: 0, items: [shifted!] })
      );
      return shifted;
    }
    return undefined;
  }

  unshift(...items: TYPE[]): number {
    let newLen = this.#array.unshift(...items);
    this.updateSubscribers(
      Ok({ array: this.#array, type: "added", index: 0, items })
    );
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: TYPE[]): TYPE[] {
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
  removeAllOf(val: TYPE) {
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
    result: Result<StateArrayRead<B>, StateError>,
    transform: (val: readonly B[], type: StateArrayReadType) => TYPE[]
  ) {
    if (result.err) return this.set(result as any);
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
}
