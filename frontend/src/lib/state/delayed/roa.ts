import {
  err,
  none,
  ok,
  OptionNone,
  ResultOk,
  type Option,
  type Result,
} from "@libResult";
import { StateBase } from "../base";
import {
  type StateHelper as Helper,
  type StateRelated as RELATED,
  type State,
  type StateROA,
  type StateROAWA,
  type StateROAWS,
  type StateSetROXWA,
  type StateSetROXWS,
} from "../types";

//##################################################################################################################################################
//      _____   ____
//     |  __ \ / __ \   /\
//     | |__) | |  | | /  \
//     |  _  /| |  | |/ /\ \
//     | | \ \| |__| / ____ \
//     |_|  \_\\____/_/    \_\
interface Owner<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): State<RT, WT, REL>;
  get read_only(): StateROA<RT, REL, WT>;
}

export type StateDelayedROA<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = StateROA<RT, REL, WT> & Owner<RT, WT, REL>;

class ROA<RT, REL extends Option<RELATED> = OptionNone, WT = any>
  extends StateBase<RT, WT, REL, ResultOk<RT>>
  implements Owner<RT, WT, REL>
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

    const write_sync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      write_sync(value).map((val) => this.#clean() ?? val);
    const write = this.write.bind(this);
    this.write = async (value) =>
      (await write(value)).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write", "write_sync"] as const).forEach(
      (k) => delete this[k]
    );
  }

  #value?: ResultOk<RT>;
  setterAsync?: StateSetROXWA<RT, Owner<RT, WT, REL>, WT>;
  setterSync?: StateSetROXWS<RT, Owner<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get read_only(): StateROA<RT, REL, WT> {
    return this as StateROA<RT, REL, WT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value);
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
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
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
    return err("State not writable");
  }
  write_sync(value: WT): Result<void, string> {
    if (this.setterSync) return this.setterSync(value, this, this.#value);
    return err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
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
      init ? async () => ok(await init()) : undefined,
      helper
    ) as StateDelayedROA<RT, REL, WT>;
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init?: () => PromiseLike<ResultOk<RT>>,
    helper?: Helper<WT, REL>
  ) {
    return new ROA<RT, REL, WT>(init, helper) as StateDelayedROA<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____   ____           __          _______
//     |  __ \ / __ \   /\     \ \        / / ____|
//     | |__) | |  | | /  \     \ \  /\  / / (___
//     |  _  /| |  | |/ /\ \     \ \/  \/ / \___ \
//     | | \ \| |__| / ____ \     \  /\  /  ____) |
//     |_|  \_\\____/_/    \_\     \/  \/  |_____/
interface OwnerWS<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): State<RT, WT, REL>;
  get read_only(): StateROA<RT, REL, WT>;
  get read_write(): StateROAWS<RT, WT, REL>;
}

export type StateDelayedROAWS<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = StateROAWS<RT, WT, REL> & OwnerWS<RT, WT, REL>;

class ROAWS<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends StateBase<RT, WT, REL, ResultOk<RT>>
  implements OwnerWS<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (setter === true)
      this.#setter = (value, state, old) => {
        if (old && !old.err && (value as unknown as RT) === old.value)
          return ok(undefined);
        return this.#helper?.limit
          ? this.#helper
              ?.limit(value)
              .map((e) => state.set_ok(e as unknown as RT))
          : ok(state.set_ok(value as unknown as RT));
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
    const write_sync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      write_sync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write_sync"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get read_only(): StateROA<RT, REL, WT> {
    return this as StateROA<RT, REL, WT>;
  }
  get read_write(): StateROAWS<RT, WT, REL> {
    return this as StateROAWS<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value);
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
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
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
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }
}

const roa_ws = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<RT>,
    setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROAWS<RT, WT, REL>(
      init ? async () => ok(await init()) : undefined,
      setter,
      helper
    ) as StateDelayedROAWS<RT, WT, REL>;
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: StateSetROXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROAWS<RT, WT, REL>(init, setter, helper) as StateDelayedROAWS<
      RT,
      WT,
      REL
    >;
  },
};

//##################################################################################################################################################
//      _____   ____           __          __
//     |  __ \ / __ \   /\     \ \        / /\
//     | |__) | |  | | /  \     \ \  /\  / /  \
//     |  _  /| |  | |/ /\ \     \ \/  \/ / /\ \
//     | | \ \| |__| / ____ \     \  /\  / ____ \
//     |_|  \_\\____/_/    \_\     \/  \/_/    \_\
interface OwnerWA<RT, WT, REL extends Option<RELATED>> {
  set(value: ResultOk<RT>): void;
  set_ok(value: RT): void;
  get state(): State<RT, WT, REL>;
  get read_only(): StateROA<RT, REL, WT>;
  get read_write(): StateROAWA<RT, WT, REL>;
}

export type StateDelayedROAWA<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = StateROAWA<RT, WT, REL> & OwnerWA<RT, WT, REL>;

class ROAWA<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends StateBase<RT, WT, REL, ResultOk<RT>>
  implements OwnerWA<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: StateSetROXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    super();
    if (setter === true)
      this.#setter = async (value, state, old) => {
        if (old && !old.err && (value as unknown as RT) === old.value)
          return ok(undefined);
        return this.#helper?.limit
          ? this.#helper
              ?.limit(value)
              .map((e) => state.set_ok(e as unknown as RT))
          : ok(state.set_ok(value as unknown as RT));
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
    const write = this.write.bind(this);
    this.write = async (value) =>
      (await write(value)).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["then", "set", "write"] as const).forEach((k) => delete this[k]);
  }

  #value?: ResultOk<RT>;
  #setter: StateSetROXWA<RT, OwnerWA<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: ResultOk<RT>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get read_only(): StateROA<RT, REL, WT> {
    return this as StateROA<RT, REL, WT>;
  }
  get read_write(): StateROAWA<RT, WT, REL> {
    return this as StateROAWA<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value);
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
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
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
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }
}

const roa_wa = {
  /**Creates a delayed ok state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<RT>,
    setter: StateSetROXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROAWA<RT, WT, REL>(
      init ? async () => ok(await init()) : undefined,
      setter,
      helper
    ) as StateDelayedROAWA<RT, WT, REL>;
  },
  /**Creates a delayed ok state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<ResultOk<RT>>,
    setter: StateSetROXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new ROAWA<RT, WT, REL>(init, setter, helper) as StateDelayedROAWA<
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
/**Delayed valueholding states, delayed means the given promise is evaluated on first access */
export const STATE_DELAYED_ROA = {
  /**Read only delayed states with guarenteed ok, delayed meaning the value is a promise evaluated on first access. */
  roa,
  /**Read write delayed states with guarenteed ok and sync write, delayed meaning the value is a promise evaluated on first access. */
  roa_ws,
  /**Read write delayed states with guarenteed ok and async write, delayed meaning the value is a promise evaluated on first access. */
  roa_wa,
};
