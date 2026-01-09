import {
  err,
  none,
  ok,
  OptionNone,
  type Option,
  type Result,
} from "@libResult";
import { StateBase } from "../base";
import {
  type StateHelper as Helper,
  type StateRelated as RELATED,
  type State,
  type StateRES,
  type StateRESWS,
  type StateSetREXWS,
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
  get state(): State<RT, WT, REL>;
  get read_only(): StateRES<RT, REL, WT>;
}
export type StateSyncRES<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = StateRES<RT, REL, WT> & Owner<RT, WT, REL>;

class RES<RT, REL extends Option<RELATED>, WT>
  extends StateBase<RT, WT, REL, Result<RT, string>>
  implements Owner<RT, WT, REL>
{
  constructor(init: Result<RT, string>, helper?: Helper<WT, REL>) {
    super();
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value: Result<RT, string>;
  setter?: StateSetREXWS<RT, Owner<RT, WT, REL>, WT>;
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
  get read_only(): StateRES<RT, REL, WT> {
    return this as StateRES<RT, REL, WT>;
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
    return func(this.#value);
  }
  get(): Result<RT, string> {
    return this.#value;
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

  get is_array(): boolean {
    return false;
  }
  get is_object(): boolean {
    return false;
  }
}
const res = {
  /**Creates a sync state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    this: void,
    init: RT,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(ok(init), helper) as StateSyncRES<RT, REL, WT>;
  },
  /**Creates a sync state from an initial error.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    this: void,
    init: string,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(err(init), helper) as StateSyncRES<RT, REL, WT>;
  },
  /**Creates a sync state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    init: Result<RT, string>,
    helper?: Helper<WT, REL>
  ) {
    return new RES<RT, REL, WT>(init, helper) as StateSyncRES<RT, REL, WT>;
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
  get state(): State<RT, WT, REL>;
  get read_only(): StateRES<RT, REL, WT>;
  get read_write(): StateRESWS<RT, WT, REL>;
}

export type StateSyncRESWS<
  RT,
  WT = RT,
  REL extends Option<RELATED> = OptionNone
> = StateRESWS<RT, WT, REL> & OwnerWS<RT, WT, REL>;

class RESWS<RT, WT, REL extends Option<RELATED>>
  extends StateBase<RT, WT, REL, Result<RT, string>>
  implements OwnerWS<RT, WT, REL>
{
  constructor(
    init: Result<RT, string>,
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
    this.#value = init;
  }

  #value: Result<RT, string>;
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
  get read_only(): StateRES<RT, REL, WT> {
    return this as StateRES<RT, REL, WT>;
  }
  get read_write(): StateRESWS<RT, WT, REL> {
    return this as StateRESWS<RT, WT, REL>;
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
    return func(this.#value);
  }
  get(): Result<RT, string> {
    return this.#value;
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

  get is_array(): boolean {
    return false;
  }
  get is_object(): boolean {
    return false;
  }
}
const res_ws = {
  /**Creates a writable sync state from an initial value.
   * @param init initial value for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  ok<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    this: void,
    init: RT,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RESWS<RT, WT, REL>(ok(init), setter, helper) as StateSyncRESWS<
      RT,
      WT,
      REL
    >;
  },
  /**Creates a writable sync state from an initial error.
   * @param init initial error for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  err<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    this: void,
    init: string,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RESWS<RT, WT, REL>(err(init), setter, helper) as StateSyncRESWS<
      RT,
      WT,
      REL
    >;
  },
  /**Creates a writable sync state from an initial result.
   * @param init initial result for state.
   * @param helper functions to check and limit the value, and to return related states.*/
  result<RT, WT = RT, REL extends Option<RELATED> = OptionNone>(
    init: Result<RT, string>,
    setter: StateSetREXWS<RT, OwnerWS<RT, WT, REL>, WT> | true = true,
    helper?: Helper<WT, REL>
  ) {
    return new RESWS<RT, WT, REL>(init, setter, helper) as StateSyncRESWS<
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
/**Sync valueholding states */
export const STATE_SYNC_RES = {
  /**Sync read only states with error */
  res,
  /**Sync read and sync write with error */
  res_ws,
};
