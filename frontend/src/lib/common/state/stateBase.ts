import { None, type Option } from "@result";
import {
  type StateRead,
  type StateRelated,
  type StateResult,
  type StateSubscriber,
} from "./types";

export abstract class StateBase<R, L extends StateRelated = {}>
  implements StateRead<R, L>
{
  protected subscribers: Set<StateSubscriber<R>> = new Set();

  //Reader Context
  abstract then<TResult1 = R>(
    func: (value: StateResult<R>) => TResult1 | PromiseLike<TResult1>
  ): TResult1 | PromiseLike<TResult1>;

  subscribe<B extends StateSubscriber<R>>(func: B, update?: boolean): B {
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

  unsubscribe<B extends StateSubscriber<R>>(func: B): B {
    if (this.subscribers.delete(func)) {
      this.onUnsubscribe(this.subscribers.size == 0);
      this.subOnUnsubscribe(this.subscribers.size == 0);
    } else console.warn("Subscriber not found with state", this, func);
    return func;
  }

  related(): Option<L> {
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
  hasSubscriber(subscriber: StateSubscriber<R>): boolean {
    return this.subscribers.has(subscriber);
  }

  /**Updates all subscribers with a value */
  protected updateSubscribers(value: StateResult<R>): void {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(value);
      } catch (e) {
        console.warn("Failed while calling subscribers ", e, this, subscriber);
      }
    }
  }
}

/**Checks if a variable is an instance of a state*/
export const instanceOfState = (state: any) => {
  return state instanceof StateBase;
};
