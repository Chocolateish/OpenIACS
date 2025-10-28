import { ResultOk, type Option, type Result } from "@libResult";
import { StateBase } from "./stateBase";
import type {
  StateError,
  StateRead,
  StateReadBase,
  StateReadOk,
  StateRelated,
  StateSubscriberBase,
} from "./types";

export type StateProxySetterBase<
  INPUT extends Result<any, StateError>,
  OUTPUT extends Result<any, StateError>
> = (value: INPUT) => OUTPUT;

export type StateProxySetter<INPUT, OUTPUT> = StateProxySetterBase<
  Result<INPUT, StateError>,
  Result<OUTPUT, StateError>
>;

export type StateProxySetterFromOk<INPUT, OUTPUT> = StateProxySetterBase<
  ResultOk<INPUT>,
  Result<OUTPUT, StateError>
>;

export type StateProxySetterOk<INPUT, OUTPUT> = StateProxySetterBase<
  Result<INPUT, StateError>,
  ResultOk<OUTPUT>
>;

export type StateProxySetterOkFromOk<INPUT, OUTPUT> = StateProxySetterBase<
  ResultOk<INPUT>,
  ResultOk<OUTPUT>
>;

export class StateProxyInternal<
  OUTPUT extends Result<any, StateError>,
  SYNC extends boolean,
  RELATED extends StateRelated,
  INPUT extends Result<any, StateError>
> extends StateBase<OUTPUT, SYNC, RELATED> {
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param state - The other states to be used in the derived state.*/
  constructor(
    state: StateReadBase<INPUT, SYNC, RELATED>,
    transform?: StateProxySetterBase<INPUT, OUTPUT>
  ) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: StateReadBase<INPUT, SYNC, RELATED>;
  #subscriber?: StateSubscriberBase<INPUT>;
  #buffer?: OUTPUT;

  protected transform(value: INPUT): OUTPUT {
    return value as any as OUTPUT;
  }

  protected subOnSubscribe(_first: boolean) {
    if (_first) this.#connect();
  }

  protected subOnUnsubscribe(_last: boolean) {
    if (_last) this.#disconnect();
  }

  #connect() {
    this.#subscriber = this.#state.subscribe((value) => {
      this.#buffer = this.transform(value);
      this.fulfillPromises(this.#buffer);
      this.updateSubscribers(this.#buffer);
    }, Boolean(this.#buffer));
  }

  #disconnect() {
    if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
    this.#subscriber = undefined;
    this.#buffer = undefined;
  }

  async then<TResult1 = OUTPUT>(
    func: (value: OUTPUT) => TResult1 | PromiseLike<TResult1>
  ): Promise<TResult1> {
    if (this.#buffer) return func(this.#buffer);
    if (!this.#subscriber) this.#connect();
    return this.appendPromise(func);
  }

  get(): SYNC extends true ? OUTPUT : unknown {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get() as INPUT);
  }

  related(): Option<RELATED> {
    return this.#state.related();
  }

  get readable(): StateReadBase<OUTPUT, SYNC, RELATED> {
    return this;
  }

  //Owner

  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: StateReadBase<INPUT, SYNC, RELATED>) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransform(transform: StateProxySetterBase<INPUT, OUTPUT>) {
    this.transform = transform;
    if (this.inUse()) {
      this.#buffer = undefined;
      this.#buffer = this.transform(await this.#state);
      this.updateSubscribers(this.#buffer);
      this.fulfillPromises(this.#buffer);
    }
  }
}

export interface StateProxy<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    Result<INPUT, StateError>
  > {
  readonly readable: StateRead<OUTPUT, SYNC, RELATED>;
  setState(state: StateRead<INPUT, SYNC, RELATED>): void;
  setTransform(transform: StateProxySetter<INPUT, OUTPUT>): Promise<void>;
}
export interface StateProxyFromOK<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    ResultOk<INPUT>
  > {
  readonly readable: StateRead<OUTPUT, SYNC, RELATED>;
  setState(state: StateReadOk<INPUT, SYNC, RELATED>): void;
  setTransform(transform: StateProxySetterFromOk<INPUT, OUTPUT>): Promise<void>;
}
export interface StateProxyOk<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<
    ResultOk<OUTPUT>,
    SYNC,
    RELATED,
    Result<INPUT, StateError>
  > {
  readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
  setState(state: StateRead<INPUT, SYNC, RELATED>): void;
  setTransform(transform: StateProxySetterOk<INPUT, OUTPUT>): Promise<void>;
}

export interface StateProxyOkFromOk<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<ResultOk<OUTPUT>, SYNC, RELATED, ResultOk<INPUT>> {
  readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
  setState(state: StateReadOk<INPUT, SYNC, RELATED>): void;
  setTransform(
    transform: StateProxySetterOkFromOk<INPUT, OUTPUT>
  ): Promise<void>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function from<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
>(
  state: StateRead<INPUT, SYNC, RELATED>,
  transform?: StateProxySetter<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    Result<INPUT, StateError>
  >(state, transform) as StateProxy<OUTPUT, SYNC, RELATED, INPUT>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function from_ok<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
>(
  state: StateReadOk<INPUT, SYNC, RELATED>,
  transform?: StateProxySetterFromOk<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    Result<INPUT, StateError>
  >(state, transform as any) as StateProxyFromOK<OUTPUT, SYNC, RELATED, INPUT>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function ok<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
>(
  state: StateRead<INPUT, SYNC, RELATED>,
  transform?: StateProxySetterOk<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    Result<INPUT, StateError>
  >(state, transform) as StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function ok_from_ok<
  OUTPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
>(
  state: StateReadOk<INPUT, SYNC, RELATED>,
  transform?: StateProxySetterOkFromOk<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, StateError>,
    SYNC,
    RELATED,
    Result<INPUT, StateError>
  >(state, transform as any) as StateProxyOkFromOk<
    OUTPUT,
    SYNC,
    RELATED,
    INPUT
  >;
}
