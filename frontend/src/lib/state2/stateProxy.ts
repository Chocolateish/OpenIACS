import { ResultOk, type Option, type Result } from "@libResult";
import { StateBaseRead } from "./stateBase";
import type {
  StateRead,
  StateReadOk,
  StateRelated,
  StateSubscriberBase,
} from "./types";

export type StateProxyTransformBase<
  INPUT extends Result<any, string>,
  OUTPUT extends Result<any, string>
> = (value: INPUT) => OUTPUT;

export type StateProxyTransform<INPUT, OUTPUT> = StateProxyTransformBase<
  Result<INPUT, string>,
  Result<OUTPUT, string>
>;

export type StateProxyTransformFromOk<INPUT, OUTPUT> = StateProxyTransformBase<
  ResultOk<INPUT>,
  Result<OUTPUT, string>
>;

export type StateProxyTransformOk<INPUT, OUTPUT> = StateProxyTransformBase<
  Result<INPUT, string>,
  ResultOk<OUTPUT>
>;

export type StateProxyTransformOkFromOk<INPUT, OUTPUT> =
  StateProxyTransformBase<ResultOk<INPUT>, ResultOk<OUTPUT>>;

export class StateProxyInternal<
  OUTPUT extends Result<any, string>,
  SYNC extends boolean,
  RELATED extends StateRelated,
  INPUT extends Result<any, string>
> extends StateBaseRead<OUTPUT, SYNC, RELATED> {
  /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
   * @param transform - Function to translate value of state or states to something else, false means first states values is used.
   * @param state - The other states to be used in the derived state.*/
  constructor(
    state: StateRead<INPUT, SYNC, RELATED>,
    transform?: StateProxyTransformBase<INPUT, OUTPUT>
  ) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: StateRead<INPUT, SYNC, RELATED>;
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
      this.fulfillReadPromises(this.#buffer);
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
    return func(this.transform(await this.#state));
  }

  get(): SYNC extends true ? OUTPUT : unknown {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get() as INPUT);
  }

  getOk(): SYNC extends true
    ? OUTPUT extends ResultOk<infer T>
      ? T
      : unknown
    : unknown {
    if (this.#buffer) return this.#buffer.unwrap;
    return this.transform(this.#state.get() as INPUT).unwrap;
  }

  related(): Option<RELATED> {
    return this.#state.related();
  }

  get readable(): StateRead<OUTPUT, SYNC, RELATED> {
    return this;
  }

  //##################################################################################################################################################
  //Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: StateRead<INPUT, SYNC, RELATED>) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransform(transform: StateProxyTransformBase<INPUT, OUTPUT>) {
    this.transform = transform;
    if (this.inUse()) {
      this.#buffer = undefined;
      this.#buffer = this.transform(await this.#state);
      this.updateSubscribers(this.#buffer);
      this.fulfillReadPromises(this.#buffer);
    }
  }
}

export interface StateProxy<
  OUTPUT,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<
    Result<OUTPUT, string>,
    SYNC,
    RELATED,
    Result<INPUT, string>
  > {
  readonly readable: StateRead<OUTPUT, SYNC, RELATED>;
  setState(state: StateRead<INPUT, SYNC, RELATED>): void;
  setTransform(transform: StateProxyTransform<INPUT, OUTPUT>): Promise<void>;
}
export interface StateProxyFromOK<
  OUTPUT,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<
    Result<OUTPUT, string>,
    SYNC,
    RELATED,
    ResultOk<INPUT>
  > {
  readonly readable: StateRead<OUTPUT, SYNC, RELATED>;
  setState(state: StateReadOk<INPUT, SYNC, RELATED>): void;
  setTransform(
    transform: StateProxyTransformFromOk<INPUT, OUTPUT>
  ): Promise<void>;
}
export interface StateProxyOk<
  OUTPUT,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<
    ResultOk<OUTPUT>,
    SYNC,
    RELATED,
    Result<INPUT, string>
  > {
  readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
  setState(state: StateRead<INPUT, SYNC, RELATED>): void;
  setTransform(transform: StateProxyTransformOk<INPUT, OUTPUT>): Promise<void>;
}

export interface StateProxyOkFromOk<
  OUTPUT,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {},
  INPUT = OUTPUT
> extends StateProxyInternal<ResultOk<OUTPUT>, SYNC, RELATED, ResultOk<INPUT>> {
  readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
  setState(state: StateReadOk<INPUT, SYNC, RELATED>): void;
  setTransform(
    transform: StateProxyTransformOkFromOk<INPUT, OUTPUT>
  ): Promise<void>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function state_proxy_from<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateRead<INPUT, SYNC, RELATED>,
  transform?: StateProxyTransform<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, string>,
    SYNC,
    RELATED,
    Result<INPUT, string>
  >(state, transform) as StateProxy<OUTPUT, SYNC, RELATED, INPUT>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function state_proxy_from_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateReadOk<INPUT, SYNC, RELATED>,
  transform?: StateProxyTransformFromOk<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, string>,
    SYNC,
    RELATED,
    Result<INPUT, string>
  >(state, transform as any) as StateProxyFromOK<OUTPUT, SYNC, RELATED, INPUT>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function state_proxy_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateRead<INPUT, SYNC, RELATED>,
  transform: StateProxyTransformOk<INPUT, OUTPUT>
): StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
export function state_proxy_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateReadOk<INPUT, SYNC, RELATED>,
  transform?: StateProxyTransformOk<INPUT, OUTPUT>
): StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
export function state_proxy_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateRead<INPUT, SYNC, RELATED>,
  transform?: StateProxyTransformOk<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, string>,
    SYNC,
    RELATED,
    Result<INPUT, string>
  >(state, transform) as StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
export function state_proxy_ok_from_ok<
  INPUT,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  OUTPUT = INPUT
>(
  state: StateReadOk<INPUT, SYNC, RELATED>,
  transform?: StateProxyTransformOkFromOk<INPUT, OUTPUT>
) {
  return new StateProxyInternal<
    Result<OUTPUT, string>,
    SYNC,
    RELATED,
    Result<INPUT, string>
  >(state, transform as any) as StateProxyOkFromOk<
    OUTPUT,
    SYNC,
    RELATED,
    INPUT
  >;
}
