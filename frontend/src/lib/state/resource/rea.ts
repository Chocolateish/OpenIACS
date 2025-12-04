import { sleep } from "@libCommon";
import {
  Err,
  None,
  Ok,
  OptionNone,
  type Option,
  type Result,
} from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_HELPER,
  type STATE_REA,
  type STATE_REA_WA,
} from "../types";

//##################################################################################################################################################
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\
/**State Resource
 * state for representing a remote resource
 *
 * Debounce and Timout
 * example if the debounce is set to 50 and timeout to 200
 * singleGet will not be called until 50 ms after the first await of the state
 * when singleGet returns a Result, it is returned to all awaiters then buffered for the period of the timeout
 * any awaiters within the timeout will get the buffer, after that it starts over
 *
 * Debounce and Retention
 * When a subscriber is added the debounce delay is added before setupConnection is called
 * likevise when the last subscriber unsubscribes the retention delay is added before teardownConnection is called
 * this can prevent unneeded calls if the user is switching around quickly between things referencing states
 * @template RT - The type of the state’s value when read.
 * @template REL - The type of related states, defaults to an empty object.*/
export interface STATE_RESOURCE_REA_OWNER<RT, WT, REL extends Option<RELATED>> {
  update_resource(value: Result<RT, string>): void;
  get buffer(): Result<RT, string> | undefined;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_REA<RT, REL, WT>;
}

export abstract class STATE_RESOURCE_REA<
    RT,
    REL extends Option<RELATED> = OptionNone,
    WT = any
  >
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements STATE_RESOURCE_REA_OWNER<RT, WT, REL>
{
  #valid: number | true = 0;
  #fetching: boolean = false;
  #buffer?: Result<RT, string>;
  #retention_timout: number = 0;
  #debounce_timout: number = 0;
  #timeout_timout: number = 0;

  /**Timeout before giving generic error, if update_resource is not called*/
  abstract get timeout(): number;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get validity(): number | true;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  protected on_subscribe(): void {
    if (this.#retention_timout) {
      clearTimeout(this.#retention_timout);
      this.#retention_timout = 0;
    } else {
      if (this.debounce > 0)
        this.#debounce_timout = setTimeout(() => {
          this.setup_connection(this);
          this.#debounce_timout = 0;
        }, this.debounce) as any;
      else this.setup_connection(this);
    }
  }

  protected on_unsubscribe(): void {
    if (this.#debounce_timout) {
      clearTimeout(this.#debounce_timout);
      this.#debounce_timout = 0;
    } else {
      if (this.retention > 0) {
        this.#retention_timout = setTimeout(() => {
          this.teardown_connection(this);
          this.#retention_timout = 0;
        }, this.retention) as any;
      } else {
        this.teardown_connection(this);
      }
    }
    if (this.validity === true) this.#valid = 0;
  }

  /**Called if the state is awaited, returns the value once*/
  protected abstract single_get(
    state: STATE_RESOURCE_REA_OWNER<RT, WT, REL>
  ): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setup_connection(
    state: STATE_RESOURCE_REA_OWNER<RT, WT, REL>
  ): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardown_connection(
    state: STATE_RESOURCE_REA_OWNER<RT, WT, REL>
  ): void;

  update_resource(value: Result<RT, string>) {
    this.#valid = this.validity === true ? true : Date.now() + this.validity;
    this.ful_R_prom(value);
    this.#fetching = false;
    clearTimeout(this.#timeout_timout);
    if (value.ok && this.#buffer?.ok && value.value !== this.#buffer.value)
      this.update_subs(value);
    this.#buffer = value;
  }

  get buffer(): Result<RT, string> | undefined {
    return this.#buffer;
  }

  get state(): STATE<RT, WT, any> {
    return this as STATE<RT, WT, any>;
  }
  get read_only(): STATE_REA<RT, any, WT> {
    return this as STATE_REA<RT, any, WT>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): false {
    return false;
  }
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#valid === true || this.#valid >= Date.now())
      return func(this.#buffer!);
    else if (!this.#fetching) {
      this.#fetching = true;
      this.#timeout_timout = setTimeout(
        () => (this.#fetching = false),
        this.timeout
      );
      if (this.debounce > 0)
        setTimeout(() => this.single_get(this), this.debounce);
      else this.single_get(this);
    }
    return this.append_R_prom(func);
  }

  //#Writer Context
  get writable(): boolean {
    return false;
  }
  get wsync(): boolean {
    return false;
  }
}

//##################################################################################################################################################
interface OWNER<RT, WT, REL extends Option<RELATED>>
  extends STATE_RESOURCE_REA_OWNER<RT, WT, REL> {}
export type STATE_RESOURCE_FUNC_REA<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = STATE_REA<RT, REL, WT> & OWNER<RT, WT, REL>;

/**Alternative state resource which can be initialized with functions
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
export class FUNC_REA<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> extends STATE_RESOURCE_REA<RT, REL, WT> {
  constructor(
    once: (state: OWNER<RT, WT, REL>) => void,
    setup: (state: OWNER<RT, WT, REL>) => void,
    teardown: (state: OWNER<RT, WT, REL>) => void,
    timeout: number,
    debounce: number,
    validity: number | true,
    retention: number,
    helper?: STATE_HELPER<WT, REL>
  ) {
    super();
    this.single_get = once;
    this.setup_connection = setup;
    this.teardown_connection = teardown;
    this.timeout = timeout;
    this.debounce = debounce;
    this.validity = validity;
    this.retention = retention;
    if (helper) this.#helper = helper;
  }

  readonly timeout: number;
  readonly debounce: number;
  readonly validity: number | true;
  readonly retention: number;
  #helper?: STATE_HELPER<WT, REL>;

  /**Called if the state is awaited, returns the value once*/
  protected single_get(_state: OWNER<RT, WT, REL>): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setup_connection(_state: OWNER<RT, WT, REL>): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardown_connection(_state: OWNER<RT, WT, REL>): void {}

  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
  }
}

const rea = {
  /**Alternative state resource which can be initialized with functions
   * @template READ - The type of the state’s value when read.
   * @template REL - The type of related states, defaults to an empty object.
   * @param once function called when state value is requested once
   * @param setup function called when state has been subscribed to
   * @param teardown function called when state has been unsubscribed from completely
   * @param debounce delay added to once value retrival, which will collect multiple once requests into a single one
   * @param validity how long the last retrived value is considered valid
   * @param retention delay after last subscriber unsubscribes before teardown is called, to allow quick resubscribe without teardown
   * */
  from<RT, REL extends Option<RELATED> = OptionNone, WT = any>(
    once: (state: OWNER<RT, WT, REL>) => void,
    setup: (state: OWNER<RT, WT, REL>) => void,
    teardown: (state: OWNER<RT, WT, REL>) => void,
    times?: {
      timeout?: number;
      debounce?: number;
      validity?: number | true;
      retention?: number;
    },
    helper?: STATE_HELPER<WT, REL>
  ) {
    return new FUNC_REA<RT, REL, WT>(
      once,
      setup,
      teardown,
      times?.timeout ?? 1000,
      times?.debounce ?? 0,
      times?.validity ?? 0,
      times?.retention ?? 0,
      helper
    ) as STATE_RESOURCE_FUNC_REA<RT, REL, WT>;
  },
  class: STATE_RESOURCE_REA,
};

//##################################################################################################################################################
//      _____  ______           __          __
//     |  __ \|  ____|   /\     \ \        / /\
//     | |__) | |__     /  \     \ \  /\  / /  \
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \
//     | | \ \| |____ / ____ \     \  /\  / ____ \
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\

/**State Resource
 * state for representing a remote resource
 *
 * Debounce and Timout
 * example if the debounce is set to 50 and timeout to 200
 * singleGet will not be called until 50 ms after the first await of the state
 * when singleGet returns a Result, it is returned to all awaiters then buffered for the period of the timeout
 * any awaiters within the timeout will get the buffer, after that it starts over
 *
 * Debounce and Retention
 * When a subscriber is added the debounce delay is added before setupConnection is called
 * likevise when the last subscriber unsubscribes the retention delay is added before teardownConnection is called
 * this can prevent unneeded calls if the user is switching around quickly between things referencing states
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
export interface STATE_RESOURCE_REA_OWNER_WA<
  RT,
  WT,
  REL extends Option<RELATED>
> {
  update_resource(value: Result<RT, string>): void;
  get buffer(): Result<RT, string> | undefined;
  get state(): STATE<RT, WT, REL>;
  get read_only(): STATE_REA<RT, REL, WT>;
  get read_write(): STATE_REA_WA<RT, WT, REL>;
}

export abstract class STATE_RESOURCE_REA_WA<
    RT,
    WT = RT,
    REL extends Option<RELATED> = OptionNone
  >
  extends STATE_BASE<RT, WT, REL, Result<RT, string>>
  implements STATE_RESOURCE_REA_OWNER_WA<RT, WT, REL>
{
  #valid: number | true = 0;
  #fetching: boolean = false;
  #buffer?: Result<RT, string>;
  #retention_timout: number = 0;
  #debounce_timout: number = 0;
  #timeout_timout: number = 0;
  #write_buffer?: WT;
  #write_debounce_timout: number = 0;
  #write_promises: ((val: Result<void, string>) => void)[] = [];

  /**Timeout before giving generic error, if update_resource is not called*/
  abstract get timeout(): number;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get validity(): number | true;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  /**How long to debounce write calls, before the last write call is used*/
  abstract get write_debounce(): number;

  protected on_subscribe() {
    if (this.#retention_timout) {
      clearTimeout(this.#retention_timout);
      this.#retention_timout = 0;
    } else {
      if (this.debounce > 0)
        this.#debounce_timout = setTimeout(() => {
          this.setup_connection(this);
          this.#debounce_timout = 0;
        }, this.debounce) as any;
      else this.setup_connection(this);
    }
  }

  protected on_unsubscribe() {
    if (this.#debounce_timout) {
      clearTimeout(this.#debounce_timout);
      this.#debounce_timout = 0;
    } else {
      if (this.retention > 0) {
        this.#retention_timout = setTimeout(() => {
          this.teardown_connection(this);
          this.#retention_timout = 0;
        }, this.retention) as any;
      } else {
        this.teardown_connection(this);
      }
    }
    if (this.validity === true) this.#valid = 0;
  }

  /**Called if the state is awaited, returns the value once*/
  protected abstract single_get(
    state: STATE_RESOURCE_REA_OWNER_WA<RT, WT, REL>
  ): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setup_connection(
    state: STATE_RESOURCE_REA_OWNER_WA<RT, WT, REL>
  ): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardown_connection(
    state: STATE_RESOURCE_REA_OWNER_WA<RT, WT, REL>
  ): void;

  /**Called after write debounce finished with the last written value*/
  protected abstract write_action(
    value: WT,
    state: STATE_RESOURCE_REA_OWNER_WA<RT, WT, REL>
  ): Promise<Result<void, string>>;

  update_resource(value: Result<RT, string>) {
    this.#valid = this.validity === true ? true : Date.now() + this.validity;
    this.ful_R_prom(value);
    this.#fetching = false;
    clearTimeout(this.#timeout_timout);
    if (value.ok && this.#buffer?.ok && value.value !== this.#buffer.value)
      this.update_subs(value);
    this.#buffer = value;
  }
  get buffer(): Result<RT, string> | undefined {
    return this.#buffer;
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get read_only(): STATE_REA<RT, REL, WT> {
    return this as STATE_REA<RT, REL, WT>;
  }
  get read_write(): STATE_REA_WA<RT, WT, REL> {
    return this as STATE_REA_WA<RT, WT, REL>;
  }

  //Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): false {
    return false;
  }
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#valid === true || this.#valid >= Date.now())
      return func(this.#buffer!);
    else if (!this.#fetching) {
      this.#fetching = true;
      (async () => {
        if (this.debounce > 0) await sleep(this.debounce);
        this.single_get(this);
        this.#timeout_timout = setTimeout(
          () => (this.#fetching = false),
          this.timeout
        );
      })();
    }
    return this.append_R_prom(func);
  }

  //Writer Context
  get writable(): true {
    return true;
  }
  get wsync(): false {
    return false;
  }
  async write(value: WT): Promise<Result<void, string>> {
    this.#write_buffer = value;
    if (this.write_debounce === 0) return this.write_action(value, this);
    else if (this.#write_debounce_timout === 0)
      this.#write_debounce_timout = window.setTimeout(async () => {
        this.#write_debounce_timout = 0;
        let write_buffer = this.#write_buffer;
        this.#write_buffer = undefined;
        let promises = this.#write_promises;
        this.#write_promises = [];
        let res = await this.write_action(write_buffer!, this);
        for (let i = 0; i < promises.length; i++) promises[i](res);
      }, this.write_debounce);
    return new Promise<Result<void, string>>((a) => {
      this.#write_promises.push(a);
    });
  }

  abstract limit(value: WT): Result<WT, string>;

  abstract check(value: WT): Result<WT, string>;
}

//##################################################################################################################################################
interface OWNER_WA<RT, WT, REL extends Option<RELATED>>
  extends STATE_RESOURCE_REA_OWNER_WA<RT, WT, REL> {}
export type STATE_RESOURCE_FUNC_REA_WA<
  RT,
  REL extends Option<RELATED> = OptionNone,
  WT = any
> = STATE_REA_WA<RT, WT, REL> & OWNER_WA<RT, WT, REL>;
/**Alternative state resource which can be initialized with functions
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
class FUNC_REA_WA<RT, WT = RT, REL extends Option<RELATED> = OptionNone>
  extends STATE_RESOURCE_REA_WA<RT, WT, REL>
  implements OWNER_WA<RT, WT, REL>
{
  constructor(
    once: (state: OWNER_WA<RT, WT, REL>) => void,
    setup: (state: OWNER_WA<RT, WT, REL>) => void,
    teardown: (state: OWNER_WA<RT, WT, REL>) => void,
    timeout: number,
    debounce: number,
    validity: number | true,
    retention: number,
    write_debounce?: number,
    write_action?: (
      value: WT,
      state: OWNER_WA<RT, WT, REL>
    ) => Promise<Result<void, string>>,
    helper?: STATE_HELPER<WT, REL>
  ) {
    super();
    this.single_get = once;
    this.setup_connection = setup;
    this.teardown_connection = teardown;
    if (write_action) this.write_action = write_action;
    this.timeout = timeout;
    this.debounce = debounce;
    this.validity = validity;
    this.retention = retention;
    this.write_debounce = write_debounce || 0;
    if (helper) this.#helper = helper;
  }

  readonly timeout: number;
  readonly debounce: number;
  readonly validity: number | true;
  readonly retention: number;
  readonly write_debounce: number;
  #helper?: STATE_HELPER<WT, REL>;

  /**Called if the state is awaited, returns the value once*/
  protected single_get(_state: OWNER_WA<RT, WT, REL>): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setup_connection(_state: OWNER_WA<RT, WT, REL>): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardown_connection(_state: OWNER_WA<RT, WT, REL>): void {}

  /**Called after write debounce finished with the last written value*/
  protected async write_action(
    _value: WT,
    _state: OWNER_WA<RT, WT, REL>
  ): Promise<Result<void, string>> {
    return Err("State not writable");
  }

  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }

  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }

  related(): REL {
    return this.#helper?.related ? this.#helper.related() : (None() as REL);
  }
}

const rea_wa = {
  /**Alternative state resource which can be initialized with functions
   * @template READ - The type of the state’s value when read.
   * @template WT - The type which can be written to the state.
   * @template REL - The type of related states, defaults to an empty object.
   * @param once function called when state value is requested once, returns a Err(string) on failure
   * @param setup function called when state has been subscribed to
   * @param teardown function called when state has been unsubscribed from completely
   * @param write_action function called after write debounce finished with the last written value
   * @param debounce delay added to once value retrival, which will collect multiple once requests into a single one
   * @param validity how long the last retrived value is considered valid
   * @param retention delay after last subscriber unsubscribes before teardown is called, to allow quick resubscribe without teardown
   * @param write_debounce debounce delay for write calls, only the last write within the delay is used
   * */
  from<RT, REL extends Option<RELATED> = OptionNone, WT = RT>(
    once: (state: OWNER_WA<RT, WT, REL>) => void,
    setup: (state: OWNER_WA<RT, WT, REL>) => void,
    teardown: () => void,
    write_action?: (
      value: WT,
      state: OWNER_WA<RT, WT, REL>
    ) => Promise<Result<void, string>>,
    times?: {
      timeout?: number;
      debounce?: number;
      validity?: number | true;
      retention?: number;
      write_debounce?: number;
    },
    helper?: STATE_HELPER<WT, REL>
  ) {
    return new FUNC_REA_WA<RT, WT, REL>(
      once,
      setup,
      teardown,
      times?.timeout ?? 1000,
      times?.debounce ?? 0,
      times?.validity ?? 0,
      times?.retention ?? 0,
      times?.write_debounce ?? 0,
      write_action,
      helper
    ) as STATE_RESOURCE_FUNC_REA_WA<RT, REL, WT>;
  },
  class: STATE_RESOURCE_REA_WA,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**State that represent a remote resource*/
export const state_resource_rea = {
  /**Remote resource */
  rea,
  /**Remote resource with write cabability */
  rea_wa,
};
