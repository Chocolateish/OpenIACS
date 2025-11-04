import { None, ResultOk, type Option, type Result } from "@libResult";
import {
  type StateReadBase,
  type StateReadError,
  type StateRelated,
  type StateSubscriberBase,
  type StateWriteError,
} from "./types";

export abstract class StateBase<
  READ extends Result<any, StateReadError>,
  SYNC extends boolean,
  RELATED extends StateRelated = {}
> implements StateReadBase<READ, SYNC, RELATED>
{
  #subscribers: Set<StateSubscriberBase<READ>> = new Set();
  #readPromises?: ((val: READ) => void)[];
  #writePromises?: ((val: Result<void, StateWriteError>) => void)[];

  //Reader Context
  abstract then<TResult1 = READ>(
    func: (value: READ) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;

  subscribe<B extends StateSubscriberBase<READ>>(func: B, update?: boolean): B {
    if (this.#subscribers.has(func)) {
      console.warn("Function already registered as subscriber");
      return func;
    }
    this.onSubscribe(this.#subscribers.size == 0);
    this.subOnSubscribe(this.#subscribers.size == 0);
    this.#subscribers.add(func);
    if (update) this.then(func);
    return func;
  }

  unsubscribe<B extends StateSubscriberBase<READ>>(func: B): B {
    if (this.#subscribers.delete(func)) {
      this.onUnsubscribe(this.#subscribers.size == 0);
      this.subOnUnsubscribe(this.#subscribers.size == 0);
    } else console.warn("Subscriber not found with state", this, func);
    return func;
  }

  abstract get(): SYNC extends true ? READ : unknown;

  abstract getOk(): SYNC extends true
    ? READ extends ResultOk<infer T>
      ? T
      : unknown
    : unknown;

  related(): Option<RELATED> {
    return None();
  }

  /**Called when subscriber is added*/
  protected subOnSubscribe(_first: boolean) {}
  /**Called when subscriber is removed*/
  protected subOnUnsubscribe(_last: boolean) {}

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
  hasSubscriber(subscriber: StateSubscriberBase<READ>): this | undefined {
    return this.#subscribers.has(subscriber) ? this : undefined;
  }

  /**Returns if the state has a subscriber */
  amountSubscriber(): number {
    return this.#subscribers.size;
  }

  /**Updates all subscribers with a value */
  protected updateSubscribers(value: READ): void {
    for (const subscriber of this.#subscribers) {
      try {
        subscriber(value);
      } catch (e) {
        console.warn("Failed while calling subscribers ", e, this, subscriber);
      }
    }
  }

  //Type
  get readable(): StateReadBase<READ, SYNC, RELATED> {
    return this;
  }

  //Promises
  protected async appendReadPromise<TResult1 = READ>(
    func: (value: READ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(
      await new Promise<READ>((a) => {
        (this.#readPromises ??= []).push(a);
      })
    );
  }
  protected fulfillReadPromises(value: READ) {
    if (this.#readPromises)
      for (let i = 0; i < this.#readPromises.length; i++)
        this.#readPromises[i](value);
    this.#readPromises = [];
  }

  protected async appendWritePromise(): Promise<Result<void, StateWriteError>> {
    return new Promise<Result<void, StateWriteError>>((a) => {
      (this.#writePromises ??= []).push(a);
    });
  }
  protected fulfillWritePromises(res: Result<void, StateWriteError>) {
    if (this.#writePromises)
      for (let i = 0; i < this.#writePromises.length; i++)
        this.#writePromises[i](res);
    this.#writePromises = [];
  }
}

export abstract class StateBaseOk<
  READ extends ResultOk<any>,
  SYNC extends boolean,
  RELATED extends StateRelated = {}
> extends StateBase<READ, SYNC, RELATED> {}

export abstract class StateBaseSync<
  READ extends Result<any, StateReadError>,
  RELATED extends StateRelated = {}
> extends StateBase<READ, true, RELATED> {}

export abstract class StateBaseSyncOk<
  READ extends ResultOk<any>,
  RELATED extends StateRelated = {}
> extends StateBase<READ, true, RELATED> {}

/**Checks if a variable is an instance of a state*/
export function state_is<STATE>(
  state: STATE
): STATE extends StateBase<infer READ, infer SYNC, infer RELATED>
  ? StateBase<READ, SYNC, RELATED>
  : undefined {
  return state instanceof StateBase ? (state as any) : (undefined as any);
}

/**Checks if a variable is an instance of a state with guarenteed ok result*/
export function state_ok_is<STATE>(
  state: STATE
): STATE extends StateBaseOk<infer READ, infer SYNC, infer RELATED>
  ? StateBaseOk<READ, SYNC, RELATED>
  : undefined {
  return state instanceof StateBaseSyncOk || state instanceof StateBaseOk
    ? (state as any)
    : (undefined as any);
}

/**Checks if a variable is an instance of a state with sync getting*/
export function state_sync_is<STATE>(
  state: STATE
): STATE extends StateBaseSync<infer READ, infer RELATED>
  ? StateBaseSync<READ, RELATED>
  : undefined {
  return state instanceof StateBaseSync ? (state as any) : (undefined as any);
}

/**Checks if a variable is an instance of a state with sync getting and guarenteed ok result*/
export function state_sync_ok_is<STATE>(
  state: STATE
): STATE extends StateBaseSyncOk<infer READ, infer RELATED>
  ? StateBaseSyncOk<READ, RELATED>
  : undefined {
  return state instanceof StateBaseSyncOk ? (state as any) : (undefined as any);
}
