import { Err, None, Ok, type Option, type Result, ResultOk } from "@libResult";
import { StateBaseSync } from "./stateBase";
import {
  type StateHelper,
  type StateOwner,
  type StateOwnerBase,
  type StateOwnerOk,
  type StateRead,
  type StateReadBase,
  type StateReadError,
  type StateReadOk,
  type StateRelated,
  type StateSetter,
  type StateSetterBase,
  type StateSetterOk,
  type StateWrite,
  type StateWriteBase,
  type StateWriteError,
  type StateWriteOk,
} from "./types";

export class StateLazyInternal<
    TYPE extends Result<any, StateReadError>,
    RELATED extends StateRelated,
    WRITE
  >
  extends StateBaseSync<TYPE, RELATED>
  implements
    StateWriteBase<TYPE, true, RELATED, WRITE, true>,
    StateOwnerBase<TYPE>
{
  constructor(
    init: () => TYPE,
    setter?:
      | StateSetterBase<TYPE, StateLazyInternal<TYPE, RELATED, WRITE>, WRITE>
      | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      if (setter === true)
        this.#setter = (value) => {
          return this.#helper?.limit
            ? this.#helper?.limit(value).map((e) => Ok(e) as TYPE)
            : Ok(Ok(value) as TYPE);
        };
      else this.#setter = setter;
    if (helper) this.#helper = helper;
    let clean = () => {
      //@ts-expect-error
      delete this.then;
      //@ts-expect-error
      delete this.get;
      //@ts-expect-error
      delete this.getOk;
      //@ts-expect-error
      delete this.write;
      //@ts-expect-error
      delete this.writeSync;
      //@ts-expect-error
      delete this.set;
      //@ts-expect-error
      delete this.setOk;
      //@ts-expect-error
      delete this.setErr;
    };
    let getAndClean = () => {
      clean();
      return (this.#value = init());
    };
    this.then = async <TResult1 = TYPE>(
      func: (value: TYPE) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      return func(getAndClean());
    };
    this.get = () => {
      return getAndClean();
    };
    this.getOk = () => {
      return getAndClean().unwrap;
    };
    let writeSync = this.writeSync.bind(this);
    this.write = async (value) => {
      this.#value = {} as any;
      let didWrite = writeSync(value);
      if (didWrite.ok) clean();
      return didWrite;
    };
    this.writeSync = (value) => {
      this.#value = {} as any;
      let didWrite = writeSync(value);
      if (didWrite.ok) clean();
      return didWrite;
    };
    this.set = (value) => {
      clean();
      this.set(value);
    };
    this.setOk = (value) => {
      clean();
      this.setOk(value);
    };
    this.setErr = (value) => {
      clean();
      this.setErr(value);
    };
  }

  #value?: TYPE;
  #setter?: StateSetterBase<
    TYPE,
    StateLazyInternal<TYPE, RELATED, WRITE>,
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
  get readable(): StateReadBase<TYPE, true, RELATED> {
    return this;
  }

  //##################################################################################################################################################
  //Writer Context
  async write(value: WRITE): Promise<Result<void, StateWriteError>> {
    return this.writeSync(value);
  }
  writeSync(value: WRITE): Result<void, StateWriteError> {
    if (this.#setter && (!this.#value!.ok || this.#value?.value !== value))
      return this.#setter(value, this, this.#value).map(this.set.bind(this));
    return Err({ code: "LRO", reason: "State not writable" });
  }
  limit(value: WRITE): Result<WRITE, StateWriteError> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }
  get writeable(): StateWriteBase<TYPE, true, RELATED, WRITE, true> {
    return this;
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: TYPE) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: TYPE extends Result<infer T, StateReadError> ? T : never): void {
    this.#value = Ok(value) as TYPE;
    this.updateSubscribers(this.#value);
  }
  setErr(err: StateReadError): void {
    this.#value = Err(err) as TYPE;
    this.updateSubscribers(this.#value);
  }
  get owner(): StateOwnerBase<TYPE> {
    return this;
  }
}

export interface StateLazy<TYPE, RELATED extends StateRelated = {}>
  extends StateLazyInternal<Result<TYPE, StateReadError>, RELATED, TYPE> {
  readonly readable: StateRead<TYPE, true, RELATED>;
  readonly writeable: StateWrite<TYPE, true, RELATED>;
  readonly owner: StateOwner<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: StateReadError): void;
}
export interface StateLazyOk<TYPE, RELATED extends StateRelated = {}>
  extends StateLazyInternal<ResultOk<TYPE>, RELATED, TYPE> {
  readonly readable: StateReadOk<TYPE, true, RELATED>;
  readonly writeable: StateWriteOk<TYPE, true, RELATED>;
  readonly owner: StateOwnerOk<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: never): void;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_lazy_from<TYPE, RELATED extends StateRelated = {}>(
  init: () => TYPE,
  setter?: StateSetter<TYPE, StateLazy<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateLazyInternal<Result<TYPE, StateReadError>, RELATED, TYPE>(
    () => Ok(init()),
    setter,
    helper
  ) as StateLazy<TYPE, RELATED>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, and that is guaranteed to be OK.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_lazy_ok<TYPE, RELATED extends StateRelated = {}>(
  init: () => TYPE,
  setter?: StateSetterOk<TYPE, StateLazyOk<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateLazyInternal<ResultOk<TYPE>, RELATED, TYPE>(
    () => Ok(init()),
    setter,
    helper
  ) as StateLazyOk<TYPE, RELATED>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, that returns an error.
 * @param err function returning initial error.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_lazy_err<TYPE, RELATED extends StateRelated = {}>(
  err: () => StateReadError,
  setter?: StateSetter<TYPE, StateLazy<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateLazyInternal<Result<TYPE, StateReadError>, RELATED, TYPE>(
    () => Err(err()),
    setter,
    helper
  ) as StateLazy<TYPE, RELATED>;
}

/**Creates a state which holds a value from a lazy function that is evaluated on first access of the state, that returns a Result.
 * @param init function returning initial result.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function state_lazy_from_result<TYPE, RELATED extends StateRelated = {}>(
  init: () => Result<TYPE, StateReadError>,
  setter?: StateSetter<TYPE, StateLazy<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateLazyInternal<Result<TYPE, StateReadError>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateLazy<TYPE, RELATED>;
}

/**Creates a state which holds a value from a lazy function that is evaluated on first access of the state, that returns a Result that is guarenteed to be OK.
 * @param init function returning initial result ok.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function state_lazy_from_result_ok<
  TYPE,
  RELATED extends StateRelated = {}
>(
  init: () => ResultOk<TYPE>,
  setter?: StateSetterOk<TYPE, StateLazyOk<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateLazyInternal<ResultOk<TYPE>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateLazyOk<TYPE, RELATED>;
}
