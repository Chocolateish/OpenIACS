import {
  Err,
  None,
  Ok,
  type Option,
  type Result,
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
    READ extends Result<any, StateError>,
    WRITE,
    RELATED extends StateRelated = {}
  >
  extends StateBaseSync<READ, RELATED>
  implements StateWriteBase<READ, true, RELATED, WRITE>, StateOwnerBase<READ>
{
  constructor(
    init: READ,
    setter?: StateSetterBase<READ, WRITE> | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      this.#setter =
        setter === true
          ? (value) => {
              return this.#helper?.limit
                ? this.#helper?.limit(value).map((v) => Ok(v as any) as READ)
                : Some(Ok(value as any) as READ);
            }
          : setter;
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value?: READ;
  #setter?: StateSetterBase<READ, WRITE>;
  #helper?: StateHelper<WRITE, RELATED>;

  //##################################################################################################################################################
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
  get readable(): StateReadBase<READ, true, RELATED> {
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
  get writeable(): StateWriteBase<READ, true, RELATED, WRITE> {
    return this;
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: READ) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: READ extends Result<infer T, StateError> ? T : never): void {
    this.#value = Ok(value) as READ;
    this.updateSubscribers(this.#value);
  }
  setErr(err: StateError): void {
    this.#value = Err(err) as READ;
    this.updateSubscribers(this.#value);
  }
  get owner(): StateOwnerBase<READ> {
    return this;
  }
}

export interface State<READ, WRITE = READ, RELATED extends StateRelated = {}>
  extends StateInternal<Result<READ, StateError>, WRITE, RELATED> {
  readonly readable: StateRead<READ, true, RELATED>;
  readonly writeable: StateWrite<READ, true, RELATED, WRITE>;
  readonly owner: StateOwner<READ>;
  setOk(value: READ): void;
  setErr(err: StateError): void;
}
export interface StateOk<READ, WRITE = READ, RELATED extends StateRelated = {}>
  extends StateInternal<ResultOk<READ>, WRITE, RELATED> {
  readonly readable: StateReadOk<READ, true, RELATED>;
  readonly writeable: StateWriteOk<READ, true, RELATED, WRITE>;
  readonly owner: StateOwnerOk<READ>;
  setOk(value: READ): void;
  setErr(err: never): void;
}

/**Creates a state from an initial value.
 * @param init initial value for state.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function from<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  init: READ,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<Result<READ, StateError>, WRITE, RELATED>(
    Ok(init),
    setter,
    helper
  ) as State<READ, WRITE, RELATED>;
}

/**Creates a state from an initial value, that is guaranteed to be OK.
 * @param init initial value for state.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function ok<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  init: READ,
  setter?: StateSetterOk<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<ResultOk<READ>, WRITE, RELATED>(
    Ok(init),
    setter,
    helper
  ) as StateOk<READ, WRITE, RELATED>;
}

/**Creates a state from an initial error.
 * @param err initial error for state.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function err<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  err: StateError,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<Result<READ, StateError>, WRITE, RELATED>(
    Err(err),
    setter,
    helper
  ) as State<READ, WRITE, RELATED>;
}

/**Creates a state which holds a value, from an initial Result.
 * @param init initial result for state.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function from_result<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
>(
  init: Result<READ, StateError>,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<Result<READ, StateError>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as State<READ, WRITE, RELATED>;
}

/**Creates a state which holds a value, from an initial OK Result, the state will be guarenteed to be OK.
 * @param init initial result ok for state.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function from_result_ok<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
>(
  init: ResultOk<READ>,
  setter?: StateSetterOk<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateInternal<ResultOk<READ>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as StateOk<READ, WRITE, RELATED>;
}
