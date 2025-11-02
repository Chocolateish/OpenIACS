import { Ok, ResultOk, type Option, type Result } from "@libResult";
import { StateBase } from "./stateBase";
import type {
  StateProxyTransform,
  StateProxyTransformBase,
  StateProxyTransformFromOk,
  StateProxyTransformOk,
  StateProxyTransformOkFromOk,
} from "./stateProxy";
import type {
  StateError,
  StateRead,
  StateReadBase,
  StateReadOk,
  StateRelated,
  StateSubscriberBase,
  StateWrite,
  StateWriteBase,
  StateWriteOk,
} from "./types";

export type StateProxyWriteTransform<WRITEOUTPUT, WRITEINPUT> = (
  value: WRITEOUTPUT
) => WRITEINPUT;

export class StateProxyWriteInternal<
    OUTPUT extends Result<any, StateError>,
    SYNC extends boolean,
    RELATED extends StateRelated,
    WRITEOUTPUT,
    INPUT extends Result<any, StateError>,
    WRITEINPUT
  >
  extends StateBase<OUTPUT, SYNC, RELATED>
  implements StateWriteBase<OUTPUT, SYNC, RELATED, WRITEOUTPUT>
{
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param state - The other states to be used in the derived state.*/
  constructor(
    state: StateWriteBase<INPUT, SYNC, RELATED, WRITEINPUT>,
    transformRead?: StateProxyTransformBase<INPUT, OUTPUT>,
    transformWrite?: StateProxyWriteTransform<WRITEOUTPUT, WRITEINPUT>
  ) {
    super();
    this.#state = state;
    if (transformRead) this.transformRead = transformRead;
    if (transformWrite) this.transformWrite = transformWrite;
  }

  #state: StateWriteBase<INPUT, SYNC, RELATED, WRITEINPUT>;
  #subscriber?: StateSubscriberBase<INPUT>;
  #buffer?: OUTPUT;

  protected transformRead(value: INPUT): OUTPUT {
    return value as any as OUTPUT;
  }
  protected transformWrite(value: WRITEOUTPUT): WRITEINPUT {
    return value as any as WRITEINPUT;
  }

  protected subOnSubscribe(_first: boolean) {
    if (_first) this.#connect();
  }

  protected subOnUnsubscribe(_last: boolean) {
    if (_last) this.#disconnect();
  }

  #connect() {
    this.#subscriber = this.#state.subscribe((value) => {
      this.#buffer = this.transformRead(value);
      this.fulfillPromises(this.#buffer);
      this.updateSubscribers(this.#buffer);
    }, !Boolean(this.#buffer));
  }

  #disconnect() {
    if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
    this.#subscriber = undefined;
    this.#buffer = undefined;
  }

  //##################################################################################################################################################
  //Reader Context
  async then<TResult1 = OUTPUT>(
    func: (value: OUTPUT) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#buffer) return func(this.#buffer);
    let prom = this.appendPromise(func);
    if (!this.#subscriber) this.#connect();
    return prom;
  }

  get(): SYNC extends true ? OUTPUT : unknown {
    if (this.#buffer) return this.#buffer;
    return this.transformRead(this.#state.get() as INPUT);
  }

  getOk(): SYNC extends true
    ? OUTPUT extends ResultOk<infer T>
      ? T
      : unknown
    : unknown {
    if (this.#buffer) return this.#buffer.unwrap;
    return this.transformRead(this.#state.get() as INPUT).unwrap;
  }

  related(): Option<RELATED> {
    return this.#state.related();
  }

  get readable(): StateReadBase<OUTPUT, SYNC, RELATED> {
    return this;
  }

  //##################################################################################################################################################
  //Writer Context
  write(value: WRITEOUTPUT): boolean {
    return this.#state.write(this.transformWrite(value));
  }
  check(value: WRITEOUTPUT): Option<string> {
    return this.#state.check(this.transformWrite(value));
  }
  limit(value: WRITEOUTPUT): Option<WRITEOUTPUT> {
    return this.#state
      .limit(this.transformWrite(value))
      .map((e) => this.transformRead(Ok(e) as INPUT).unwrap);
  }
  get writeable(): StateWriteBase<OUTPUT, SYNC, RELATED, WRITEOUTPUT> {
    return this;
  }

  //##################################################################################################################################################
  //Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: StateWriteBase<INPUT, SYNC, RELATED, WRITEINPUT>) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransformRead(transform: StateProxyTransformBase<INPUT, OUTPUT>) {
    this.transformRead = transform;
    if (this.inUse()) {
      this.#buffer = undefined;
      this.#buffer = this.transformRead(await this.#state);
      this.updateSubscribers(this.#buffer);
      this.fulfillPromises(this.#buffer);
    }
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransformWrite(
    transform: StateProxyWriteTransform<WRITEOUTPUT, WRITEINPUT>
  ) {
    this.transformWrite = transform;
  }
}

export interface StateProxyWrite<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyWriteInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  > {
  readonly readable: StateRead<OUTPUT, SYNC, RELATED>;
  readonly writeable: StateWrite<OUTPUT, SYNC, RELATED>;

  setState(state: StateWrite<INPUT, SYNC, RELATED>): void;
  setTransformRead(
    transform: StateProxyTransform<INPUT, OUTPUT>
  ): Promise<void>;
  setTransformWrite(
    transform: StateProxyWriteTransform<OUTPUT, INPUT>
  ): Promise<void>;
}
export interface StateProxyWriteFromOK<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyWriteInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  > {
  readonly readable: StateRead<OUTPUT, SYNC, RELATED>;
  readonly writeable: StateWrite<OUTPUT, SYNC, RELATED>;

  setState(state: StateWriteOk<INPUT, SYNC, RELATED>): void;
  setTransformRead(
    transform: StateProxyTransformFromOk<INPUT, OUTPUT>
  ): Promise<void>;
  setTransformWrite(
    transform: StateProxyWriteTransform<OUTPUT, INPUT>
  ): Promise<void>;
}
export interface StateProxyWriteOk<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyWriteInternal<
    ResultOk<OUTPUT>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  > {
  readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
  readonly writeable: StateWriteOk<OUTPUT, SYNC, RELATED>;
  setState(state: StateWrite<INPUT, SYNC, RELATED>): void;
  setTransformRead(
    transform: StateProxyTransformOk<INPUT, OUTPUT>
  ): Promise<void>;
  setTransformWrite(
    transform: StateProxyWriteTransform<OUTPUT, INPUT>
  ): Promise<void>;
}

export interface StateProxyWriteOkFromOk<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyWriteInternal<
    ResultOk<OUTPUT>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  > {
  readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
  readonly writeable: StateWriteOk<OUTPUT, SYNC, RELATED>;
  setState(state: StateWriteOk<INPUT, SYNC, RELATED>): void;
  setTransformRead(
    transform: StateProxyTransformOkFromOk<INPUT, OUTPUT>
  ): Promise<void>;
  setTransformWrite(
    transform: StateProxyWriteTransform<OUTPUT, INPUT>
  ): Promise<void>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
export function state_proxy_write_from<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateWrite<INPUT, SYNC, RELATED>,
  transformRead?: StateProxyTransform<INPUT, OUTPUT>,
  transformWrite?: StateProxyWriteTransform<OUTPUT, INPUT>
) {
  return new StateProxyWriteInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  >(state, transformRead, transformWrite) as StateProxyWrite<
    OUTPUT,
    SYNC,
    RELATED,
    INPUT
  >;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
export function state_proxy_write_from_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateWriteOk<INPUT, SYNC, RELATED>,
  transformRead?: StateProxyTransformFromOk<INPUT, OUTPUT>,
  transformWrite?: StateProxyWriteTransform<OUTPUT, INPUT>
) {
  return new StateProxyWriteInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  >(state, transformRead as any, transformWrite) as StateProxyWriteFromOK<
    OUTPUT,
    SYNC,
    RELATED,
    INPUT
  >;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
export function state_proxy_write_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateWrite<INPUT, SYNC, RELATED>,
  transform: StateProxyTransformOk<INPUT, OUTPUT>,
  transformWrite?: StateProxyWriteTransform<OUTPUT, INPUT>
): StateProxyWriteOk<OUTPUT, SYNC, RELATED, INPUT>;
export function state_proxy_write_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateWriteOk<INPUT, SYNC, RELATED>,
  transform?: StateProxyTransformOk<INPUT, OUTPUT>,
  transformWrite?: StateProxyWriteTransform<OUTPUT, INPUT>
): StateProxyWriteOk<OUTPUT, SYNC, RELATED, INPUT>;
export function state_proxy_write_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateWrite<INPUT, SYNC, RELATED>,
  transformRead?: StateProxyTransformOk<INPUT, OUTPUT>,
  transformWrite?: StateProxyWriteTransform<OUTPUT, INPUT>
) {
  return new StateProxyWriteInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  >(state, transformRead, transformWrite) as StateProxyWriteOk<
    OUTPUT,
    SYNC,
    RELATED,
    INPUT
  >;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
export function state_proxy_write_ok_from_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateWriteOk<INPUT, SYNC, RELATED>,
  transformRead?: StateProxyTransformOkFromOk<INPUT, OUTPUT>,
  transformWrite?: StateProxyWriteTransform<OUTPUT, INPUT>
) {
  return new StateProxyWriteInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    OUTPUT,
    Result<INPUT, StateError>,
    INPUT
  >(state, transformRead as any, transformWrite) as StateProxyWriteOkFromOk<
    OUTPUT,
    SYNC,
    RELATED,
    INPUT
  >;
}
