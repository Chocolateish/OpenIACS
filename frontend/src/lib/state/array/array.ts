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
import type {
  StateHelper as HELPER,
  StateRelated as RELATED,
  State,
  StateRES,
  StateRESWS,
  StateROS,
  StateROSWS,
  StateSetREXWS,
} from "../types";

//##################################################################################################################################################
//      _________     _______  ______  _____
//     |__   __\ \   / /  __ \|  ____|/ ____|
//        | |   \ \_/ /| |__) | |__  | (___
//        | |    \   / |  ___/|  __|  \___ \
//        | |     | |  | |    | |____ ____) |
//        |_|     |_|  |_|    |______|_____/

export const StateArrayWriteType = {
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;
export type StateArrayWriteType =
  (typeof StateArrayWriteType)[keyof typeof StateArrayWriteType];

export type StateArrayReadType = StateArrayWriteType | "none";

export interface StateArrayWrite<TYPE> {
  type: StateArrayWriteType;
  index: number;
  items: readonly TYPE[];
}

export interface StateArrayRead<TYPE> {
  array: readonly TYPE[];
  type: StateArrayReadType;
  index: number;
  items: readonly TYPE[];
}

export type StateArray<AT, REL extends Option<RELATED> = OptionNone> = State<
  StateArrayRead<AT>,
  StateArrayWrite<AT>,
  REL
>;

type SAR<AT> = StateArrayRead<AT>;
type SAW<AT> = StateArrayWrite<AT>;

type ArraySetter<
  AT,
  RRT extends Result<SAR<AT>, string>,
  REL extends Option<RELATED>
> = (
  value: SAW<AT>,
  state: OwnerWS<AT, RRT, REL>,
  old?: RRT
) => Result<void, string>;

interface Owner<
  AT,
  RRT extends Result<SAR<AT>, string>,
  REL extends Option<RELATED>
> {
  set(value: ResultOk<AT[]>): void;
  set_ok(value: AT[]): void;
  setter?: ArraySetter<AT, RRT, REL>;
  get state(): State<SAR<AT>, SAW<AT>, REL>;

  get array(): readonly AT[];
  readonly length: number;
  push(...items: AT[]): number;
  pop(): AT | undefined;
  shift(): AT | undefined;
  unshift(...items: AT[]): number;
  splice(start: number, deleteCount?: number, ...items: AT[]): AT[];
  delete(val: AT): void;

  apply_read<B>(
    result: ResultOk<SAR<B>>,
    transform: (val: readonly B[], type: StateArrayReadType) => AT[]
  ): void;
}
interface OwnerWS<
  AT,
  RRT extends Result<SAR<AT>, string>,
  REL extends Option<RELATED>
> extends Owner<AT, RRT, REL> {
  setter: ArraySetter<AT, RRT, REL>;
}

export type StateArrayROS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = StateROS<SAR<AT>, REL, SAW<AT>> &
  Owner<AT, ResultOk<SAR<AT>>, REL> & {
    readonly read_only: StateROS<SAR<AT>, REL, SAW<AT>>;
    readonly read_write?: StateROSWS<SAR<AT>, SAW<AT>, REL>;
  };

export type StateArrayROSWS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = StateROSWS<SAR<AT>, SAW<AT>, REL> &
  OwnerWS<AT, ResultOk<SAR<AT>>, REL> & {
    readonly read_only: StateROS<SAR<AT>, REL, SAW<AT>>;
    readonly read_write: StateROSWS<SAR<AT>, SAW<AT>, REL>;
  };

export type StateArrayRES<
  AT,
  REL extends Option<RELATED> = OptionNone
> = StateRES<SAR<AT>, REL, SAW<AT>> &
  Owner<AT, ResultOk<SAR<AT>>, REL> & {
    set_err(error: string): void;
    readonly read_only: StateRES<SAR<AT>, REL, SAW<AT>>;
    readonly read_write?: StateRESWS<SAR<AT>, SAW<AT>, REL>;
  };

export type StateArrayRESWS<
  AT,
  REL extends Option<RELATED> = OptionNone
> = StateRESWS<SAR<AT>, SAW<AT>, REL> &
  OwnerWS<AT, ResultOk<SAR<AT>>, REL> & {
    set_err(error: string): void;
    readonly read_only: StateRES<SAR<AT>, REL, SAW<AT>>;
    readonly read_write: StateRESWS<SAR<AT>, SAW<AT>, REL>;
  };

//##################################################################################################################################################
//      _    _ ______ _      _____  ______ _____   _____
//     | |  | |  ____| |    |  __ \|  ____|  __ \ / ____|
//     | |__| | |__  | |    | |__) | |__  | |__) | (___
//     |  __  |  __| | |    |  ___/|  __| |  _  / \___ \
//     | |  | | |____| |____| |    | |____| | \ \ ____) |
//     |_|  |_|______|______|_|    |______|_|  \_\_____/

/** Applies a read from a state array to another array
 * @template AT - Types allowed in both arrays.
 * @template TAT - Optional type if state array type is different from array
 * @param array Array to modify in place
 * @param read Read struct from state array
 * @param transform optional tranform function for when state array is not same type of array*/
export function apply_read<AT>(array: AT[], read: StateArrayRead<AT>): AT[];
export function apply_read<AT, TAT = AT>(
  array: AT[],
  read: StateArrayRead<TAT>,
  transform: (value: TAT, index: number, array: readonly TAT[]) => AT
): AT[];
export function apply_read<AT, TAT = AT>(
  array: AT[],
  read: StateArrayRead<TAT & AT>,
  transform?: (value: TAT, index: number, array: readonly TAT[]) => AT
): AT[] {
  const a = array;
  const t = transform;
  const { type: ty, index: ix, items: it } = read;
  if (ty === "none") a.splice(ix, a.length, ...(t ? it.map(t) : it));
  else if (ty === "added") a.splice(ix, 0, ...(t ? it.map(t) : it));
  else if (ty === "removed") a.splice(ix, it.length);
  else if (ty === "changed")
    for (let i = 0; i < it.length; i++) a[ix + i] = t ? t(it[i], i, it) : it[i];
  return a;
}

//##################################################################################################################################################
//       _____ _                _____ _____
//      / ____| |        /\    / ____/ ____|
//     | |    | |       /  \  | (___| (___
//     | |    | |      / /\ \  \___ \\___ \
//     | |____| |____ / ____ \ ____) |___) |
//      \_____|______/_/    \_\_____/_____/

class RXS<
    AT,
    RRT extends Result<SAR<AT>, string>,
    REL extends Option<RELATED> = OptionNone
  >
  extends StateBase<SAR<AT>, SAW<AT>, REL, RRT>
  implements Owner<AT, RRT, REL>
{
  constructor(
    init: Result<AT[], string>,
    helper?: HELPER<SAW<AT>, REL>,
    setter?: ArraySetter<AT, RRT, REL> | true
  ) {
    super();
    if (setter === true)
      this.#setter = (val) =>
        ok(this.apply_read(ok(val as SAR<AT>), (v) => [...v]));
    else this.#setter = setter;
    if (helper) this.#helper = helper;
    this.set(init);
  }

  #error?: string;
  #array: AT[] = [];
  #helper?: HELPER<SAW<AT>, REL>;
  #setter?: ArraySetter<AT, RRT, REL>;

  #mr(type: StateArrayReadType, index: number, items: AT[]): SAR<AT> {
    return { array: this.#array, type, index, items };
  }

  set(value: Result<AT[], string>) {
    this.#array = value.ok ? value.value : [];
    this.#error = value.ok ? undefined : value.error;
    this.update_subs(ok(this.#mr("none", 0, this.#array)) as RRT);
  }
  set_ok(value: AT[]): void {
    this.set(ok(value));
  }
  set_err(error: string): void {
    this.set(err(error));
  }

  set setter(setter: ArraySetter<AT, RRT, REL> | undefined) {
    this.#setter = setter;
  }
  get setter(): ArraySetter<AT, RRT, REL> | undefined {
    return this.#setter;
  }
  get state(): State<SAR<AT>, SAW<AT>, REL> {
    return this as State<SAR<AT>, SAW<AT>, REL>;
  }
  get read_only(): State<SAR<AT>, SAW<AT>, REL> {
    return this as State<SAR<AT>, SAW<AT>, REL>;
  }
  get read_write(): State<SAR<AT>, SAW<AT>, REL> | undefined {
    return this.#setter ? (this as State<SAR<AT>, SAW<AT>, REL>) : undefined;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = RRT>(func: (value: RRT) => T | PromiseLike<T>): Promise<T> {
    return func(this.get());
  }
  get(): RRT {
    if (this.#error) return err(this.#error) as RRT;
    return ok(this.#mr("none", 0, this.#array)) as RRT;
  }
  ok(): SAR<AT> {
    return this.#mr("none", 0, this.#array);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
  }

  //#Writer Context
  get writable(): boolean {
    return this.#setter !== undefined;
  }
  get wsync(): boolean {
    return this.writable;
  }
  async write(value: SAW<AT>): Promise<Result<void, string>> {
    return this.write_sync(value);
  }
  write_sync(value: SAW<AT>): Result<void, string> {
    if (this.#setter)
      return this.#setter(value, this as OwnerWS<AT, RRT, REL>, this.get());
    return err("State not writable");
  }
  limit(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: SAW<AT>): Result<SAW<AT>, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }

  //Array/Owner Context
  get array(): readonly AT[] {
    return this.#array;
  }

  get length(): number {
    return this.#array.length;
  }

  push(...items: AT[]): number {
    const index = this.#array.length;
    const new_len = this.#array.push(...items);
    this.update_subs(ok(this.#mr("added", index, items)) as RRT);
    return new_len;
  }

  pop(): AT | undefined {
    const p = this.#array.pop();
    if (p)
      this.update_subs(
        ok(this.#mr("removed", this.#array.length + 1, [p])) as RRT
      );
    return p;
  }

  shift(): AT | undefined {
    const shifted = this.#array.shift();
    if (shifted) this.update_subs(ok(this.#mr("removed", 0, [shifted])) as RRT);
    return shifted;
  }

  unshift(...items: AT[]): number {
    const new_len = this.#array.unshift(...items);
    this.update_subs(ok(this.#mr("added", 0, items)) as RRT);
    return new_len;
  }

  splice(start: number, delete_count?: number, ...items: AT[]): AT[] {
    const r = this.#array.splice(start, delete_count!, ...items);
    if (r.length > 0)
      this.update_subs(ok(this.#mr("removed", start, r)) as RRT);
    if (items.length > 0)
      this.update_subs(ok(this.#mr("added", start, items)) as RRT);
    return r;
  }

  delete(val: AT) {
    for (let i = 0; i < this.#array.length; i++)
      if ((this.#array[i] = val)) {
        this.update_subs(ok(this.#mr("removed", i, [val])) as RRT);
        i--;
      }
  }

  ///Helps apply the changes from one state array to another
  apply_read<B>(
    result: ResultOk<SAR<B>>,
    transform: (val: readonly B[], type: StateArrayReadType) => AT[]
  ) {
    const { index, items: its, type } = result.value;
    const items = transform(its, type);
    if (type === "none") return this.set(ok(items));
    else if (type === "added") this.#array.splice(index, 0, ...items);
    else if (type === "removed") this.#array.splice(index, items.length);
    else if (type === "changed")
      for (let i = 0; i < its.length; i++) this.#array[index + i] = items[i];
    this.update_subs(ok(this.#mr(type, index, items)) as RRT);
  }
}

//##################################################################################################################################################
//       _____ ______ _   _ ______ _____         _______ ____  _____   _____
//      / ____|  ____| \ | |  ____|  __ \     /\|__   __/ __ \|  __ \ / ____|
//     | |  __| |__  |  \| | |__  | |__) |   /  \  | | | |  | | |__) | (___
//     | | |_ |  __| | . ` |  __| |  _  /   / /\ \ | | | |  | |  _  / \___ \
//     | |__| | |____| |\  | |____| | \ \  / ____ \| | | |__| | | \ \ ____) |
//      \_____|______|_| \_|______|_|  \_\/_/    \_\_|  \____/|_|  \_\_____/
const ROS = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param helper functions to make related*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new RXS<AT, ResultOk<SAR<AT>>, REL>(
      ok(init),
      helper
    ) as StateArrayROS<AT, REL>;
  },
};
const ROS_WS = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    setter:
      | StateSetREXWS<SAR<AT>, OwnerWS<AT, ResultOk<SAR<AT>>, REL>, SAW<AT>>
      | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new RXS<AT, ResultOk<SAR<AT>>, REL>(
      ok(init),
      helper,
      setter
    ) as StateArrayROSWS<AT, REL>;
  },
};
const RES = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param helper functions to make related*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new RXS<AT, Result<SAR<AT>, string>, REL>(
      ok(init),
      helper
    ) as StateArrayRES<AT, REL>;
  },
  /**Creates a state representing an array
   * @param init initial error
   * @param helper functions to make related*/
  err<AT, REL extends Option<RELATED> = OptionNone>(
    error: string,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new RXS<AT, Result<SAR<AT>, string>, REL>(
      err(error),
      helper
    ) as StateArrayRES<AT, REL>;
  },
};
const RES_WS = {
  /**Creates a state representing an array
   * @param init initial array, leave empty for empty array
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  ok<AT, REL extends Option<RELATED> = OptionNone>(
    init: AT[] = [],
    setter:
      | StateSetREXWS<
          SAR<AT>,
          OwnerWS<AT, Result<SAR<AT>, string>, REL>,
          SAW<AT>
        >
      | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new RXS<AT, Result<SAR<AT>, string>, REL>(
      ok(init),
      helper,
      setter
    ) as StateArrayRESWS<AT, REL>;
  },
  /**Creates a state representing an array
   * @param err initial error
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit*/
  err<AT, REL extends Option<RELATED> = OptionNone>(
    error: string,
    setter:
      | StateSetREXWS<
          SAR<AT>,
          OwnerWS<AT, Result<SAR<AT>, string>, REL>,
          SAW<AT>
        >
      | true,
    helper?: HELPER<SAW<AT>, REL>
  ) {
    return new RXS<AT, Result<SAR<AT>, string>, REL>(
      err(error),
      helper,
      setter
    ) as StateArrayRESWS<AT, REL>;
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
export const STATE_ARRAY = {
  apply_read,
  ros: ROS,
  ros_ws: ROS_WS,
  res: RES,
  res_ws: RES_WS,
  is(s: any): s is State<StateArrayRead<any>, any> {
    return s instanceof RXS;
  },
};
