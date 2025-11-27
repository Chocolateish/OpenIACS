import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_HELPER as Helper,
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_ROS,
  type STATE_ROS_WS,
  type STATE_SET_REX_WS,
  type STATE_SET_ROX_WS,
} from "../types";

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/
interface OWNER<RT, WT, REL extends RELATED> {
  set(value: ResultOk<RT>): void;
  setOk(value: RT): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_ROS<RT, REL, WT>;
}

export type STATE_LAZY_ROS<RT, REL extends RELATED = {}, WT = any> = STATE_ROS<
  RT,
  REL,
  WT
> &
  OWNER<RT, WT, REL>;

class ROS<RT, REL extends RELATED = {}, WT = any>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>>
  implements OWNER<RT, WT, REL>
{
  constructor(init: () => ResultOk<RT>, helper?: Helper<WT, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "writeSync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  setter?: STATE_SET_REX_WS<RT, OWNER<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get readOnly(): STATE_ROS<RT, REL, WT> {
    return this as STATE_ROS<RT, REL, WT>;
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
  getOk(): RT {
    return this.get().value;
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //#Writer Context
  get writable(): boolean {
    return this.setter !== undefined;
  }
  get wsync(): boolean {
    return this.writable;
  }
  async write(value: WT): Promise<Result<void, string>> {
    return this.writeSync(value);
  }
  writeSync(value: WT): Result<void, string> {
    if (this.setter) return this.setter(value, this, this.#value);
    return Err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}
const ros = {
  /**Creates a lazy ok state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends RELATED = {}, WT = any>(
    init: () => RT,
    helper?: Helper<WT, REL>
  ) {
    return new ROS<RT, REL, WT>(() => Ok(init()), helper) as STATE_LAZY_ROS<
      RT,
      REL,
      WT
    >;
  },
  /**Creates a lazy ok state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends RELATED = {}, WT = any>(
    init: () => ResultOk<RT>,
    helper?: Helper<WT, REL>
  ) {
    return new ROS<RT, REL, WT>(init, helper) as STATE_LAZY_ROS<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____   ____   _____  __          _______
//     |  __ \ / __ \ / ____| \ \        / / ____|
//     | |__) | |  | | (___    \ \  /\  / / (___
//     |  _  /| |  | |\___ \    \ \/  \/ / \___ \
//     | | \ \| |__| |____) |    \  /\  /  ____) |
//     |_|  \_\\____/|_____/      \/  \/  |_____/
interface OWNER_WS<RT, WT, REL extends RELATED> {
  set(value: ResultOk<RT>): void;
  setOk(value: RT): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_ROS<RT, REL, WT>;
  get readWrite(): STATE_ROS_WS<RT, WT, REL>;
}

export type STATE_LAZY_ROS_WS<
  RT,
  WT = RT,
  REL extends RELATED = {}
> = STATE_ROS_WS<RT, WT, REL> & OWNER_WS<RT, WT, REL>;

class ROS_WS<RT, WT, REL extends RELATED>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>>
  implements OWNER_WS<RT, WT, REL>
{
  constructor(
    init: () => ResultOk<RT>,
    setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (setter === true)
      this.#setter = (value, state, old) => {
        if (old && !old.err && (value as unknown as RT) === old.value)
          return Ok(undefined);
        return this.#helper?.limit
          ? this.#helper
              ?.limit(value)
              .map((e) => state.setOk(e as unknown as RT))
          : Ok(state.setOk(value as unknown as RT));
      };
    else this.#setter = setter;
    if (helper) this.#helper = helper;
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "writeSync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  get state(): STATE<RT, WT, REL> {
    return this;
  }
  get readOnly(): STATE_ROS<RT, REL, WT> {
    return this;
  }
  get readWrite(): STATE_ROS_WS<RT, WT, REL> {
    return this;
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
  getOk(): RT {
    return this.get().value;
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //#Writer Context
  get writable(): true {
    return true;
  }
  get wsync(): true {
    return true;
  }
  async write(value: WT): Promise<Result<void, string>> {
    return this.writeSync(value);
  }
  writeSync(value: WT): Result<void, string> {
    return this.#setter(value, this, this.#value);
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}
const ros_ws = {
  /**Creates a lazy ok state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends RELATED = {}>(
    init: () => RT,
    setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROS_WS<RT, WT, REL>(
      () => Ok(init()),
      setter,
      helper
    ) as STATE_LAZY_ROS_WS<RT, WT, REL>;
  },
  /**Creates a lazy ok state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends RELATED = {}>(
    init: () => ResultOk<RT>,
    setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROS_WS<RT, WT, REL>(init, setter, helper) as STATE_LAZY_ROS_WS<
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
export const state_lazy_ros = {
  /**Sync Read lazy states with guarenteed ok, lazy meaning the value is only evaluated on first access. */
  ros,
  /**Sync Read And Sync Write lazy states with guarenteed ok, lazy meaning the value is only evaluated on first access. */
  ros_ws,
};
