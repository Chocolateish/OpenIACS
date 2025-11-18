import { Err, None, Ok, type Option, type Result } from "@libResult";
import { STATE_REA_WA, type STATE_HELPER_WRITE } from "./types";

/**Enum of possible access types for base element*/
const READ_TYPE = {
  none: "none",
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;
type READ_TYPE = (typeof READ_TYPE)[keyof typeof READ_TYPE];

/**Enum of possible access types for base element*/
const WRITE_TYPE = {
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;
type WRITE_TYPE = (typeof WRITE_TYPE)[keyof typeof WRITE_TYPE];

export interface STATE_ARRAY_READ<TYPE> {
  array: readonly TYPE[];
  type: READ_TYPE;
  index: number;
  items: readonly TYPE[];
}

export interface STATE_ARRAY_WRITE<TYPE> {
  type: WRITE_TYPE;
  index: number;
  items: readonly TYPE[];
}

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/

/** Represents a state storing an array with subscription and related utilities, and mutation methods.
 * @template AT - Types allowed in the state array.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template OK - Indicates if state can have erroneous values (true = no errors).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export class StateArray<AT, RELATED extends {} = {}> extends STATE_REA_WA<
  STATE_ARRAY_READ<AT>,
  STATE_ARRAY_WRITE<AT>,
  RELATED
> {
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init?: Result<AT[], string>,
    setter?: (value: STATE_ARRAY_WRITE<AT>) => Option<STATE_ARRAY_WRITE<AT>>,
    helper?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>
  ) {
    super();
    if (setter) this.#setter = setter;
    if (helper) this.#helper = helper;
    if (init) this.set(init);
    else this.set(Ok([]));
  }

  //Internal Context
  #error?: string;
  #array: AT[] = [];
  #helper?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>;
  #setter?: (value: STATE_ARRAY_WRITE<AT>) => Option<STATE_ARRAY_WRITE<AT>>;

  //Reader Context
  async then<TResult1 = Result<STATE_ARRAY_READ<AT>, string>>(
    func: (
      value: Result<STATE_ARRAY_READ<AT>, string>
    ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#error) return func(Err(this.#error));
    else
      return func(
        Ok({ array: this.#array, type: "none", index: 0, items: this.#array })
      );
  }

  get(): Result<STATE_ARRAY_READ<AT>, string> {
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
  async write(value: STATE_ARRAY_WRITE<AT>): Promise<Result<void, string>> {
    return this.writeSync(value);
  }

  writeSync(value: STATE_ARRAY_WRITE<AT>): Result<void, string> {
    if (this.#setter) {
      let setValue = this.#setter(value);
      if (setValue.none) return Err("State not writable");
      value = setValue.value;
    }
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
      (value as STATE_ARRAY_READ<AT>).array = this.#array;
      this.updateSubscribers(Ok(value as STATE_ARRAY_READ<AT>));
    }
    return Ok(undefined);
  }

  limit(value: STATE_ARRAY_WRITE<AT>): Result<STATE_ARRAY_WRITE<AT>, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: STATE_ARRAY_WRITE<AT>): Result<STATE_ARRAY_WRITE<AT>, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }

  //Array/Owner Context
  set(value: Result<AT[], string>) {
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

  get array(): readonly AT[] {
    return this.#array;
  }

  get length(): number {
    return this.#array.length;
  }

  push(...items: AT[]): number {
    let index = this.#array.length;
    let newLen = this.#array.push(...items);
    this.updateSubscribers(
      Ok({ array: this.#array, type: "added", index, items })
    );
    return newLen;
  }

  pop(): AT | undefined {
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

  shift(): AT | undefined {
    if (this.#array.length > 0) {
      let shifted = this.#array.shift();
      this.updateSubscribers(
        Ok({ array: this.#array, type: "removed", index: 0, items: [shifted!] })
      );
      return shifted;
    }
    return undefined;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#array.unshift(...items);
    this.updateSubscribers(
      Ok({ array: this.#array, type: "added", index: 0, items })
    );
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
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
  removeAllOf(val: AT) {
    for (let i = 0; i < this.#array.length; i++)
      if ((this.#array[i] = val)) {
        this.updateSubscribers(
          Ok({ array: this.#array, type: "removed", index: i, items: [val] })
        );
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  applyStateArrayRead<B>(
    result: Result<STATE_ARRAY_READ<B>, string>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
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

//##################################################################################################################################################
//      _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//       | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//       | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\

/** Applies a read from a state array to another array
 * @template TYPE - Types allowed in both arrays.*/
export function state_array_apply_read_to_array<TYPE>(
  array: TYPE[],
  read: STATE_ARRAY_READ<TYPE>
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
export function state_array_apply_read_to_array_transform<INPUT, OUTPUT>(
  array: OUTPUT[],
  read: STATE_ARRAY_READ<INPUT>,
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

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**States representing arrays */
export let state_array = {};
