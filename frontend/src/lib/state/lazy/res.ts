import {
  err,
  none,
  ok,
  OptionNone,
  type Option,
  type Result,
} from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_HELPER as Helper,
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_RES,
  type STATE_RES_WS,
  type STATE_SET_REX_WS,
} from "../types";

//##################################################################################################################################################
//      _____  ______  _____
//     |  __ \|  ____|/ ____|
//     | |__) | |__  | (___
//     |  _  /|  __|  \___ \
//     | | \ \| |____ ____) |
//     |_|  \_\______|_____/
interface Owner<RT, WT, REL extends Option<RELATED>> {
  set(value: Result<RT, string>): void;
  set_ok(value: RT): void;
  set_err(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_RES<RT, REL, WT>;
}

export type StateLazyRES<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = STATE_RES<RT, REL, WT> & Owner<RT, WT, REL>;

class RES<RT, REL extends Option<RELATED> = OptionNone, WT = any>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements Owner<RT, WT, REL>
{
  constructor(init: () => Result<RT, string>, helper?: Helper<WT, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    const write_sync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      write_sync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "write_sync"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  setter?: STATE_SET_REX_WS<RT, Owner<RT, WT, REL>, WT>;
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
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get read_only(): STATE_RES<RT, REL, WT> {
    return this as STATE_RES<RT, REL, WT>;
  }

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
    return func(this.get());
  }
  get(): Result<RT, string> {
    return this.#value!;
  }
  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (none() as REL);
  }

  //#Writer Context
  get writable(): boolean {
    return this.setter !== undefined;
  }
  get wsync(): boolean {
    return this.writable;
  }
  async write(value: WT): Promise<Result<void, string>> {
    return this.write_sync(value);
  }
  write_sync(value: WT): Result<void, string> {
    if (this.setter) return this.setter(value, this, this.#value);
    return err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : ok(value);
  }
}
const res = {
  /**Creates a lazy state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init: () => RT,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(() => ok(init()), helper) as StateLazyRES<
      RT,
      REL,
      WT
    >;
  },
  /**Creates a lazy state from an initial error, lazy meaning the value is only evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init: () => string,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(() => err(init()), helper) as StateLazyRES<
      RT,
      REL,
      WT
    >;
  },
  /**Creates a lazy state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init: () => Result<RT, string>,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(init, helper) as StateLazyRES<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____  ______  _____  __          _______
//     |  __ \|  ____|/ ____| \ \        / / ____|
//     | |__) | |__  | (___    \ \  /\  / / (___
//     |  _  /|  __|  \___ \    \ \/  \/ / \___ \
//     | | \ \| |____ ____) |    \  /\  /  ____) |
//     |_|  \_\______|_____/      \/  \/  |_____/

interface OwnerWS<RT, WT, REL extends Option<RELATED>> {
  set(value: Result<RT, string>): void;
  set_ok(value: RT): void;
  set_err(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_RES<RT, REL, WT>;
  get read_write(): STATE_RES_WS<RT, WT, REL>;
}

export type StateLazyRESWS<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = STATE_RES_WS<RT, WT, REL> & OwnerWS<RT, WT, REL>;

class RESWS<RT, WT, REL extends Option<RELATED>>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements OwnerWS<RT, WT, REL>
{
  constructor(
    init: () => Result<RT, string>,
    setter: STATE_SET_REX_WS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
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
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    const write_sync = this.write_sync.bind(this);
    this.write_sync = (value) =>
      write_sync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "write_sync"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  #setter: STATE_SET_REX_WS<RT, OwnerWS<RT, WT, REL>, WT>;
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
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get read_only(): STATE_RES<RT, REL, WT> {
    return this as STATE_RES<RT, REL, WT>;
  }
  get read_write(): STATE_RES_WS<RT, WT, REL> {
    return this as STATE_RES_WS<RT, WT, REL>;
  }

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
    return func(this.get());
  }
  get(): Result<RT, string> {
    return this.#value!;
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
const res_ws = {
  /**Creates a writable lazy state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init: () => RT,
    setter: STATE_SET_REX_WS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RESWS<RT, WT, REL>(
      () => ok(init()),
      setter,
      helper
    ) as StateLazyRESWS<RT, WT, REL>;
  },
  /**Creates a writable lazy state from an initial error, lazy meaning the value is only evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init: () => string,
    setter: STATE_SET_REX_WS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RESWS<RT, WT, REL>(
      () => err(init()),
      setter,
      helper
    ) as StateLazyRESWS<RT, WT, REL>;
  },
  /**Creates a writable lazy state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init: () => Result<RT, string>,
    setter: STATE_SET_REX_WS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RESWS<RT, WT, REL>(init, setter, helper) as StateLazyRESWS<
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
/**Lazy valueholding states, lazy means the given function is evaluated on first access */
export const STATE_LAZY_RES = {
  /**Sync Read lazy states with error, lazy meaning the value is only evaluated on first access. */
  res,
  /**Sync Read And Sync Write lazy states with error, lazy meaning the value is only evaluated on first access. */
  res_ws,
};
