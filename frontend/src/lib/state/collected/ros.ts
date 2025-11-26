import { type ResultOk } from "@libResult";
import { STATE_BASE } from "../base";
import { type STATE, type STATE_ROS, type STATE_RXS } from "../types";
import type {
  STATE_COLLECTED_STATES,
  STATE_COLLECTED_SUBS,
  STATE_COLLECTED_TRANS_VAL,
  STATE_COLLECTED_TRANS_VAL_UNK,
} from "./shared";

interface OWNER<RT, IN extends [STATE_RXS<any>, ...STATE_RXS<any>[]]> {
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: STATE_COLLECTED_STATES<IN>): void;
  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(
    getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => ResultOk<RT>
  ): void;
  get state(): STATE<RT, any, any>;
  get readOnly(): STATE_ROS<RT, any>;
}

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/

export type STATE_COLLECTED_ROS<
  RT,
  IN extends [STATE_RXS<any>, ...STATE_RXS<any>[]]
> = STATE_ROS<RT, any> & OWNER<RT, IN>;

export class ROS<RT, IN extends [STATE_RXS<any>, ...STATE_RXS<any>[]]>
  extends STATE_BASE<RT, any, any, ResultOk<RT>>
  implements OWNER<RT, IN>
{
  constructor(
    transform:
      | ((values: STATE_COLLECTED_TRANS_VAL<IN>) => ResultOk<RT>)
      | false,
    ...states: IN
  ) {
    super();
    if (transform) this.getter = transform;
    this.#states = states;
  }

  #buffer?: ResultOk<RT>;

  #states: IN;
  #stateBuffers: STATE_COLLECTED_TRANS_VAL_UNK<IN> =
    [] as STATE_COLLECTED_TRANS_VAL_UNK<IN>;
  #stateSubscribers: STATE_COLLECTED_SUBS<IN>[] = [];

  protected getter(values: STATE_COLLECTED_TRANS_VAL<IN>): ResultOk<RT> {
    return values[0] as ResultOk<RT>;
  }

  /**Called when subscriber is added*/
  protected onSubscribe(first: boolean) {
    if (!first) return;
    let calc = false;
    for (let i = 0; i < this.#states.length; i++) {
      this.#stateBuffers[i] = this.#states[i].get();
      this.#stateSubscribers[i] = this.#states[i].sub((value) => {
        this.#stateBuffers[i] = value;
        if (!calc) {
          calc = true;
          Promise.resolve().then(() => {
            this.#buffer = this.getter(
              this.#stateBuffers as STATE_COLLECTED_TRANS_VAL<IN>
            );
            this.updateSubs(this.#buffer);
            calc = false;
          });
        }
      });
    }
    this.#buffer = this.getter(
      this.#stateBuffers as STATE_COLLECTED_TRANS_VAL<IN>
    );
    this.updateSubs(this.#buffer);
  }

  /**Called when subscriber is removed*/
  protected onUnsubscribe(last: boolean) {
    if (!last) return;
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsub(this.#stateSubscribers[i] as any);
    this.#stateSubscribers = [];
    this.#stateBuffers = [] as STATE_COLLECTED_TRANS_VAL<IN>;
    this.#buffer = undefined;
  }

  //#Owner
  setStates(...states: STATE_COLLECTED_STATES<IN>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.onSubscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }
  setGetter(getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => ResultOk<RT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.getter = getter;
      this.onSubscribe(true);
    } else this.getter = getter;
  }
  get state(): STATE<RT, any, any> {
    return this as STATE<RT, any, any>;
  }
  get readOnly(): STATE_ROS<RT, any> {
    return this as STATE_ROS<RT, any>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }
  get(): ResultOk<RT> {
    if (this.#buffer) return this.#buffer;
    return this.getter(
      this.#states.map((s) => s.get()) as STATE_COLLECTED_TRANS_VAL<IN>
    );
  }
  getOk(): RT {
    return this.get().value;
  }

  //#Writer Context
  get writable(): boolean {
    return false;
  }
  get wsync(): boolean {
    return false;
  }
}

export const state_collected_ros = {
  /**Creates a guarenteed ok state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends [STATE_RXS<any>, ...STATE_RXS<any>[]]>(
    transform:
      | ((values: STATE_COLLECTED_TRANS_VAL<IN>) => ResultOk<RT>)
      | false,
    ...states: IN
  ) {
    return new ROS<RT, IN>(transform, ...states) as STATE_COLLECTED_ROS<RT, IN>;
  },
  class: ROS,
};
