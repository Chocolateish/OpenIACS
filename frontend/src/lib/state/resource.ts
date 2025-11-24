import { Err, None, Ok, ResultOk, type Option, type Result } from "@libResult";
import {
  STATE_REA_BASE,
  STATE_REA_WA,
  STATE_ROA_BASE,
  type STATE_RELATED as Related,
  type STATE_HELPER,
  type STATE_HELPER_WRITE,
} from "./types";

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
export abstract class STATE_RESOURCE_REA<
  RT,
  REL extends Related = {}
> extends STATE_REA_BASE<RT, REL> {
  #valid: number = 0;
  #fetching: boolean = false;
  #buffer?: Result<RT, string>;
  #retentionTimout: number = 0;
  #debounceTimout: number = 0;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get timeout(): number;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  protected onSubscribe(first: boolean): void {
    if (!first || this.inUse()) return;
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

  protected onUnsubscribe(last: boolean): void {
    if (!last) return;
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

  /**Called if the state is awaited, returns the value once*/
  protected abstract singleGet(state: this): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setupConnection(state: this): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardownConnection(): void;

  updateResource(value: Result<RT, string>) {
    this.#valid = Date.now() + this.timeout;
    this.fulRProm(value);
    this.#fetching = false;
    if (value.ok && this.#buffer?.ok && value.value !== this.#buffer.value)
      this.updateSubs(value);
    this.#buffer = value;
  }

  get buffer(): Result<RT, string> | undefined {
    return this.#buffer;
  }

  //Reader Context
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#valid >= Date.now()) {
      return func(this.#buffer!);
    } else if (this.#fetching) return this.appendRProm(func);
    else {
      this.#fetching = true;
      if (this.debounce > 0)
        await new Promise((a) => {
          setTimeout(a, this.debounce);
        });
      this.singleGet(this);
      return this.appendRProm(func);
    }
  }
}

//##################################################################################################################################################
//      _____   ____           __          _______
//     |  __ \ / __ \   /\     \ \        / / ____|
//     | |__) | |  | | /  \     \ \  /\  / / (___
//     |  _  /| |  | |/ /\ \     \ \/  \/ / \___ \
//     | | \ \| |__| / ____ \     \  /\  /  ____) |
//     |_|  \_\\____/_/    \_\     \/  \/  |_____/
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
export abstract class STATE_RESOURCE_ROA<
  RT,
  REL extends Related = {}
> extends STATE_ROA_BASE<RT, REL> {
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

  protected onSubscribe(first: boolean): void {
    if (!first || this.inUse()) return;
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

  protected onUnsubscribe(last: boolean): void {
    if (!last) return;
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

  /**Called if the state is awaited, returns the value once*/
  protected abstract singleGet(state: this): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setupConnection(state: this): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardownConnection(): void;

  updateResource(value: ResultOk<RT>) {
    this.#valid = Date.now() + this.timeout;
    this.fulRProm(value);
    this.#fetching = false;
    if (value.ok && this.#buffer?.ok && value.value !== this.#buffer.value)
      this.updateSubs(value);
    this.#buffer = value;
  }

  get buffer(): ResultOk<RT> | undefined {
    return this.#buffer;
  }

  //Reader Context
  async then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#valid >= Date.now()) {
      return func(this.#buffer!);
    } else if (this.#fetching) return this.appendRProm(func);
    else {
      this.#fetching = true;
      if (this.debounce > 0)
        await new Promise((a) => {
          setTimeout(a, this.debounce);
        });
      this.singleGet(this);
      return this.appendRProm(func);
    }
  }
}

//##################################################################################################################################################
//      _____  ______           __          _______
//     |  __ \|  ____|   /\     \ \        / / ____|
//     | |__) | |__     /  \     \ \  /\  / / (___
//     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
//     | | \ \| |____ / ____ \     \  /\  /  ____) |
//     |_|  \_\______/_/    \_\     \/  \/  |_____/
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
export abstract class STATE_RESOURCE_REA_WA<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_REA_WA<RT, WT, REL> {
  #valid: number = 0;
  #fetching: boolean = false;
  #buffer?: Result<RT, string>;
  #retentionTimout: number = 0;
  #debounceTimout: number = 0;
  #writeBuffer?: WT;
  #writeDebounceTimout: number = 0;

  /**Debounce delaying one time value retrival*/
  abstract get debounce(): number;

  /**Timeout for validity of last buffered value*/
  abstract get timeout(): number;

  /**Retention delay before resource performs teardown of connection is performed*/
  abstract get retention(): number;

  /**How long to debounce write calls, before the last write call is used*/
  abstract get writebounce(): number;

  protected onSubscribe(first: boolean) {
    if (!first || this.inUse()) return;
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

  protected onUnsubscribe(last: boolean) {
    if (!last) return;
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

  /**Called if the state is awaited, returns the value once*/
  protected abstract singleGet(state: this): void;

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected abstract setupConnection(state: this): void;

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected abstract teardownConnection(): void;

  /**Called after write debounce finished with the last written value*/
  protected abstract writeAction(
    value: WT,
    state: this
  ): Promise<Result<void, string>>;

  updateResource(value: Result<RT, string>) {
    this.#valid = Date.now() + this.timeout;
    this.fulRProm(value);
    this.#fetching = false;
    if (value.ok && this.#buffer?.ok && value.value !== this.#buffer.value)
      this.updateSubs(value);
    this.#buffer = value;
  }

  get buffer(): Result<RT, string> | undefined {
    return this.#buffer;
  }

  //Reader Context
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#valid >= Date.now()) {
      return func(this.#buffer!);
    } else if (this.#fetching) return this.appendRProm(func);
    else {
      this.#fetching = true;
      if (this.debounce > 0)
        await new Promise((a) => {
          setTimeout(a, this.debounce);
        });
      this.singleGet(this);
      return this.appendRProm(func);
    }
  }

  //Writer Context
  write(value: WT): Promise<Result<void, string>> {
    this.#writeBuffer = value;
    if (this.writebounce === 0) return this.writeAction(value, this);
    else if (this.#writeDebounceTimout === 0)
      this.#writeDebounceTimout = window.setTimeout(async () => {
        this.writeAction(this.#writeBuffer!, this);
        this.#writeDebounceTimout = 0;
        this.#writeBuffer = undefined;
      }, this.writebounce);
    return this.appendWProm();
  }

  abstract limit(value: WT): Result<WT, string>;

  abstract check(value: WT): Result<WT, string>;
}

//##################################################################################################################################################
//      _____  ______            ______ _    _ _   _  _____
//     |  __ \|  ____|   /\     |  ____| |  | | \ | |/ ____|
//     | |__) | |__     /  \    | |__  | |  | |  \| | |
//     |  _  /|  __|   / /\ \   |  __| | |  | | . ` | |
//     | | \ \| |____ / ____ \  | |    | |__| | |\  | |____
//     |_|  \_\______/_/    \_\ |_|     \____/|_| \_|\_____|

/**Alternative state resource which can be initialized with functions
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
export class STATE_RESOURCE_FUNC_REA<
  RT,
  REL extends Related = {}
> extends STATE_RESOURCE_REA<RT, REL> {
  constructor(
    once: (state: STATE_RESOURCE_FUNC_REA<RT, REL>) => void,
    setup: (state: STATE_RESOURCE_FUNC_REA<RT, REL>) => void,
    teardown: () => void,
    debounce: number,
    timeout: number,
    retention: number,
    helper?: STATE_HELPER<REL>
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
  #helper?: STATE_HELPER<REL>;

  /**Called if the state is awaited, returns the value once*/
  protected singleGet(_state: this): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setupConnection(_state: this): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardownConnection(): void {}

  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
}

//##################################################################################################################################################
//      _____  ______            ______ _    _ _   _  _____
//     |  __ \|  ____|   /\     |  ____| |  | | \ | |/ ____|
//     | |__) | |__     /  \    | |__  | |  | |  \| | |
//     |  _  /|  __|   / /\ \   |  __| | |  | | . ` | |
//     | | \ \| |____ / ____ \  | |    | |__| | |\  | |____
//     |_|  \_\______/_/    \_\ |_|     \____/|_| \_|\_____|

/**Alternative state resource which can be initialized with functions
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
export class STATE_RESOURCE_FUNC_ROA<
  RT,
  REL extends Related = {}
> extends STATE_RESOURCE_ROA<RT, REL> {
  constructor(
    once: (state: STATE_RESOURCE_FUNC_ROA<RT, REL>) => void,
    setup: (state: STATE_RESOURCE_FUNC_ROA<RT, REL>) => void,
    teardown: () => void,
    debounce: number,
    timeout: number,
    retention: number,
    helper?: STATE_HELPER<REL>
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
  #helper?: STATE_HELPER<REL>;

  /**Called if the state is awaited, returns the value once*/
  protected singleGet(_state: this): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setupConnection(_state: this): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardownConnection(): void {}

  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
}

//##################################################################################################################################################
//      _____  ______           __          __       ______ _    _ _   _  _____
//     |  __ \|  ____|   /\     \ \        / /\     |  ____| |  | | \ | |/ ____|
//     | |__) | |__     /  \     \ \  /\  / /  \    | |__  | |  | |  \| | |
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \   |  __| | |  | | . ` | |
//     | | \ \| |____ / ____ \     \  /\  / ____ \  | |    | |__| | |\  | |____
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\ |_|     \____/|_| \_|\_____|
/**Alternative state resource which can be initialized with functions
 * @template RT - The type of the state’s value when read.
 * @template WT - The type which can be written to the state.
 * @template REL - The type of related states, defaults to an empty object.*/
export class STATE_RESOURCE_FUNC_REA_WA<
  RT,
  WT = RT,
  REL extends Related = {}
> extends STATE_RESOURCE_REA_WA<RT, WT, REL> {
  constructor(
    once: (state: STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>) => void,
    setup: (state: STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>) => void,
    teardown: () => void,
    debounce: number,
    timeout: number,
    retention: number,
    writeBounce?: number,
    writeAction?: (
      value: WT,
      state: STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>
    ) => Promise<Result<void, string>>,
    helper?: STATE_HELPER_WRITE<WT, REL>
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
  #helper?: STATE_HELPER_WRITE<WT, REL>;

  /**Called if the state is awaited, returns the value once*/
  protected singleGet(_state: this): void {}

  /**Called when state is subscribed to to setup connection to remote resource*/
  protected setupConnection(_state: this): void {}

  /**Called when state is no longer subscribed to to cleanup connection to remote resource*/
  protected teardownConnection(): void {}

  /**Called after write debounce finished with the last written value*/
  protected async writeAction(
    _value: WT,
    _state: this
  ): Promise<Result<void, string>> {
    return Err("State not writable");
  }

  limit(value: WT): Result<WT, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }

  check(value: WT): Result<WT, string> {
    return this.#helper?.check ? this.#helper.check(value) : Ok(value);
  }

  related(): Option<REL> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  /**Call this to fullfill any promises waiting for result of a write.*/
  fullfillWrite(value: Result<void, string>) {
    this.fulWProm(value);
  }
}

//##################################################################################################################################################
//      _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//       | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//       | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\

const rea = {
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
  from<RT, REL extends Related = {}>(
    once: (state: STATE_RESOURCE_FUNC_REA<RT, REL>) => void,
    setup: (state: STATE_RESOURCE_FUNC_REA<RT, REL>) => void,
    teardown: () => void,
    debounce: number = 0,
    timeout: number = 0,
    retention: number = 0,
    helper?: STATE_HELPER<REL>
  ) {
    return new STATE_RESOURCE_FUNC_REA<RT, REL>(
      once,
      setup,
      teardown,
      debounce,
      timeout,
      retention,
      helper
    );
  },
  class: STATE_RESOURCE_REA,
  func_class: STATE_RESOURCE_FUNC_REA,
};

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
  from<RT, REL extends Related = {}>(
    once: (state: STATE_RESOURCE_FUNC_ROA<RT, REL>) => void,
    setup: (state: STATE_RESOURCE_FUNC_ROA<RT, REL>) => void,
    teardown: () => void,
    debounce: number = 0,
    timeout: number = 0,
    retention: number = 0,
    helper?: STATE_HELPER<REL>
  ) {
    return new STATE_RESOURCE_FUNC_ROA<RT, REL>(
      once,
      setup,
      teardown,
      debounce,
      timeout,
      retention,
      helper
    );
  },
  class: STATE_RESOURCE_ROA,
  func_class: STATE_RESOURCE_FUNC_ROA,
};

//##################################################################################################################################################
const rea_wa = {
  /**Alternative state resource which can be initialized with functions
   * @template READ - The type of the state’s value when read.
   * @template WT - The type which can be written to the state.
   * @template REL - The type of related states, defaults to an empty object.
   * @param once function called when state value is requested once, returns a Err(string) on failure
   * @param setup function called when state has been subscribed to
   * @param teardown function called when state has been unsubscribed from completely
   * @param debounce delay added to once value retrival, which will collect multiple once requests into a single one
   * @param timeout how long the last retrived value is considered valid
   * @param retention delay after last subscriber unsubscribes before teardown is called, to allow quick resubscribe without teardown
   * @param writeBounce debounce delay for write calls, only the last write within the delay is used
   * @param writeAction function called after write debounce finished with the last written value
   * */
  from<RT, REL extends Related = {}, WT = RT>(
    once: (state: STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>) => void,
    setup: (state: STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>) => void,
    teardown: () => void,
    debounce: number = 0,
    timeout: number = 0,
    retention: number = 0,
    writeBounce?: number,
    writeAction?: (
      value: WT,
      state: STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>
    ) => Promise<Result<void, string>>,
    helper?: STATE_HELPER_WRITE<WT, REL>
  ) {
    return new STATE_RESOURCE_FUNC_REA_WA<RT, WT, REL>(
      once,
      setup,
      teardown,
      debounce,
      timeout,
      retention,
      writeBounce,
      writeAction,
      helper
    );
  },
  class: STATE_RESOURCE_REA_WA,
  func_class: STATE_RESOURCE_FUNC_REA_WA,
};
//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**State that represent a remote resource*/
export const state_resource = {
  /**Remote resource */
  rea,
  /**Remote resource with guaranteed ok value */
  roa,
  /**Remote resource with write cabability */
  rea_wa,
};
