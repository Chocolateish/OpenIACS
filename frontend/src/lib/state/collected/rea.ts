import { Err, None, OptionNone, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import { type STATE, type STATE_REA } from "../types";
import type {
  STATE_COLLECTED_STATES,
  STATE_COLLECTED_SUBS,
  STATE_COLLECTED_TRANS_VAL,
  STATE_COLLECTED_TRANS_VAL_UNK,
} from "./shared";

//##################################################################################################################################################
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\
interface OWNER<RT, IN extends STATE<any>[], WT> {
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
  get read_only(): STATE_REA<RT, any, WT>;
}

export type STATE_COLLECTED_REA<
  RT,
  IN extends STATE<any>[],
  WT = any
> = STATE_REA<RT, OptionNone, WT> & OWNER<RT, IN, WT>;

export class REA<RT, IN extends STATE<any>[], WT>
  extends STATE_BASE<RT, WT, OptionNone, Result<RT, string>>
  implements OWNER<RT, IN, WT>
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
  protected on_subscribe() {
    if (!this.#states.length)
      return (this.#buffer = Err("No states registered"));
    this.#stateBuffers.length = this.#states.length;
    //Creates a new scope to hold count and amount variables
    {
      let count = 0;
      const amount = this.#states.length - 1;
      Promise.all(this.#states).then((vals) => {
        for (let i = 0; i < this.#stateBuffers.length; i++)
          this.#stateBuffers[i] = this.#stateBuffers[i] ?? vals[i];
        this.#buffer = this.getter(
          this.#stateBuffers as STATE_COLLECTED_TRANS_VAL<IN>
        );
        this.ful_R_prom(this.#buffer);
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
              this.update_subs(this.#buffer);
              calc = false;
            });
          }
        });
      }
    }
  }

  /**Called when subscriber is removed*/
  protected on_unsubscribe() {
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsub(this.#stateSubscribers[i] as any);
    this.#stateSubscribers = [];
    this.#stateBuffers = [] as STATE_COLLECTED_TRANS_VAL<IN>;
    this.#buffer = undefined;
  }

  //#Owner Context
  set_states(...states: STATE_COLLECTED_STATES<IN>) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.#states = [...states] as unknown as IN;
      this.on_subscribe();
    } else this.#states = [...states] as unknown as IN;
  }
  set_getter(
    getter: (values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>
  ) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.getter = getter;
      this.on_subscribe();
    } else this.getter = getter;
  }
  get state(): STATE<RT, WT, any> {
    return this as STATE<RT, WT, any>;
  }
  get read_only(): STATE_REA<RT, any, WT> {
    return this as STATE_REA<RT, any, WT>;
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
    return this.append_R_prom(func);
  }
  related(): OptionNone {
    return None();
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
  from<RT, IN extends STATE<any>[], WT = any>(
    transform:
      | ((values: STATE_COLLECTED_TRANS_VAL<IN>) => Result<RT, string>)
      | false,
    ...states: IN
  ) {
    return new REA<RT, IN, WT>(transform, ...states) as STATE_COLLECTED_REA<
      RT,
      IN,
      WT
    >;
  },
  class: REA,
};
