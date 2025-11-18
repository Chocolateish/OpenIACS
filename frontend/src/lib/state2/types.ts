import { None, type Option, type Result, type ResultOk } from "@libResult";

/**Function used to subscribe to state changes
 * @template RT - The type of the state’s value when read.*/
export type STATE_SUB<RT> = (value: Result<RT, string>) => void;

/**Function used to subscribe to state changes with guarenteed Ok value
 * @template RT - The type of the state’s value when read.*/
export type STATE_SUB_OK<RT> = (value: ResultOk<RT>) => void;

/**Map of values or states related to a state */
export type STATE_RELATED = {
  [key: string | symbol | number]: any;
};

export interface STATE_HELPER<REL extends STATE_RELATED = {}> {
  related?: () => Option<REL>;
}
export interface STATE_HELPER_WRITE<WT, REL extends STATE_RELATED = {}>
  extends STATE_HELPER<REL> {
  limit?: (value: WT) => Result<WT, string>;
  check?: (value: WT) => Result<WT, string>;
}

export type STATE_SET_REA<RT, S extends StateReadAll<any, any>, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Promise<Result<void, string>>;

export type STATE_SET_ROA<RT, S extends StateReadAll<any, any>, WT = RT> = (
  value: WT,
  state: S,
  old?: ResultOk<RT>
) => Promise<Result<void, string>>;

export type STATE_SET_RES<RT, S extends StateReadAll<any, any>, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Result<void, string>;

export type STATE_SET_ROS<RT, S extends StateReadAll<any, any>, WT = RT> = (
  value: WT,
  state: S,
  old?: ResultOk<RT>
) => Result<void, string>;

//###########################################################################################################################################################
//###########################################################################################################################################################
//      _____  ______          _____  ______ _____     _____ ____  _   _ _______ ________   _________
//     |  __ \|  ____|   /\   |  __ \|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |__) | |__     /  \  | |  | | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     |  _  /|  __|   / /\ \ | |  | |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | | \ \| |____ / ____ \| |__| | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//     |_|  \_\______/_/    \_\_____/|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|

export abstract class StateReadAll<RT, REL extends STATE_RELATED = {}> {
  #subscribers: Set<STATE_SUB<any>> = new Set();
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
  get?(): Result<RT, string>;
  /**Gets the value of the state without result, only works when state is OK */
  getOk?(): RT;
  /**This adds a function as a subscriber to changes to the state
   * @param update set true to update subscriber immediatly*/
  subscribe<T = STATE_SUB<RT>>(func: STATE_SUB<RT>, update?: boolean): T {
    if (this.#subscribers.has(func)) {
      console.warn("Function already registered as subscriber", this, func);
      return func as T;
    }
    this.onSubscribe(this.#subscribers.size == 0);
    this.#subscribers.add(func);
    if (update) this.then(func as (value: Result<RT, string>) => void);
    return func as T;
  }
  /**This removes a function as a subscriber to the state*/
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB<RT>): T {
    if (this.#subscribers.delete(func))
      this.onUnsubscribe(this.#subscribers.size == 0);
    else console.warn("Subscriber not found with state", this, func);
    return func as T;
  }
  /**This returns related states if any*/
  related(): Option<REL> {
    return None();
  }

  /**Returns if the state is being used */
  inUse(): this | undefined {
    return this.#subscribers.size > 0 ? this : undefined;
  }
  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: STATE_SUB<RT>): this | undefined {
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
  abstract get readonly(): StateReadAll<RT, REL>;

  //Promises
  /**Creates a promise which can be fulfilled later with fulRProm */
  protected async appendRProm<
    T = Result<RT, string>,
    TResult1 = Result<RT, string>
  >(func: (value: T) => TResult1 | PromiseLike<TResult1>): Promise<TResult1> {
    return func(
      await new Promise<T>((a) => {
        (this.#readPromises ??= []).push(
          a as (val: Result<RT, string>) => void
        );
      })
    );
  }
  /**Fulfills all read promises with given value */
  protected fulRProm<T = Result<RT, string>>(value: Result<RT, string>): T {
    if (this.#readPromises)
      for (let i = 0; i < this.#readPromises.length; i++)
        this.#readPromises[i](value);
    this.#readPromises = [];
    return value as T;
  }
}

//###########################################################################################################################################################
export abstract class STATE_REA<
  RT,
  REL extends STATE_RELATED = {}
> extends StateReadAll<RT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): false {
    return false;
  }
  get readonly(): STATE_REA<RT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
export abstract class STATE_ROA<
  RT,
  REL extends STATE_RELATED = {}
> extends StateReadAll<RT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<T = STATE_SUB_OK<RT>>(func: STATE_SUB_OK<RT>, update?: boolean): T {
    return super.subscribe(func as STATE_SUB<RT>, update) as T;
  }
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB_OK<RT>): T {
    return super.unsubscribe(func as STATE_SUB<RT>);
  }
  hasSubscriber(subscriber: STATE_SUB_OK<RT>): this | undefined {
    return super.hasSubscriber(subscriber as STATE_SUB<RT>);
  }

  get readonly(): STATE_ROA<RT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
export abstract class STATE_RES<
  RT,
  REL extends STATE_RELATED = {}
> extends StateReadAll<RT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): false {
    return false;
  }
  abstract get(): Result<RT, string>;

  get readonly(): STATE_RES<RT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
export abstract class STATE_ROS<
  RT,
  REL extends STATE_RELATED = {}
> extends StateReadAll<RT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<T = STATE_SUB_OK<RT>>(func: STATE_SUB_OK<RT>, update?: boolean): T {
    return super.subscribe(func as STATE_SUB<RT>, update) as T;
  }
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB_OK<RT>): T {
    return super.unsubscribe(func as STATE_SUB<RT>);
  }
  hasSubscriber(subscriber: STATE_SUB_OK<RT>): this | undefined {
    return super.hasSubscriber(subscriber as STATE_SUB<RT>);
  }
  abstract get(): ResultOk<RT>;
  abstract getOk(): RT;
  get readonly(): STATE_ROS<RT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
//     __          _______  _____ _______ ______ _____     _____ ____  _   _ _______ ________   _________
//     \ \        / /  __ \|_   _|__   __|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//      \ \  /\  / /| |__) | | |    | |  | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//       \ \/  \/ / |  _  /  | |    | |  |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//        \  /\  /  | | \ \ _| |_   | |  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//         \/  \/   |_|  \_\_____|  |_|  |______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|

export abstract class StateWriteAll<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateReadAll<RT, REL> {
  #writePromises?: ((val: Result<void, string>) => void)[];

  //#Writer Context
  /**Can state be written syncronously*/
  abstract readonly wsync: boolean;
  /**Is state writable*/
  abstract readonly writable: boolean;
  /** This attempts a write to the state, write is not guaranteed to succeed
   * @returns promise of result with error for the write*/
  abstract write(value: WT): Promise<Result<void, string>>;
  /**Limits given value to valid range if possible returns None if not possible */
  abstract limit(value: WT): Result<WT, string>;
  /**Checks if the value is valid and returns reason for invalidity */
  abstract check(value: WT): Result<WT, string>;
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  writeSync?(value: WT): Result<void, string>;
  /**Returns the same state as just a writable, for access management*/
  abstract readonly readwrite?: StateWriteAll<RT, WT, REL>;

  //Promises
  /**Creates a promise which can be fulfilled later with fulRProm */
  protected appendWProm(): Promise<Result<void, string>> {
    return new Promise<Result<void, string>>((a) => {
      (this.#writePromises ??= []).push(a);
    });
  }
  /**Fulfills all write promises with given value */
  protected fulWProm(value: Result<void, string>): typeof value {
    if (this.#writePromises)
      for (let i = 0; i < this.#writePromises.length; i++)
        this.#writePromises[i](value);
    this.#writePromises = [];
    return value;
  }
}

//###########################################################################################################################################################
//###########################################################################################################################################################
export abstract class STATE_REA_WA<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): false {
    return false;
  }
  get readonly(): STATE_REA<RT, REL> {
    return this as STATE_REA<RT, REL>;
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
  get readwrite(): STATE_REA_WA<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
export abstract class STATE_REA_WS<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): false {
    return false;
  }
  get readonly(): STATE_REA<RT, REL> {
    return this as STATE_REA<RT, REL>;
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
  get readwrite(): STATE_REA_WS<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
//###########################################################################################################################################################
export abstract class STATE_ROA_WA<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<T = STATE_SUB_OK<RT>>(func: STATE_SUB_OK<RT>, update?: boolean): T {
    return super.subscribe(func as STATE_SUB<RT>, update) as T;
  }
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB_OK<RT>): T {
    return super.unsubscribe(func as STATE_SUB<RT>);
  }
  hasSubscriber(subscriber: STATE_SUB_OK<RT>): this | undefined {
    return super.hasSubscriber(subscriber as STATE_SUB<RT>);
  }
  get readonly(): STATE_ROA<RT, REL> {
    return this as STATE_ROA<RT, REL>;
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
  get readwrite(): STATE_ROA_WA<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
export abstract class STATE_ROA_WS<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): false {
    return false;
  }
  get rok(): true {
    return true;
  }
  abstract then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): PromiseLike<T>;
  subscribe<T = STATE_SUB_OK<RT>>(func: STATE_SUB_OK<RT>, update?: boolean): T {
    return super.subscribe(func as STATE_SUB<RT>, update) as T;
  }
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB_OK<RT>): T {
    return super.unsubscribe(func as STATE_SUB<RT>);
  }
  hasSubscriber(subscriber: STATE_SUB_OK<RT>): this | undefined {
    return super.hasSubscriber(subscriber as STATE_SUB<RT>);
  }
  get readonly(): STATE_ROA<RT, REL> {
    return this as STATE_ROA<RT, REL>;
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
  get readwrite(): STATE_ROA_WS<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
//###########################################################################################################################################################
export abstract class STATE_RES_WA<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): false {
    return false;
  }
  abstract get(): Result<RT, string>;

  get readonly(): STATE_RES<RT, REL> {
    return this as STATE_RES<RT, REL>;
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
  get readwrite(): STATE_RES_WA<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
export abstract class STATE_RES_WS<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): false {
    return false;
  }
  abstract get(): Result<RT, string>;

  get readonly(): STATE_RES<RT, REL> {
    return this as STATE_RES<RT, REL>;
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
  get readwrite(): STATE_RES_WS<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
//###########################################################################################################################################################
export abstract class STATE_ROS_WA<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): true {
    return true;
  }
  abstract get(): Result<RT, string>;
  abstract getOk(): RT;
  subscribe<T = STATE_SUB_OK<RT>>(func: STATE_SUB_OK<RT>, update?: boolean): T {
    return super.subscribe(func as STATE_SUB<RT>, update) as T;
  }
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB_OK<RT>): T {
    return super.unsubscribe(func as STATE_SUB<RT>);
  }
  hasSubscriber(subscriber: STATE_SUB_OK<RT>): this | undefined {
    return super.hasSubscriber(subscriber as STATE_SUB<RT>);
  }
  get readonly(): STATE_ROS<RT, REL> {
    return this as STATE_ROS<RT, REL>;
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

  get readwrite(): STATE_ROS_WA<RT, WT, REL> {
    return this;
  }
}
//###########################################################################################################################################################
export abstract class STATE_ROS_WS<
  RT,
  WT = RT,
  REL extends STATE_RELATED = {}
> extends StateWriteAll<RT, WT, REL> {
  get rsync(): true {
    return true;
  }
  get rok(): true {
    return true;
  }
  abstract get(): Result<RT, string>;
  abstract getOk(): RT;
  subscribe<T = STATE_SUB_OK<RT>>(func: STATE_SUB_OK<RT>, update?: boolean): T {
    return super.subscribe(func as STATE_SUB<RT>, update) as T;
  }
  unsubscribe<T = STATE_SUB<RT>>(func: STATE_SUB_OK<RT>): T {
    return super.unsubscribe(func as STATE_SUB<RT>);
  }
  hasSubscriber(subscriber: STATE_SUB_OK<RT>): this | undefined {
    return super.hasSubscriber(subscriber as STATE_SUB<RT>);
  }
  get readonly(): STATE_ROS<RT, REL> {
    return this as STATE_ROS<RT, REL>;
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
  get readwrite(): STATE_ROS_WS<RT, WT, REL> {
    return this;
  }
}

//###########################################################################################################################################################
//      _________     _______  ______  _____
//     |__   __\ \   / /  __ \|  ____|/ ____|
//        | |   \ \_/ /| |__) | |__  | (___
//        | |    \   / |  ___/|  __|  \___ \
//        | |     | |  | |    | |____ ____) |
//        |_|     |_|  |_|    |______|_____/

export type STATE<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXX<RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>;

export type STATE_REX<RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_RES<RT, REL>;

export type STATE_ROX<RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA<RT, REL>
  | STATE_ROS<RT, REL>;

export type STATE_RXA<RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>;

export type STATE_RXS<RT, REL extends STATE_RELATED = {}> =
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>;

//###########################################################################################################################################################
export type STATE_RXX_XX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXX_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXX_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_RXX_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_REX_XX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>;

export type STATE_REX_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>;

export type STATE_REX_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>;

export type STATE_REX_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WS<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_ROX_XX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_ROX_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_ROX_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_ROX_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_RXA_XX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>;

export type STATE_RXA_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>;

export type STATE_RXA_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>;

export type STATE_RXA_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_RXS_XX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXS_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXS_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_RXS_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

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
