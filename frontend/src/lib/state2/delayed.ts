import {
  Err,
  None,
  Ok,
  ResultErr,
  ResultOk,
  type Option,
  type Result,
} from "@libResult";
import {
  STATE_REA,
  STATE_REA_WS,
  STATE_ROA,
  STATE_ROA_WS,
  type StateHelper as Helper,
  type StateHelperWrite as HelperWrite,
  type StateRelated as Related,
  type StateSetSync as Set,
  type StateSetOkSync as SetOk,
} from "./types";

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/
export class STATE_DELAYED_REA<RT, REL extends Related> extends STATE_REA<
  RT,
  REL
> {
  constructor(init?: PromiseLike<Result<RT, string>>, helper?: Helper<REL>) {
    super();
    if (helper) this.#helper = helper;

    this.then = async <TResult1 = Result<RT, string>>(
      func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      let prom = this.appendRProm(func);
      if (init) {
        try {
          this.set(await init);
        } catch (e) {
          this.setErr(String(e));
        }
      }
      return prom;
    };
    this.set = (value) => this.set(this.fulRProm(this.#clean() ?? value));
  }

  #clean(): void {
    (["then", "set"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  #helper?: Helper<REL>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: Result<RT, string>) {
    this.updateSubscribers((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  setErr(err: string): void {
    this.set(Err(err));
  }
}

export class STATE_DELAYED_ROA<RT, REL extends Related> extends STATE_ROA<
  RT,
  REL
> {
  constructor(init?: PromiseLike<ResultOk<RT>>, helper?: Helper<REL>) {
    super();
    if (helper) this.#helper = helper;

    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      let prom = this.appendRProm(func);
      if (init) {
        try {
          this.set(await init);
        } catch (e) {
          console.warn("Failed to initialize delayed RO state: ", e, this);
        }
      }
      return prom;
    };
    this.set = (value) => this.set(this.fulRProm(this.#clean() ?? value));
  }

  #clean(): void {
    (["then", "set"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #helper?: Helper<REL>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: ResultOk<RT>) {
    this.updateSubscribers((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
}

export class STATE_DELAYED_REA_WS<
  RT,
  WT,
  REL extends Related
> extends STATE_REA_WS<RT, WT, REL> {
  constructor(
    init?: PromiseLike<Result<RT, string>>,
    setter?: Set<RT, WT, STATE_DELAYED_REA_WS<RT, WT, REL>> | true,
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

    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      let prom = this.appendRProm(func);
      if (init) {
        try {
          this.set(await init);
        } catch (e) {
          console.warn("Failed to initialize delayed RO state: ", e, this);
        }
      }
      return prom;
    };
    this.set = (value) => this.set(this.fulRProm(this.#clean() ?? value));
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "writeSync"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  #setter?: Set<RT, WT, STATE_DELAYED_REA_WS<RT, WT, REL>>;
  #helper?: HelperWrite<WT, REL>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
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
    this.updateSubscribers((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
  setErr(err: string): void {
    this.set(Err(err));
  }
}

export class STATE_DELAYED_ROA_WS<
  RT,
  WT,
  REL extends Related
> extends STATE_ROA_WS<RT, WT, REL> {
  constructor(
    init?: PromiseLike<ResultOk<RT>>,
    setter?: SetOk<RT, WT, STATE_DELAYED_ROA_WS<RT, WT, REL>> | true,
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
    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      let prom = this.appendRProm(func);
      if (init) {
        try {
          this.set(await init);
        } catch (e) {
          console.warn("Failed to initialize delayed RO state: ", e, this);
        }
      }
      return prom;
    };
    this.set = (value) => this.set(this.fulRProm(this.#clean() ?? value));
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "writeSync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter?: SetOk<RT, WT, STATE_DELAYED_ROA_WS<RT, WT, REL>>;
  #helper?: HelperWrite<WT, REL>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
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
    this.updateSubscribers((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
}

function initToOk<T>(
  init?: PromiseLike<T>
): PromiseLike<ResultOk<T>> | undefined {
  return init
    ? {
        async then(func: (value: ResultOk<T>) => any | PromiseLike<any>) {
          return func(Ok(await init));
        },
      }
    : undefined;
}
function initToErr(
  init?: PromiseLike<string>
): PromiseLike<ResultErr<string>> | undefined {
  return init
    ? {
        async then(func: (value: ResultErr<string>) => any | PromiseLike<any>) {
          return func(Err(await init));
        },
      }
    : undefined;
}

//##################################################################################################################################################
//      _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//       | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//       | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\
let read = {
  /**Creates a delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    helper?: Helper<REL>
  ) {
    return new STATE_DELAYED_REA<RT, REL>(initToOk(init), helper);
  },
  /**Creates a delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Related = {}>(
    init?: PromiseLike<string>,
    helper?: Helper<REL>
  ) {
    return new STATE_DELAYED_REA<RT, REL>(
      init?.then((e) => Err(e)),
      helper
    );
  },
  /**Creates a delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}>(
    init?: PromiseLike<Result<RT, string>>,
    helper?: Helper<REL>
  ) {
    return new STATE_DELAYED_REA<RT, REL>(init, helper);
  },
  /**Checks if a state is a STATE_DELAYED_R*/
  is(state: any): state is STATE_DELAYED_REA<any, any> {
    return state instanceof STATE_DELAYED_REA;
  },
  class: STATE_DELAYED_REA,
};

let readOk = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    helper?: Helper<REL>
  ) {
    return new STATE_DELAYED_ROA<RT, REL>(initToOk(init), helper);
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}>(
    init?: PromiseLike<ResultOk<RT>>,
    helper?: Helper<REL>
  ) {
    return new STATE_DELAYED_ROA<RT, REL>(init, helper);
  },
  /**Checks if a state is a STATE_DELAYED_RO*/
  is(state: any): state is STATE_DELAYED_ROA<any, any> {
    return state instanceof STATE_DELAYED_ROA;
  },
  class: STATE_DELAYED_ROA,
};

let write = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    setter?: Set<RT, WT, STATE_DELAYED_REA_WS<RT, WT, REL>> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_REA_WS<RT, WT, REL>(
      initToOk(init),
      setter,
      helper
    );
  },
  /**Creates a writable delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<string>,
    setter?: Set<RT, WT, STATE_DELAYED_REA_WS<RT, WT, REL>> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_REA_WS<RT, WT, REL>(
      initToErr(init),
      setter,
      helper
    );
  },
  /**Creates a writable delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<Result<RT, string>>,
    setter?: Set<RT, WT, STATE_DELAYED_REA_WS<RT, WT, REL>> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_REA_WS<RT, WT, REL>(init, setter, helper);
  },
  /**Checks if a state is a STATE_DELAYED_R_W*/
  is(state: any): state is STATE_DELAYED_REA_WS<any, any, any> {
    return state instanceof STATE_DELAYED_REA_WS;
  },
  class: STATE_DELAYED_REA_WS,
};

let writeOk = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    setter?: SetOk<RT, WT, STATE_DELAYED_ROA_WS<RT, WT, REL>> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_ROA_WS<RT, WT, REL>(
      initToOk(init),
      setter,
      helper
    );
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<ResultOk<RT>>,
    setter?: SetOk<RT, WT, STATE_DELAYED_ROA_WS<RT, WT, REL>> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_ROA_WS<RT, WT, REL>(init, setter, helper);
  },
  /**Checks if a state is a STATE_DELAYED_RO_W*/
  is(state: any): state is STATE_DELAYED_ROA_WS<any, any, any> {
    return state instanceof STATE_DELAYED_ROA_WS;
  },
  class: STATE_DELAYED_ROA_WS,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
export let delayed = {
  /**Read only delayed states with error, delayed meaning the value is a promise evaluated on first access. */
  rea: read,
  /**Read only delayed states with guarenteed ok, delayed meaning the value is a promise evaluated on first access. */
  roa: readOk,
  /**Read write only delayed states with error, delayed meaning the value is a promise evaluated on first access. */
  rea_ws: write,
  /**Read write only delayed states with guarenteed ok, delayed meaning the value is a promise evaluated on first access. */
  roa_ws: writeOk,
};
