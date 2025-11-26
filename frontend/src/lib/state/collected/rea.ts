import { Err, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import { type STATE, type STATE_REA } from "../types";
import type {
  STATE_COLLECTED_STATES,
  STATE_COLLECTED_SUBS,
  STATE_COLLECTED_TRANS_VAL,
  STATE_COLLECTED_TRANS_VAL_UNK,
} from "./shared";

interface OWNER<RT, IN extends STATE<any>[]> {
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: STATE_COLLECTED_STATES<IN>): void;
  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(
    getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>
  ): void;
  get state(): STATE<RT, any, any>;
  get readOnly(): STATE_REA<RT, any>;
}

//##################################################################################################################################################
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\

export type STATE_COLLECTED_REA<RT, IN extends STATE<any>[]> = STATE_REA<
  RT,
  any
> &
  OWNER<RT, IN>;

export class REA<RT, IN extends STATE<any>[]>
  extends STATE_BASE<RT, any, any, Result<RT, string>>
  implements OWNER<RT, IN>
{
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
  protected onSubscribe(first: boolean) {
    if (!first) return;
    if (!this.#states.length)
      return (this.#buffer = Err("No states registered"));
    this.#stateBuffers.length = this.#states.length;
    let count = 0;
    let amount = this.#states.length - 1;
    Promise.all(this.#states).then((vals) => {
      for (let i = 0; i < this.#stateBuffers.length; i++)
        this.#stateBuffers[i] = this.#stateBuffers[i] ?? vals[i];
      this.#buffer = this.getter(
        this.#stateBuffers as STATE_COLLECTED_TRANS_VAL<IN>
      );
      this.fulRProm(this.#buffer);
      count = amount;
    });
    let calc = false;
    for (let i = 0; i < this.#states.length; i++) {
      this.#stateSubscribers[i] = this.#states[i].sub((value) => {
        if (count < amount) {
          if (!this.#stateBuffers[i]) count++;
          this.#stateBuffers[i] = value;
          return;
        }
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

  //#Owner Context
  setStates(...states: STATE_COLLECTED_STATES<IN>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.onSubscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }
  setGetter(
    getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.getter = getter;
      this.onSubscribe(true);
    } else this.getter = getter;
  }
  get state(): STATE<RT, any, any> {
    return this as STATE<RT, any, any>;
  }
  get readOnly(): STATE_REA<RT, any> {
    return this as STATE_REA<RT, any>;
  }

  //#Reader Context
  get rok(): false {
    return false;
  }
  get rsync(): false {
    return false;
  }
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    if (!this.#stateBuffers.length)
      return func(
        this.getter(
          (await Promise.all(this.#states)) as STATE_COLLECTED_TRANS_VAL<IN>
        )
      );
    return this.appendRProm(func);
  }

  //#Writer Context
  get writable(): boolean {
    return false;
  }
  get wsync(): boolean {
    return false;
  }
}

export const state_collected_rea = {
  /**Creates a state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends STATE<any>[]>(
    transform:
      | ((values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>)
      | false,
    ...states: IN
  ) {
    return new REA<RT, IN>(transform, ...states) as STATE_COLLECTED_REA<RT, IN>;
  },
  class: REA,
};
