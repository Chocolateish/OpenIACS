import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import {
  State_ROS,
  State_ROS_WS,
  State_RS,
  State_RS_WS,
  type StateHelper,
  type StateRelated,
  type StateSetterOkSync,
  type StateSetterSync,
} from "./types";

export class State_Sync_R<RT, REL extends StateRelated> extends State_RS<
  RT,
  REL
> {
  constructor(init: Result<RT, string>, helper?: StateHelper<never, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value: Result<RT, string>;
  #helper?: StateHelper<never, REL>;

  //##################################################################################################################################################
  //Reader Context
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

  //##################################################################################################################################################
  //Owner Context
  set(value: Result<RT, string>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  setErr(err: string): void {
    this.set(Err(err));
  }
}

export class State_Sync_RO<RT, REL extends StateRelated> extends State_ROS<
  RT,
  REL
> {
  constructor(init: ResultOk<RT>, helper?: StateHelper<never, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value: ResultOk<RT>;
  #helper?: StateHelper<never, REL>;

  //##################################################################################################################################################
  //Reader Context
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

  //##################################################################################################################################################
  //Owner Context
  set(value: ResultOk<RT>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
}

export class State_Sync_R_W<
  RT,
  WT,
  REL extends StateRelated
> extends State_RS_WS<RT, WT, REL> {
  constructor(
    init: Result<RT, string>,
    setter?: StateSetterSync<RT, WT, State_Sync_R_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
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
  #setter?: StateSetterSync<RT, WT, State_Sync_R_W<RT, WT, REL>>;
  #helper?: StateHelper<WT, REL>;

  //##################################################################################################################################################
  //Reader Context
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

  //##################################################################################################################################################
  //Writer Context
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

  //##################################################################################################################################################
  //Owner Context
  set(value: Result<RT, string>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  setErr(err: string): void {
    this.set(Err(err));
  }
}

export class State_Sync_RO_W<
  RT,
  WT,
  REL extends StateRelated
> extends State_ROS_WS<RT, WT, REL> {
  constructor(
    init: ResultOk<RT>,
    setter?: StateSetterOkSync<RT, WT, State_Sync_RO_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
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
  #setter?: StateSetterOkSync<RT, WT, State_Sync_RO_W<RT, WT, REL>>;
  #helper?: StateHelper<WT, REL>;

  //##################################################################################################################################################
  //Reader Context
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

  //##################################################################################################################################################
  //Writer Context
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

  //##################################################################################################################################################
  //Owner Context
  set(value: ResultOk<RT>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
}

let read = {
  /**Creates a sync state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends StateRelated = {}>(
    init: RT,
    helper?: StateHelper<never, REL>
  ) {
    return new State_Sync_R<RT, REL>(Ok(init), helper);
  },
  /**Creates a sync state from an initial error.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends StateRelated = {}>(
    init: string,
    helper?: StateHelper<never, REL>
  ) {
    return new State_Sync_R<RT, REL>(Err(init), helper);
  },
  /**Creates a sync state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends StateRelated = {}>(
    init: Result<RT, string>,
    helper?: StateHelper<never, REL>
  ) {
    return new State_Sync_R<RT, REL>(init, helper);
  },
};

let readOk = {
  /**Creates a sync ok state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends StateRelated = {}>(
    init: RT,
    helper?: StateHelper<never, REL>
  ) {
    return new State_Sync_RO<RT, REL>(Ok(init), helper);
  },
  /**Creates a sync ok state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends StateRelated = {}>(
    init: ResultOk<RT>,
    helper?: StateHelper<never, REL>
  ) {
    return new State_Sync_RO<RT, REL>(init, helper);
  },
};

let write = {
  /**Creates a writable sync state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends StateRelated = {}>(
    init: RT,
    setter?: StateSetterSync<RT, WT, State_Sync_R_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
  ) {
    return new State_Sync_R_W<RT, WT, REL>(Ok(init), setter, helper);
  },
  /**Creates a writable sync state from an initial error.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends StateRelated = {}>(
    init: string,
    setter?: StateSetterSync<RT, WT, State_Sync_R_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
  ) {
    return new State_Sync_R_W<RT, WT, REL>(Err(init), setter, helper);
  },
  /**Creates a writable sync state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends StateRelated = {}>(
    init: Result<RT, string>,
    setter?: StateSetterSync<RT, WT, State_Sync_R_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
  ) {
    return new State_Sync_R_W<RT, WT, REL>(init, setter, helper);
  },
};

let writeOk = {
  /**Creates a sync ok state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends StateRelated = {}>(
    init: RT,
    setter?: StateSetterOkSync<RT, WT, State_Sync_RO_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
  ) {
    return new State_Sync_RO_W<RT, WT, REL>(Ok(init), setter, helper);
  },
  /**Creates a sync ok state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends StateRelated = {}>(
    init: ResultOk<RT>,
    setter?: StateSetterOkSync<RT, WT, State_Sync_RO_W<RT, WT, REL>> | true,
    helper?: StateHelper<WT, REL>
  ) {
    return new State_Sync_RO_W<RT, WT, REL>(init, setter, helper);
  },
};

export let sync = {
  r: {
    e: read,
    o: readOk,
  },
  w: {
    e: write,
    o: writeOk,
  },
};
