import { None, ResultOk, type Option } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE_RELATED as RELATED,
  type STATE,
  type STATE_HELPER,
  type STATE_ROA,
} from "../types";

//##################################################################################################################################################
//      _____   ____
//     |  __ \ / __ \   /\
//     | |__) | |  | | /  \
//     |  _  /| |  | |/ /\ \
//     | | \ \| |__| / ____ \
//     |_|  \_\\____/_/    \_\
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
export interface STATE_RESOURCE_ROA_OWNER<RT, WT, REL extends RELATED> {
  updateResource(value: ResultOk<RT>): void;
  get buffer(): ResultOk<RT> | undefined;
  get state(): STATE<RT, WT, REL>;
  get readOnly(): STATE_ROA<RT, REL, WT>;
}
export abstract class STATE_RESOURCE_ROA<RT, REL extends RELATED = {}, WT = any>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>>
  implements STATE_RESOURCE_ROA_OWNER<RT, WT, REL>
{
  #valid: number = 0;
  #fetching: boolean = false;
  #buffer?: ResultOk<RT>;
  #retentionTimout: number = 0;
  #debounceTimout: number = 0;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get timeout(): number;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  protected on_subscribe(first: boolean): void {
    if (!first || this.in_use()) return;
    if (this.#retentionTimout) {
      clearTimeout(this.#retentionTimout);
      this.#retentionTimout = 0;
    } else {
      this.#fetching = true;
      if (this.debounce > 0)
        this.#debounceTimout = setTimeout(() => {
          this.setupConnection(this);
          this.#debounceTimout = 0;
        }, this.debounce) as any;
      else this.setupConnection(this);
    }
  }

  protected on_unsubscribe(last: boolean): void {
    if (!last) return;
    if (this.#debounceTimout) {
      clearTimeout(this.#debounceTimout);
      this.#debounceTimout = 0;
    } else {
      if (this.retention > 0) {
        this.#retentionTimout = setTimeout(() => {
          this.teardownConnection(this);
          this.#retentionTimout = 0;
        }, this.retention) as any;
      } else {
        this.teardownConnection(this);
      }
    }
  }

  /**Called if the state is awaited, returns the value once*/
  protected abstract singleGet(
    state: STATE_RESOURCE_ROA_OWNER<RT, WT, REL>
  ): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setupConnection(
    state: STATE_RESOURCE_ROA_OWNER<RT, WT, REL>
  ): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardownConnection(
    state: STATE_RESOURCE_ROA_OWNER<RT, WT, REL>
  ): void;

  updateResource(value: ResultOk<RT>) {
    this.#valid = Date.now() + this.timeout;
    this.ful_R_prom(value);
    this.#fetching = false;
    if (value.ok && this.#buffer?.ok && value.value !== this.#buffer.value)
      this.update_subs(value);
    this.#buffer = value;
  }
  get buffer(): ResultOk<RT> | undefined {
    return this.#buffer;
  }
  get state(): STATE<RT, WT, REL> {
    return this as STATE<RT, WT, REL>;
  }
  get readOnly(): STATE_ROA<RT, REL, WT> {
    return this as STATE_ROA<RT, REL, WT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): false {
    return false;
  }
  async then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#valid >= Date.now()) {
      return func(this.#buffer!);
    } else if (this.#fetching) return this.append_R_prom(func);
    else {
      this.#fetching = true;
      if (this.debounce > 0)
        await new Promise((a) => {
          setTimeout(a, this.debounce);
        });
      this.singleGet(this);
      return this.append_R_prom(func);
    }
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
interface OWNER<RT, WT, REL extends RELATED>
  extends STATE_RESOURCE_ROA_OWNER<RT, WT, REL> {}
export type STATE_RESOURCE_FUNC_ROA<
  RT,
  REL extends RELATED = {},
  WT = any
> = STATE_ROA<RT, REL, WT> & OWNER<RT, WT, REL>;

/**Alternative state resource which can be initialized with functions
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
class FUNC_ROA<RT, REL extends RELATED = {}, WT = any>
  extends STATE_RESOURCE_ROA<RT, REL, WT>
  implements OWNER<RT, WT, REL>
{
  constructor(
    once: (state: OWNER<RT, WT, REL>) => void,
    setup: (state: OWNER<RT, WT, REL>) => void,
    teardown: (state: OWNER<RT, WT, REL>) => void,
    debounce: number,
    timeout: number,
    retention: number,
    helper?: STATE_HELPER<WT, REL>
  ) {
    super();
    this.singleGet = once;
    this.setupConnection = setup;
    this.teardownConnection = teardown;
    this.debounce = debounce;
    this.timeout = timeout;
    this.retention = retention;
    if (helper) this.#helper = helper;
  }

  readonly debounce: number;
  readonly timeout: number;
  readonly retention: number;
  #helper?: STATE_HELPER<WT, REL>;

  /**Called if the state is awaited, returns the value once*/
  protected singleGet(_state: OWNER<RT, WT, REL>): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setupConnection(_state: OWNER<RT, WT, REL>): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardownConnection(_state: OWNER<RT, WT, REL>): void {}

  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
}

const roa = {
  /**Alternative state resource which can be initialized with functions
   * @template READ - The type of the state’s value when read.
   * @template REL - The type of related states, defaults to an empty object.
   * @param once function called when state value is requested once
   * @param setup function called when state has been subscribed to
   * @param teardown function called when state has been unsubscribed from completely
   * @param debounce delay added to once value retrival, which will collect multiple once requests into a single one
   * @param timeout how long the last retrived value is considered valid
   * @param retention delay after last subscriber unsubscribes before teardown is called, to allow quick resubscribe without teardown
   * */
  from<RT, REL extends RELATED = {}, WT = any>(
    once: (state: OWNER<RT, WT, REL>) => void,
    setup: (state: OWNER<RT, WT, REL>) => void,
    teardown: (state: OWNER<RT, WT, REL>) => void,
    debounce: number = 0,
    timeout: number = 0,
    retention: number = 0,
    helper?: STATE_HELPER<WT, REL>
  ) {
    return new FUNC_ROA<RT, REL, WT>(
      once,
      setup,
      teardown,
      debounce,
      timeout,
      retention,
      helper
    ) as STATE_RESOURCE_ROA<RT, REL, WT>;
  },
  class: STATE_RESOURCE_ROA,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**State that represent a remote resource*/
export const state_resource_roa = {
  /**Remote resource with guaranteed ok value */
  roa,
};
