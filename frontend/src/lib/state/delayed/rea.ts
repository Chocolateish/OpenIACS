import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_HELPER as Helper,
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_REA,
  type STATE_REA_WA,
  type STATE_REA_WS,
  type STATE_SET_REX_WA,
  type STATE_SET_REX_WS,
} from "../types";

interface OWNER<RT, WT, REL extends RELATED> {
  set(value: Result<RT, string>): void;
  setOk(value: RT): void;
  setErr(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_REA<RT, REL, WT>;
}

//##################################################################################################################################################
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\
export type STATE_DELAYED_REA<
  RT,
  REL extends RELATED = {},
  WT = any
> = STATE_REA<RT, REL, WT> & OWNER<RT, WT, REL>;

class REA<RT, REL extends RELATED = {}, WT = any>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements OWNER<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<Result<RT, string>>,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (helper) this.#helper = helper;

    //Temporary override until first access
    let initializing = false;
    this.then = async <TResult1 = Result<RT, string>>(
      func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init)
        if (!initializing) {
          initializing = true;
          (async () => {
            try {
              this.#value = await init();
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
    let write = this.write.bind(this);
    this.write = async (value) =>
      (await write(value)).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write", "writeSync"] as const).forEach(
      (k) => delete this[k]
    );
  }

  #value?: Result<RT, string>;
  setterAsync?: STATE_SET_REX_WA<RT, OWNER<RT, WT, REL>, WT>;
  setterSync?: STATE_SET_REX_WS<RT, OWNER<RT, WT, REL>, WT>;
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
  get readOnly(): STATE_REA<RT, REL, WT> {
    return this as STATE_REA<RT, REL, WT>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value) as any;
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //#Writer Context
  get writable(): boolean {
    return Boolean(this.setterSync || this.setterAsync);
  }
  get wsync(): boolean {
    return Boolean(this.setterSync);
  }
  async write(value: WT): Promise<Result<void, string>> {
    if (this.setterAsync) return this.setterAsync(value, this, this.#value);
    return Err("State not writable");
  }
  writeSync(value: WT): Result<void, string> {
    if (this.setterSync) return this.setterSync(value, this, this.#value);
    return Err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}

const rea = {
  /**Creates a delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends RELATED = {}, WT = any>(
    init?: () => PromiseLike<RT>,
    helper?: Helper<WT, REL>
  ) {
    return new REA<RT, REL, WT>(
      init ? async () => Ok(await init()) : undefined,
      helper
    ) as STATE_DELAYED_REA<RT, REL, WT>;
  },
  /**Creates a delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends RELATED = {}, WT = any>(
    init?: () => PromiseLike<string>,
    helper?: Helper<WT, REL>
  ) {
    return new REA<RT, REL, WT>(
      init ? async () => Err(await init()) : undefined,
      helper
    ) as STATE_DELAYED_REA<RT, REL, WT>;
  },
  /**Creates a delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends RELATED = {}, WT = any>(
    init?: () => PromiseLike<Result<RT, string>>,
    helper?: Helper<WT, REL>
  ) {
    return new REA<RT, REL, WT>(init, helper) as STATE_DELAYED_REA<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____  ______           __          _______
//     |  __ \|  ____|   /\     \ \        / / ____|
//     | |__) | |__     /  \     \ \  /\  / / (___
//     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
//     | | \ \| |____ / ____ \     \  /\  /  ____) |
//     |_|  \_\______/_/    \_\     \/  \/  |_____/
interface OWNER_WS<RT, WT, REL extends RELATED> {
  set(value: Result<RT, string>): void;
  setOk(value: RT): void;
  setErr(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_REA<RT, REL, WT>;
  get readWrite(): STATE_REA_WS<RT, WT, REL>;
}

export type STATE_DELAYED_REA_WS<
  RT,
  WT = RT,
  REL extends RELATED = {}
> = STATE_REA_WS<RT, WT, REL> & OWNER_WS<RT, WT, REL>;

class REA_WS<RT, WT = RT, REL extends RELATED = {}>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements OWNER_WS<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
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

    //Temporary override until first access
    let initializing = false;
    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init)
        if (!initializing) {
          initializing = true;
          (async () => {
            try {
              this.#value = await init();
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
    (["then", "set", "writeSync"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  #setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT>;
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
  get readOnly(): STATE_REA<RT, REL, WT> {
    return this as STATE_REA<RT, REL, WT>;
  }
  get readWrite(): STATE_REA_WS<RT, WT, REL> {
    return this as STATE_REA_WS<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value) as any;
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
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

const rea_ws = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends RELATED = {}>(
    init?: () => PromiseLike<RT>,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REA_WS<RT, WT, REL>(
      init ? async () => Ok(await init()) : undefined,
      setter,
      helper
    ) as STATE_DELAYED_REA_WS<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends RELATED = {}>(
    init?: () => PromiseLike<string>,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REA_WS<RT, WT, REL>(
      init ? async () => Err(await init()) : undefined,
      setter,
      helper
    ) as STATE_DELAYED_REA_WS<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends RELATED = {}>(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REA_WS<RT, WT, REL>(
      init,
      setter,
      helper
    ) as STATE_DELAYED_REA_WS<RT, WT, REL>;
  },
};

//##################################################################################################################################################
//      _____  ______           __          __
//     |  __ \|  ____|   /\     \ \        / /\
//     | |__) | |__     /  \     \ \  /\  / /  \
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \
//     | | \ \| |____ / ____ \     \  /\  / ____ \
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\
interface OWNER_WA<RT, WT, REL extends RELATED> {
  set(value: Result<RT, string>): void;
  setOk(value: RT): void;
  setErr(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_REA<RT, REL, WT>;
  get readWrite(): STATE_REA_WA<RT, WT, REL>;
}

export type STATE_DELAYED_REA_WA<
  RT,
  WT = RT,
  REL extends RELATED = {}
> = STATE_REA_WA<RT, WT, REL> & OWNER_WA<RT, WT, REL>;

export class REA_WA<RT, WT = RT, REL extends RELATED = {}>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements OWNER_WA<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: STATE_SET_REX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    super();
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
    let initializing = false;
    this.then = async <TResult1 = ResultOk<RT>>(
      func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      if (init)
        if (!initializing) {
          initializing = true;
          (async () => {
            try {
              this.#value = await init();
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
    (["then", "set", "write"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  #setter: STATE_SET_REX_WA<RT, OWNER_WA<RT, WT, REL>, WT>;
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
  get readOnly(): STATE_REA<RT, REL, WT> {
    return this as STATE_REA<RT, REL, WT>;
  }
  get readWrite(): STATE_REA_WA<RT, WT, REL> {
    return this as STATE_REA_WA<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value) as any;
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //#Writer Context
  get writable(): true {
    return true;
  }
  get wsync(): false {
    return false;
  }
  async write(value: WT): Promise<Result<void, string>> {
    return this.#setter(value, this, this.#value);
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}

const rea_wa = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends RELATED = {}>(
    init?: () => PromiseLike<RT>,
    setter: STATE_SET_REX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REA_WA<RT, WT, REL>(
      init ? async () => Ok(await init()) : undefined,
      setter,
      helper
    ) as STATE_DELAYED_REA_WA<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends RELATED = {}>(
    init?: () => PromiseLike<string>,
    setter: STATE_SET_REX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REA_WA<RT, WT, REL>(
      init ? async () => Err(await init()) : undefined,
      setter,
      helper
    ) as STATE_DELAYED_REA_WA<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends RELATED = {}>(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: STATE_SET_REX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REA_WA<RT, WT, REL>(
      init,
      setter,
      helper
    ) as STATE_DELAYED_REA_WA<RT, WT, REL>;
  },
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
