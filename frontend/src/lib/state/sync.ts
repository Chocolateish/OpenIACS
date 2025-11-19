import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import {
  STATE_RES,
  STATE_RES_WS,
  STATE_ROS,
  STATE_ROS_WS,
  type STATE_HELPER as Helper,
  type STATE_HELPER_WRITE as HelperWrite,
  type STATE_RELATED as Related,
  type STATE_SET_RES,
  type STATE_SET_ROS,
} from "./types";

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/
export class STATE_SYNC_RES<RT, REL extends Related = {}> extends STATE_RES<
  RT,
  REL
> {
  constructor(init: Result<RT, string>, helper?: Helper<REL>) {
    super();
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value: Result<RT, string>;
  #helper?: Helper<REL>;

  //#Reader Context
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

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_SYNC_ROS<RT, REL extends Related = {}> extends STATE_ROS<
  RT,
  REL
> {
  constructor(init: ResultOk<RT>, helper?: Helper<REL>) {
    super();
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value: ResultOk<RT>;
  #helper?: Helper<REL>;

  //#Reader Context
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

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_SYNC_RES_WS<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_RES_WS<RT, WT, REL> {
  constructor(
    init: Result<RT, string>,
    setter?: STATE_SET_RES<RT, STATE_SYNC_RES_WS<RT, WT, REL>, WT> | true,
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
  #setter?: STATE_SET_RES<RT, STATE_SYNC_RES_WS<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
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

  //#Writer Context
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

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_SYNC_ROS_WS<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_ROS_WS<RT, WT, REL> {
  constructor(
    init: ResultOk<RT>,
    setter?: STATE_SET_ROS<RT, STATE_SYNC_ROS_WS<RT, WT, REL>, WT> | true,
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
  #setter?: STATE_SET_ROS<RT, STATE_SYNC_ROS_WS<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
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
  /**Creates a sync state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Related = {}>(init: RT, helper?: Helper<REL>) {
    return new STATE_SYNC_RES<RT, REL>(Ok(init), helper);
  },
  /**Creates a sync state from an initial error.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Related = {}>(init: string, helper?: Helper<REL>) {
    return new STATE_SYNC_RES<RT, REL>(Err(init), helper);
  },
  /**Creates a sync state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}>(
    init: Result<RT, string>,
    helper?: Helper<REL>
  ) {
    return new STATE_SYNC_RES<RT, REL>(init, helper);
  },
  /**Checks if a state is a STATE_SYNC_R*/
  is(state: any): state is STATE_SYNC_RES<any, any> {
    return state instanceof STATE_SYNC_RES;
  },
  class: STATE_SYNC_RES,
};

//##################################################################################################################################################
const ros = {
  /**Creates a sync ok state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Related = {}>(init: RT, helper?: Helper<REL>) {
    return new STATE_SYNC_ROS<RT, REL>(Ok(init), helper);
  },
  /**Creates a sync ok state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}>(
    init: ResultOk<RT>,
    helper?: Helper<REL>
  ) {
    return new STATE_SYNC_ROS<RT, REL>(init, helper);
  },
  /**Checks if a state is a STATE_SYNC_RO*/
  is(state: any): state is STATE_SYNC_ROS<any, any> {
    return state instanceof STATE_SYNC_ROS;
  },
  class: STATE_SYNC_ROS,
};

//##################################################################################################################################################
const res_ws = {
  /**Creates a writable sync state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init: RT,
    setter?: STATE_SET_RES<RT, STATE_SYNC_RES_WS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_RES_WS<RT, WT, REL>(Ok(init), setter, helper);
  },
  /**Creates a writable sync state from an initial error.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Related = {}>(
    init: string,
    setter?: STATE_SET_RES<RT, STATE_SYNC_RES_WS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_RES_WS<RT, WT, REL>(Err(init), setter, helper);
  },
  /**Creates a writable sync state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: Result<RT, string>,
    setter?: STATE_SET_RES<RT, STATE_SYNC_RES_WS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_RES_WS<RT, WT, REL>(init, setter, helper);
  },
  /**Checks if a state is a STATE_SYNC_R_W*/
  is(state: any): state is STATE_SYNC_RES_WS<any, any, any> {
    return state instanceof STATE_SYNC_RES_WS;
  },
  class: STATE_SYNC_RES_WS,
};

//##################################################################################################################################################
const ros_ws = {
  /**Creates a sync ok state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init: RT,
    setter?: STATE_SET_ROS<RT, STATE_SYNC_ROS_WS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_ROS_WS<RT, WT, REL>(Ok(init), setter, helper);
  },
  /**Creates a sync ok state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: ResultOk<RT>,
    setter?: STATE_SET_ROS<RT, STATE_SYNC_ROS_WS<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_SYNC_ROS_WS<RT, WT, REL>(init, setter, helper);
  },
  /**Checks if a state is a STATE_SYNC_RO_W*/
  is(state: any): state is STATE_SYNC_ROS_WS<any, any, any> {
    return state instanceof STATE_SYNC_ROS_WS;
  },
  class: STATE_SYNC_ROS_WS,
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
  /**Sync read only states with error */
  res,
  /**Sync read only states with guarenteed ok*/
  ros,
  /**Sync read and sync write with error */
  res_ws,
  /**Sync read and sync write with guarenteed ok*/
  ros_ws,
};
