import {
  Err,
  None,
  Ok,
  type Option,
  type Result,
  ResultOk,
  Some,
} from "@libResult";
import { StateBase } from "./stateBase";
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

export class StateDelayedInternal<
    TYPE extends Result<any, StateError>,
    RELATED extends StateRelated,
    WRITE = TYPE
  >
  extends StateBase<TYPE, false, RELATED>
  implements StateWriteBase<TYPE, false, RELATED, WRITE>, StateOwnerBase<TYPE>
{
  constructor(
    init?: Promise<TYPE>,
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
    let clean = () => {
      //@ts-expect-error
      delete this.then;
      //@ts-expect-error
      delete this.write;
      //@ts-expect-error
      delete this.set;
      //@ts-expect-error
      delete this.setOk;
      //@ts-expect-error
      delete this.setErr;
    };
    this.then = async <TResult1 = TYPE>(
      func: (value: TYPE) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      let prom = this.appendPromise(func);
      if (init)
        init
          .then((val) => {
            this.set(val);
          })
          .catch((error) => {
            this.set(
              Err({
                reason: (error as Error).message,
                code: "INIT",
              }) as TYPE
            );
          });
      return prom;
    };
    let write = this.write.bind(this);
    this.write = (value) => {
      this.#value = {} as any;
      let didWrite = write(value);
      if (didWrite) clean();
      return didWrite;
    };
    this.set = (value) => {
      clean();
      this.fulfillPromises(value);
      this.set(value);
    };
    this.setOk = (value) => {
      clean();
      this.fulfillPromises(Ok(value) as TYPE);
      this.setOk(value);
    };
    this.setErr = (value) => {
      clean();
      this.fulfillPromises(Err(value) as TYPE);
      this.setErr(value);
    };
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
  get(): unknown {
    return;
  }
  getOk(): unknown {
    return;
  }
  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readable(): StateReadBase<TYPE, false, RELATED> {
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
  get writeable(): StateWriteBase<TYPE, false, RELATED, WRITE> {
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

export interface StateDelayed<TYPE, RELATED extends StateRelated = {}>
  extends StateDelayedInternal<Result<TYPE, StateError>, RELATED, TYPE> {
  readonly readable: StateRead<TYPE, false, RELATED>;
  readonly writeable: StateWrite<TYPE, false, RELATED>;
  readonly owner: StateOwner<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: StateError): void;
}
export interface StateDelayedOk<TYPE, RELATED extends StateRelated = {}>
  extends StateDelayedInternal<ResultOk<TYPE>, RELATED, TYPE> {
  readonly readable: StateReadOk<TYPE, false, RELATED>;
  readonly writeable: StateWriteOk<TYPE, false, RELATED>;
  readonly owner: StateOwnerOk<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: never): void;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_delayed_from<TYPE, RELATED extends StateRelated = {}>(
  init?: Promise<TYPE>,
  setter?: StateSetter<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<Result<TYPE, StateError>, RELATED, TYPE>(
    init?.then((v) => Ok(v)),
    setter,
    helper
  ) as StateDelayed<TYPE, RELATED>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, and that is guaranteed to be OK.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_delayed_ok<TYPE, RELATED extends StateRelated = {}>(
  init?: Promise<TYPE>,
  setter?: StateSetterOk<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<ResultOk<TYPE>, RELATED, TYPE>(
    init?.then((v) => Ok(v)),
    setter,
    helper
  ) as StateDelayedOk<TYPE, RELATED>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, that returns an error.
 * @param err function returning initial error.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_delayed_err<TYPE, RELATED extends StateRelated = {}>(
  err?: Promise<StateError>,
  setter?: StateSetter<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<Result<TYPE, StateError>, RELATED, TYPE>(
    err?.then((e) => Err(e)),
    setter,
    helper
  ) as StateDelayed<TYPE, RELATED>;
}

/**Creates a state which holds a value from a delayed value (promise), that is awaited on first access of the state.
 * @param init Promise returning result.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function state_delayed_from_result<
  TYPE,
  RELATED extends StateRelated = {}
>(
  init?: Promise<Result<TYPE, StateError>>,
  setter?: StateSetter<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<Result<TYPE, StateError>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateDelayed<TYPE, RELATED>;
}

/**Creates a state which holds a value from a delayed value (promise), that is awaited on first access of the state, and is guarenteed to be OK.
 * @param init Promise returning result ok, don't throw in the promise or it will break.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function state_delayed_from_result_ok<
  TYPE,
  RELATED extends StateRelated = {}
>(
  init?: Promise<ResultOk<TYPE>>,
  setter?: StateSetterOk<TYPE> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<ResultOk<TYPE>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateDelayedOk<TYPE, RELATED>;
}
