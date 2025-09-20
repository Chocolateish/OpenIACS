import { Err } from "@result";
import { StateBase } from "./stateBase";
import type { StateRead, StateResult, StateSubscriber } from "./types";

type StateReadArray<T extends any[]> = {
  [K in keyof T]: StateRead<T[K]>;
};
type StateResultArray<T extends any[]> = {
  [K in keyof T]: StateResult<T[K]>;
};
type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

/**The `StateDerived` class is used to create a state which is derived from other states. The derived state will update when any of the other states update.*/
export class StateDerived<I extends any[], O = I[0]>
  extends StateBase<O>
  implements StateRead<O>
{
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param state - The first state to be used in the derived state. If this is a function, it will be used as the getter function.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    readTransform: (value: StateResultArray<I>) => StateResult<O>,
    ...states: StateReadArray<I>
  );
  constructor(...states: StateReadArray<I>);
  constructor(
    state?: StateRead<I[0]> | ((value: StateResultArray<I>) => StateResult<O>),
    ...states: Tail<StateReadArray<I>>
  ) {
    super();
    if (typeof state === "function") {
      this.getter = state;
      this.#states = states as any;
    } else this.#states = [...arguments] as any;
  }

  #state: number = 0; //0 = not subscribed, 1 = buffer invalid subscribed, 2 = buffer valid
  #buffer: StateResult<O> | undefined;
  #waiting: ((value: StateResult<O> | PromiseLike<StateResult<O>>) => void)[] =
    [];

  #states: StateReadArray<I>;
  #stateBuffers: StateResultArray<I> = [] as StateResultArray<I>;
  #stateSubscribers: StateSubscriber<I>[] = [];

  protected getter(values: StateResultArray<I>): StateResult<O> {
    return values[0] as any;
  }

  /**Called when subscriber is added*/
  protected subOnSubscribe(_first: boolean) {
    if (_first) this.#connect();
  }

  /**Called when subscriber is removed*/
  protected subOnUnsubscribe(_last: boolean) {
    if (_last) this.#disconnect();
  }

  async #calculate(first: boolean) {
    this.#state = 3;
    await Promise.resolve();
    this.#buffer = this.getter(this.#stateBuffers);
    if (!first) this.updateSubscribers(this.#buffer);
    this.#fulfillWaiting(this.#buffer);
    this.#state = 2;
  }

  #connect() {
    if (this.#states.length > 1) {
      this.#state = 1;
      let count = this.#states.length;
      for (let i = 0; i < this.#states.length; i++) {
        this.#stateSubscribers[i] = this.#states[i].subscribe((value) => {
          if (this.#state === 2) {
            this.#stateBuffers[i] = value;
            this.#calculate(false);
          } else if (this.#state === 1 && !this.#stateBuffers[i]) {
            this.#stateBuffers[i] = value;
            count--;
            if (count === 0) {
              this.#state = 2;
              this.#calculate(true);
            }
          } else this.#stateBuffers[i] = value;
        }, true);
      }
    } else if (this.#states.length === 1) {
      this.#state = 1;
      this.#stateSubscribers[0] = this.#states[0].subscribe((value) => {
        this.#state = 2;
        this.#buffer = this.getter([value] as StateResultArray<I>);
        this.updateSubscribers(this.#buffer);
        this.#fulfillWaiting(this.#buffer);
      }, true);
    }
  }

  #disconnect() {
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsubscribe(this.#stateSubscribers[i]);
    this.#stateSubscribers = [];
    this.#stateBuffers = [] as StateResultArray<I>;
    this.#buffer = undefined;
    this.#state = 0;
  }

  #fulfillWaiting(value: StateResult<O>) {
    for (let i = 0; i < this.#waiting.length; i++) this.#waiting[i](value);
    this.#waiting = [];
  }

  //Reader Context
  async then<TResult1 = O>(
    func: (value: StateResult<O>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#buffer) return func(this.#buffer);
    switch (this.#state) {
      default:
      case 0:
        if (this.#states.length)
          return func(this.getter(await Promise.all(this.#states)));
        else return func(Err({ reason: "No states registered", code: "INV" }));
      case 1:
      case 3:
        return new Promise<StateResult<O>>((a) => {
          this.#waiting.push(a);
        }).then(func);
      case 2:
        return func(this.#buffer!);
    }
  }

  //Owner

  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: StateReadArray<I>) {
    if (this.subscribers.size) {
      this.#disconnect();
      this.#states = [...states] as StateReadArray<I>;
      this.#connect();
    } else this.#states = [...states] as StateReadArray<I>;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: (value: StateResultArray<I>) => StateResult<O>) {
    this.getter = getter;
    if (this.#state === 2) {
      this.#buffer = this.getter(this.#stateBuffers);
      this.updateSubscribers(this.#buffer);
      this.#fulfillWaiting(this.#buffer);
    }
  }
}
