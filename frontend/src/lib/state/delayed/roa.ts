import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import {
  STATE_ROA_BASE,
  STATE_ROA_WA,
  STATE_ROA_WS,
  type STATE_HELPER as Helper,
  type STATE_HELPER_WRITE as HelperWrite,
  type STATE_RELATED as Related,
  type STATE_SET_ROX_WA,
  type STATE_SET_ROX_WS,
} from "../types";

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

//##################################################################################################################################################
//      _____   ____
//     |  __ \ / __ \   /\
//     | |__) | |  | | /  \
//     |  _  /| |  | |/ /\ \
//     | | \ \| |__| / ____ \
//     |_|  \_\\____/_/    \_\

export class STATE_DELAYED_ROA<
  RT,
  REL extends Related = {}
> extends STATE_ROA_BASE<RT, REL> {
  constructor(init?: PromiseLike<ResultOk<RT>>, helper?: Helper<REL>) {
    super();
    if (helper) this.#helper = helper;

    //Temporary override until first access
    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init) {
        let ini = init;
        init = undefined;
        (async () => {
          try {
            this.#value = await ini;
            this.fulRProm(this.#value);
          } catch (e) {
            console.error("Failed to initialize delayed RO state: ", e, this);
          }
          this.#clean();
        })();
      }
      return this.appendRProm(func);
    };
    this.set = (value) => {
      this.#clean();
      this.set(this.fulRProm(value));
    };
  }

  #clean(): void {
    (["then", "set"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #helper?: Helper<REL>;

  //#Reader Context
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  //Becomes sync compatible once evaluated
  get rsync(): false {
    return Boolean(this.#value) as any;
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.updateSubs((this.#value = value));
  }
  setOk(value: RT): void {
    this.set(Ok(value));
  }
}

const roa = {
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

//##################################################################################################################################################
//      _____   ____           __          _______
//     |  __ \ / __ \   /\     \ \        / / ____|
//     | |__) | |  | | /  \     \ \  /\  / / (___
//     |  _  /| |  | |/ /\ \     \ \/  \/ / \___ \
//     | | \ \| |__| / ____ \     \  /\  /  ____) |
//     |_|  \_\\____/_/    \_\     \/  \/  |_____/

export class STATE_DELAYED_ROA_WS<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_ROA_WS<RT, WT, REL> {
  constructor(
    init?: PromiseLike<ResultOk<RT>>,
    setter?: STATE_SET_ROX_WS<RT, STATE_DELAYED_ROA_WS<RT, WT, REL>, WT> | true,
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

    //Temporary override until first access
    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init) {
        let ini = init;
        init = undefined;
        (async () => {
          try {
            this.#value = await ini;
            this.fulRProm(this.#value);
          } catch (e) {
            console.error("Failed to initialize delayed RO state: ", e, this);
          }
          this.#clean();
        })();
      }
      return this.appendRProm(func);
    };
    this.set = (value) => {
      this.#clean();
      this.set(this.fulRProm(value));
    };
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "writeSync", "sub"] as const).forEach(
      (k) => delete this[k]
    );
  }

  #value?: ResultOk<RT>;
  #setter?: STATE_SET_ROX_WS<RT, STATE_DELAYED_ROA_WS<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  //Becomes sync compatible once evaluated
  get rsync(): false {
    return Boolean(this.#value) as any;
  }
  get(): ResultOk<RT> {
    return this.#value!;
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

const roa_ws = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    setter?: STATE_SET_ROX_WS<RT, STATE_DELAYED_ROA_WS<RT, WT, REL>, WT> | true,
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
    setter?: STATE_SET_ROX_WS<RT, STATE_DELAYED_ROA_WS<RT, WT, REL>, WT> | true,
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
//      _____   ____           __          __
//     |  __ \ / __ \   /\     \ \        / /\
//     | |__) | |  | | /  \     \ \  /\  / /  \
//     |  _  /| |  | |/ /\ \     \ \/  \/ / /\ \
//     | | \ \| |__| / ____ \     \  /\  / ____ \
//     |_|  \_\\____/_/    \_\     \/  \/_/    \_\

export class STATE_DELAYED_ROA_WA<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_ROA_WA<RT, WT, REL> {
  constructor(
    init?: PromiseLike<ResultOk<RT>>,
    setter?: STATE_SET_ROX_WA<RT, STATE_DELAYED_ROA_WA<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    super();
    if (setter)
      if (setter === true)
        this.#setter = async (value, state, old) => {
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

    //Temporary override until first access
    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init) {
        let ini = init;
        init = undefined;
        (async () => {
          try {
            this.#value = await ini;
            this.fulRProm(this.#value);
          } catch (e) {
            console.error("Failed to initialize delayed RO state: ", e, this);
          }
          this.#clean();
        })();
      }
      return this.appendRProm(func);
    };
    this.set = (value) => {
      this.#clean();
      this.set(this.fulRProm(value));
    };
    let write = this.write.bind(this);
    this.write = async (value) =>
      (await write(value)).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "writeSync", "sub"] as const).forEach(
      (k) => delete this[k]
    );
  }

  #value?: ResultOk<RT>;
  #setter?: STATE_SET_ROX_WA<RT, STATE_DELAYED_ROA_WA<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  //Becomes sync compatible once evaluated
  get rsync(): false {
    return Boolean(this.#value) as any;
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }

  //#Writer Context
  async write(value: WT): Promise<Result<void, string>> {
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

const roa_wa = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    setter?: STATE_SET_ROX_WA<RT, STATE_DELAYED_ROA_WA<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_ROA_WA<RT, WT, REL>(
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
    setter?: STATE_SET_ROX_WA<RT, STATE_DELAYED_ROA_WA<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_ROA_WA<RT, WT, REL>(init, setter, helper);
  },
  /**Checks if a state is a STATE_DELAYED_RO_W*/
  is(state: any): state is STATE_DELAYED_ROA_WA<any, any, any> {
    return state instanceof STATE_DELAYED_ROA_WA;
  },
  class: STATE_DELAYED_ROA_WA,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**Delayed valueholding states, delayed means the given promise is evaluated on first access */
export const state_delayed_roa = {
  /**Read only delayed states with guarenteed ok, delayed meaning the value is a promise evaluated on first access. */
  roa,
  /**Read write delayed states with guarenteed ok and sync write, delayed meaning the value is a promise evaluated on first access. */
  roa_ws,
  /**Read write delayed states with guarenteed ok and async write, delayed meaning the value is a promise evaluated on first access. */
  roa_wa,
};
