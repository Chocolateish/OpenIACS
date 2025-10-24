import { None, type Option } from "@libResult";
import {
  type StateReadBase,
  type StateRelated,
  type StateResult,
  type StateSubscriberBase,
} from "./types";

/** Represents a writable state object with subscription and related utilities.
 * @template READ - The type of the state’s value when read.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template OK - Indicates if state can have erroneous values (true = no errors).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export abstract class StateBase<
  READ extends StateResult<any>,
  SYNC extends boolean,
  RELATED extends StateRelated = {}
> implements StateReadBase<READ, SYNC, RELATED>
{
  protected subscribers: Set<StateSubscriberBase<READ>> = new Set();

  //Reader Context
  abstract then<TResult1 = READ>(
    func: (value: READ) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;

  subscribe<B extends StateSubscriberBase<READ>>(func: B, update?: boolean): B {
    if (this.subscribers.has(func)) {
      console.warn("Function already registered as subscriber");
      return func;
    }
    this.onSubscribe(this.subscribers.size == 0);
    this.subOnSubscribe(this.subscribers.size == 0);
    this.subscribers.add(func);
    if (update) this.then(func);
    return func;
  }

  unsubscribe<B extends StateSubscriberBase<READ>>(func: B): B {
    if (this.subscribers.delete(func)) {
      this.onUnsubscribe(this.subscribers.size == 0);
      this.subOnUnsubscribe(this.subscribers.size == 0);
    } else console.warn("Subscriber not found with state", this, func);
    return func;
  }

  abstract get(): SYNC extends true ? READ : unknown;

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
  inUse(): boolean {
    return Boolean(this.subscribers.size);
  }

  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: StateSubscriberBase<READ>): boolean {
    return this.subscribers.has(subscriber);
  }

  /**Updates all subscribers with a value */
  protected updateSubscribers(value: READ): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(value);
      } catch (e) {
        console.warn("Failed while calling subscribers ", e, this, subscriber);
      }
    }
  }

  //Type
  get readable() {
    return this as StateReadBase<READ, SYNC, RELATED>;
  }
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
  return state instanceof StateBase;
};
