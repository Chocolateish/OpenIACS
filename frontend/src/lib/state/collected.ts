import { Err, Ok, type Result, type ResultOk } from "@libResult";
import {
  STATE_REA,
  STATE_RES,
  STATE_ROA,
  STATE_ROS,
  type STATE_REX,
  type STATE_ROX,
  type STATE_RXS,
  type STATE_RXX,
  type STATE_SUB,
  type STATE_SUB_OK,
} from "./types";

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/

type TRANS_VAL<IN extends STATE_RXX<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROX<infer RT>
    ? ResultOk<RT>
    : IN[I] extends STATE_REX<infer RT>
    ? Result<RT, string>
    : never;
};

type TRANS_VAL_UNK<IN extends STATE_RXX<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROX<infer RT>
    ? ResultOk<RT>
    : IN[I] extends STATE_REX<infer RT>
    ? Result<RT, string>
    : unknown;
};

type SUBS<IN extends STATE_RXX<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROX<infer RT>
    ? STATE_SUB_OK<RT>
    : IN[I] extends STATE_REX<infer RT>
    ? STATE_SUB<RT>
    : never;
};

type STATES<IN extends STATE_RXX<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROX<infer RT>
    ? STATE_ROX<RT>
    : IN[I] extends STATE_REX<infer RT>
    ? STATE_REX<RT>
    : never;
};

export class STATE_COLLECTED_REA<
  RT,
  IN extends STATE_RXX<any>[]
> extends STATE_REA<RT> {
  constructor(
    transform: ((values: TRANS_VAL<IN>) => Result<RT, string>) | false,
    ...states: IN
  ) {
    super();
    if (transform) this.getter = transform;
    this.#states = states;
  }

  #state: 0 | 1 | 2 | 3 = 0; //0 = not subscribed, 1 = buffer invalid subscribed, 2 = buffer valid, 3 = calculating
  #buffer?: Result<RT, string>;

  #states: IN;
  #stateBuffers: TRANS_VAL_UNK<IN> = [] as TRANS_VAL_UNK<IN>;
  #stateSubscribers: SUBS<IN>[] = [];

  protected getter(values: TRANS_VAL<IN>): Result<RT, string> {
    return values[0];
  }

  /**Called when subscriber is added*/
  protected onSubscribe(first: boolean) {
    if (first) {
      if (this.#states.length > 1) {
        this.#state = 1;
        let count = this.#states.length;
        for (let i = 0; i < this.#states.length; i++) {
          this.#stateSubscribers[i] = this.#states[i].sub((value) => {
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
        this.#stateSubscribers[0] = this.#states[0].sub((value) => {
          this.#state = 2;
          this.#buffer = this.getter([value] as TRANS_VAL<IN>);
          this.updateSubscribers(this.#buffer);
          this.fulRProm(this.#buffer);
        }, true);
      } else {
        this.#state = 2;
        this.#buffer = Err("No states registered");
        this.updateSubscribers(this.#buffer);
        this.fulRProm(this.#buffer);
      }
    }
  }

  /**Called when subscriber is removed*/
  protected onUnsubscribe(last: boolean) {
    if (last) {
      for (let i = 0; i < this.#states.length; i++)
        this.#states[i].unsub(this.#stateSubscribers[i] as any);
      this.#stateSubscribers = [];
      this.#stateBuffers = [] as TRANS_VAL<IN>;
      this.#buffer = undefined;
      this.#state = 0;
    }
  }

  async #calculate(first: boolean) {
    this.#state = 3;
    await Promise.resolve();
    this.#buffer = this.getter(this.#stateBuffers as TRANS_VAL<IN>);
    if (!first) this.updateSubscribers(this.#buffer);
    this.fulRProm(this.#buffer);
    this.#state = 2;
  }

  //Reader Context
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    switch (this.#state) {
      case 0:
        return func(
          this.#states.length
            ? this.getter((await Promise.all(this.#states)) as TRANS_VAL<IN>)
            : Err("No states registered")
        );
      case 1:
      case 3:
        return this.appendRProm(func);
      case 2:
        return func(this.#buffer!);
    }
  }

  //Owner
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: STATES<IN>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.onSubscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: (values: TRANS_VAL<IN>) => Result<RT, string>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.getter = getter;
      this.onSubscribe(true);
    } else this.getter = getter;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################

export class STATE_COLLECTED_ROA<
  RT,
  IN extends [STATE_RXX<any>, ...STATE_RXX<any>[]]
> extends STATE_ROA<RT> {
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    transform: ((values: TRANS_VAL<IN>) => ResultOk<RT>) | false,
    ...states: IN
  ) {
    super();
    if (transform) this.getter = transform;
    this.#states = states;
  }

  #state: 0 | 1 | 2 | 3 = 0; //0 = not subscribed, 1 = buffer invalid subscribed, 2 = buffer valid, 3 = calculating
  #buffer?: ResultOk<RT>;

  #states: IN;
  #stateBuffers: TRANS_VAL_UNK<IN> = [] as TRANS_VAL_UNK<IN>;
  #stateSubscribers: SUBS<IN>[] = [];

  protected getter(values: TRANS_VAL<IN>): ResultOk<RT> {
    return values[0];
  }

  /**Called when subscriber is added*/
  protected onSubscribe(first: boolean) {
    if (first) {
      if (this.#states.length > 1) {
        this.#state = 1;
        let count = this.#states.length;
        for (let i = 0; i < this.#states.length; i++) {
          this.#stateSubscribers[i] = this.#states[i].sub((value) => {
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
        this.#stateSubscribers[0] = this.#states[0].sub((value) => {
          this.#state = 2;
          this.#buffer = this.getter([value] as TRANS_VAL<IN>);
          this.updateSubscribers(this.#buffer);
          this.fulRProm(this.#buffer);
        }, true);
      }
    }
  }

  /**Called when subscriber is removed*/
  protected onUnsubscribe(last: boolean) {
    if (last) {
      for (let i = 0; i < this.#states.length; i++)
        this.#states[i].unsub(this.#stateSubscribers[i] as any);
      this.#stateSubscribers = [];
      this.#stateBuffers = [] as TRANS_VAL<IN>;
      this.#buffer = undefined;
      this.#state = 0;
    }
  }

  async #calculate(first: boolean) {
    this.#state = 3;
    await Promise.resolve();
    this.#buffer = this.getter(this.#stateBuffers as TRANS_VAL<IN>);
    if (!first) this.updateSubscribers(this.#buffer);
    this.fulRProm(this.#buffer);
    this.#state = 2;
  }

  //Reader Context
  async then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    switch (this.#state) {
      case 0:
        return func(
          this.getter((await Promise.all(this.#states)) as TRANS_VAL<IN>)
        );
      case 1:
      case 3:
        return this.appendRProm(func);
      case 2:
        return func(this.#buffer!);
    }
  }

  //Owner
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: STATES<IN>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.onSubscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: (values: TRANS_VAL<IN>) => ResultOk<RT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.getter = getter;
      this.onSubscribe(true);
    } else this.getter = getter;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_COLLECTED_RES<
  RT,
  IN extends STATE_RXS<any>[]
> extends STATE_RES<RT> {
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    transform: ((values: TRANS_VAL<IN>) => Result<RT, string>) | false,
    ...states: IN
  ) {
    super();
    if (transform) this.getter = transform;
    this.#states = states;
  }

  #buffer?: Result<RT, string>;

  #states: IN;
  #stateBuffers: TRANS_VAL_UNK<IN> = [] as TRANS_VAL_UNK<IN>;
  #stateSubscribers: SUBS<IN>[] = [];

  protected getter(values: TRANS_VAL<IN>): Result<RT, string> {
    return values[0];
  }

  /**Called when subscriber is added*/
  protected onSubscribe(first: boolean) {
    if (first) {
      if (this.#states.length > 1) {
        let calc = false;
        for (let i = 0; i < this.#states.length; i++) {
          this.#stateBuffers[i] = this.#states[i].get();
          this.#stateSubscribers[i] = this.#states[i].sub((value) => {
            this.#stateBuffers[i] = value;
            if (!calc) {
              calc = true;
              Promise.resolve().then(() => {
                this.#buffer = this.getter(this.#stateBuffers as TRANS_VAL<IN>);
                if (!first) this.updateSubscribers(this.#buffer);
                calc = false;
              });
            }
          }, false);
        }
        this.#buffer = this.getter(this.#stateBuffers as TRANS_VAL<IN>);
        this.updateSubscribers(this.#buffer);
      } else if (this.#states.length === 1) {
        this.#buffer = this.get();
        this.updateSubscribers(this.#buffer);
        this.#stateSubscribers[0] = this.#states[0].sub((value) => {
          this.#buffer = this.getter([value] as TRANS_VAL<IN>);
          this.updateSubscribers(this.#buffer);
        }, false);
      } else {
        this.#buffer = Err("No states registered");
        this.updateSubscribers(this.#buffer);
      }
    }
  }

  /**Called when subscriber is removed*/
  protected onUnsubscribe(last: boolean) {
    if (last) {
      for (let i = 0; i < this.#states.length; i++)
        this.#states[i].unsub(this.#stateSubscribers[i] as any);
      this.#stateSubscribers = [];
      this.#stateBuffers = [] as TRANS_VAL<IN>;
      this.#buffer = undefined;
    }
  }

  //Reader Context
  async then<T = Result<RT, string>>(
    func: (value: Result<RT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return await func(this.get());
  }

  get(): Result<RT, string> {
    if (this.#buffer) return this.#buffer;
    return this.#states.length
      ? this.getter(this.#states.map((s) => s.get()) as TRANS_VAL<IN>)
      : Err("No states registered");
  }

  //Owner
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: STATES<IN>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.onSubscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: (values: TRANS_VAL<IN>) => Result<RT, string>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.getter = getter;
      this.onSubscribe(true);
    } else this.getter = getter;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_COLLECTED_ROS<
  RT,
  IN extends [STATE_RXS<any>, ...STATE_RXS<any>[]]
> extends STATE_ROS<RT> {
  constructor(
    transform: ((values: TRANS_VAL<IN>) => ResultOk<RT>) | false,
    ...states: IN
  ) {
    super();
    if (transform) this.getter = transform;
    this.#states = states;
  }

  #buffer?: ResultOk<RT>;

  #states: IN;
  #stateBuffers: TRANS_VAL_UNK<IN> = [] as TRANS_VAL_UNK<IN>;
  #stateSubscribers: SUBS<IN>[] = [];

  protected getter(values: TRANS_VAL<IN>): ResultOk<RT> {
    return values[0];
  }

  /**Called when subscriber is added*/
  protected onSubscribe(first: boolean) {
    if (first) {
      if (this.#states.length > 1) {
        let calc = false;
        for (let i = 0; i < this.#states.length; i++) {
          this.#stateBuffers[i] = this.#states[i].get();
          this.#stateSubscribers[i] = this.#states[i].sub((value) => {
            this.#stateBuffers[i] = value;
            if (!calc) {
              calc = true;
              Promise.resolve().then(() => {
                this.#buffer = this.getter(this.#stateBuffers as TRANS_VAL<IN>);
                if (!first) this.updateSubscribers(this.#buffer);
                calc = false;
              });
            }
          }, false);
        }
        this.#buffer = this.getter(this.#stateBuffers as TRANS_VAL<IN>);
        this.updateSubscribers(this.#buffer);
      } else if (this.#states.length === 1) {
        this.#buffer = this.get();
        this.updateSubscribers(this.#buffer);
        this.#stateSubscribers[0] = this.#states[0].sub((value) => {
          this.#buffer = this.getter([value] as TRANS_VAL<IN>);
          this.updateSubscribers(this.#buffer);
        });
      }
    }
  }

  /**Called when subscriber is removed*/
  protected onUnsubscribe(last: boolean) {
    if (last) {
      for (let i = 0; i < this.#states.length; i++)
        this.#states[i].unsub(this.#stateSubscribers[i] as any);
      this.#stateSubscribers = [];
      this.#stateBuffers = [] as TRANS_VAL<IN>;
      this.#buffer = undefined;
    }
  }

  //Reader Context
  async then<T = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return await func(this.get());
  }

  get(): ResultOk<RT> {
    if (this.#buffer) return this.#buffer;
    return this.getter(this.#states.map((s) => s.get()) as TRANS_VAL<IN>);
  }

  getOk(): RT {
    return this.get().value;
  }

  //Owner
  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: STATES<IN>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#states = [...states] as unknown as IN;
      this.onSubscribe(true);
    } else this.#states = [...states] as unknown as IN;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(getter: (values: TRANS_VAL<IN>) => ResultOk<RT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.getter = getter;
      this.onSubscribe(true);
    } else this.getter = getter;
  }
}

//##################################################################################################################################################
//      _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//       | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//       | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\

const rea = {
  /**Creates a state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends STATE_RXX<any>[]>(
    transform: ((values: TRANS_VAL<IN>) => Result<RT, string>) | false,
    ...states: IN
  ) {
    return new STATE_COLLECTED_REA<RT, IN>(transform, ...states);
  },
  class: STATE_COLLECTED_REA,
};
const roa = {
  /**Creates a guarenteed ok state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends [STATE_RXX<any>, ...STATE_RXX<any>[]]>(
    transform: ((values: TRANS_VAL<IN>) => ResultOk<RT>) | false,
    ...states: IN
  ) {
    return new STATE_COLLECTED_ROA<RT, IN>(transform, ...states);
  },
  class: STATE_COLLECTED_ROA,
};
const res = {
  /**Creates a state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends STATE_RXS<any>[]>(
    transform: ((values: TRANS_VAL<IN>) => Result<RT, string>) | false,
    ...states: IN
  ) {
    return new STATE_COLLECTED_RES<RT, IN>(transform, ...states);
  },
  class: STATE_COLLECTED_RES,
};
const ros = {
  /**Creates a guarenteed ok state that collects multiple states values and reduces it to one.
   * @param transform - Function to translate value of collected states, false means first states values is used.
   * @param states - The states to collect.*/
  from<RT, IN extends [STATE_RXS<any>, ...STATE_RXS<any>[]]>(
    transform: ((values: TRANS_VAL<IN>) => ResultOk<RT>) | false,
    ...states: IN
  ) {
    return new STATE_COLLECTED_ROS<RT, IN>(transform, ...states);
  },
  class: STATE_COLLECTED_ROS,
};

//##################################################################################################################################################
//       _____ ____  _      _      ______ _____ _______ _____
//      / ____/ __ \| |    | |    |  ____/ ____|__   __/ ____|
//     | |   | |  | | |    | |    | |__ | |       | | | (___
//     | |   | |  | | |    | |    |  __|| |       | |  \___ \
//     | |___| |__| | |____| |____| |___| |____   | |  ____) |
//      \_____\____/|______|______|______\_____|  |_| |_____/

//      _   _ _    _ __  __ ____  ______ _____     _____ _    _ __  __
//     | \ | | |  | |  \/  |  _ \|  ____|  __ \   / ____| |  | |  \/  |
//     |  \| | |  | | \  / | |_) | |__  | |__) | | (___ | |  | | \  / |
//     | . ` | |  | | |\/| |  _ <|  __| |  _  /   \___ \| |  | | |\/| |
//     | |\  | |__| | |  | | |_) | |____| | \ \   ____) | |__| | |  | |
//     |_| \_|\____/|_|  |_|____/|______|_|  \_\ |_____/ \____/|_|  |_|
class NUMBER_SUM_REA<S extends STATE_RXX<number>[]> extends STATE_COLLECTED_REA<
  number,
  S
> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: Result<number, string>[]): Result<number, string> {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }
}
//##################################################################################################################################################
class NUMBER_SUM_ROA<
  S extends [STATE_ROX<number>, ...STATE_ROX<number>[]]
> extends STATE_COLLECTED_ROA<number, S> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return Ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}
//##################################################################################################################################################
class NUMBER_SUM_RES<S extends STATE_RXS<number>[]> extends STATE_COLLECTED_RES<
  number,
  S
> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: Result<number, string>[]): Result<number, string> {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }
}
//##################################################################################################################################################
class NUMBER_SUM_ROS<
  S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]
> extends STATE_COLLECTED_ROS<number, S> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return Ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

const number = {
  sum: {
    rea<S extends STATE_RXX<number>[]>(...states: S) {
      return new NUMBER_SUM_REA(...states);
    },
    roa<S extends [STATE_ROX<number>, ...STATE_ROX<number>[]]>(...states: S) {
      return new NUMBER_SUM_ROA(...states);
    },
    res<S extends STATE_RXS<number>[]>(...states: S) {
      return new NUMBER_SUM_RES(...states);
    },
    ros<S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]>(...states: S) {
      return new NUMBER_SUM_ROS(...states);
    },
  },
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/
/**Collected stats, collects values from multiple states and reduces it to one */
export const state_collected = {
  rea,
  roa,
  res,
  ros,
  number,
};
