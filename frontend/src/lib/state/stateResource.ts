import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import { StateBase } from "./stateBase";
import type {
  StateHelper,
  StateRead,
  StateReadError,
  StateReadOk,
  StateRelated,
  StateWrite,
  StateWriteBase,
  StateWriteError,
  StateWriteOk,
} from "./types";

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
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export abstract class StateResourceBase<
    READ extends Result<any, StateReadError>,
    RELATED extends StateRelated = {},
    WRITE = READ extends Result<infer T, StateReadError> ? T : never
  >
  extends StateBase<READ, false, RELATED>
  implements StateWriteBase<READ, false, RELATED, WRITE, false>
{
  #valid: number = 0;
  #fetching: boolean = false;
  #buffer?: READ;
  #retentionTimout: number = 0;
  #debounceTimout: number = 0;
  #writeBuffer?: WRITE;
  #writeDebounceTimout: number = 0;
  #writePromise?: (val: Result<void, StateWriteError>) => void;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get timeout(): number;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  /**How long to debounce write calls, before the last write call is used*/
  abstract get writebounce(): number;

  /**Called when subscriber is added*/
  protected subOnSubscribe(_first: boolean) {
    if (_first) {
      if (!this.inUse()) {
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
    }
  }

  /**Called when subscriber is removed*/
  protected subOnUnsubscribe(_last: boolean) {
    if (_last) {
      if (this.#debounceTimout) {
        clearTimeout(this.#debounceTimout);
        this.#debounceTimout = 0;
      } else {
        if (this.retention > 0) {
          this.#retentionTimout = setTimeout(() => {
            this.teardownConnection();
            this.#retentionTimout = 0;
          }, this.retention) as any;
        } else {
          this.teardownConnection();
        }
      }
    }
  }

  /**Called if the state is awaited, returns the value once*/
  protected abstract singleGet(state: this): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setupConnection(state: this): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardownConnection(): void;

  /**Called after write debounce finished with the last written value*/
  protected abstract writeAction(
    value: WRITE,
    state: this
  ): Promise<Result<void, StateWriteError>>;

  updateResource(value: READ) {
    this.#buffer = value;
    this.#valid = Date.now() + this.timeout;
    this.fulfillReadPromises(value);
    this.#fetching = false;
    this.updateSubscribers(value);
  }

  //Reader Context
  async then<TResult1 = READ>(
    func: (value: READ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#valid >= Date.now()) {
      return func(this.#buffer!);
    } else if (this.#fetching) return this.appendReadPromise(func);
    else {
      this.#fetching = true;
      if (this.debounce > 0)
        await new Promise((a) => {
          setTimeout(a, this.debounce);
        });
      this.singleGet(this);
      return this.appendReadPromise(func);
    }
  }

  get(): unknown {
    return;
  }

  getOk(): unknown {
    return;
  }

  //Writer Context
  write(value: WRITE): Promise<Result<void, StateWriteError>> {
    this.#writeBuffer = value;
    if (this.writebounce === 0) return this.writeAction(value, this);
    else if (this.#writeDebounceTimout === 0)
      this.#writeDebounceTimout = window.setTimeout(async () => {
        let writeRes = this.writeAction(this.#writeBuffer!, this);
        this.#writeDebounceTimout = 0;
        this.#writeBuffer = undefined;
        this.fulfillWritePromises(await writeRes);
      }, this.writebounce);
    return this.appendWritePromise();
  }

  writeSync(_value: unknown): unknown {
    return undefined;
  }

  abstract check(_value: WRITE): Option<string>;

  abstract limit(value: WRITE): Result<WRITE, StateWriteError>;

  get writeable(): StateWriteBase<READ, false, RELATED, WRITE, false> {
    return this;
  }

  //Promises
  writePromise(): Promise<Result<void, StateWriteError>> {
    return new Promise<Result<void, StateWriteError>>((a) => {
      if (this.#writePromise)
        console.warn("Overwriting existing write promise");
      this.#writePromise = a;
    });
  }
  fulfillWrite(res: Result<void, StateWriteError>) {
    if (this.#writePromise) this.#writePromise(res);
    else console.warn("No write promise to fulfill");
    this.#writePromise = undefined;
  }
}

/**Alternative state resource which can be initialized with functions
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.*/
class StateResourceFunc<
  READ extends Result<any, StateReadError>,
  RELATED extends StateRelated = {},
  WRITE = READ extends Result<infer T, StateReadError> ? T : never
> extends StateResourceBase<READ, RELATED, WRITE> {
  constructor(
    once: (state: StateResourceFunc<READ, RELATED, WRITE>) => void,
    setup: (state: StateResourceFunc<READ, RELATED, WRITE>) => void,
    teardown: () => void,
    debounce: number,
    timeout: number,
    retention: number,
    writeBounce?: number,
    writeAction?: (
      value: WRITE,
      state: StateResourceFunc<READ, RELATED, WRITE>
    ) => Promise<Result<void, StateWriteError>>,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    this.singleGet = once;
    this.setupConnection = setup;
    this.teardownConnection = teardown;
    if (writeAction) this.writeAction = writeAction;
    this.debounce = debounce;
    this.timeout = timeout;
    this.retention = retention;
    this.writebounce = writeBounce || 0;
    if (helper) this.#helper = helper;
  }

  readonly debounce: number;
  readonly timeout: number;
  readonly retention: number;
  readonly writebounce: number;
  #helper?: StateHelper<WRITE, RELATED>;

  /**Called if the state is awaited, returns the value once*/
  protected singleGet(_state: this): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setupConnection(_state: this): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardownConnection(): void {}

  /**Called after write debounce finished with the last written value*/
  protected async writeAction(
    _value: WRITE,
    _state: this
  ): Promise<Result<void, StateWriteError>> {
    return Err({ code: "LRO", reason: "State not writable" });
  }

  limit(value: WRITE): Result<WRITE, StateWriteError> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }
}

export interface StateResource<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
> extends StateResourceFunc<Result<TYPE, StateReadError>, RELATED, WRITE> {
  readonly readable: StateRead<TYPE, false, RELATED>;
  readonly writeable: StateWrite<TYPE, false, RELATED, WRITE>;
  updateResource(value: Result<TYPE, StateReadError>): void;
}
export interface StateResourceOk<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
> extends StateResourceFunc<Result<TYPE, StateReadError>, RELATED, WRITE> {
  readonly readable: StateReadOk<TYPE, false, RELATED>;
  readonly writeable: StateWriteOk<TYPE, false, RELATED, WRITE>;
  updateResource(value: ResultOk<TYPE>): void;
}

/**Alternative state resource which can be initialized with functions
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.
 * @param once function called when state value is requested once, returns a Err(StateError) on failure
 * @param setup function called when state has been subscribed to
 * @param teardown function called when state has been unsubscribed from completely
 * @param debounce delay added to once value retrival, which will collect multiple once requests into a single one
 * @param timeout how long the last retrived value is considered valid
 * @param retention delay after last subscriber unsubscribes before teardown is called, to allow quick resubscribe without teardown
 * @param writeBounce debounce delay for write calls, only the last write within the delay is used
 * @param writeCheck function called every time write is called to check if value is valid
 * @param writeAction function called after write debounce finished with the last written value
 * */
export function state_resource<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
>(
  once: (
    state: StateResourceFunc<Result<TYPE, StateReadError>, RELATED, WRITE>
  ) => void,
  setup: (
    state: StateResourceFunc<Result<TYPE, StateReadError>, RELATED, WRITE>
  ) => void,
  teardown: () => void,
  debounce: number = 0,
  timeout: number = 0,
  retention: number = 0,
  writeBounce?: number,
  writeAction?: (
    value: WRITE,
    state: StateResourceFunc<Result<TYPE, StateReadError>, RELATED, WRITE>
  ) => Promise<Result<void, StateWriteError>>,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateResourceFunc<Result<TYPE, StateReadError>, RELATED, WRITE>(
    once,
    setup,
    teardown,
    debounce,
    timeout,
    retention,
    writeBounce,
    writeAction,
    helper
  ) as StateResource<TYPE, RELATED, WRITE>;
}

/**Alternative state resource which can be initialized with functions
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.
 * @param once function called when state value is requested once, returns a Err(StateError) on failure
 * @param setup function called when state has been subscribed to
 * @param teardown function called when state has been unsubscribed from completely
 * @param debounce delay added to once value retrival, which will collect multiple once requests into a single one
 * @param timeout how long the last retrived value is considered valid
 * @param retention delay after last subscriber unsubscribes before teardown is called, to allow quick resubscribe without teardown
 * @param writeBounce debounce delay for write calls, only the last write within the delay is used
 * @param writeCheck function called every time write is called to check if value is valid
 * @param writeAction function called after write debounce finished with the last written value
 * */
export function state_resource_ok<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
>(
  once: (state: StateResourceFunc<ResultOk<TYPE>, RELATED, WRITE>) => void,
  setup: (state: StateResourceFunc<ResultOk<TYPE>, RELATED, WRITE>) => void,
  teardown: () => void,
  debounce: number = 0,
  timeout: number = 0,
  retention: number = 0,
  writeBounce?: number,
  writeAction?: (
    value: WRITE,
    state: StateResourceFunc<ResultOk<TYPE>, RELATED, WRITE>
  ) => Promise<ResultOk<void>>,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateResourceFunc<ResultOk<TYPE>, RELATED, WRITE>(
    once,
    setup,
    teardown,
    debounce,
    timeout,
    retention,
    writeBounce,
    writeAction,
    helper
  ) as StateResourceOk<TYPE, RELATED, WRITE>;
}
