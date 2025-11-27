import { Err, None, Ok, type Option, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_HELPER as Helper,
  type STATE_RELATED as Related,
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
interface OWNER<RT, WT, REL extends RELATED> {
  set(value: Result<RT, string>): void;
  setOk(value: RT): void;
  setErr(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_RES<RT, REL, WT>;
}

export type STATE_LAZY_RES<RT, REL extends RELATED = {}, WT = any> = STATE_RES<
  RT,
  REL,
  WT
> &
  OWNER<RT, WT, REL>;

class RES<RT, REL extends Related = {}, WT = any>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements OWNER<RT, WT, REL>
{
  constructor(init: () => Result<RT, string>, helper?: Helper<WT, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "writeSync"] as const).forEach((k) => delete this[k]);
  }

  #value?: Result<RT, string>;
  setter?: STATE_SET_REX_WS<RT, OWNER<RT, WT, REL>, WT>;
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
  get readOnly(): STATE_RES<RT, REL, WT> {
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
  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //#Writer Context
  get writable(): boolean {
    return this.setter !== undefined;
  }
  get wsync(): boolean {
    return this.writable;
  }
  async write(value: WT): Promise<Result<void, string>> {
    return this.writeSync(value);
  }
  writeSync(value: WT): Result<void, string> {
    if (this.setter) return this.setter(value, this, this.#value);
    return Err("State not writable");
  }
  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }
}
const res = {
  /**Creates a lazy state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Related = {}, WT = any>(
    init: () => RT,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(() => Ok(init()), helper) as STATE_LAZY_RES<
      RT,
      REL,
      WT
    >;
  },
  /**Creates a lazy state from an initial error, lazy meaning the value is only evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Related = {}, WT = any>(
    init: () => string,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(() => Err(init()), helper) as STATE_LAZY_RES<
      RT,
      REL,
      WT
    >;
  },
  /**Creates a lazy state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Related = {}, WT = any>(
    init: () => Result<RT, string>,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(init, helper) as STATE_LAZY_RES<RT, REL, WT>;
  },
};

//##################################################################################################################################################
//      _____  ______  _____  __          _______
//     |  __ \|  ____|/ ____| \ \        / / ____|
//     | |__) | |__  | (___    \ \  /\  / / (___
//     |  _  /|  __|  \___ \    \ \/  \/ / \___ \
//     | | \ \| |____ ____) |    \  /\  /  ____) |
//     |_|  \_\______|_____/      \/  \/  |_____/

interface OWNER_WS<RT, WT, REL extends RELATED> {
  set(value: Result<RT, string>): void;
  setOk(value: RT): void;
  setErr(err: string): void;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_RES<RT, REL, WT>;
  get readWrite(): STATE_RES_WS<RT, WT, REL>;
}

export type STATE_LAZY_RES_WS<
  RT,
  WT = RT,
  REL extends RELATED = {}
> = STATE_RES_WS<RT, WT, REL> & OWNER_WS<RT, WT, REL>;

class RES_WS<RT, WT, REL extends Related>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements OWNER_WS<RT, WT, REL>
{
  constructor(
    init: () => Result<RT, string>,
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
    this.get = () => this.#clean() ?? (this.#value = init());
    this.set = (value) => this.set(this.#clean() ?? value);
    let writeSync = this.writeSync.bind(this);
    this.writeSync = (value) =>
      writeSync(value).map((val) => this.#clean() ?? val);
  }

  #clean(): void {
    (["get", "set", "writeSync"] as const).forEach((k) => delete this[k]);
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
    return this;
  }
  get readOnly(): STATE_RES<RT, REL, WT> {
    return this;
  }
  get readWrite(): STATE_RES_WS<RT, WT, REL> {
    return this;
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
const res_ws = {
  /**Creates a writable lazy state from an initial value, lazy meaning the value is only evaluated on first access.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Related = {}>(
    init: () => RT,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RES_WS<RT, WT, REL>(() => Ok(init()), setter, helper);
  },
  /**Creates a writable lazy state from an initial error, lazy meaning the value is only evaluated on first access.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Related = {}>(
    init: () => string,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RES_WS<RT, WT, REL>(() => Err(init()), setter, helper);
  },
  /**Creates a writable lazy state from an initial result, lazy meaning the value is only evaluated on first access.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Related = {}>(
    init: () => Result<RT, string>,
    setter: STATE_SET_REX_WS<RT, OWNER_WS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RES_WS<RT, WT, REL>(init, setter, helper);
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
export const state_lazy_res = {
  /**Sync Read lazy states with error, lazy meaning the value is only evaluated on first access. */
  res,
  /**Sync Read And Sync Write lazy states with error, lazy meaning the value is only evaluated on first access. */
  res_ws,
};
