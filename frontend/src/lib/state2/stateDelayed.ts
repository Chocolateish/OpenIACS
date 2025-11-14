import { Err, None, Ok, type Option, type Result, ResultOk } from "@libResult";
import { StateBaseRead } from "./stateBase";
import {
  type State,
  type StateHelper,
  type StateOwnerAll,
  type StateOwnerOk,
  type StateReadOk,
  type StateRelated,
  type StateSetter,
  type StateSetterBase,
  type StateSetterOk,
  type StateWrite,
  type StateWriteSync,
} from "./types";

export class StateDelayedInternal<
    TYPE extends Result<any, string>,
    RELATED extends StateRelated,
    WRITE = TYPE
  >
  extends StateBaseRead<TYPE, false, RELATED>
  implements StateWrite<TYPE, false, RELATED, WRITE, false>, StateOwnerOk<TYPE>
{
  constructor(
    init?: Promise<TYPE>,
    setter?:
      | StateSetterBase<TYPE, StateDelayedInternal<TYPE, RELATED, WRITE>, WRITE>
      | true,
    helper?: StateHelper<WRITE, RELATED>
  ) {
    super();
    if (setter)
      if (setter === true)
        this.#setter = async (value, state) => {
          return this.#helper?.limit
            ? this.#helper?.limit(value).map((e) => state.setOk(e as any))
            : Ok(state.setOk(value as any));
        };
      else this.#setter = setter;
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
      let prom = this.appendReadPromise(func);
      if (init)
        init
          .then((val) => {
            this.set(val);
          })
          .catch((error) => {
            this.set(Err((error as Error).message) as TYPE);
          });
      return prom;
    };
    let write = this.write.bind(this);
    this.write = async (value) => {
      this.#value = {} as any;
      let didWrite = await write(value);
      if (didWrite.ok) clean();
      return didWrite;
    };
    this.set = (value) => {
      clean();
      this.fulfillReadPromises(value);
      this.set(value);
    };
    this.setOk = (value) => {
      clean();
      this.fulfillReadPromises(Ok(value) as TYPE);
      this.setOk(value);
    };
    this.setErr = (value) => {
      clean();
      this.fulfillReadPromises(Err(value) as TYPE);
      this.setErr(value);
    };
  }

  #value?: TYPE;
  #setter?: StateSetterBase<
    TYPE,
    StateDelayedInternal<TYPE, RELATED, WRITE>,
    WRITE
  >;
  #helper?: StateHelper<WRITE, RELATED>;
  #writePromise?: (val: Result<void, string>) => void;

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = TYPE>(
    func: (value: TYPE) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    return func(this.#value!);
  }
  get(): unknown {
    return this.#value!;
  }
  getOk(): unknown {
    return this.#value!.unwrap;
  }
  related(): Option<RELATED> {
    return this.#helper?.related ? this.#helper.related() : None();
  }
  get readable(): State<TYPE, false, RELATED> {
    return this;
  }

  //##################################################################################################################################################
  //Writer Context
  async write(value: WRITE): Promise<Result<void, string>> {
    if (this.#setter && (!this.#value!.ok || this.#value?.value !== value))
      return this.#setter(value, this, this.#value);
    return Err("State not writable");
  }
  writeSync(_value: unknown): unknown {
    return undefined;
  }
  limit(value: WRITE): Result<WRITE, string> {
    return this.#helper?.limit ? this.#helper.limit(value) : Ok(value);
  }
  check(value: WRITE): Option<string> {
    return this.#helper?.check ? this.#helper.check(value) : None();
  }
  get writeable(): StateWrite<TYPE, false, RELATED, WRITE, false> {
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
  get owner(): StateOwnerOk<TYPE> {
    return this;
  }

  //Promises
  writePromise(): Promise<Result<void, string>> {
    return new Promise<Result<void, string>>((a) => {
      if (this.#writePromise)
        console.warn("Overwriting existing write promise");
      this.#writePromise = a;
    });
  }
  fulfillWrite(res: Result<void, string>) {
    if (this.#writePromise) this.#writePromise(res);
    else console.warn("No write promise to fulfill");
    this.#writePromise = undefined;
  }
}

export interface StateDelayed<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
> extends StateDelayedInternal<Result<TYPE, string>, RELATED, WRITE> {
  readonly readable: State<TYPE, false, RELATED>;
  readonly writeable: StateWrite<TYPE, false, RELATED, WRITE>;
  readonly owner: StateOwnerOk<TYPE>;
  setOk(value: TYPE): void;
  setErr(err: string): void;
}
export interface StateDelayedOk<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
> extends StateDelayedInternal<ResultOk<TYPE>, RELATED, WRITE> {
  readonly readable: StateReadOk<TYPE, false, RELATED>;
  readonly writeable: StateWriteSync<TYPE, false, RELATED, WRITE>;
  readonly owner: StateOwnerAll<TYPE>;
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
  setter?: StateSetter<TYPE, StateDelayed<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<Result<TYPE, string>, RELATED, TYPE>(
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
export function state_delayed_ok<
  TYPE,
  RELATED extends StateRelated = {},
  WRITE = TYPE
>(
  init?: Promise<TYPE>,
  setter?:
    | StateSetterOk<TYPE, StateDelayedOk<TYPE, RELATED, WRITE>, WRITE>
    | true,
  helper?: StateHelper<WRITE, RELATED>
) {
  return new StateDelayedInternal<ResultOk<TYPE>, RELATED, WRITE>(
    init?.then((v) => Ok(v)),
    setter,
    helper
  ) as StateDelayedOk<TYPE, RELATED, WRITE>;
}

/**Creates a state from an initial lazy function that is evaluated on first access of the state, that returns an error.
 * @param err function returning initial error.
 * @param setter function called when state value is set via setter, set true let write set it's value.
 * @param helper functions to check and limit the value, and to return related states.
 * */
export function state_delayed_err<TYPE, RELATED extends StateRelated = {}>(
  err?: Promise<string>,
  setter?: StateSetter<TYPE, StateDelayed<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<Result<TYPE, string>, RELATED, TYPE>(
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
  init?: Promise<Result<TYPE, string>>,
  setter?: StateSetter<TYPE, StateDelayed<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<Result<TYPE, string>, RELATED, TYPE>(
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
  setter?: StateSetterOk<TYPE, StateDelayedOk<TYPE, RELATED>> | true,
  helper?: StateHelper<TYPE, RELATED>
) {
  return new StateDelayedInternal<ResultOk<TYPE>, RELATED, TYPE>(
    init,
    setter,
    helper
  ) as StateDelayedOk<TYPE, RELATED>;
}
