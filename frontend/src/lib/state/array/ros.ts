import {
  err,
  none,
  ok,
  OptionNone,
  ResultOk,
  type Option,
  type Result,
} from "@libResult";
import { StateBase } from "../base";
import {
  type StateHelper as HELPER,
  type StateRelated as RELATED,
  type State,
  type StateROS,
  type StateROSWS,
  type StateSetREXWS,
} from "../types";
import type {
  StateArrayReadType as READ_TYPE,
  StateArrayRead as SAR,
  StateArrayWrite as SAW,
  StateArrayMethods,
} from "./shared";

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/

interface Owner<AT, REL extends Option<RELATED>> extends StateArrayMethods<AT> {
  set(value: ResultOk<AT[]>): void;
  get state(): State<SAR<AT>, SAW<AT>, REL>;
  get read_only(): StateROS<SAR<AT>, REL, SAW<AT>>;
}
export type StateArrayROS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = StateROS<SAR<AT>, REL, SAW<AT>> & Owner<AT, REL>;

class ROS<AT, REL extends Option<RELATED> = OptionNone>
  extends StateBase<SAR<AT>, SAW<AT>, REL, ResultOk<SAR<AT>>>
  implements Owner<AT, REL>
{
  constructor(init: ResultOk<AT[]>, helper?: HELPER<SAW<AT>, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.set(init);
  }

  #a: AT[] = [];
  #helper?: HELPER<SAW<AT>, REL>;
  setter?: StateSetREXWS<SAR<AT>, Owner<AT, REL>, SAW<AT>>;

  #mr(type: READ_TYPE, index: number, items: AT[]): SAR<AT> {
    return { array: this.#a, type, index, items };
  }

  get state(): State<SAR<AT>, SAW<AT>, REL> {
    return this as State<SAR<AT>, SAW<AT>, REL>;
  }
  get read_only(): StateROS<SAR<AT>, REL, SAW<AT>> {
    return this as StateROS<SAR<AT>, REL, SAW<AT>>;
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
    return ok(this.ok());
  }
  ok(): SAR<AT> {
    return this.#mr("none", 0, this.#a);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
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
    return err("State not writable");
  }
  limit(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }

  //Array/Owner Context
  get is_array(): boolean {
    return true;
  }

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
    const index = this.#a.length;
    const new_len = this.#a.push(...items);
    this.update_subs(ok(this.#mr("added", index, items)));
    return new_len;
  }

  pop(): AT | undefined {
    const p = this.#a.pop();
    if (p) this.update_subs(ok(this.#mr("removed", this.#a.length + 1, [p])));
    return p;
  }

  shift(): AT | undefined {
    const shifted = this.#a.shift();
    if (shifted) this.update_subs(ok(this.#mr("removed", 0, [shifted])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    const new_len = this.#a.unshift(...items);
    this.update_subs(ok(this.#mr("added", 0, items)));
    return new_len;
  }

  splice(start: number, delete_count?: number, ...items: AT[]): AT[] {
    const r = this.#a.splice(start, delete_count!, ...items);
    if (r.length > 0) this.update_subs(ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.update_subs(ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.update_subs(ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  apply_read<B>(
    result: ResultOk<SAR<B>>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    const { index, items: its, type } = result.value;
    const items = transform(its, type);
    if (type === "none") return this.set(ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.update_subs(ok(this.#mr(type, index, items)));
  }

  get is_object(): boolean {
    return false;
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
    return new ROS<AT, REL>(ok(init), helper) as StateArrayROS<AT, REL>;
  },
};

//##################################################################################################################################################
//      _____   ____   _____  __          _______
//     |  __ \ / __ \ / ____| \ \        / / ____|
//     | |__) | |  | | (___    \ \  /\  / / (___
//     |  _  /| |  | |\___ \    \ \/  \/ / \___ \
//     | | \ \| |__| |____) |    \  /\  /  ____) |
//     |_|  \_\\____/|_____/      \/  \/  |_____/

interface OwnerWS<AT, REL extends Option<RELATED>>
  extends StateArrayMethods<AT> {
  set(value: ResultOk<AT[]>): void;
  get state(): State<SAR<AT>, SAW<AT>, REL>;
  get read_only(): StateROS<SAR<AT>, REL, SAW<AT>>;
  get read_write(): StateROSWS<SAR<AT>, SAW<AT>, REL>;
}
export type StateArrayROSWS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = StateROSWS<SAR<AT>, SAW<AT>, REL> & OwnerWS<AT, REL>;

class ROSWS<AT, REL extends Option<RELATED> = OptionNone>
  extends StateBase<SAR<AT>, SAW<AT>, REL, ResultOk<SAR<AT>>>
  implements OwnerWS<AT, REL>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a promise for an eager async value, use a function returning a promise for a lazy async value
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  constructor(
    init: ResultOk<AT[]>,
    setter: StateSetREXWS<SAR<AT>, OwnerWS<AT, REL>, SAW<AT>> | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    super();
    if (setter === true)
      this.#setter = (val) =>
        ok(this.apply_read(ok(val as SAR<AT>), (v) => [...v]));
    else this.#setter = setter;
    if (helper) this.#helper = helper;
    this.set(init);
  }

  //Internal Context
  #a: AT[] = [];
  #helper?: HELPER<SAW<AT>, REL>;
  #setter: StateSetREXWS<SAR<AT>, OwnerWS<AT, REL>, SAW<AT>>;

  #mr(type: READ_TYPE, index: number, items: AT[]): SAR<AT> {
    return { array: this.#a, type, index, items };
  }

  get state(): State<SAR<AT>, SAW<AT>, REL> {
    return this as State<SAR<AT>, SAW<AT>, REL>;
  }
  get read_only(): StateROS<SAR<AT>, REL, SAW<AT>> {
    return this as StateROS<SAR<AT>, REL, SAW<AT>>;
  }
  get read_write(): StateROSWS<SAR<AT>, SAW<AT>, REL> {
    return this as StateROSWS<SAR<AT>, SAW<AT>, REL>;
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
    return ok(this.ok());
  }
  ok(): SAR<AT> {
    return this.#mr("none", 0, this.#a);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
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
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }

  //Array/Owner Context
  get is_array(): boolean {
    return true;
  }

  set(value: ResultOk<AT[]>) {
    this.#a = value.value;
    this.update_subs(ok(this.#mr("none", 0, this.#a)));
  }

  get array(): readonly AT[] {
    return this.#a;
  }

  get length(): number {
    return this.#a.length;
  }

  push(...items: AT[]): number {
    const index = this.#a.length;
    const new_len = this.#a.push(...items);
    this.update_subs(ok(this.#mr("added", index, items)));
    return new_len;
  }

  pop(): AT | undefined {
    const p = this.#a.pop();
    if (p) this.update_subs(ok(this.#mr("removed", this.#a.length + 1, [p])));
    return p;
  }

  shift(): AT | undefined {
    const shifted = this.#a.shift();
    if (shifted) this.update_subs(ok(this.#mr("removed", 0, [shifted])));
    return shifted;
  }

  unshift(...items: AT[]): number {
    const new_len = this.#a.unshift(...items);
    this.update_subs(ok(this.#mr("added", 0, items)));
    return new_len;
  }

  splice(start: number, delete_count?: number, ...items: AT[]): AT[] {
    const r = this.#a.splice(start, delete_count!, ...items);
    if (r.length > 0) this.update_subs(ok(this.#mr("removed", start, r)));
    if (items.length > 0) this.update_subs(ok(this.#mr("added", start, items)));
    return r;
  }

  /// Removes all instances of a value in the array
  delete(val: AT) {
    for (let i = 0; i < this.#a.length; i++)
      if ((this.#a[i] = val)) {
        this.update_subs(ok(this.#mr("removed", i, [val])));
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  apply_read<B>(
    result: ResultOk<SAR<B>>,
    transform: (val: readonly B[], type: READ_TYPE) => AT[]
  ) {
    const { index, items: its, type } = result.value;
    const items = transform(its, type);
    if (type === "none") return this.set(ok(items));
    else if (type === "added") this.#a.splice(index, 0, ...items);
    else if (type === "removed") this.#a.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#a[index + i] = items[i];
    this.update_subs(ok(this.#mr(type, index, items)));
  }

  get is_object(): boolean {
    return false;
  }
}

const ros_ws = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    setter: StateSetREXWS<SAR<AT>, OwnerWS<AT, REL>, SAW<AT>> | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new ROSWS<AT, REL>(ok(init), setter, helper) as StateArrayROSWS<
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
export const STATE_ARRAY_ROS = {
  ros,
  ros_ws,
};
