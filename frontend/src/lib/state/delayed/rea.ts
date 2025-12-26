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
  type StateREA,
  type StateREAWA,
  type StateREAWS,
  type StateSetREXWA,
  type StateSetREXWS,
} from "../types";

//##################################################################################################################################################
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\
interface Owner<RT, WT, REL extends Option<RELATED>> {
  set(value: Result<RT, string>): void;
  set_ok(value: RT): void;
  set_err(err: string): void;
  get state(): State<RT, WT, REL>;
  get read_only(): StateREA<RT, REL, WT>;
}

export type StateDelayedREA<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = StateREA<RT, REL, WT> & Owner<RT, WT, REL>;

class REA<RT, REL extends Option<RELATED> = OptionNone, WT = any>
  extends StateBase<RT, WT, REL, Result<RT, string>>
  implements Owner<RT, WT, REL>
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
              this.#value = err(String(e));
            }
            this.ful_R_prom(this.#value);
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

  #value?: Result<RT, string>;
  setterAsync?: StateSetREXWA<RT, Owner<RT, WT, REL>, WT>;
  setterSync?: StateSetREXWS<RT, Owner<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: Result<RT, string>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  set_err(error: string): void {
    this.set(err(error));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get read_only(): StateREA<RT, REL, WT> {
    return this as StateREA<RT, REL, WT>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value);
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
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

const rea = {
  /**Creates a delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init?: () => PromiseLike<RT>,
    helper?: Helper<WT, REL>
  ) {
    return new REA<RT, REL, WT>(
      init ? async () => ok(await init()) : undefined,
      helper
    ) as StateDelayedREA<RT, REL, WT>;
  },
  /**Creates a delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init?: () => PromiseLike<string>,
    helper?: Helper<WT, REL>
  ) {
    return new REA<RT, REL, WT>(
      init ? async () => err(await init()) : undefined,
      helper
    ) as StateDelayedREA<RT, REL, WT>;
  },
  /**Creates a delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init?: () => PromiseLike<Result<RT, string>>,
    helper?: Helper<WT, REL>
  ) {
    return new REA<RT, REL, WT>(init, helper) as StateDelayedREA<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____  ______           __          _______
//     |  __ \|  ____|   /\     \ \        / / ____|
//     | |__) | |__     /  \     \ \  /\  / / (___
//     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
//     | | \ \| |____ / ____ \     \  /\  /  ____) |
//     |_|  \_\______/_/    \_\     \/  \/  |_____/
interface OwnerWS<RT, WT, REL extends Option<RELATED>> {
  set(value: Result<RT, string>): void;
  set_ok(value: RT): void;
  set_err(err: string): void;
  get state(): State<RT, WT, REL>;
  get read_only(): StateREA<RT, REL, WT>;
  get read_write(): StateREAWS<RT, WT, REL>;
}

export type StateDelayedREAWS<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = StateREAWS<RT, WT, REL> & OwnerWS<RT, WT, REL>;

class REAWS<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends StateBase<RT, WT, REL, Result<RT, string>>
  implements OwnerWS<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
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
            } catch (e) {
              this.#value = err(String(e));
            }
            this.ful_R_prom(this.#value);
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

  #value?: Result<RT, string>;
  #setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: Result<RT, string>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  set_err(error: string): void {
    this.set(err(error));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get read_only(): StateREA<RT, REL, WT> {
    return this as StateREA<RT, REL, WT>;
  }
  get read_write(): StateREAWS<RT, WT, REL> {
    return this as StateREAWS<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value);
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
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

const rea_ws = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<RT>,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REAWS<RT, WT, REL>(
      init ? async () => ok(await init()) : undefined,
      setter,
      helper
    ) as StateDelayedREAWS<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<string>,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REAWS<RT, WT, REL>(
      init ? async () => err(await init()) : undefined,
      setter,
      helper
    ) as StateDelayedREAWS<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REAWS<RT, WT, REL>(init, setter, helper) as StateDelayedREAWS<
      RT,
      WT,
      REL
    >;
  },
};

//##################################################################################################################################################
//      _____  ______           __          __
//     |  __ \|  ____|   /\     \ \        / /\
//     | |__) | |__     /  \     \ \  /\  / /  \
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \
//     | | \ \| |____ / ____ \     \  /\  / ____ \
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\
interface OwnerWA<RT, WT, REL extends Option<RELATED>> {
  set(value: Result<RT, string>): void;
  set_ok(value: RT): void;
  set_err(err: string): void;
  get state(): State<RT, WT, REL>;
  get read_only(): StateREA<RT, REL, WT>;
  get read_write(): StateREAWA<RT, WT, REL>;
}

export type StateDelayedREAWA<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = StateREAWA<RT, WT, REL> & OwnerWA<RT, WT, REL>;

class REAWA<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends StateBase<RT, WT, REL, Result<RT, string>>
  implements OwnerWA<RT, WT, REL>
{
  constructor(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: StateSetREXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
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
            } catch (e) {
              this.#value = err(String(e));
            }
            this.ful_R_prom(this.#value);
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

  #value?: Result<RT, string>;
  #setter: StateSetREXWA<RT, OwnerWA<RT, WT, REL>, WT>;
  #helper?: Helper<WT, REL>;

  //#Owner Context
  set(value: Result<RT, string>) {
    this.update_subs((this.#value = value));
  }
  set_ok(value: RT): void {
    this.set(ok(value));
  }
  set_err(error: string): void {
    this.set(err(error));
  }
  get state(): State<RT, WT, REL> {
    return this as State<RT, WT, REL>;
  }
  get read_only(): StateREA<RT, REL, WT> {
    return this as StateREA<RT, REL, WT>;
  }
  get read_write(): StateREAWA<RT, WT, REL> {
    return this as StateREAWA<RT, WT, REL>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  //Becomes sync compatible once evaluated
  get rsync(): boolean {
    return Boolean(this.#value);
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  async then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
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

const rea_wa = {
  /**Creates a writable delayed state from an initial value, delayed meaning the value is a promise evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<RT>,
    setter: StateSetREXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REAWA<RT, WT, REL>(
      init ? async () => ok(await init()) : undefined,
      setter,
      helper
    ) as StateDelayedREAWA<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial error, delayed meaning the value is a promise evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<string>,
    setter: StateSetREXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REAWA<RT, WT, REL>(
      init ? async () => err(await init()) : undefined,
      setter,
      helper
    ) as StateDelayedREAWA<RT, WT, REL>;
  },
  /**Creates a writable delayed state from an initial result, delayed meaning the value is a promise evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init?: () => PromiseLike<Result<RT, string>>,
    setter: StateSetREXWA<RT, OwnerWA<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new REAWA<RT, WT, REL>(init, setter, helper) as StateDelayedREAWA<
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
export const STATE_DELAYED_REA = {
  /**Read only delayed states with error, delayed meaning the value is a promise evaluated on first access. */
  rea,
  /**Read write delayed states with error and sync write, delayed meaning the value is a promise evaluated on first access. */
  rea_ws,
  /**Read write delayed state with error and async write, delayed meaning the value is a promise evaluated on first access. */
  rea_wa,
};
