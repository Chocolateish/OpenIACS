import { None, Ok, type Option, ResultOk, Some } from "@libResult";
import { StateBase } from "./stateBase";
import {
  type StateHelper,
  type StateRelated,
  type StateResult,
  type StateWriteBase,
} from "./types";

/** Represents a writable state object with subscription and related utilities.
 * @template READ - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template RELATED - The type of related states, defaults to an empty object.*/
class StateInternal<
    READ extends StateResult<any>,
    WRITE,
    RELATED extends StateRelated = {}
  >
  extends StateBase<READ, true, RELATED>
  implements StateWriteBase<READ, true, RELATED, WRITE>
{
  /**Creates a state which holds a value
   * @param init initial value for state, use a function returning a value for a lazy value (does not call function until the state is first used)
   * @param setter function called when state value is set via setter, set true let write set it's value
   * @param helper functions to check and limit the value, and to return related states */
  constructor(
    init: READ | (() => READ),
    setter?: ((value: WRITE) => Option<READ>) | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) =>
              this.#helper?.limit
                ? this.#helper
                    .limit(value)
                    .map<READ>((val) => Ok(val as any as READ) as any)
                : Some(Ok(value as any as READ) as any)
          : setter;
    if (helper) this.#helper = helper;
    if (typeof init === "function") {
      let clean = () => {
        //@ts-expect-error
        delete this.then;
        //@ts-expect-error
        delete this.get;
        //@ts-expect-error
        delete this.write;
        return (this.#value = init());
      };
      this.then = async <TResult1 = READ>(
        func: (value: READ) => TResult1 | PromiseLike<TResult1>
      ): Promise<TResult1> => {
        return func(clean());
      };
      this.get = () => {
        return clean() as any;
      };
      this.write = (value) => {
        clean();
        this.write(value);
      };
    } else {
      this.#value = init;
    }
  }

  #value?: READ;
  #setter?: (value: WRITE) => Option<READ>;
  #helper?: StateHelper<WRITE, RELATED>;

  //Reader Context
  async then<TResult1 = READ>(
    func: (value: READ) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }

  get(): READ {
    return this.#value!;
  }

  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  //Writer Context
  /**Requests a change of value from the state */
  write(value: WRITE): void {
    if (this.#setter && (!this.#value!.ok || this.#value?.value !== value))
      this.#setter(value).map(this.set.bind(this));
  }

  /**Checks the value against the limit set by the helper, returns a reason for value being unvalid or none if it is valid*/
  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }

  /**Limits the value to the limit set by the helper, if no limiter is set, the value is returned as is*/
  limit(value: WRITE): Option<WRITE> {
    return this.#helper?.limit ? this.#helper.limit(value) : Some(value);
  }

  get writeable(): StateWriteBase<READ, true, RELATED, WRITE> {
    return this;
  }

  //Owner Context
  /**Sets the value of the state */
  set(value: READ) {
    this.#value = value;
    this.updateSubscribers(value);
  }
}

/** Represents a readable/writable state object with subscription and related utilities.
 * @template READ - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.
 * @template WRITE - The type which can be written to the state.*/
export type State<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
> = StateInternal<StateResult<READ>, WRITE, RELATED>;

/** Represents a readable/writable state object with guarenteed valid value and subscription and related utilities.
 * @template READ - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.
 * @template WRITE - The type which can be written to the state.*/
export type StateOk<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
> = StateInternal<ResultOk<READ>, WRITE, RELATED>;

/**Creates a state which holds a value
 * @param init initial value for state, use a function returning a value for a lazy value (does not call function until the state is first used)
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states */
export function state<TYPE, RELATED extends StateRelated = {}, WRITE = TYPE>(
  init: StateResult<TYPE> | (() => StateResult<TYPE>),
  setter?: ((value: WRITE) => Option<StateResult<TYPE>>) | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<StateResult<TYPE>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as State<TYPE, RELATED, WRITE>;
}
/**Creates a state which holds a value, that is guaranteed to be OK
 * @param init initial value for state, use a function returning a value for a lazy value (does not call function until the state is first used)
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states */
export function stateOk<TYPE, RELATED extends StateRelated = {}, WRITE = TYPE>(
  init: ResultOk<TYPE> | (() => ResultOk<TYPE>),
  setter?: ((value: WRITE) => Option<ResultOk<TYPE>>) | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<ResultOk<TYPE>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as StateOk<TYPE, RELATED, WRITE>;
}
