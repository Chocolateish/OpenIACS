import { Err, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import { type STATE, type STATE_RES } from "../types";
import type {
  STATE_COLLECTED_STATES,
  STATE_COLLECTED_SUBS,
  STATE_COLLECTED_TRANS_VAL,
  STATE_COLLECTED_TRANS_VAL_UNK,
} from "./shared";

//##################################################################################################################################################
//      _____  ______  _____
//     |  __ \|  ____|/ ____|
//     | |__) | |__  | (___
//     |  _  /|  __|  \___ \
//     | | \ \| |____ ____) |
//     |_|  \_\______|_____/
interface OWNER<RT, IN extends STATE_RES<any>[], WT> {
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  set_states(...states: STATE_COLLECTED_STATES<IN>): void;
  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  set_getter(
    getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>
  ): void;
  get state(): STATE<RT, WT, any>;
  get read_only(): STATE_RES<RT, any, WT>;
}
export type STATE_COLLECTED_RES<
  RT,
  IN extends STATE_RES<any>[],
  WT = any
> = STATE_RES<RT, any, WT> & OWNER<RT, IN, WT>;

export class RES<RT, IN extends STATE_RES<any>[], WT>
  extends STATE_BASE<RT, WT, any, Result<RT, string>>
  implements OWNER<RT, IN, WT>
{
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    transform:
      | ((values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>)
      | false,
    ...states: IN
  ) {
    super();
    if (transform) this.getter = transform;
    this.#states = states;
  }

  #buffer?: Result<RT, string>;

  #states: IN;
  #stateBuffers: STATE_COLLECTED_TRANS_VAL_UNK<IN> =
    [] as STATE_COLLECTED_TRANS_VAL_UNK<IN>;
  #stateSubscribers: STATE_COLLECTED_SUBS<IN>[] = [];

  protected getter(values: STATE_COLLECTED_TRANS_VAL<IN>): Result<RT, string> {
    return values[0];
  }

  /**Called when subscriber is added*/
  protected on_subscribe(first: boolean) {
    if (!first) return;
    if (!this.#states.length)
      return (this.#buffer = Err("No states registered"));
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
            this.update_subs(this.#buffer);
            calc = false;
          });
        }
      });
    }
    this.#buffer = this.getter(
      this.#stateBuffers as STATE_COLLECTED_TRANS_VAL<IN>
    );
    this.update_subs(this.#buffer);
  }

  /**Called when subscriber is removed*/
  protected on_unsubscribe(last: boolean) {
    if (!last) return;
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsub(this.#stateSubscribers[i] as any);
    this.#stateSubscribers = [];
    this.#stateBuffers = [] as STATE_COLLECTED_TRANS_VAL<IN>;
    this.#buffer = undefined;
  }

  //#Owner
  set_states(...states: STATE_COLLECTED_STATES<IN>) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.on_subscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }
  set_getter(
    getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>
  ) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.getter = getter;
      this.on_subscribe(true);
    } else this.getter = getter;
  }
  get state(): STATE<RT, WT, any> {
    return this as STATE<RT, WT, any>;
  }
  get read_only(): STATE_RES<RT, any, WT> {
    return this as STATE_RES<RT, any, WT>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): true {
    return true;
  }
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }
  get(): Result<RT, string> {
    if (this.#buffer) return this.#buffer;
    return this.#states.length
      ? this.getter(
          this.#states.map((s) => s.get()) as STATE_COLLECTED_TRANS_VAL<IN>
        )
      : Err("No states registered");
  }

  //#Writer Context
  get writable(): boolean {
    return false;
  }
  get wsync(): boolean {
    return false;
  }
}

/**Collected states, collects values from multiple states and reduces it to one */
export const state_collected_res = {
  /**Creates a state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends STATE_RES<any>[], WT = any>(
    transform:
      | ((values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>)
      | false,
    ...states: IN
  ) {
    return new RES<RT, IN, WT>(transform, ...states) as STATE_COLLECTED_RES<
      RT,
      IN,
      WT
    >;
  },
  class: RES,
};
