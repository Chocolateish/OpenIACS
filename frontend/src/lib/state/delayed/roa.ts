import {
  Err,
  None,
  Ok,
  OptionNone,
  ResultOk,
  type Option,
  type Result,
} from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_HELPER as Helper,
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_ROA,
  type STATE_ROA_WA,
  type STATE_ROA_WS,
  type STATE_SET_ROX_WA,
  type STATE_SET_ROX_WS,
} from "../types";

//##################################################################################################################################################
//      _____   ____
//     |  __ \ / __ \   /\
//     | |__) | |  | | /  \
//     |  _  /| |  | |/ /\ \
//     | | \ \| |__| / ____ \
//     |_|  \_\\____/_/    \_\
interface OWNER<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_ROA<RT, REL, WT>;
}

export type STATE_DELAYED_ROA<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = STATE_ROA<RT, REL, WT> & OWNER<RT, WT, REL>;

class ROA<RT, REL extends Option<RELATED> = OptionNone, WT = any>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>>
  implements OWNER<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<ResultOk<RT>>,
    helper?: Helper<WT, REL>
  ) {
    super();
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
              this.ful_R_prom(this.#value);
            } catch (e) {
              console.error("Failed to initialize delayed RO state: ", e, this);
            }
            this.#clean();
          })();
        }
      return this.append_R_prom(func);
    };
    this.set = (value) => {
      this.#clean();
      this.set(this.ful_R_prom(value));
    };

    let writeSync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
    let write = this.write.bind(this);
    this.write = async (value) =>
      (await write(value)).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write", "write_sync"] as const).forEach(
      (k) => delete this[k]
    );
  }

  #value?: ResultOk<RT>;
  setterAsync?: STATE_SET_ROX_WA<RT, OWNER<RT, WT, REL>, WT>;
  setterSync?: STATE_SET_ROX_WS<RT, OWNER<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(Ok(value));
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get read_only(): STATE_ROA<RT, REL, WT> {
    return this as STATE_ROA<RT, REL, WT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value) as any;
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }
  ok(): RT {
    return this.#value!.value;
  }
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
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
  write_sync(value: WT): Result<void, string> {
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

const roa = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init?: () => PromiseLike<RT>,
    helper?: Helper<WT, REL>
  ) {
    return new ROA<RT, REL, WT>(
      init ? async () => Ok(await init()) : undefined,
      helper
    ) as STATE_DELAYED_ROA<RT, REL, WT>;
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init?: () => PromiseLike<ResultOk<RT>>,
    helper?: Helper<WT, REL>
  ) {
    return new ROA<RT, REL, WT>(init, helper) as STATE_DELAYED_ROA<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____   ____           __          _______
//     |  __ \ / __ \   /\     \ \        / / ____|
//     | |__) | |  | | /  \     \ \  /\  / / (___
//     |  _  /| |  | |/ /\ \     \ \/  \/ / \___ \
//     | | \ \| |__| / ____ \     \  /\  /  ____) |
//     |_|  \_\\____/_/    \_\     \/  \/  |_____/
interface OWNER_WS<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_ROA<RT, REL, WT>;
  get read_write(): STATE_ROA_WS<RT, WT, REL>;
}

export type STATE_DELAYED_ROA_WS<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = STATE_ROA_WS<RT, WT, REL> & OWNER_WS<RT, WT, REL>;

class ROA_WS<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>>
  implements OWNER_WS<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<ResultOk<RT>>,
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
              .map((e) => state.set_ok(e as unknown as RT))
          : Ok(state.set_ok(value as unknown as RT));
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
              this.ful_R_prom(this.#value);
            } catch (e) {
              console.error("Failed to initialize delayed RO state: ", e, this);
            }
            this.#clean();
          })();
        }
      return this.append_R_prom(func);
    };
    this.set = (value) => {
      this.#clean();
      this.set(this.ful_R_prom(value));
    };
    let writeSync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write_sync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(Ok(value));
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get read_only(): STATE_ROA<RT, REL, WT> {
    return this as STATE_ROA<RT, REL, WT>;
  }
  get read_write(): STATE_ROA_WS<RT, WT, REL> {
    return this as STATE_ROA_WS<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value) as any;
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }
  ok(): RT {
    return this.#value!.value;
  }
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
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
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}

const roa_ws = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<RT>,
    setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROA_WS<RT, WT, REL>(
      init ? async () => Ok(await init()) : undefined,
      setter,
      helper
    ) as STATE_DELAYED_ROA_WS<RT, WT, REL>;
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: STATE_SET_ROX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROA_WS<RT, WT, REL>(
      init,
      setter,
      helper
    ) as STATE_DELAYED_ROA_WS<RT, WT, REL>;
  },
};

//##################################################################################################################################################
//      _____   ____           __          __
//     |  __ \ / __ \   /\     \ \        / /\
//     | |__) | |  | | /  \     \ \  /\  / /  \
//     |  _  /| |  | |/ /\ \     \ \/  \/ / /\ \
//     | | \ \| |__| / ____ \     \  /\  / ____ \
//     |_|  \_\\____/_/    \_\     \/  \/_/    \_\
interface OWNER_WA<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_ROA<RT, REL, WT>;
  get read_write(): STATE_ROA_WA<RT, WT, REL>;
}

export type STATE_DELAYED_ROA_WA<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = STATE_ROA_WA<RT, WT, REL> & OWNER_WA<RT, WT, REL>;

export class ROA_WA<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>>
  implements OWNER_WA<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: STATE_SET_ROX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
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
              .map((e) => state.set_ok(e as unknown as RT))
          : Ok(state.set_ok(value as unknown as RT));
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
              this.ful_R_prom(this.#value);
            } catch (e) {
              console.error("Failed to initialize delayed RO state: ", e, this);
            }
            this.#clean();
          })();
        }
      return this.append_R_prom(func);
    };
    this.set = (value) => {
      this.#clean();
      this.set(this.ful_R_prom(value));
    };
    let write = this.write.bind(this);
    this.write = async (value) =>
      (await write(value)).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter: STATE_SET_ROX_WA<RT, OWNER_WA<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(Ok(value));
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get read_only(): STATE_ROA<RT, REL, WT> {
    return this as STATE_ROA<RT, REL, WT>;
  }
  get read_write(): STATE_ROA_WA<RT, WT, REL> {
    return this as STATE_ROA_WA<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value) as any;
  }
  get(): ResultOk<RT> {
    return this.#value!;
  }
  ok(): RT {
    return this.#value!.value;
  }
  async then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
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

const roa_wa = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<RT>,
    setter: STATE_SET_ROX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROA_WA<RT, WT, REL>(
      init ? async () => Ok(await init()) : undefined,
      setter,
      helper
    ) as STATE_DELAYED_ROA_WA<RT, WT, REL>;
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: STATE_SET_ROX_WA<RT, OWNER_WA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROA_WA<RT, WT, REL>(
      init,
      setter,
      helper
    ) as STATE_DELAYED_ROA_WA<RT, WT, REL>;
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
export const state_delayed_roa = {
  /**Read only delayed states with guarenteed ok, delayed meaning the value is a promise evaluated on first access. */
  roa,
  /**Read write delayed states with guarenteed ok and sync write, delayed meaning the value is a promise evaluated on first access. */
  roa_ws,
  /**Read write delayed states with guarenteed ok and async write, delayed meaning the value is a promise evaluated on first access. */
  roa_wa,
};
