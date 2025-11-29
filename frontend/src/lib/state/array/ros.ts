import {
  Err,
  None,
  Ok,
  OptionNone,
  ResultOk,
  type Option,
  type Result,
} from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_HELPER as HELPER,
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_ROS,
  type STATE_ROS_WS,
  type STATE_SET_REX_WS,
} from "../types";
import type {
  STATE_ARRAY_READ_TYPE as READ_TYPE,
  STATE_ARRAY_READ as SAR,
  STATE_ARRAY_WRITE as SAW,
  STATE_ARRAY,
} from "./shared";

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/

interface OWNER<AT, REL extends Option<RELATED>> extends STATE_ARRAY<AT> {
  set(value: ResultOk<AT[]>): void;
  get state(): STATE<SAR<AT>, SAW<AT>, REL>;
  get read_only(): STATE_ROS<SAR<AT>, REL, SAW<AT>>;
}
export type STATE_ARRAY_ROS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = STATE_ROS<SAR<AT>, REL, SAW<AT>> & OWNER<AT, REL>;

export class ROS<AT, REL extends Option<RELATED> = OptionNone>
  extends STATE_BASE<SAR<AT>, SAW<AT>, REL, ResultOk<SAR<AT>>>
  implements OWNER<AT, REL>
{
  constructor(init: ResultOk<AT[]>, helper?: HELPER<SAW<AT>, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.set(init);
  }

  #a: AT[] = [];
  #helper?: HELPER<SAW<AT>, REL>;
  setter?: STATE_SET_REX_WS<SAR<AT>, OWNER<AT, REL>, SAW<AT>>;

  #mr(type: READ_TYPE, index: number, items: AT[]): SAR<AT> {
    return { array: this.#a, type, index, items };
  }

  get state(): STATE<SAR<AT>, SAW<AT>, REL> {
    return this as STATE<SAR<AT>, SAW<AT>, REL>;
  }
  get read_only(): STATE_ROS<SAR<AT>, REL, SAW<AT>> {
    return this as STATE_ROS<SAR<AT>, REL, SAW<AT>>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = ResultOk<SAR<AT>>>(
    func: (value: ResultOk<SAR<AT>>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }
  get(): ResultOk<SAR<AT>> {
    return Ok(this.ok());
  }
  ok(): SAR<AT> {
    return this.#mr("none", 0, this.#a);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
  }

  //#Writer Context
  get writable(): boolean {
    return this.setter !== undefined;
  }
  get wsync(): boolean {
    return this.writable;
  }
  async write(value: SAW<AT>): Promise<Result<void, string>> {
    return this.write_sync(value);
  }
  write_sync(value: SAW<AT>): Result<void, string> {
    if (this.setter) return this.setter(value, this, this.get());
    return Err("State not writable");
  }
  limit(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }

  //Array/Owner Context
  set(value: ResultOk<AT[]>) {
    this.#a = value.value;
    this.update_subs(this.get());
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
    this.update_subs(Ok(this.#mr("added", index, items)));
    return newLen;
  }

  pop(): AT | undefined {
    let p = this.#a.pop();
    if (p) this.update_subs(Ok(this.#mr("removed", this.#a.length + 1, [p!])));
    return p;
  }

  shift(): AT | undefined {
    let shifted = this.#a.shift();
    if (shifted) this.update_subs(Ok(this.#mr("removed", 0, [shifted!])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#a.unshift(...items);
    this.update_subs(Ok(this.#mr("added", 0, items)));
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
    let r = this.#a.splice(start, deleteCount!, ...items);
    if (r.length > 0) this.update_subs(Ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.update_subs(Ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.update_subs(Ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  apply_read<B>(
    result: ResultOk<SAR<B>>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    let { index, items: its, type } = result.value;
    let items = transform(its, type);
    if (type === "none") return this.set(Ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.update_subs(Ok(this.#mr(type, index, items)));
  }
}
const ros = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param helper functions to make related*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new ROS<AT, REL>(Ok(init), helper) as STATE_ARRAY_ROS<AT, REL>;
  },
};

//##################################################################################################################################################
//      _____   ____   _____  __          _______
//     |  __ \ / __ \ / ____| \ \        / / ____|
//     | |__) | |  | | (___    \ \  /\  / / (___
//     |  _  /| |  | |\___ \    \ \/  \/ / \___ \
//     | | \ \| |__| |____) |    \  /\  /  ____) |
//     |_|  \_\\____/|_____/      \/  \/  |_____/

interface OWNER_WS<AT, REL extends Option<RELATED>> extends STATE_ARRAY<AT> {
  set(value: ResultOk<AT[]>): void;
  get state(): STATE<SAR<AT>, SAW<AT>, REL>;
  get read_only(): STATE_ROS<SAR<AT>, REL, SAW<AT>>;
  get read_write(): STATE_ROS_WS<SAR<AT>, SAW<AT>, REL>;
}
export type STATE_ARRAY_ROS_WS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = STATE_ROS_WS<SAR<AT>, SAW<AT>, REL> & OWNER_WS<AT, REL>;

export class ROS_WS<AT, REL extends Option<RELATED> = OptionNone>
  extends STATE_BASE<SAR<AT>, SAW<AT>, REL, ResultOk<SAR<AT>>>
  implements OWNER_WS<AT, REL>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init: ResultOk<AT[]>,
    setter: STATE_SET_REX_WS<SAR<AT>, OWNER_WS<AT, REL>, SAW<AT>> | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    super();
    if (setter === true)
      this.#setter = (val) =>
        Ok(this.apply_read(Ok(val as SAR<AT>), (v) => [...v]));
    else this.#setter = setter;
    if (helper) this.#helper = helper;
    this.set(init);
  }

  //Internal Context
  #a: AT[] = [];
  #helper?: HELPER<SAW<AT>, REL>;
  #setter: STATE_SET_REX_WS<SAR<AT>, OWNER_WS<AT, REL>, SAW<AT>>;

  #mr(type: READ_TYPE, index: number, items: AT[]): SAR<AT> {
    return { array: this.#a, type, index, items };
  }

  get state(): STATE<SAR<AT>, SAW<AT>, REL> {
    return this as STATE<SAR<AT>, SAW<AT>, REL>;
  }
  get read_only(): STATE_ROS<SAR<AT>, REL, SAW<AT>> {
    return this as STATE_ROS<SAR<AT>, REL, SAW<AT>>;
  }
  get read_write(): STATE_ROS_WS<SAR<AT>, SAW<AT>, REL> {
    return this as STATE_ROS_WS<SAR<AT>, SAW<AT>, REL>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = ResultOk<SAR<AT>>>(
    func: (value: ResultOk<SAR<AT>>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }
  get(): ResultOk<SAR<AT>> {
    return Ok(this.ok());
  }
  ok(): SAR<AT> {
    return this.#mr("none", 0, this.#a);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
  }

  //#Writer Context
  get writable(): true {
    return true;
  }
  get wsync(): true {
    return true;
  }
  async write(value: SAW<AT>): Promise<Result<void, string>> {
    return this.write_sync(value);
  }
  write_sync(value: SAW<AT>): Result<void, string> {
    return this.#setter(value, this, this.get());
  }
  limit(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }

  //Array/Owner Context
  set(value: ResultOk<AT[]>) {
    this.#a = value.value;
    this.update_subs(Ok(this.#mr("none", 0, this.#a)));
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
    this.update_subs(Ok(this.#mr("added", index, items)));
    return newLen;
  }

  pop(): AT | undefined {
    let p = this.#a.pop();
    if (p) this.update_subs(Ok(this.#mr("removed", this.#a.length + 1, [p!])));
    return p;
  }

  shift(): AT | undefined {
    let shifted = this.#a.shift();
    if (shifted) this.update_subs(Ok(this.#mr("removed", 0, [shifted!])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    let newLen = this.#a.unshift(...items);
    this.update_subs(Ok(this.#mr("added", 0, items)));
    return newLen;
  }

  splice(start: number, deleteCount?: number, ...items: AT[]): AT[] {
    let r = this.#a.splice(start, deleteCount!, ...items);
    if (r.length > 0) this.update_subs(Ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.update_subs(Ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.update_subs(Ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  apply_read<B>(
    result: ResultOk<SAR<B>>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    let { index, items: its, type } = result.value;
    let items = transform(its, type);
    if (type === "none") return this.set(Ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.update_subs(Ok(this.#mr(type, index, items)));
  }
}

const ros_ws = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    setter: STATE_SET_REX_WS<SAR<AT>, OWNER_WS<AT, REL>, SAW<AT>> | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new ROS_WS<AT, REL>(Ok(init), setter, helper) as STATE_ARRAY_ROS_WS<
      AT,
      REL
    >;
  },
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**States representing arrays */
export const state_array_ros = {
  ros,
  ros_ws,
};
