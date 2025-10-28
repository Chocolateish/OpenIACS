import { Err, None, type Option, type Result, Some } from "@libResult";
import { StateBase } from "./stateBase";
import type { StateError, StateRelated, StateWriteBase } from "./types";

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
    READ extends Result<any, StateError>,
    RELATED extends StateRelated = {},
    WRITE = READ extends Result<infer T, StateError> ? T : never
  >
  extends StateBase<READ, false, RELATED>
  implements StateWriteBase<READ, false, RELATED, WRITE>
{
  /**Stores the last time when buffer was valid*/
  #valid: number = 0;
  /**Is high while once fetching value*/
  #fetching: boolean = false;
  /**Buffer of last value*/
  #buffer: READ | undefined;
  /**Promises for value*/
  #promises: ((value: READ) => void)[] = [];
  /**Timeout for retention delay*/
  #retentionTimout: number = 0;
  /**Timeout for debounce delay*/
  #debounceTimout: number = 0;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get timeout(): number;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  /**Called if the state is awaited, returns the value once*/
  protected abstract singleGet(): Promise<READ>;

  /**Called when subscriber is added*/
  protected subOnSubscribe(_first: boolean) {
    if (_first) {
      if (this.#subscribers.size === 0) {
        if (this.#retentionTimout) {
          clearTimeout(this.#retentionTimout);
          this.#retentionTimout = 0;
        } else {
          this.#fetching = true;
          if (this.debounce > 0)
            this.#debounceTimout = setTimeout(() => {
              this.setupConnection(this.updateResource.bind(this));
              this.#debounceTimout = 0;
            }, this.debounce) as any;
          else this.setupConnection(this.updateResource.bind(this));
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

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setupConnection(update: (value: READ) => void): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardownConnection(): void;

  protected updateResource(value: READ) {
    this.#buffer = value;
    this.#valid = Date.now() + this.timeout;
    for (let i = 0; i < this.#promises.length; i++)
      this.#promises[i](this.#buffer);
    this.#promises = [];
    this.#fetching = false;
    this.updateSubscribers(value);
  }

  //Reader Context
  async then<TResult1 = READ>(
    func: (value: READ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#valid >= Date.now()) {
      return func(this.#buffer!);
    } else if (this.#fetching)
      return func(
        await new Promise((a) => {
          this.#promises.push(a);
          console.log(this.#promises);
        })
      );
    else {
      this.#fetching = true;
      if (this.debounce > 0)
        await new Promise((a) => {
          setTimeout(a, this.debounce);
        });
      this.#buffer = await this.singleGet();
      this.#valid = Date.now() + this.timeout;
      for (let i = 0; i < this.#promises.length; i++)
        this.#promises[i](this.#buffer);
      this.#promises = [];
      this.#fetching = false;
      return func(this.#buffer);
    }
  }

  get(): unknown {
    return;
  }

  //Writer Context
  abstract write(value: WRITE): boolean;

  check(_value: WRITE): Option<string> {
    return None();
  }

  limit(value: WRITE): Option<WRITE> {
    return Some(value);
  }

  get writeable(): StateWriteBase<READ, false, RELATED, WRITE> {
    return this;
  }
}

/**Alternative state resource which can be initialized with functions
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.*/
class StateResourceFunc<
  READ extends Result<any, StateError>,
  RELATED extends StateRelated = {},
  WRITE = READ extends Result<infer T, StateError> ? T : never
> extends StateResourceBase<READ, RELATED, WRITE> {
  /**Creates a state which connects to an async source and keeps updated with any changes to the source
   * @param once function called when state value is requested once, the function should throw if it fails to get data
   * @param setup function called when state is being used to setup live update of value
   * @param teardown function called when state is no longer being used to teardown/cleanup communication
   * @param setter function called when state value is set via setter, set true let state set it's own value
   * @param checker function to allow state users to check if a given value is valid for the state
   * @param limiter function to allow state users to limit a given value to state limit */
  constructor(
    once: () => Promise<READ>,
    setup: (update: (value: READ) => void) => void,
    teardown: () => void,
    debounce: number,
    timeout: number,
    retention: number,
    setter?: (
      value: WRITE,
      state: StateResourceFunc<READ, RELATED, WRITE>
    ) => boolean,
    helper?: {
      limit?: (value: WRITE) => Option<WRITE>;
      check?: (value: WRITE) => Option<string>;
      related?: () => Option<any>;
    }
  ) {
    super();
    this.singleGet = once;
    this.setupConnection = setup;
    this.teardownConnection = teardown;
    this.#debounce = debounce;
    this.#timeout = timeout;
    this.#retention = retention;
    if (setter) this.#setter = setter;
    if (helper) this.#helper = helper;
  }

  #setter:
    | ((
        value: WRITE,
        state: StateResourceFunc<READ, RELATED, WRITE>
      ) => boolean)
    | undefined;
  #debounce: number;
  #timeout: number;
  #retention: number;
  #helper:
    | {
        limit?: (value: WRITE) => Option<WRITE>;
        check?: (value: WRITE) => Option<string>;
        related?: () => Option<any>;
      }
    | undefined;

  /**Debounce delaying one time value retrival*/
  get debounce(): number {
    return this.#debounce;
  }

  /**Timeout for validity of last buffered value*/
  get timeout(): number {
    return this.#timeout;
  }

  /**Retention delay before resource performs teardown of connection is performed*/
  get retention(): number {
    return this.#retention;
  }

  /**Called if the state is awaited, returns the value once*/
  protected async singleGet(): Promise<READ> {
    return Err({ reason: "", code: "INV" }) as any;
  }

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setupConnection(_update: (value: READ) => void): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardownConnection(): void {}

  write(value: WRITE): boolean {
    if (this.#setter) return this.#setter(value, this);
    return false;
  }

  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }

  limit(value: WRITE): Option<WRITE> {
    return this.#helper?.limit ? this.#helper.limit(value) : Some(value);
  }
}

/**Alternative state resource which can be initialized with functions
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export type StateResource<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
> = StateResourceFunc<Result<TYPE, StateError>, RELATED, WRITE>;

/**Alternative state resource which can be initialized with functions
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export function stateResource<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
>(
  once: () => Promise<Result<TYPE, StateError>>,
  setup: (update: (value: Result<TYPE, StateError>) => void) => void,
  teardown: () => void,
  debounce: number,
  timeout: number,
  retention: number,
  setter?: (
    value: WRITE,
    state: StateResourceFunc<Result<TYPE, StateError>, RELATED, WRITE>
  ) => boolean,
  helper?: {
    limit?: (value: WRITE) => Option<WRITE>;
    check?: (value: WRITE) => Option<string>;
    related?: () => Option<any>;
  }
) {
  return new StateResourceFunc<Result<TYPE, StateError>, RELATED, WRITE>(
    once,
    setup,
    teardown,
    debounce,
    timeout,
    retention,
    setter,
    helper
  ) as StateResource<TYPE, RELATED, WRITE>;
}
