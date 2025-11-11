import { Err, None, Ok, type Option, type Result, ResultOk } from "@libResult";
import { StateBaseReadSync } from "./stateBase";
import {
  type StateHelper,
  type StateOwner,
  type StateOwnerOk,
  type StateRead,
  type StateReadOk,
  type StateRelated,
  type StateSetterSync,
  type StateSetterSyncBase,
  type StateSetterSyncOk,
  type StateWrite,
  type StateWriteSync,
} from "./types";

export class StateInternal<
    TYPE extends Result<any, string>,
    RELATED extends StateRelated,
    WRITE
  >
  extends StateBaseReadSync<TYPE, RELATED>
  implements StateWrite<TYPE, true, RELATED, WRITE, true>, StateOwner<TYPE>
{
  constructor(
    init: TYPE,
    setter?:
      | StateSetterSyncBase<TYPE, StateInternal<TYPE, RELATED, WRITE>, WRITE>
      | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      if (setter === true)
        this.#setter = (value, state) => {
          return this.#helper?.limit
            ? this.#helper?.limit(value).map((e) => state.setOk(e as any))
            : Ok(state.setOk(value as any));
        };
      else this.#setter = setter;
    if (helper) this.#helper = helper;
    this.#value = init;
  }

  #value?: TYPE;
  #setter?: StateSetterSyncBase<
    TYPE,
    StateInternal<TYPE, RELATED, WRITE>,
    WRITE
  >;
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
  get readable(): StateRead<TYPE, true, RELATED> {
    return this;
  }

  //##################################################################################################################################################
  //Writer Context
  async write(value: WRITE): Promise<Result<void, string>> {
    return this.writeSync(value);
  }
  writeSync(value: WRITE): Result<void, string> {
    if (this.#setter && (!this.#value!.ok || this.#value?.value !== value))
      return this.#setter(value, this, this.#value);
    return Err("State not writable");
  }
  limit(value: WRITE): Result<WRITE, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }
  get writeable(): StateWrite<TYPE, true, RELATED, WRITE, true> {
    return this;
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: TYPE) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: TYPE extends Result<infer T, string> ? T : never): void {
    this.#value = Ok(value) as TYPE;
    this.updateSubscribers(this.#value);
  }
  setErr(err: string): void {
    this.#value = Err(err) as TYPE;
    this.updateSubscribers(this.#value);
  }
  get owner(): StateOwner<TYPE> {
    return this;
  }
}

export interface State<TYPE, RELATED extends StateRelated = {}>
  extends StateInternal<Result<TYPE, string>, RELATED, TYPE> {
  readonly readable: StateRead<TYPE, true, RELATED>;
  readonly writeable: StateWrite<TYPE, true, RELATED>;
  readonly owner: StateOwner<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: string): void;
}
export interface StateOk<TYPE, RELATED extends StateRelated = {}>
  extends StateInternal<ResultOk<TYPE>, RELATED, TYPE> {
  readonly readable: StateReadOk<TYPE, true, RELATED>;
  readonly writeable: StateWriteSync<TYPE, true, RELATED>;
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
  setter?: StateSetterSync<TYPE, State<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<Result<TYPE, string>, RELATED, TYPE>(
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
  init: TYPE,
  setter?: StateSetterSyncOk<TYPE, StateOk<TYPE, RELATED>> | true,
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
  err: string,
  setter?: StateSetterSync<TYPE, State<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<Result<TYPE, string>, RELATED, TYPE>(
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
  init: Result<TYPE, string>,
  setter?: StateSetterSync<TYPE, State<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<Result<TYPE, string>, RELATED, TYPE>(
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
  setter?: StateSetterSyncOk<TYPE, StateOk<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateInternal<ResultOk<TYPE>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateOk<TYPE, RELATED>;
}
