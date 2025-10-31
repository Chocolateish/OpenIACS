import {
  Err,
  None,
  Ok,
  type Option,
  type Result,
  type ResultBase,
  ResultOk,
  Some,
} from "@libResult";
import { StateBaseSync } from "./stateBase";
import {
  type StateError,
  type StateHelper,
  type StateOwner,
  type StateOwnerBase,
  type StateOwnerOk,
  type StateRead,
  type StateReadBase,
  type StateReadOk,
  type StateRelated,
  type StateSetter,
  type StateSetterBase,
  type StateSetterOk,
  type StateWrite,
  type StateWriteBase,
  type StateWriteOk,
} from "./types";
export class StateInternal<
    TYPE extends Result<any, StateError>,
    RELATED extends StateRelated,
    WRITE
  >
  extends StateBaseSync<TYPE, RELATED>
  implements StateWriteBase<TYPE, true, RELATED, WRITE>, StateOwnerBase<TYPE>
{
  constructor(
    init: TYPE,
    setter?: StateSetterBase<TYPE, WRITE> | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) => {
              return this.#helper?.limit
                ? this.#helper?.limit(value).map((v) => Ok(v as any) as TYPE)
                : Some(Ok(value as any) as TYPE);
            }
          : setter;
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value?: TYPE;
  #setter?: StateSetterBase<TYPE, WRITE>;
  #helper?: StateHelper<WRITE, RELATED>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = TYPE>(
    func: (value: TYPE) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  get(): TYPE {
    return this.#value!;
  }
  getOk(): TYPE extends ResultOk<infer T> ? T : unknown {
    return this.#value!.unwrap;
  }
  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readable(): StateReadBase<TYPE, true, RELATED> {
    return this;
  }

  //##################################################################################################################################################
  //Writer Context
  write(value: WRITE): boolean {
    if (this.#setter && (!this.#value!.ok || this.#value?.value !== value))
      return (
        this.#setter(value).map(this.set.bind(this)).unwrapOr(false) !== false
      );
    return false;
  }
  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }
  limit(value: WRITE): Option<WRITE> {
    return this.#helper?.limit ? this.#helper.limit(value) : Some(value);
  }
  get writeable(): StateWriteBase<TYPE, true, RELATED, WRITE> {
    return this;
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: TYPE) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: TYPE extends Result<infer T, StateError> ? T : never): void {
    this.#value = Ok(value) as TYPE;
    this.updateSubscribers(this.#value);
  }
  setErr(err: StateError): void {
    this.#value = Err(err) as TYPE;
    this.updateSubscribers(this.#value);
  }
  get owner(): StateOwnerBase<TYPE> {
    return this;
  }
}

export interface State<TYPE, RELATED extends StateRelated = {}>
  extends StateInternal<Result<TYPE, StateError>, RELATED, TYPE> {
  readonly readable: StateRead<TYPE, true, RELATED>;
  readonly writeable: StateWrite<TYPE, true, RELATED>;
  readonly owner: StateOwner<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: StateError): void;
}
export interface StateOk<TYPE, RELATED extends StateRelated = {}>
  extends StateInternal<ResultOk<TYPE>, RELATED, TYPE> {
  readonly readable: StateReadOk<TYPE, true, RELATED>;
  readonly writeable: StateWriteOk<TYPE, true, RELATED>;
  readonly owner: StateOwnerOk<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: never): void;
}

/**Creates a state from an initial value.
 * @param init initial value for state.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_from<TYPE, RELATED extends StateRelated = {}>(
  init: TYPE,
  setter?: StateSetter<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<Result<TYPE, StateError>, RELATED, TYPE>(
    Ok(init),
    setter,
    helper
  ) as State<TYPE, RELATED>;
}

/**Creates a state from an initial value, that is guaranteed to be OK.
 * @param init initial value for state.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_ok<TYPE, RELATED extends StateRelated = {}>(
  init: TYPE extends ResultBase<any, any> ? never : TYPE,
  setter?: StateSetterOk<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<ResultOk<TYPE>, RELATED, TYPE>(
    Ok(init),
    setter,
    helper
  ) as StateOk<TYPE, RELATED>;
}

/**Creates a state from an initial error.
 * @param err initial error for state.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_err<TYPE, RELATED extends StateRelated = {}>(
  err: StateError,
  setter?: StateSetter<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<Result<TYPE, StateError>, RELATED, TYPE>(
    Err(err),
    setter,
    helper
  ) as State<TYPE, RELATED>;
}

/**Creates a state which holds a value, from an initial Result.
 * @param init initial result for state.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function state_from_result<TYPE, RELATED extends StateRelated = {}>(
  init: Result<TYPE, StateError>,
  setter?: StateSetter<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<Result<TYPE, StateError>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as State<TYPE, RELATED>;
}

/**Creates a state which holds a value, from an initial OK Result, the state will be guarenteed to be OK.
 * @param init initial result ok for state.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function state_from_result_ok<TYPE, RELATED extends StateRelated = {}>(
  init: ResultOk<TYPE>,
  setter?: StateSetterOk<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<ResultOk<TYPE>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateOk<TYPE, RELATED>;
}
