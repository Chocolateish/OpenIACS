import {
  Err,
  None,
  Ok,
  type Option,
  type Result,
  ResultOk,
  Some,
} from "@libResult";
import { StateBaseSync, StateBaseSyncOk } from "./stateBase";
import {
  type StateError,
  type StateHelper,
  type StateRead,
  type StateReadOk,
  type StateRelated,
  type StateSetter,
  type StateSetterOk,
  type StateWrite,
  type StateWriteBase,
  type StateWriteOk,
} from "./types";

export class StateLazy<READ, WRITE, RELATED extends StateRelated = {}>
  extends StateBaseSync<Result<READ, StateError>, RELATED>
  implements StateWriteBase<Result<READ, StateError>, true, RELATED, WRITE>
{
  constructor(
    init: () => Result<READ, StateError>,
    setter?: StateSetter<READ, WRITE> | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) => {
              return this.#helper?.limit
                ? this.#helper?.limit(value).map((v) => Ok(v as any as READ))
                : Some(Ok(value as any as READ));
            }
          : setter;
    if (helper) this.#helper = helper;
    let clean = () => {
      //@ts-expect-error
      delete this.then;
      //@ts-expect-error
      delete this.get;
      //@ts-expect-error
      delete this.write;
      return (this.#value = init());
    };
    this.then = async <TResult1 = Result<READ, StateError>>(
      func: (
        value: Result<READ, StateError>
      ) => TResult1 | PromiseLike<TResult1>
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
  }

  #value?: Result<READ, StateError>;
  #setter?: StateSetter<READ, WRITE>;
  #helper?: StateHelper<WRITE, RELATED>;

  //Reader Context
  async then<TResult1 = Result<READ, StateError>>(
    func: (value: Result<READ, StateError>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }

  get(): Result<READ, StateError> {
    return this.#value!;
  }

  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  get readable(): StateRead<READ, true, RELATED> {
    return this as StateRead<READ, true, RELATED>;
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

  get writeable(): StateWrite<READ, true, RELATED, WRITE> {
    return this as StateWrite<READ, true, RELATED, WRITE>;
  }

  //Owner Context
  /**Sets the value of the state */
  set(value: Result<READ, StateError>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
}

export class StateLazyOk<READ, WRITE, RELATED extends StateRelated = {}>
  extends StateBaseSyncOk<ResultOk<READ>, RELATED>
  implements StateWriteBase<ResultOk<READ>, true, RELATED, WRITE>
{
  constructor(
    init: () => ResultOk<READ>,
    setter?: StateSetterOk<READ, WRITE> | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) => {
              return this.#helper?.limit
                ? this.#helper?.limit(value).map((v) => Ok(v as any as READ))
                : Some(Ok(value as any as READ));
            }
          : setter;
    if (helper) this.#helper = helper;
    let clean = () => {
      //@ts-expect-error
      delete this.then;
      //@ts-expect-error
      delete this.get;
      //@ts-expect-error
      delete this.write;
      return (this.#value = init());
    };
    this.then = async <TResult1 = ResultOk<READ>>(
      func: (value: ResultOk<READ>) => TResult1 | PromiseLike<TResult1>
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
  }

  #value?: ResultOk<READ>;
  #setter?: StateSetterOk<READ, WRITE>;
  #helper?: StateHelper<WRITE, RELATED>;

  //Reader Context
  async then<TResult1 = ResultOk<READ>>(
    func: (value: ResultOk<READ>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }

  get(): ResultOk<READ> {
    return this.#value!;
  }

  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }

  get readable(): StateReadOk<READ, true, RELATED> {
    return this as StateReadOk<READ, true, RELATED>;
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

  get writeable(): StateWriteOk<READ, true, RELATED, WRITE> {
    return this as StateWriteOk<READ, true, RELATED, WRITE>;
  }

  //Owner Context
  /**Sets the value of the state */
  set(value: ResultOk<READ>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function from<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  init: () => READ,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateLazy<READ, WRITE, RELATED>(() => Ok(init()), setter, helper);
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, and that is guaranteed to be OK.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function ok<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  init: () => READ,
  setter?: StateSetterOk<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateLazyOk<READ, WRITE, RELATED>(
    () => Ok(init()),
    setter,
    helper
  );
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, that returns an error.
 * @param err function returning initial error.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function err<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  err: () => StateError,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateLazy<READ, WRITE, RELATED>(() => Err(err()), setter, helper);
}

/**Creates a state which holds a value from a lazy function that is evaluated on first access of the state, that returns a Result.
 * @param init function returning initial result.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function from_result<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
>(
  init: () => Result<READ, StateError>,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateLazy<READ, WRITE, RELATED>(init, setter, helper);
}

/**Creates a state which holds a value from a lazy function that is evaluated on first access of the state, that returns a Result that is guarenteed to be OK.
 * @param init function returning initial result ok.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function from_result_ok<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
>(
  init: () => ResultOk<READ>,
  setter?: StateSetterOk<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateLazyOk<READ, WRITE, RELATED>(init, setter, helper);
}
