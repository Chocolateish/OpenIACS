import { type Option, type Result, type ResultOk } from "@libResult";

/**Function used to subscribe to state changes
 * @template RT - The type of the state’s value when read.*/
export type StateSubscriber<RT> = (value: Result<RT, string>) => void;

/**Function used to subscribe to state changes with guarenteed Ok value
 * @template RT - The type of the state’s value when read.*/
export type StateSubscriberOk<RT> = (value: ResultOk<RT>) => void;

/**Map of values or states related to a state */
export type StateRelated = {
  [key: string | symbol | number]: any;
};

export type StateHelper<RT, L extends StateRelated = {}> = {
  limit?: (value: RT) => Result<RT, string>;
  check?: (value: RT) => Result<RT, string>;
  related?: () => Option<L>;
};

export type StateSetter<RT, WT = RT, STATE = State<any>> = (
  value: WT,
  state: STATE,
  old?: Result<RT, string>
) => Promise<Result<void, string>>;

export type StateSetterOk<RT, WT = RT, STATE = State<any>> = (
  value: WT,
  state: STATE,
  old?: ResultOk<RT>
) => Promise<Result<void, string>>;

export type StateSetterSync<RT, WT = RT, STATE = State<any>> = (
  value: WT,
  state: STATE,
  old?: Result<RT, string>
) => Result<void, string>;

export type StateSetterOkSync<RT, WT = RT, STATE = State<any>> = (
  value: WT,
  state: STATE,
  old?: ResultOk<RT>
) => Result<void, string>;

//###########################################################################################################################################################
//      _____  ______          _____  ______ _____     _____ ____  _   _ _______ ________   _________
//     |  __ \|  ____|   /\   |  __ \|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |__) | |__     /  \  | |  | | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     |  _  /|  __|   / /\ \ | |  | |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | | \ \| |____ / ____ \| |__| | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//     |_|  \_\______/_/    \_\_____/|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|

export abstract class StateAll<RT, REL extends StateRelated = {}> {
  #subscribers: Set<StateSubscriber<RT>> = new Set();
  #readPromises?: ((val: Result<RT, string>) => void)[];

  //#Reader Context
  /**Can state value be retrieved syncronously*/
  abstract readonly rsync: boolean;
  /**Is state guarenteed to be Ok */
  abstract readonly rok: boolean;
  /**Allows getting value of state*/
  abstract then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  /**Gets the current value of the state if state is sync*/
  abstract get?(): Result<RT, string>;
  /**Gets the value of the state without result, only works when state is OK */
  getOk?(): RT;
  /**This adds a function as a subscriber to changes to the state
   * @param update set true to update subscriber immediatly*/
  subscribe<B extends StateSubscriber<RT>>(func: B, update?: boolean): B {
    if (this.#subscribers.has(func)) {
      console.warn("Function already registered as subscriber", this, func);
      return func;
    }
    this.onSubscribe(this.#subscribers.size == 0);
    this.#subscribers.add(func);
    if (update) this.then(func);
    return func;
  }
  /**This removes a function as a subscriber to the state*/
  unsubscribe<B extends StateSubscriber<RT>>(func: B): B {
    if (this.#subscribers.delete(func))
      this.onUnsubscribe(this.#subscribers.size == 0);
    else console.warn("Subscriber not found with state", this, func);
    return func;
  }
  /**This returns related states if any*/
  abstract related(): Option<REL>;

  /**Returns if the state is being used */
  inUse(): this | undefined {
    return this.#subscribers.size > 0 ? this : undefined;
  }
  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: StateSubscriber<RT>): this | undefined {
    return this.#subscribers.has(subscriber) ? this : undefined;
  }
  /**Returns if the state has a subscriber */
  amountSubscriber(): number {
    return this.#subscribers.size;
  }

  /**Called when subscriber is added*/
  protected onSubscribe(_first: boolean): void {}
  /**Called when subscriber is removed*/
  protected onUnsubscribe(_last: boolean): void {}

  /**Updates all subscribers with a value */
  protected updateSubscribers(value: Result<RT, string>): void {
    for (const subscriber of this.#subscribers) {
      try {
        subscriber(value);
      } catch (e) {
        console.warn("Failed while calling subscribers ", e, this, subscriber);
      }
    }
  }

  /**Returns state as a readable state type*/
  abstract get readonly(): StateAll<RT, REL>;

  //Promises
  protected async appendReadPromise<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(
      await new Promise<Result<RT, string>>((a) => {
        (this.#readPromises ??= []).push(a);
      })
    );
  }
  protected fulfillReadPromises(value: Result<RT, string>) {
    if (this.#readPromises)
      for (let i = 0; i < this.#readPromises.length; i++)
        this.#readPromises[i](value);
    this.#readPromises = [];
  }
}

export abstract class State_R<
  RT,
  REL extends StateRelated = {}
> extends StateAll<RT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): false {
    return false;
  }
  get readonly(): State_R<RT, REL> {
    return this;
  }
}

export abstract class State_RO<
  RT,
  REL extends StateRelated = {}
> extends StateAll<RT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    return super.subscribe(func as StateSubscriber<RT>, update) as B;
  }
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    return super.unsubscribe(func as StateSubscriber<RT>) as B;
  }
  hasSubscriber(subscriber: StateSubscriberOk<RT>): this | undefined {
    return super.hasSubscriber(subscriber as StateSubscriber<RT>);
  }

  get readonly(): State_RO<RT, REL> {
    return this;
  }
}

export abstract class State_RS<
  RT,
  REL extends StateRelated = {}
> extends StateAll<RT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): false {
    return false;
  }
  abstract get(): Result<RT, string>;

  get readonly(): State_RS<RT, REL> {
    return this;
  }
}

export abstract class State_ROS<
  RT,
  REL extends StateRelated = {}
> extends StateAll<RT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    return super.subscribe(func as StateSubscriber<RT>, update) as B;
  }
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    return super.unsubscribe(func as StateSubscriber<RT>) as B;
  }
  hasSubscriber(subscriber: StateSubscriberOk<RT>): this | undefined {
    return super.hasSubscriber(subscriber as StateSubscriber<RT>);
  }
  abstract get(): ResultOk<RT>;
  abstract getOk(): RT;
  get readonly(): State_ROS<RT, REL> {
    return this;
  }
}

export let State_RSO = State_ROS;

export type State<RT, REL extends StateRelated = {}> =
  | State_R<RT, REL>
  | State_RO<RT, REL>
  | State_RS<RT, REL>
  | State_ROS<RT, REL>;

//###########################################################################################################################################################
//     __          _______  _____ _______ ______ _____     _____ ____  _   _ _______ ________   _________
//     \ \        / /  __ \|_   _|__   __|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//      \ \  /\  / /| |__) | | |    | |  | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//       \ \/  \/ / |  _  /  | |    | |  |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//        \  /\  /  | | \ \ _| |_   | |  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//         \/  \/   |_|  \_\_____|  |_|  |______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|

export abstract class StateAllWrite<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAll<RT, REL> {
  #writePromises?: ((val: Result<void, string>) => void)[];

  //#Writer Context
  /**Can state be written syncronously*/
  abstract readonly wsync: boolean;
  /**Is state writable*/
  abstract readonly writable: boolean;
  /** This attempts a write to the state, write is not guaranteed to succeed
   * @returns promise of result with error for the write*/
  abstract write?(value: WT): Promise<Result<void, string>>;
  /**Limits given value to valid range if possible returns None if not possible */
  abstract limit?(value: WT): Result<WT, string>;
  /**Checks if the value is valid and returns reason for invalidity */
  abstract check?(value: WT): Result<WT, string>;
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  abstract writeSync?(value: WT): Result<void, string>;
  /**Returns the same state as just a writable, for access management*/
  abstract readonly readwrite?: StateAllWrite<RT, WT, REL>;

  //Promises
  protected async appendWritePromise<TResult1 = Result<void, string>>(
    func: (value: Result<void, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(
      await new Promise<Result<void, string>>((a) => {
        (this.#writePromises ??= []).push(a);
      })
    );
  }
  protected fulfillWritePromises(value: Result<void, string>) {
    if (this.#writePromises)
      for (let i = 0; i < this.#writePromises.length; i++)
        this.#writePromises[i](value);
    this.#writePromises = [];
  }
}

//#Read Write
export abstract class State_R_W<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): false {
    return false;
  }
  get readonly(): State_R<RT, REL> {
    return this as State_R<RT, REL>;
  }
  get wsync(): false {
    return false;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;
  get readwrite(): State_R_W<RT, WT, REL> {
    return this;
  }
}

export abstract class State_R_WS<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): false {
    return false;
  }
  get readonly(): State_R<RT, REL> {
    return this as State_R<RT, REL>;
  }
  get wsync(): true {
    return true;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;
  abstract writeSync(value: WT): Result<void, string>;
  get readwrite(): State_R_WS<RT, WT, REL> {
    return this;
  }
}

//#Read Ok Write
export abstract class State_RO_W<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    return super.subscribe(func as StateSubscriber<RT>, update) as B;
  }
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    return super.unsubscribe(func as StateSubscriber<RT>) as B;
  }
  hasSubscriber(subscriber: StateSubscriberOk<RT>): this | undefined {
    return super.hasSubscriber(subscriber as StateSubscriber<RT>);
  }
  get readonly(): State_RO<RT, REL> {
    return this as State_RO<RT, REL>;
  }
  get wsync(): false {
    return false;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;
  get readwrite(): State_RO_W<RT, WT, REL> {
    return this;
  }
}

export abstract class State_RO_WS<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    return super.subscribe(func as StateSubscriber<RT>, update) as B;
  }
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    return super.unsubscribe(func as StateSubscriber<RT>) as B;
  }
  hasSubscriber(subscriber: StateSubscriberOk<RT>): this | undefined {
    return super.hasSubscriber(subscriber as StateSubscriber<RT>);
  }
  get readonly(): State_RO<RT, REL> {
    return this as State_RO<RT, REL>;
  }

  get wsync(): true {
    return true;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;
  abstract writeSync(value: WT): Result<void, string>;
  get readwrite(): State_RO_WS<RT, WT, REL> {
    return this;
  }
}

//#Read Sync Write
export abstract class State_RS_W<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): false {
    return false;
  }
  abstract get(): Result<RT, string>;

  get readonly(): State_RS<RT, REL> {
    return this as State_RS<RT, REL>;
  }
  get wsync(): false {
    return false;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;
  get readwrite(): State_RS_W<RT, WT, REL> {
    return this;
  }
}

export abstract class State_RS_WS<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): false {
    return false;
  }
  abstract get(): Result<RT, string>;

  get readonly(): State_RS<RT, REL> {
    return this as State_RS<RT, REL>;
  }

  get wsync(): true {
    return true;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;

  abstract writeSync(value: WT): Result<void, string>;
  get readwrite(): State_RS_WS<RT, WT, REL> {
    return this;
  }
}

//#Read Sync Write
export abstract class State_ROS_W<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): true {
    return true;
  }
  abstract get(): Result<RT, string>;
  abstract getOk(): RT;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    return super.subscribe(func as StateSubscriber<RT>, update) as B;
  }
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    return super.unsubscribe(func as StateSubscriber<RT>) as B;
  }
  hasSubscriber(subscriber: StateSubscriberOk<RT>): this | undefined {
    return super.hasSubscriber(subscriber as StateSubscriber<RT>);
  }
  get readonly(): State_ROS<RT, REL> {
    return this as State_ROS<RT, REL>;
  }
  get wsync(): false {
    return false;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;

  get readwrite(): State_ROS_W<RT, WT, REL> {
    return this;
  }
}
export type State_RSO_W<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> = State_ROS_W<RT, WT, REL>;

export abstract class State_ROS_WS<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> extends StateAllWrite<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): true {
    return true;
  }
  abstract get(): Result<RT, string>;
  abstract getOk(): RT;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    return super.subscribe(func as StateSubscriber<RT>, update) as B;
  }
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    return super.unsubscribe(func as StateSubscriber<RT>) as B;
  }
  hasSubscriber(subscriber: StateSubscriberOk<RT>): this | undefined {
    return super.hasSubscriber(subscriber as StateSubscriber<RT>);
  }
  get readonly(): State_ROS<RT, REL> {
    return this as State_ROS<RT, REL>;
  }

  get wsync(): true {
    return true;
  }
  get writable(): true {
    return true;
  }
  abstract write(value: WT): Promise<Result<void, string>>;
  abstract limit(value: WT): Result<WT, string>;
  abstract check(value: WT): Result<WT, string>;

  abstract writeSync(value: WT): Result<void, string>;
  get readwrite(): State_ROS_WS<RT, WT, REL> {
    return this;
  }
}

export type State_RSO_WS<
  RT,
  WT = RT,
  REL extends StateRelated = {}
> = State_ROS_WS<RT, WT, REL>;

export type StateWrite<RT, WT = RT, REL extends StateRelated = {}> =
  | State_R<RT, REL>
  | State_RO<RT, REL>
  | State_RS<RT, REL>
  | State_ROS<RT, REL>
  | State_R_W<RT, WT, REL>
  | State_R_WS<RT, WT, REL>
  | State_RO_W<RT, WT, REL>
  | State_RO_WS<RT, WT, REL>
  | State_RS_W<RT, WT, REL>
  | State_RS_WS<RT, WT, REL>
  | State_ROS_W<RT, WT, REL>
  | State_ROS_WS<RT, WT, REL>;

//###########################################################################################################################################################
//       ______          ___   _ ______ _____     _____ ____  _   _ _______ ________   _________
//      / __ \ \        / / \ | |  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |  | \ \  /\  / /|  \| | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     | |  | |\ \/  \/ / | . ` |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | |__| | \  /\  /  | |\  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//      \____/   \/  \/   |_| \_|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
/** Represents the standard owner interface for a state object.
 * @template OT - The type of the state’s value.*/
export interface StateOwnerAll<OT> {
  /** This sets the value of the state to a result and updates all subscribers */
  set(value: Result<OT, string>): void;
  /** This sets the value of the state to a ok result and updates all subscribers */
  setOk(value: OT): void;
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr?(err: OT): void;
}

/** Represents the standard owner interface for a state object.
 * @template OT - The type of the state’s value.*/
export interface StateOwnerOk<OT> extends StateOwnerAll<OT> {
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr(err: OT): void;
}
