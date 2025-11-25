import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import { STATE_BASE } from "./base";
import {
  type STATE_HELPER as Helper,
  type STATE_RELATED as Related,
  type STATE,
  type STATE_RES,
  type STATE_RES_WS,
  type STATE_ROS,
  type STATE_ROS_WS,
  type STATE_SET_REX_WS,
  type STATE_SET_ROX_WS,
} from "./types";

//##################################################################################################################################################
//      _____  ______  _____
//     |  __ \|  ____|/ ____|
//     | |__) | |__  | (___
//     |  _  /|  __|  \___ \
//     | | \ \| |____ ____) |
//     |_|  \_\______|_____/
export class STATE_LAZY_RES<
  RT,
  REL extends Related = {},
  WT = any
> extends STATE_BASE<RT, WT, REL, Result<RT, string>> {
  constructor(init: () => Result<RT, string>, helper?: Helper<WT, REL>) {
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

  #value?: Result<RT, string>;
  setter?: STATE_SET_REX_WS<RT, STATE_LAZY_RES<RT, REL, WT>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: Result<RT, string>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  setErr(err: string): void {
    this.set(Err(err));
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get readOnly(): STATE_RES<RT, REL> {
    return this as STATE_RES<RT, REL>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): true {
    return true;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.get());
  }
  get(): Result<RT, string> {
    return this.#value!;
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
const res = {
  /**Creates a lazy state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Related = {}, WT = any>(
    init: () => RT,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_RES<RT, REL, WT>(() => Ok(init()), helper);
  },
  /**Creates a lazy state from an initial error, lazy meaning the value is only evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Related = {}, WT = any>(
    init: () => string,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_RES<RT, REL, WT>(() => Err(init()), helper);
  },
  /**Creates a lazy state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}, WT = any>(
    init: () => Result<RT, string>,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_RES<RT, REL, WT>(init, helper);
  },
  class: STATE_LAZY_RES,
};

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/
export class STATE_LAZY_ROS<
  RT,
  REL extends Related = {},
  WT = any
> extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
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
  setter?: STATE_SET_REX_WS<RT, STATE_LAZY_ROS<RT, REL, WT>, WT>;
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
  get readOnly(): STATE_ROS<RT, REL> {
    return this as STATE_ROS<RT, REL>;
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
  ok<RT, REL extends Related = {}, WT = any>(
    init: () => RT,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_ROS<RT, REL, WT>(() => Ok(init()), helper);
  },
  /**Creates a lazy ok state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}, WT = any>(
    init: () => ResultOk<RT>,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_ROS<RT, REL, WT>(init, helper);
  },
  class: STATE_LAZY_ROS,
};

//##################################################################################################################################################
//      _____  ______  _____  __          _______
//     |  __ \|  ____|/ ____| \ \        / / ____|
//     | |__) | |__  | (___    \ \  /\  / / (___
//     |  _  /|  __|  \___ \    \ \/  \/ / \___ \
//     | | \ \| |____ ____) |    \  /\  /  ____) |
//     |_|  \_\______|_____/      \/  \/  |_____/
export class STATE_LAZY_RES_WS<RT, WT, REL extends Related> extends STATE_BASE<
  RT,
  WT,
  REL,
  Result<RT, string>
> {
  constructor(
    init: () => Result<RT, string>,
    setter?: STATE_SET_REX_WS<RT, STATE_LAZY_RES_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (setter)
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

  #value?: Result<RT, string>;
  #setter?: STATE_SET_REX_WS<RT, STATE_LAZY_RES_WS<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: Result<RT, string>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  setErr(err: string): void {
    this.set(Err(err));
  }
  get state(): STATE<RT, WT, REL> {
    return this;
  }
  get readOnly(): STATE_RES<RT, REL> {
    return this;
  }
  get writeOnly(): STATE_RES_WS<RT, WT, REL> {
    return this;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): true {
    return true;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.get());
  }
  get(): Result<RT, string> {
    return this.#value!;
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
    if (this.#setter) return this.#setter(value, this, this.#value);
    return Err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}
const res_ws = {
  /**Creates a writable lazy state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init: () => RT,
    setter?: STATE_SET_REX_WS<RT, STATE_LAZY_RES_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_RES_WS<RT, WT, REL>(() => Ok(init()), setter, helper);
  },
  /**Creates a writable lazy state from an initial error, lazy meaning the value is only evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Related = {}>(
    init: () => string,
    setter?: STATE_SET_REX_WS<RT, STATE_LAZY_RES_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_RES_WS<RT, WT, REL>(
      () => Err(init()),
      setter,
      helper
    );
  },
  /**Creates a writable lazy state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: () => Result<RT, string>,
    setter?: STATE_SET_REX_WS<RT, STATE_LAZY_RES_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_RES_WS<RT, WT, REL>(init, setter, helper);
  },
  class: STATE_LAZY_RES_WS,
};

//##################################################################################################################################################
//      _____   ____   _____  __          _______
//     |  __ \ / __ \ / ____| \ \        / / ____|
//     | |__) | |  | | (___    \ \  /\  / / (___
//     |  _  /| |  | |\___ \    \ \/  \/ / \___ \
//     | | \ \| |__| |____) |    \  /\  /  ____) |
//     |_|  \_\\____/|_____/      \/  \/  |_____/
export class STATE_LAZY_ROS_WS<RT, WT, REL extends Related> extends STATE_BASE<
  RT,
  WT,
  REL,
  ResultOk<RT>
> {
  constructor(
    init: () => ResultOk<RT>,
    setter?: STATE_SET_ROX_WS<RT, STATE_LAZY_ROS_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (setter)
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
  #setter?: STATE_SET_ROX_WS<RT, STATE_LAZY_ROS_WS<RT, WT, REL>, WT>;
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
  get readOnly(): STATE_ROS<RT, REL> {
    return this;
  }
  get writeOnly(): STATE_ROS_WS<RT, WT, REL> {
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
    if (this.#setter) return this.#setter(value, this, this.#value);
    return Err("State not writable");
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
  ok<RT, WT = RT, REL extends Related = {}>(
    init: () => RT,
    setter?: STATE_SET_ROX_WS<RT, STATE_LAZY_ROS_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_ROS_WS<RT, WT, REL>(() => Ok(init()), setter, helper);
  },
  /**Creates a lazy ok state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: () => ResultOk<RT>,
    setter?: STATE_SET_ROX_WS<RT, STATE_LAZY_ROS_WS<RT, WT, REL>, WT> | true,
    helper?: Helper<WT, REL>
  ) {
    return new STATE_LAZY_ROS_WS<RT, WT, REL>(init, setter, helper);
  },
  class: STATE_LAZY_ROS_WS,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**Lazy valueholding states, lazy means the given function is evaluated on first access */
export const state_lazy = {
  /**Sync Read lazy states with error, lazy meaning the value is only evaluated on first access. */
  res,
  /**Sync Read lazy states with guarenteed ok, lazy meaning the value is only evaluated on first access. */
  ros,
  /**Sync Read And Sync Write lazy states with error, lazy meaning the value is only evaluated on first access. */
  res_ws,
  /**Sync Read And Sync Write lazy states with guarenteed ok, lazy meaning the value is only evaluated on first access. */
  ros_ws,
};
