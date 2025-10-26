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
  type StateRead,
  type StateReadOk,
  type StateRelated,
  type StateSetter,
  type StateSetterOk,
  type StateWrite,
  type StateWriteBase,
  type StateWriteOk,
} from "./types";

export class StateDelayed<READ, WRITE, RELATED extends StateRelated = {}>
  extends StateBase<Result<READ, StateError>, false, RELATED>
  implements
    StateWriteBase<Result<READ, StateError>, false, RELATED, WRITE>,
    StateOwnerBase<Result<READ, StateError>>
{
  constructor(
    init: PromiseLike<Result<READ, StateError>>,
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
      delete this.write;
    };
    let getAndClean = new Promise<Result<READ, StateError>>(async (a) => {
      try {
        this.#value = await init;
      } catch (error) {
        this.#value = Err({
          reason: (error as Error).message,
          code: "INIT",
        });
      }
      clean();
      a(this.#value);
    });
    this.then = async <TResult1 = Result<READ, StateError>>(
      func: (
        value: Result<READ, StateError>
      ) => TResult1 | PromiseLike<TResult1>
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

  #value?: Result<READ, StateError>;
  #setter?: StateSetter<READ, WRITE>;
  #helper?: StateHelper<WRITE, RELATED>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = Result<READ, StateError>>(
    func: (value: Result<READ, StateError>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  get(): never {
    return undefined as never;
  }
  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readable(): StateRead<READ, false, RELATED> {
    return this as StateRead<READ, false, RELATED>;
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
  get writeable(): StateWrite<READ, false, RELATED, WRITE> {
    return this as StateWrite<READ, false, RELATED, WRITE>;
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: Result<READ, StateError>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: READ): void {
    this.#value = Ok(value);
    this.updateSubscribers(this.#value);
  }
  setErr(err: StateError): void {
    this.#value = Err(err);
    this.updateSubscribers(this.#value);
  }
  get owner(): StateOwner<READ> {
    return this as StateOwner<READ>;
  }
}

export class StateDelayedOk<READ, WRITE, RELATED extends StateRelated = {}>
  extends StateBase<ResultOk<READ>, false, RELATED>
  implements
    StateWriteBase<ResultOk<READ>, false, RELATED, WRITE>,
    StateOwnerBase<ResultOk<READ>>
{
  constructor(
    init: PromiseLike<ResultOk<READ>>,
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
      delete this.write;
    };
    let getAndClean = new Promise<ResultOk<READ>>(async (a) => {
      this.#value = await init;
      clean();
      a(this.#value);
    });
    this.then = async <TResult1 = ResultOk<READ>>(
      func: (value: ResultOk<READ>) => TResult1 | PromiseLike<TResult1>
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

  #value?: ResultOk<READ>;
  #setter?: StateSetterOk<READ, WRITE>;
  #helper?: StateHelper<WRITE, RELATED>;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = ResultOk<READ>>(
    func: (value: ResultOk<READ>) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  get(): never {
    return undefined as never;
  }
  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readable(): StateReadOk<READ, false, RELATED> {
    return this as StateReadOk<READ, false, RELATED>;
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
  get writeable(): StateWriteOk<READ, false, RELATED, WRITE> {
    return this as StateWriteOk<READ, false, RELATED, WRITE>;
  }

  //##################################################################################################################################################
  //Owner Context
  set(value: ResultOk<READ>) {
    this.#value = value;
    this.updateSubscribers(value);
  }
  setOk(value: READ): void {
    this.#value = Ok(value);
    this.updateSubscribers(this.#value);
  }
  setErr(_err: never): void {}
  get owner(): StateOwner<READ> {
    return this as StateOwner<READ>;
  }
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
  return new StateDelayed<READ, WRITE, RELATED>(
    init.then((v) => Ok(v)),
    setter,
    helper
  );
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
  return new StateDelayedOk<READ, WRITE, RELATED>(
    init.then((v) => Ok(v)),
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
  err: PromiseLike<StateError>,
  setter?: StateSetter<READ, WRITE> | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayed<READ, WRITE, RELATED>(
    err.then((e) => Err(e)),
    setter,
    helper
  );
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
  return new StateDelayed<READ, WRITE, RELATED>(init, setter, helper);
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
  return new StateDelayedOk<READ, WRITE, RELATED>(init, setter, helper);
}
