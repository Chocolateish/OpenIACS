import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import {
  STATE_RES_BASE,
  STATE_RES_WS,
  STATE_ROS_BASE,
  STATE_ROS_WS,
  type STATE_HELPER,
  type STATE_HELPER_WRITE,
  type STATE_SET_REX_WS,
} from "./types";

const WRITE_TYPE = {
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;

type WRITE_TYPE = (typeof WRITE_TYPE)[keyof typeof WRITE_TYPE];

type READ_TYPE = WRITE_TYPE | "none";

export interface STATE_ARRAY_WRITE<TYPE> {
  type: WRITE_TYPE;
  index: number;
  items: readonly TYPE[];
}

export interface STATE_ARRAY_READ<TYPE> {
  array: readonly TYPE[];
  type: READ_TYPE;
  index: number;
  items: readonly TYPE[];
}

interface STATE_ARRAY<AT> {
  push(...items: AT[]): number;
  pop(): AT | undefined;
  shift(): AT | undefined;
  unshift(...items: AT[]): number;
  splice(start: number, deleteCount?: number, ...items: AT[]): AT[];
  /** Removes all instances of a value in the array*/
  delete(val: AT): void;
}

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/
export class STATE_ARRAY_RES<AT, RELATED extends {} = {}>
  extends STATE_RES_BASE<STATE_ARRAY_READ<AT>, RELATED>
  implements STATE_ARRAY<AT>
{
  constructor(init?: Result<AT[], string>, helper?: STATE_HELPER<RELATED>) {
    super();
    if (helper) this.#h = helper;
    if (init) this.set(init);
    else this.set(Ok([]));
  }

  //Internal Context
  #e?: string;
  #a: AT[] = [];
  #h?: STATE_HELPER<RELATED>;

  #mr(type: READ_TYPE, index: number, items: AT[]): STATE_ARRAY_READ<AT> {
    return { array: this.#a, type, index, items };
  }

  //Reader Context
  async then<T = Result<STATE_ARRAY_READ<AT>, string>>(
    func: (value: Result<STATE_ARRAY_READ<AT>, string>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }

  get(): Result<STATE_ARRAY_READ<AT>, string> {
    if (this.#e) return Err(this.#e);
    return Ok(this.#mr("none", 0, this.#a));
  }

  related(): Option<RELATED> {
    return this.#h?.related ? this.#h.related() : None();
  }

  //Array/Owner Context
  set(value: Result<AT[], string>) {
    this.#a = value.ok ? value.value : [];
    this.#e = value.ok ? undefined : value.error;
    this.updateSubs(Ok(this.#mr("none", 0, this.#a)));
  }

  get array(): readonly AT[] {
    return this.#a;
  }

  get length(): number {
    return this.#a.length;
  }

  push(...items: AT[]): number {
    let index = this.#a.length;
    let newLen = this.#a.push(...items);
    this.updateSubs(Ok(this.#mr("added", index, items)));
    return newLen;
  }

  pop(): AT | undefined {
    let p = this.#a.pop();
    if (p) this.updateSubs(Ok(this.#mr("removed", this.#a.length + 1, [p!])));
    return p;
  }

  shift(): AT | undefined {
    let shifted = this.#a.shift();
    if (shifted) this.updateSubs(Ok(this.#mr("removed", 0, [shifted!])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#a.unshift(...items);
    this.updateSubs(Ok(this.#mr("added", 0, items)));
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
    let r = this.#a.splice(start, deleteCount!, ...items);
    if (r.length > 0) this.updateSubs(Ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.updateSubs(Ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.updateSubs(Ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  applyRead<B>(
    result: Result<STATE_ARRAY_READ<B>, string>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    if (result.err) return this.set(result);
    let { index, items: its, type } = result.value;
    let items = transform(its, type);
    if (type === "none") return this.set(Ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.updateSubs(Ok(this.#mr(type, index, items)));
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_ARRAY_ROS<AT, RELATED extends {} = {}>
  extends STATE_ROS_BASE<STATE_ARRAY_READ<AT>, RELATED>
  implements STATE_ARRAY<AT>
{
  constructor(init?: ResultOk<AT[]>, helper?: STATE_HELPER<RELATED>) {
    super();
    if (helper) this.#h = helper;
    if (init) this.set(init);
    else this.set(Ok([]));
  }

  #a: AT[] = [];
  #h?: STATE_HELPER<RELATED>;

  #mr(type: READ_TYPE, index: number, items: AT[]): STATE_ARRAY_READ<AT> {
    return { array: this.#a, type, index, items };
  }

  //Reader Context
  async then<T = ResultOk<STATE_ARRAY_READ<AT>>>(
    func: (value: ResultOk<STATE_ARRAY_READ<AT>>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }

  get(): ResultOk<STATE_ARRAY_READ<AT>> {
    return Ok(this.getOk());
  }

  getOk(): STATE_ARRAY_READ<AT> {
    return this.#mr("none", 0, this.#a);
  }

  related(): Option<RELATED> {
    return this.#h?.related ? this.#h.related() : None();
  }

  //Array/Owner Context
  set(value: ResultOk<AT[]>) {
    this.#a = value.value;
    this.updateSubs(this.get());
  }

  get array(): readonly AT[] {
    return this.#a;
  }

  get length(): number {
    return this.#a.length;
  }

  push(...items: AT[]): number {
    let index = this.#a.length;
    let newLen = this.#a.push(...items);
    this.updateSubs(Ok(this.#mr("added", index, items)));
    return newLen;
  }

  pop(): AT | undefined {
    let p = this.#a.pop();
    if (p) this.updateSubs(Ok(this.#mr("removed", this.#a.length + 1, [p!])));
    return p;
  }

  shift(): AT | undefined {
    let shifted = this.#a.shift();
    if (shifted) this.updateSubs(Ok(this.#mr("removed", 0, [shifted!])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#a.unshift(...items);
    this.updateSubs(Ok(this.#mr("added", 0, items)));
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
    let r = this.#a.splice(start, deleteCount!, ...items);
    if (r.length > 0) this.updateSubs(Ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.updateSubs(Ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.updateSubs(Ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  applyRead<B>(
    result: ResultOk<STATE_ARRAY_READ<B>>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    let { index, items: its, type } = result.value;
    let items = transform(its, type);
    if (type === "none") return this.set(Ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.updateSubs(Ok(this.#mr(type, index, items)));
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_ARRAY_RES_WS<AT, RELATED extends {} = {}>
  extends STATE_RES_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_WRITE<AT>, RELATED>
  implements STATE_ARRAY<AT>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init?: Result<AT[], string>,
    setter?:
      | STATE_SET_REX_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_RES_WS<AT, RELATED>>
      | true,
    helper?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>
  ) {
    super();
    if (setter === true)
      this.#s = (val) => Ok(this.applyRead(Ok(val), (v) => [...v]));
    else if (setter) this.#s = setter;
    if (helper) this.#h = helper;
    if (init) this.set(init);
    else this.set(Ok([]));
  }

  //Internal Context
  #e?: string;
  #a: AT[] = [];
  #h?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>;
  #s?: STATE_SET_REX_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_RES_WS<AT, RELATED>>;

  #mr(type: READ_TYPE, index: number, items: AT[]): STATE_ARRAY_READ<AT> {
    return { array: this.#a, type, index, items };
  }

  //Reader Context
  async then<T = Result<STATE_ARRAY_READ<AT>, string>>(
    func: (value: Result<STATE_ARRAY_READ<AT>, string>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }

  get(): Result<STATE_ARRAY_READ<AT>, string> {
    if (this.#e) return Err(this.#e);
    return Ok(this.#mr("none", 0, this.#a));
  }

  related(): Option<RELATED> {
    return this.#h?.related ? this.#h.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  async write(value: STATE_ARRAY_WRITE<AT>): Promise<Result<void, string>> {
    return this.writeSync(value);
  }

  writeSync(value: STATE_ARRAY_WRITE<AT>): Result<void, string> {
    if (this.#s) return this.#s(value as STATE_ARRAY_READ<AT>, this);
    return Err("State not writable");
  }

  limit(value: STATE_ARRAY_WRITE<AT>): Result<STATE_ARRAY_WRITE<AT>, string> {
    return this.#h?.limit ? this.#h.limit(value) : Ok(value);
  }
  check(value: STATE_ARRAY_WRITE<AT>): Result<STATE_ARRAY_WRITE<AT>, string> {
    return this.#h?.check ? this.#h.check(value) : Ok(value);
  }

  //Array/Owner Context
  set(value: Result<AT[], string>) {
    this.#a = value.ok ? value.value : [];
    this.#e = value.ok ? undefined : value.error;
    this.updateSubs(Ok(this.#mr("none", 0, this.#a)));
  }

  get array(): readonly AT[] {
    return this.#a;
  }

  get length(): number {
    return this.#a.length;
  }

  push(...items: AT[]): number {
    let index = this.#a.length;
    let newLen = this.#a.push(...items);
    this.updateSubs(Ok(this.#mr("added", index, items)));
    return newLen;
  }

  pop(): AT | undefined {
    let p = this.#a.pop();
    if (p) this.updateSubs(Ok(this.#mr("removed", this.#a.length + 1, [p!])));
    return p;
  }

  shift(): AT | undefined {
    let shifted = this.#a.shift();
    if (shifted) this.updateSubs(Ok(this.#mr("removed", 0, [shifted!])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#a.unshift(...items);
    this.updateSubs(Ok(this.#mr("added", 0, items)));
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
    let r = this.#a.splice(start, deleteCount!, ...items);
    if (r.length > 0) this.updateSubs(Ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.updateSubs(Ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.updateSubs(Ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  applyRead<B>(
    result: Result<STATE_ARRAY_READ<B>, string>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    if (result.err) return this.set(result);
    let { index, items: its, type } = result.value;
    let items = transform(its, type);
    if (type === "none") return this.set(Ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.updateSubs(Ok(this.#mr(type, index, items)));
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_ARRAY_ROS_WS<AT, RELATED extends {} = {}>
  extends STATE_ROS_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_WRITE<AT>, RELATED>
  implements STATE_ARRAY<AT>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init?: ResultOk<AT[]>,
    setter?:
      | STATE_SET_REX_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_ROS_WS<AT, RELATED>>
      | true,
    helper?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>
  ) {
    super();
    if (setter === true)
      this.#s = (val) => Ok(this.applyRead(Ok(val), (v) => [...v]));
    else if (setter) this.#s = setter;
    if (helper) this.#h = helper;
    if (init) this.set(init);
    else this.set(Ok([]));
  }

  //Internal Context
  #a: AT[] = [];
  #h?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>;
  #s?: STATE_SET_REX_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_ROS_WS<AT, RELATED>>;

  #mr(type: READ_TYPE, index: number, items: AT[]): STATE_ARRAY_READ<AT> {
    return { array: this.#a, type, index, items };
  }

  //Reader Context
  async then<T = ResultOk<STATE_ARRAY_READ<AT>>>(
    func: (value: ResultOk<STATE_ARRAY_READ<AT>>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }

  get(): ResultOk<STATE_ARRAY_READ<AT>> {
    return Ok(this.getOk());
  }

  getOk(): STATE_ARRAY_READ<AT> {
    return this.#mr("none", 0, this.#a);
  }

  related(): Option<RELATED> {
    return this.#h?.related ? this.#h.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  async write(value: STATE_ARRAY_WRITE<AT>): Promise<Result<void, string>> {
    return this.writeSync(value);
  }

  writeSync(value: STATE_ARRAY_WRITE<AT>): Result<void, string> {
    if (this.#s) return this.#s(value as STATE_ARRAY_READ<AT>, this);
    return Err("State not writable");
  }

  limit(value: STATE_ARRAY_WRITE<AT>): Result<STATE_ARRAY_WRITE<AT>, string> {
    return this.#h?.limit ? this.#h.limit(value) : Ok(value);
  }
  check(value: STATE_ARRAY_WRITE<AT>): Result<STATE_ARRAY_WRITE<AT>, string> {
    return this.#h?.check ? this.#h.check(value) : Ok(value);
  }

  //Array/Owner Context
  set(value: ResultOk<AT[]>) {
    this.#a = value.value;
    this.updateSubs(Ok(this.#mr("none", 0, this.#a)));
  }

  get array(): readonly AT[] {
    return this.#a;
  }

  get length(): number {
    return this.#a.length;
  }

  push(...items: AT[]): number {
    let index = this.#a.length;
    let newLen = this.#a.push(...items);
    this.updateSubs(Ok(this.#mr("added", index, items)));
    return newLen;
  }

  pop(): AT | undefined {
    let p = this.#a.pop();
    if (p) this.updateSubs(Ok(this.#mr("removed", this.#a.length + 1, [p!])));
    return p;
  }

  shift(): AT | undefined {
    let shifted = this.#a.shift();
    if (shifted) this.updateSubs(Ok(this.#mr("removed", 0, [shifted!])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#a.unshift(...items);
    this.updateSubs(Ok(this.#mr("added", 0, items)));
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
    let r = this.#a.splice(start, deleteCount!, ...items);
    if (r.length > 0) this.updateSubs(Ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.updateSubs(Ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.updateSubs(Ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  applyRead<B>(
    result: ResultOk<STATE_ARRAY_READ<B>>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    let { index, items: its, type } = result.value;
    let items = transform(its, type);
    if (type === "none") return this.set(Ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.updateSubs(Ok(this.#mr(type, index, items)));
  }
}

//##################################################################################################################################################
//      _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//       | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//       | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\

const res = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param helper functions to make related*/
  ok<AT, RELATED extends {} = {}>(
    init: AT[] = [],
    helper?: STATE_HELPER<RELATED>
  ) {
    return new STATE_ARRAY_RES<AT, RELATED>(Ok(init), helper);
  },
  class: STATE_ARRAY_RES,
};

const ros = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param helper functions to make related*/
  ok<AT, RELATED extends {} = {}>(
    init: AT[] = [],
    helper?: STATE_HELPER<RELATED>
  ) {
    return new STATE_ARRAY_ROS<AT, RELATED>(Ok(init), helper);
  },
  class: STATE_ARRAY_ROS,
};

const res_ws = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  ok<AT, RELATED extends {} = {}>(
    init: AT[] = [],
    setter?:
      | STATE_SET_REX_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_RES_WS<AT, RELATED>>
      | true,
    helper?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>
  ) {
    return new STATE_ARRAY_RES_WS<AT, RELATED>(Ok(init), setter, helper);
  },
  class: STATE_ARRAY_RES_WS,
};

const ros_ws = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  ok<AT, RELATED extends {} = {}>(
    init: AT[] = [],
    setter?:
      | STATE_SET_REX_WS<STATE_ARRAY_READ<AT>, STATE_ARRAY_ROS_WS<AT, RELATED>>
      | true,
    helper?: STATE_HELPER_WRITE<STATE_ARRAY_WRITE<AT>, RELATED>
  ) {
    return new STATE_ARRAY_ROS_WS<AT, RELATED>(Ok(init), setter, helper);
  },
  class: STATE_ARRAY_ROS_WS,
};

/** Applies a read from a state array to another array
 * @template AT - Types allowed in both arrays.
 * @template TAT - Optional type if state array type is different from array
 * @param array Array to modify in place
 * @param read Read struct from state array
 * @param transform optional tranform function for when state array is not same type of array*/
export function apply_read<AT>(array: AT[], read: STATE_ARRAY_READ<AT>): AT[];
export function apply_read<AT, TAT = AT>(
  array: AT[],
  read: STATE_ARRAY_READ<TAT>,
  transform: (value: TAT, index: number, array: readonly TAT[]) => AT
): AT[];
export function apply_read<AT, TAT = AT>(
  array: AT[],
  read: STATE_ARRAY_READ<TAT & AT>,
  transform?: (value: TAT, index: number, array: readonly TAT[]) => AT
): AT[] {
  let a = array;
  let t = transform;
  let { type: ty, index: ix, items: it } = read;
  if (ty === "none") a.splice(ix, a.length, ...(t ? it.map(t) : it));
  else if (ty === "added") a.splice(ix, 0, ...(t ? it.map(t) : it));
  else if (ty === "removed") a.splice(ix, it.length);
  else if (ty === "changed")
    for (let i = 0; i < it.length; i++) a[ix + i] = t ? t(it[i], i, it) : it[i];
  return a;
}

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**States representing arrays */
export const state_array = {
  apply_read,
  res_ws,
  ros,
  ros_ws,
  res,
};
