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

export class StateLazyInternal<
    READ extends Result<any, StateError>,
    WRITE,
    RELATED extends StateRelated = {}
  >
  extends StateBaseSync<READ, RELATED>
  implements StateWriteBase<READ, true, RELATED, WRITE>, StateOwnerBase<READ>
{
  constructor(
    init: () => READ,
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
      delete this.get;
      //@ts-expect-error
      delete this.write;
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
    this.then = async <TResult1 = READ>(
      func: (value: READ) => TResult1 | PromiseLike<TResult1>
    ): Promise<TResult1> => {
      return func(getAndClean());
    };
    this.get = () => {
      return getAndClean();
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

export interface StateLazy<
  READ,
  WRITE = READ,
  RELATED extends StateRelated = {}
> extends StateLazyInternal<Result<READ, StateError>, WRITE, RELATED> {
  readonly readable: StateRead<READ, true, RELATED>;
  readonly writeable: StateWrite<READ, true, RELATED, WRITE>;
  readonly owner: StateOwner<READ>;
  setOk(value: READ): void;
  setErr(err: StateError): void;
}
export interface StateLazyOk<
  READ,
  WRITE = READ,
  RELATED extends StateRelated = {}
> extends StateLazyInternal<ResultOk<READ>, WRITE, RELATED> {
  readonly readable: StateReadOk<READ, true, RELATED>;
  readonly writeable: StateWriteOk<READ, true, RELATED, WRITE>;
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
  init: () => READ,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateLazyInternal<Result<READ, StateError>, WRITE, RELATED>(
    () => Ok(init()),
    setter,
    helper
  ) as StateLazy<READ, WRITE, RELATED>;
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
  return new StateLazyInternal<ResultOk<READ>, WRITE, RELATED>(
    () => Ok(init()),
    setter,
    helper
  ) as StateLazyOk<READ, WRITE, RELATED>;
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
  return new StateLazyInternal<Result<READ, StateError>, WRITE, RELATED>(
    () => Err(err()),
    setter,
    helper
  ) as StateLazy<READ, WRITE, RELATED>;
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
  return new StateLazyInternal<Result<READ, StateError>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as StateLazy<READ, WRITE, RELATED>;
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
  return new StateLazyInternal<ResultOk<READ>, WRITE, RELATED>(
    init,
    setter,
    helper
  ) as StateLazyOk<READ, WRITE, RELATED>;
}
