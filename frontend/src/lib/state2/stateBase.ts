import { None, ResultOk, type Option, type Result } from "@libResult";
import {
  type StateRead,
  type StateReadOk,
  type StateReadOkSync,
  type StateReadSync,
  type StateRelated,
  type StateSubscriber,
  type StateSubscriberOk,
} from "./types";

/**Common class all states inherit from to make instanceof work */
export abstract class State<RT, RELATED extends StateRelated = {}>
  implements StateRead<RT, RELATED>
{
  //Reader Context
  abstract then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;

  abstract subscribe<B extends StateSubscriber<RT>>(
    func: B,
    update?: boolean
  ): B;

  abstract unsubscribe<B extends StateSubscriber<RT>>(func: B): B;

  abstract related(): Option<RELATED>;

  get readable(): StateRead<RT, RELATED> {
    return this;
  }
}

//###########################################################################################################################################################
//      ____           _____ ______   _____  ______          _____
//     |  _ \   /\    / ____|  ____| |  __ \|  ____|   /\   |  __ \
//     | |_) | /  \  | (___ | |__    | |__) | |__     /  \  | |  | |
//     |  _ < / /\ \  \___ \|  __|   |  _  /|  __|   / /\ \ | |  | |
//     | |_) / ____ \ ____) | |____  | | \ \| |____ / ____ \| |__| |
//     |____/_/    \_\_____/|______| |_|  \_\______/_/    \_\_____/

export abstract class StateBaseRead<RT, RELATED extends StateRelated = {}>
  extends State<RT, RELATED>
  implements StateRead<RT, RELATED>
{
  #subscribers: Set<StateSubscriber<RT>> = new Set();
  #readPromises?: ((val: Result<RT, string>) => void)[];

  //Reader Context
  abstract then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;

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

  unsubscribe<B extends StateSubscriber<RT>>(func: B): B {
    if (this.#subscribers.delete(func))
      this.onUnsubscribe(this.#subscribers.size == 0);
    else console.warn("Subscriber not found with state", this, func);
    return func;
  }

  related(): Option<RELATED> {
    return None();
  }

  get readable(): StateRead<RT, RELATED> {
    return this;
  }

  //Owner Context
  /**Called when subscriber is added*/
  protected onSubscribe(_first: boolean) {}
  /**Called when subscriber is removed*/
  protected onUnsubscribe(_last: boolean) {}

  /**Returns if the state is being used */
  inUse(): this | undefined {
    return this.#subscribers.size ? this : undefined;
  }

  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: StateSubscriber<RT>): this | undefined {
    return this.#subscribers.has(subscriber) ? this : undefined;
  }

  /**Returns if the state has a subscriber */
  amountSubscriber(): number {
    return this.#subscribers.size;
  }

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

  //Promises
  protected async appendReadPromise<TResult1 = RT>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(
      await new Promise<Result<RT, string>>((a) => {
        (this.#readPromises ??= []).push(a);
      })
    );
  }
  fulfillReadPromises(value: Result<RT, string>) {
    if (this.#readPromises)
      for (let i = 0; i < this.#readPromises.length; i++)
        this.#readPromises[i](value);
    this.#readPromises = [];
  }
}

//###########################################################################################################################################################
//      ____           _____ ______   _____  ______          _____     ____  _  __
//     |  _ \   /\    / ____|  ____| |  __ \|  ____|   /\   |  __ \   / __ \| |/ /
//     | |_) | /  \  | (___ | |__    | |__) | |__     /  \  | |  | | | |  | | ' /
//     |  _ < / /\ \  \___ \|  __|   |  _  /|  __|   / /\ \ | |  | | | |  | |  <
//     | |_) / ____ \ ____) | |____  | | \ \| |____ / ____ \| |__| | | |__| | . \
//     |____/_/    \_\_____/|______| |_|  \_\______/_/    \_\_____/   \____/|_|\_\

export abstract class StateBaseReadOk<RT, RELATED extends StateRelated = {}>
  extends State<RT, RELATED>
  implements StateReadOk<RT, RELATED>
{
  #subscribers: Set<StateSubscriberOk<RT>> = new Set();
  #readPromises?: ((val: ResultOk<RT>) => void)[];

  //Reader Context
  abstract then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;

  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B {
    if (this.#subscribers.has(func)) {
      console.warn("Function already registered as subscriber", this, func);
      return func;
    }
    this.onSubscribe(this.#subscribers.size == 0);
    this.#subscribers.add(func);
    if (update) this.then(func);
    return func;
  }

  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B {
    if (this.#subscribers.delete(func))
      this.onUnsubscribe(this.#subscribers.size == 0);
    else console.warn("Subscriber not found with state", this, func);
    return func;
  }

  related(): Option<RELATED> {
    return None();
  }

  get readable(): StateReadOk<RT, RELATED> {
    return this;
  }

  //Owner Context
  /**Called when subscriber is added*/
  protected onSubscribe(_first: boolean) {}
  /**Called when subscriber is removed*/
  protected onUnsubscribe(_last: boolean) {}

  /**Returns if the state is being used */
  inUse(): this | undefined {
    return this.#subscribers.size ? this : undefined;
  }

  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: StateSubscriber<RT>): this | undefined {
    return this.#subscribers.has(subscriber) ? this : undefined;
  }

  /**Returns if the state has a subscriber */
  amountSubscriber(): number {
    return this.#subscribers.size;
  }

  /**Updates all subscribers with a value */
  protected updateSubscribers(value: ResultOk<RT>): void {
    for (const subscriber of this.#subscribers) {
      try {
        subscriber(value);
      } catch (e) {
        console.warn("Failed while calling subscribers ", e, this, subscriber);
      }
    }
  }

  //Promises
  protected async appendReadPromise<TResult1 = RT>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(
      await new Promise<ResultOk<RT>>((a) => {
        (this.#readPromises ??= []).push(a);
      })
    );
  }
  fulfillReadPromises(value: ResultOk<RT>) {
    if (this.#readPromises)
      for (let i = 0; i < this.#readPromises.length; i++)
        this.#readPromises[i](value);
    this.#readPromises = [];
  }
}

//###########################################################################################################################################################
//      ____           _____ ______   _____  ______          _____     _______     ___   _  _____
//     |  _ \   /\    / ____|  ____| |  __ \|  ____|   /\   |  __ \   / ____\ \   / / \ | |/ ____|
//     | |_) | /  \  | (___ | |__    | |__) | |__     /  \  | |  | | | (___  \ \_/ /|  \| | |
//     |  _ < / /\ \  \___ \|  __|   |  _  /|  __|   / /\ \ | |  | |  \___ \  \   / | . ` | |
//     | |_) / ____ \ ____) | |____  | | \ \| |____ / ____ \| |__| |  ____) |  | |  | |\  | |____
//     |____/_/    \_\_____/|______| |_|  \_\______/_/    \_\_____/  |_____/   |_|  |_| \_|\_____|

export abstract class StateBaseReadSync<RT, RELATED extends StateRelated = {}>
  extends StateBaseRead<RT, RELATED>
  implements StateReadSync<RT, RELATED>
{
  abstract get(): Result<RT, string>;

  get readable(): StateReadSync<RT, RELATED> {
    return this;
  }
}

//###########################################################################################################################################################
//      ____           _____ ______   _____  ______          _____     ____  _  __   _______     ___   _  _____
//     |  _ \   /\    / ____|  ____| |  __ \|  ____|   /\   |  __ \   / __ \| |/ /  / ____\ \   / / \ | |/ ____|
//     | |_) | /  \  | (___ | |__    | |__) | |__     /  \  | |  | | | |  | | ' /  | (___  \ \_/ /|  \| | |
//     |  _ < / /\ \  \___ \|  __|   |  _  /|  __|   / /\ \ | |  | | | |  | |  <    \___ \  \   / | . ` | |
//     | |_) / ____ \ ____) | |____  | | \ \| |____ / ____ \| |__| | | |__| | . \   ____) |  | |  | |\  | |____
//     |____/_/    \_\_____/|______| |_|  \_\______/_/    \_\_____/   \____/|_|\_\ |_____/   |_|  |_| \_|\_____|

export abstract class StateBaseReadOkSync<RT, RELATED extends StateRelated = {}>
  extends StateBaseReadOk<RT, RELATED>
  implements StateReadOkSync<RT, RELATED>
{
  abstract then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;
  abstract get(): ResultOk<RT>;
  abstract getOk(): RT;
  get readable(): StateReadOkSync<RT, RELATED> {
    return this;
  }
}
export let StateBaseSyncOk = StateBaseReadOkSync;

//###########################################################################################################################################################
//      _____ _   _  _____ _______       _   _  _____ ______    _____ _    _ ______ _____ _  __ _____
//     |_   _| \ | |/ ____|__   __|/\   | \ | |/ ____|  ____|  / ____| |  | |  ____/ ____| |/ // ____|
//       | | |  \| | (___    | |  /  \  |  \| | |    | |__    | |    | |__| | |__ | |    | ' /| (___
//       | | | . ` |\___ \   | | / /\ \ | . ` | |    |  __|   | |    |  __  |  __|| |    |  <  \___ \
//      _| |_| |\  |____) |  | |/ ____ \| |\  | |____| |____  | |____| |  | | |___| |____| . \ ____) |
//     |_____|_| \_|_____/   |_/_/    \_\_| \_|\_____|______|  \_____|_|  |_|______\_____|_|\_\_____/

/**Checks if a variable is an instance of a state*/
export function state_is(state: any): state is State<any> {
  return state instanceof State;
}

/**Checks if a variable is an instance of a readable state result*/
export function state_read_is(state: any): state is StateRead<any, any> {
  return state instanceof StateBaseRead;
}

/**Checks if a variable is an instance of a readable state result*/
export function state_read_ok_is(state: any): state is StateReadOk<any, any> {
  return state instanceof StateBaseReadOk;
}

/**Checks if a variable is an instance of a readable state result*/
export function state_read_sync_is(
  state: any
): state is StateReadSync<any, any> {
  return (
    state instanceof StateBaseReadSync || state instanceof StateBaseReadOkSync
  );
}

/**Checks if a variable is an instance of a readable state result*/
export function state_read_ok_sync_is(
  state: any
): state is StateReadOkSync<any, any> {
  return state instanceof StateBaseReadOkSync;
}
