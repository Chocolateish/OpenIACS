import { Err, ResultOk, type Result } from "@libResult";
import { StateBase } from "./stateBase";
import type {
  StateRead,
  StateReadBase,
  StateReadOk,
  StateSubscriberBase,
} from "./types";

/**The `StateDerived` class is used to create a state which is derived from other states. The derived state will update when any of the other states update.
 * @template INPUT - The type allowed for the input of the derive
 * @template OUTPUT - The type outputted by the derive*/
export class StateDerivedInternal<
  OUTPUT extends Result<any, string>,
  INPUT extends StateReadBase<any, SYNC>[],
  SYNC extends boolean
> extends StateBase<OUTPUT, SYNC> {
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param states - The other states to be used in the derived state.*/
  constructor(
    transform:
      | ((values: {
          [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, SYNC>
            ? READ
            : never;
        }) => OUTPUT)
      | false,
    ...states: INPUT
  ) {
    super();
    if (typeof transform === "function") this.getter = transform;
    this.#states = states;
  }

  #state: number = 0; //0 = not subscribed, 1 = buffer invalid subscribed, 2 = buffer valid
  #buffer: OUTPUT | undefined;
  #waiting: ((value: OUTPUT | PromiseLike<OUTPUT>) => void)[] = [];

  #states: INPUT;
  #stateBuffers: {
    [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, SYNC>
      ? READ
      : never;
  } = [] as any;
  #stateSubscribers: StateSubscriberBase<any>[] = [];

  protected getter(values: {
    [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, SYNC>
      ? READ
      : never;
  }): OUTPUT {
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
        this.#buffer = this.getter([value] as any);
        this.updateSubscribers(this.#buffer);
        this.#fulfillWaiting(this.#buffer);
      }, true);
    }
  }

  #disconnect() {
    for (let i = 0; i < this.#states.length; i++)
      this.#states[i].unsubscribe(this.#stateSubscribers[i]);
    this.#stateSubscribers = [];
    this.#stateBuffers = [] as any;
    this.#buffer = undefined;
    this.#state = 0;
  }

  #fulfillWaiting(value: OUTPUT) {
    for (let i = 0; i < this.#waiting.length; i++) this.#waiting[i](value);
    this.#waiting = [];
  }

  //Reader Context
  async then<TResult1 = OUTPUT>(
    func: (value: OUTPUT) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#buffer) return func(this.#buffer);
    switch (this.#state) {
      default:
      case 0:
        if (this.#states.length)
          return func(this.getter((await Promise.all(this.#states)) as any));
        else {
          //@ts-expect-error
          return func(Err({ reason: "No states registered", code: "INV" }));
        }
      case 1:
      case 3:
        return new Promise<OUTPUT>((a) => {
          this.#waiting.push(a);
        }).then(func);
      case 2:
        return func(this.#buffer!);
    }
  }

  get(): SYNC extends true ? OUTPUT : unknown {
    if (this.#buffer) return this.#buffer;
    return this.getter(this.#states.map((s) => s.get()) as any);
  }

  getOk(): SYNC extends true
    ? OUTPUT extends ResultOk<infer T>
      ? T
      : unknown
    : unknown {
    if (this.#buffer) return this.#buffer.unwrap;
    return this.getter(this.#states.map((s) => s.get()) as any).unwrap;
  }

  get readable(): StateReadBase<OUTPUT, SYNC, {}> {
    return this as StateReadBase<OUTPUT, SYNC, {}>;
  }

  //Owner

  /**The `setStates` method is used to update the states used by the `StateDerived` class.
   * @param states - The new states. This function should accept an array of states and return the derived state.*/
  setStates(...states: INPUT) {
    if (this.inUse()) {
      this.#disconnect();
      this.#states = [...states] as INPUT;
      this.#connect();
    } else this.#states = [...states] as INPUT;
  }

  /**The `setGetter` method is used to update the getter function used by the `StateDerived` class.
   * This function is used to compute the derived state based on the current states.
   * @param getter - The new getter function. This function should accept an array of states and return the derived state.*/
  setGetter(
    getter: (values: {
      [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, SYNC>
        ? READ
        : never;
    }) => OUTPUT
  ) {
    this.getter = getter;
    if (this.#state === 2) {
      this.#buffer = this.getter(this.#stateBuffers);
      this.updateSubscribers(this.#buffer);
      this.#fulfillWaiting(this.#buffer);
    }
  }
}

export interface StateDerived<
  OUTPUT,
  INPUT extends StateReadBase<any, any>[],
  SYNC extends boolean
> extends StateDerivedInternal<Result<OUTPUT, string>, INPUT, SYNC> {
  readonly readable: StateRead<OUTPUT, SYNC>;
  setStates(...states: INPUT): void;
  setGetter(
    getter: (values: {
      [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, SYNC>
        ? READ
        : never;
    }) => Result<OUTPUT, string>
  ): void;
}

export interface StateDerivedOk<
  OUTPUT,
  INPUT extends StateReadBase<any, any>[],
  SYNC extends boolean
> extends StateDerivedInternal<ResultOk<OUTPUT>, INPUT, SYNC> {
  readonly readable: StateReadOk<OUTPUT, SYNC>;
  setStates(...states: INPUT): void;
  setGetter(
    getter: (values: {
      [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, SYNC>
        ? READ
        : never;
    }) => ResultOk<OUTPUT>
  ): void;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_from_states<
  OUTPUT,
  INPUT extends [StateReadBase<any, any>, ...StateReadBase<any, any>[]]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, any>
          ? READ
          : never;
      }) => Result<OUTPUT, string>)
    | false,
  ...states: INPUT
) {
  return new StateDerivedInternal<Result<OUTPUT, string>, INPUT, any>(
    transform,
    ...states
  ) as StateDerived<OUTPUT, INPUT, any>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_ok_from_states<
  OUTPUT,
  INPUT extends [StateReadBase<any, any>, ...StateReadBase<any, any>[]]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, any>
          ? READ
          : never;
      }) => ResultOk<OUTPUT>)
    | false,
  ...states: INPUT
) {
  return new StateDerivedInternal<ResultOk<OUTPUT>, INPUT, any>(
    transform,
    ...states
  ) as StateDerivedOk<OUTPUT, INPUT, any>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_from_state_array<
  OUTPUT,
  INPUT extends StateReadBase<any, any>[]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, any>
          ? READ
          : never;
      }) => Result<OUTPUT, string>)
    | false,
  states: INPUT
) {
  return new StateDerivedInternal<Result<OUTPUT, string>, INPUT, any>(
    transform,
    ...states
  ) as StateDerived<OUTPUT, INPUT, any>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_ok_from_state_array<
  OUTPUT,
  INPUT extends StateReadBase<any, any>[]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, any>
          ? READ
          : never;
      }) => ResultOk<OUTPUT>)
    | false,
  states: INPUT
) {
  return new StateDerivedInternal<ResultOk<OUTPUT>, INPUT, any>(
    transform,
    ...states
  ) as StateDerivedOk<OUTPUT, INPUT, any>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_sync_from_states<
  OUTPUT,
  INPUT extends [StateReadBase<any, true>, ...StateReadBase<any, true>[]]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, true>
          ? READ
          : never;
      }) => Result<OUTPUT, string>)
    | false,
  ...states: INPUT
) {
  return new StateDerivedInternal<Result<OUTPUT, string>, INPUT, true>(
    transform,
    ...states
  ) as StateDerived<OUTPUT, INPUT, true>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_sync_ok_from_states<
  OUTPUT,
  INPUT extends [StateReadBase<any, true>, ...StateReadBase<any, true>[]]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, true>
          ? READ
          : never;
      }) => ResultOk<OUTPUT>)
    | false,
  ...states: INPUT
) {
  return new StateDerivedInternal<ResultOk<OUTPUT>, INPUT, true>(
    transform,
    ...states
  ) as StateDerivedOk<OUTPUT, INPUT, true>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_sync_from_state_array<
  OUTPUT,
  INPUT extends StateReadBase<any, true>[]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, true>
          ? READ
          : never;
      }) => Result<OUTPUT, string>)
    | false,
  states: INPUT
) {
  return new StateDerivedInternal<Result<OUTPUT, string>, INPUT, true>(
    transform,
    ...states
  ) as StateDerived<OUTPUT, INPUT, true>;
}

/**Creates a state which is derived from other states. The derived state will update when any of the other states update.
 * @param transform - Function to translate value of state or states to something else, false means first states values is used.
 * @param states - The other states to be used in the derived state.*/
export function state_derived_sync_ok_from_state_array<
  OUTPUT,
  INPUT extends StateReadBase<any, any>[]
>(
  transform:
    | ((values: {
        [I in keyof INPUT]: INPUT[I] extends StateReadBase<infer READ, true>
          ? READ
          : never;
      }) => ResultOk<OUTPUT>)
    | false,
  states: INPUT
) {
  return new StateDerivedInternal<ResultOk<OUTPUT>, INPUT, true>(
    transform,
    ...states
  ) as StateDerivedOk<OUTPUT, INPUT, true>;
}
