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
    READ extends Result<any, StateError>,
    WRITE = READ,
    RELATED extends StateRelated = {}
  >
  extends StateBase<READ, false, RELATED>
  implements StateWriteBase<READ, false, RELATED, WRITE>, StateOwnerBase<READ>
{
  constructor(
    init: PromiseLike<READ>,
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
    let clean = () => {
      //@ts-expect-error
      delete this.then;
      //@ts-expect-error
      delete this.write;
    };
    let getAndClean = new Promise<READ>(async (a) => {
      try {
        this.#value = await init;
      } catch (error) {
        this.#value = Err({
          reason: (error as Error).message,
          code: "INIT",
        }) as READ;
      }
      clean();
      a(this.#value);
    });
    this.then = async <TResult1 = READ>(
      func: (value: READ) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      return func(await getAndClean);
    };
    let write = this.write.bind(this);
    this.write = (value) => {
      this.#value = {} as any;
      let didWrite = write(value);
      if (didWrite) clean();
      return didWrite;
    };
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
  get(): never {
    return undefined as never;
  }
  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readable(): StateReadBase<READ, false, RELATED> {
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
  get writeable(): StateWriteBase<READ, false, RELATED, WRITE> {
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

export interface StateDelayed<
  READ,
  WRITE = READ,
  RELATED extends StateRelated = {}
> extends StateDelayedInternal<Result<READ, StateError>, WRITE, RELATED> {
  readonly readable: StateRead<READ, false, RELATED>;
  readonly writeable: StateWrite<READ, false, RELATED, WRITE>;
  readonly owner: StateOwner<READ>;
  setOk(value: READ): void;
  setErr(err: StateError): void;
}
export interface StateDelayedOk<
  READ,
  WRITE = READ,
  RELATED extends StateRelated = {}
> extends StateDelayedInternal<ResultOk<READ>, WRITE, RELATED> {
  readonly readable: StateReadOk<READ, false, RELATED>;
  readonly writeable: StateWriteOk<READ, false, RELATED, WRITE>;
  readonly owner: StateOwnerOk<READ>;
  setOk(value: READ): void;
  setErr(err: never): void;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function from<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  init: PromiseLike<READ>,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayedInternal<Result<READ, StateError>, WRITE, RELATED>(
    init.then((v) => Ok(v)),
    setter,
    helper
  ) as StateDelayed<READ, WRITE, RELATED>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, and that is guaranteed to be OK.
 * @param init function returning initial value.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function ok<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  init: PromiseLike<READ>,
  setter?: StateSetterOk<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayedInternal<ResultOk<READ>, WRITE, RELATED>(
    init.then((v) => Ok(v)),
    setter,
    helper
  ) as StateDelayedOk<READ, WRITE, RELATED>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, that returns an error.
 * @param err function returning initial error.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function err<READ, RELATED extends StateRelated = {}, WRITE = READ>(
  err: PromiseLike<StateError>,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayedInternal<Result<READ, StateError>, WRITE, RELATED>(
    err.then((e) => Err(e)),
    setter,
    helper
  ) as StateDelayed<READ, WRITE, RELATED>;
}

/**Creates a state which holds a value from a delayed value (promise), that is awaited on first access of the state.
 * @param init Promise returning result.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function from_result<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
>(
  init: PromiseLike<Result<READ, StateError>>,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayedInternal<Result<READ, StateError>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as StateDelayed<READ, WRITE, RELATED>;
}

/**Creates a state which holds a value from a delayed value (promise), that is awaited on first access of the state, and is guarenteed to be OK.
 * @param init Promise returning result ok, don't throw in the promise or it will break.
 * @param setter function called when state value is set via setter, set true let write set it's value
 * @param helper functions to check and limit the value, and to return related states
 * */
export function from_result_ok<
  READ,
  RELATED extends StateRelated = {},
  WRITE = READ
>(
  init: PromiseLike<ResultOk<READ>>,
  setter?: StateSetterOk<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayedInternal<ResultOk<READ>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as StateDelayedOk<READ, WRITE, RELATED>;
}
