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
  STATE_REA_BASE,
  STATE_REA_WA,
  STATE_REA_WS,
  type STATE_HELPER as Helper,
  type STATE_HELPER_WRITE as HelperWrite,
  type STATE_RELATED as Related,
  type STATE_SET_REX_WA,
  type STATE_SET_REX_WS,
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
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\
export class STATE_DELAYED_REA<
  RT,
  REL extends Related = {}
> extends STATE_REA_BASE<RT, REL> {
  constructor(init?: PromiseLike<Result<RT, string>>, helper?: Helper<REL>) {
    super();
    if (helper) this.#helper = helper;

    //Temporary override until first access
    this.then = async <TResult1 = Result<RT, string>>(
      func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init) {
        let ini = init;
        init = undefined;
        (async () => {
          try {
            this.#value = await ini;
          } catch (e) {
            this.#value = Err(String(e));
          }
          this.fulRProm(this.#value);
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

  #value?: Result<RT, string>;
  #helper?: Helper<REL>;

  //#Reader Context
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
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
  get(): Result<RT, string> {
    return this.#value!;
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

const rea = {
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

//##################################################################################################################################################
//      _____  ______           __          _______
//     |  __ \|  ____|   /\     \ \        / / ____|
//     | |__) | |__     /  \     \ \  /\  / / (___
//     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
//     | | \ \| |____ / ____ \     \  /\  /  ____) |
//     |_|  \_\______/_/    \_\     \/  \/  |_____/

export class STATE_DELAYED_REA_WS<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_REA_WS<RT, WT, REL> {
  constructor(
    init?: PromiseLike<Result<RT, string>>,
    setter?: STATE_SET_REX_WS<RT, STATE_DELAYED_REA_WS<RT, WT, REL>, WT> | true,
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
          } catch (e) {
            this.#value = Err(String(e));
          }
          this.fulRProm(this.#value);
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

  #value?: Result<RT, string>;
  #setter?: STATE_SET_REX_WS<RT, STATE_DELAYED_REA_WS<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
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
  get(): Result<RT, string> {
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

const rea_ws = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    setter?: STATE_SET_REX_WS<RT, STATE_DELAYED_REA_WS<RT, WT, REL>, WT> | true,
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
    setter?: STATE_SET_REX_WS<RT, STATE_DELAYED_REA_WS<RT, WT, REL>, WT> | true,
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
    setter?: STATE_SET_REX_WS<RT, STATE_DELAYED_REA_WS<RT, WT, REL>, WT> | true,
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

//##################################################################################################################################################
//      _____  ______           __          __
//     |  __ \|  ____|   /\     \ \        / /\
//     | |__) | |__     /  \     \ \  /\  / /  \
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \
//     | | \ \| |____ / ____ \     \  /\  / ____ \
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\

export class STATE_DELAYED_REA_WA<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_REA_WA<RT, WT, REL> {
  constructor(
    init?: PromiseLike<Result<RT, string>>,
    setter?: STATE_SET_REX_WA<RT, STATE_DELAYED_REA_WA<RT, WT, REL>, WT> | true,
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
          } catch (e) {
            this.#value = Err(String(e));
          }
          this.fulRProm(this.#value);
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

  #value?: Result<RT, string>;
  #setter?: STATE_SET_REX_WA<RT, STATE_DELAYED_REA_WA<RT, WT, REL>, WT>;
  #helper?: HelperWrite<WT, REL>;

  //#Reader Context
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
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
  get(): Result<RT, string> {
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

const rea_wa = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init?: PromiseLike<RT>,
    setter?: STATE_SET_REX_WA<RT, STATE_DELAYED_REA_WA<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_REA_WA<RT, WT, REL>(
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
    setter?: STATE_SET_REX_WA<RT, STATE_DELAYED_REA_WA<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_REA_WA<RT, WT, REL>(
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
    setter?: STATE_SET_REX_WA<RT, STATE_DELAYED_REA_WA<RT, WT, REL>, WT> | true,
    helper?: HelperWrite<WT, REL>
  ) {
    return new STATE_DELAYED_REA_WA<RT, WT, REL>(init, setter, helper);
  },
  /**Checks if a state is a STATE_DELAYED_R_W*/
  is(state: any): state is STATE_DELAYED_REA_WA<any, any, any> {
    return state instanceof STATE_DELAYED_REA_WA;
  },
  class: STATE_DELAYED_REA_WA,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**Delayed valueholding states, delayed means the given promise is evaluated on first access */
export const state_delayed_rea = {
  /**Read only delayed states with error, delayed meaning the value is a promise evaluated on first access. */
  rea,
  /**Read write delayed states with error and sync write, delayed meaning the value is a promise evaluated on first access. */
  rea_ws,
  /**Read write delayed state with error and async write, delayed meaning the value is a promise evaluated on first access. */
  rea_wa,
};
