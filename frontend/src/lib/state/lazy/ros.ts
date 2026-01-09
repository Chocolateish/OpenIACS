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
  type StateHelper as Helper,
  type StateRelated as RELATED,
  type State,
  type StateROS,
  type StateROSWS,
  type StateSetREXWS,
  type StateSetROXWS,
} from "../types";

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/
interface Owner<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): State<RT, WT, REL>;
  get readOnly(): StateROS<RT, REL, WT>;
}

export type StateLazyROS<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = StateROS<RT, REL, WT> & Owner<RT, WT, REL>;

class ROS<RT, REL extends Option<RELATED> = OptionNone, WT = any>
  extends StateBase<RT, WT, REL, ResultOk<RT>>
  implements Owner<RT, WT, REL>
{
  constructor(init: () => ResultOk<RT>, helper?: Helper<WT, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    const write_sync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      write_sync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "write_sync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  setter?: StateSetREXWS<RT, Owner<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get readOnly(): StateROS<RT, REL, WT> {
    return this as StateROS<RT, REL, WT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.get());
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }
  ok(): RT {
    return this.get().value;
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
  async write(value: WT): Promise<Result<void, string>> {
    return this.write_sync(value);
  }
  write_sync(value: WT): Result<void, string> {
    if (this.setter) return this.setter(value, this, this.#value);
    return err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }

  get is_array(): boolean {
    return false;
  }
  get is_object(): boolean {
    return false;
  }
}
const ros = {
  /**Creates a lazy ok state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init: () => RT,
    helper?: Helper<WT, REL>
  ) {
    return new ROS<RT, REL, WT>(() => ok(init()), helper) as StateLazyROS<
      RT,
      REL,
      WT
    >;
  },
  /**Creates a lazy ok state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init: () => ResultOk<RT>,
    helper?: Helper<WT, REL>
  ) {
    return new ROS<RT, REL, WT>(init, helper) as StateLazyROS<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____   ____   _____  __          _______
//     |  __ \ / __ \ / ____| \ \        / / ____|
//     | |__) | |  | | (___    \ \  /\  / / (___
//     |  _  /| |  | |\___ \    \ \/  \/ / \___ \
//     | | \ \| |__| |____) |    \  /\  /  ____) |
//     |_|  \_\\____/|_____/      \/  \/  |_____/
interface OwnerWS<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): State<RT, WT, REL>;
  get readOnly(): StateROS<RT, REL, WT>;
  get readWrite(): StateROSWS<RT, WT, REL>;
}

export type StateLazyROSWS<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = StateROSWS<RT, WT, REL> & OwnerWS<RT, WT, REL>;

class ROSWS<RT, WT, REL extends Option<RELATED>>
  extends StateBase<RT, WT, REL, ResultOk<RT>>
  implements OwnerWS<RT, WT, REL>
{
  constructor(
    init: () => ResultOk<RT>,
    setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (setter === true)
      this.#setter = (value, state, old) => {
        if (old && !old.err && (value as unknown as RT) === old.value)
          return ok(undefined);
        return this.#helper?.limit
          ? this.#helper
              ?.limit(value)
              .map((e) => state.set_ok(e as unknown as RT))
          : ok(state.set_ok(value as unknown as RT));
      };
    else this.#setter = setter;
    if (helper) this.#helper = helper;
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    const write_sync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      write_sync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "write_sync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get readOnly(): StateROS<RT, REL, WT> {
    return this as StateROS<RT, REL, WT>;
  }
  get readWrite(): StateROSWS<RT, WT, REL> {
    return this as StateROSWS<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.get());
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }
  ok(): RT {
    return this.get().value;
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
  async write(value: WT): Promise<Result<void, string>> {
    return this.write_sync(value);
  }
  write_sync(value: WT): Result<void, string> {
    return this.#setter(value, this, this.#value);
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }

  get is_array(): boolean {
    return false;
  }
  get is_object(): boolean {
    return false;
  }
}
const ros_ws = {
  /**Creates a lazy ok state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init: () => RT,
    setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROSWS<RT, WT, REL>(
      () => ok(init()),
      setter,
      helper
    ) as StateLazyROSWS<RT, WT, REL>;
  },
  /**Creates a lazy ok state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init: () => ResultOk<RT>,
    setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROSWS<RT, WT, REL>(init, setter, helper) as StateLazyROSWS<
      RT,
      WT,
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
/**Lazy valueholding states, lazy means the given function is evaluated on first access */
export const STATE_LAZY_ROS = {
  /**Sync Read lazy states with guarenteed ok, lazy meaning the value is only evaluated on first access. */
  ros,
  /**Sync Read And Sync Write lazy states with guarenteed ok, lazy meaning the value is only evaluated on first access. */
  ros_ws,
};
