import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import { STATE_IS } from "./base";
import {
  type STATE_HELPER_WRITE as HelperWrite,
  type STATE_RELATED as Related,
  type STATE_RES,
  type STATE_SET_REX_WS,
  type STATE_SET_ROX_WS,
} from "./types";

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/

export class STATE_SYNC_RES<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_IS<RT, WT, REL, Result<RT, string>> {
  constructor(
    init: Result<RT, string>,
    setter?: STATE_SET_REX_WS<RT, STATE_SYNC_RES<RT, WT, REL>, WT> | boolean,
    helper?: HelperWrite<WT, REL>
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
    this.#value = init;
  }

  #value: Result<RT, string>;
  #setter?: STATE_SET_REX_WS<RT, STATE_SYNC_RES<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

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
    return func(this.#value);
  }
  get(): Result<RT, string> {
    return this.#value;
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readonly(): STATE_RES<RT, REL> {
    return this;
  }

  //#Writer Context
  get writable(): boolean {
    return this.#setter !== undefined;
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
}

export class STATE_SYNC_ROS<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_IS<RT, WT, REL, ResultOk<RT>> {
  constructor(
    init: ResultOk<RT>,
    setter?: STATE_SET_ROX_WS<RT, STATE_SYNC_ROS<RT, WT, REL>, WT> | boolean,
    helper?: HelperWrite<WT, REL>
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
    this.#value = init;
  }

  #value: ResultOk<RT>;
  #setter?: STATE_SET_ROX_WS<RT, STATE_SYNC_ROS<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): true {
    return true;
  }
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value);
  }
  get(): ResultOk<RT> {
    return this.#value;
  }
  getOk(): RT {
    return this.#value.value;
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //#Writer Context
  get writable(): boolean {
    return this.#setter !== undefined;
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

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
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
  /**Creates a writable sync state from an initial value.
   * @param init initial value for state.
   * @param setter optional setter function, if true a default setter is used, if false state is read only.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init: RT,
    setter?: STATE_SET_REX_WS<RT, STATE_SYNC_RES<RT, WT, REL>, WT> | boolean,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_RES<RT, WT, REL>(Ok(init), setter, helper);
  },
  /**Creates a writable sync state from an initial error.
   * @param init initial error for state.
   * @param setter optional setter function, if true a default setter is used, if false state is read only.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Related = {}>(
    init: string,
    setter?: STATE_SET_REX_WS<RT, STATE_SYNC_RES<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_RES<RT, WT, REL>(Err(init), setter, helper);
  },
  /**Creates a writable sync state from an initial result.
   * @param init initial result for state.
   * @param setter optional setter function, if true a default setter is used, if false state is read only.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: Result<RT, string>,
    setter?: STATE_SET_REX_WS<RT, STATE_SYNC_RES<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_RES<RT, WT, REL>(init, setter, helper);
  },
  class: STATE_SYNC_RES,
};

//##################################################################################################################################################
const ros = {
  /**Creates a sync ok state from an initial value.
   * @param init initial value for state.
   * @param setter optional setter function, if true a default setter is used, if false state is read only.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init: RT,
    setter?: STATE_SET_ROX_WS<RT, STATE_SYNC_ROS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_ROS<RT, WT, REL>(Ok(init), setter, helper);
  },
  /**Creates a sync ok state from an initial result.
   * @param init initial result for state.
   * @param setter optional setter function, if true a default setter is used, if false state is read only.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: ResultOk<RT>,
    setter?: STATE_SET_ROX_WS<RT, STATE_SYNC_ROS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_ROS<RT, WT, REL>(init, setter, helper);
  },
  class: STATE_SYNC_ROS,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**Sync valueholding states */
export const state_sync = {
  /**Sync read only states with error*/
  res,
  /**Sync read only states with guarenteed ok*/
  ros,
};
