import { Err, None, ResultOk, type Option, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE,
  type STATE_REA_WA,
  type STATE_REA_WS,
  type STATE_RES,
  type STATE_RES_WA,
  type STATE_RES_WS,
  type STATE_ROA_WA,
  type STATE_ROA_WS,
  type STATE_ROS,
} from "../types";

interface OWNER<
  S extends STATE_RES<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransform(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  get state(): STATE<ROUT, any, any>;
  get readOnly(): STATE_RES<ROUT, any>;
}

//##################################################################################################################################################
//      _____  ______  _____
//     |  __ \|  ____|/ ____|
//     | |__) | |__  | (___
//     |  _  /|  __|  \___ \
//     | | \ \| |____ ____) |
//     |_|  \_\______|_____/

export type STATE_PROXY_RES<
  S extends STATE_RES<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
> = STATE_RES<ROUT, any> & OWNER<S, RIN, ROUT>;

export class RES<
    S extends STATE_RES<RIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    ROUT = RIN
  >
  extends STATE_BASE<ROUT, any, any, Result<ROUT, string>>
  implements OWNER<S, RIN, ROUT>
{
  constructor(
    state: S,
    transform?: (value: Result<RIN, string>) => Result<ROUT, string>
  ) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transform(value);
    this.updateSubs(this.#buffer);
  };
  #buffer?: Result<ROUT, string>;

  private transform(value: Result<RIN, string>): Result<ROUT, string> {
    return value as Result<ROUT, string>;
  }

  protected onSubscribe(first: boolean): void {
    if (first) this.#state.sub(this.#subscriber, false);
  }
  protected onUnsubscribe(last: boolean): void {
    if (last) {
      this.#state.unsub(this.#subscriber);
      this.#buffer = undefined;
    }
  }

  //#Owner Context
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  setTransform(transform: (val: Result<RIN, string>) => Result<ROUT, string>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
  get state(): STATE<ROUT, any> {
    return this as STATE<ROUT, any>;
  }
  get readOnly(): STATE_RES<ROUT, any> {
    return this as STATE_RES<ROUT, any>;
  }

  //#Reader Context
  get rok(): false {
    return this.#state.rok as false;
  }
  get rsync(): true {
    return true;
  }
  async then<T = Result<ROUT, string>>(
    func: (value: Result<ROUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }
  get(): Result<ROUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get());
  }
  related(): Option<{}> {
    return None();
  }

  //#Writer Context
  get writable(): boolean {
    return this.#state.writable;
  }
  get wsync(): boolean {
    return this.#state.wsync;
  }
}

/**Creates a sync proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function res_from<S extends STATE_RES<IN>, IN, OUT = IN>(
  state: STATE_ROS<IN>,
  transform?: (value: ResultOk<IN>) => Result<OUT, string>
): STATE_PROXY_RES<S, IN, OUT>;
function res_from<S extends STATE_RES<IN>, IN, OUT = IN>(
  state: STATE_RES<IN>,
  transform?: (value: Result<IN, string>) => Result<OUT, string>
): STATE_PROXY_RES<S, IN, OUT>;
function res_from<S extends STATE_RES<IN>, IN, OUT = IN>(
  state: S,
  transform: any
): STATE_PROXY_RES<S, IN, OUT> {
  return new RES<S, IN, OUT>(state, transform) as STATE_PROXY_RES<S, IN, OUT>;
}

//##################################################################################################################################################
//      _____  ______  _____  __          _______
//     |  __ \|  ____|/ ____| \ \        / / ____|
//     | |__) | |__  | (___    \ \  /\  / / (___
//     |  _  /|  __|  \___ \    \ \/  \/ / \___ \
//     | | \ \| |____ ____) |    \  /\  /  ____) |
//     |_|  \_\______|_____/      \/  \/  |_____/
interface OWNER_WS<
  S,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformRead(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformWrite(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, any>;
  get readOnly(): STATE_RES<ROUT, any, WOUT>;
  get readWrite(): STATE_RES_WS<ROUT, WOUT>;
}

export type STATE_PROXY_RES_WS<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_RES_WS<ROUT, WOUT> & OWNER_WS<S, RIN, WIN, ROUT, WOUT>;

export class RES_WS<
    S extends STATE_RES_WS<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, Result<ROUT, string>>
  implements OWNER_WS<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  ) {
    super();
    this.#state = state;
    if (transformRead) this.transformRead = transformRead;
    if (transformWrite) this.transformWrite = transformWrite;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transformRead(value);
    this.updateSubs(this.#buffer);
  };
  #buffer?: Result<ROUT, string>;

  private transformRead(value: Result<RIN, string>): Result<ROUT, string> {
    return value as Result<ROUT, string>;
  }
  private transformWrite(value: WOUT): WIN {
    return value as unknown as WIN;
  }
  protected onSubscribe(first: boolean): void {
    if (first) this.#state.sub(this.#subscriber, false);
  }
  protected onUnsubscribe(last: boolean): void {
    if (last) {
      this.#state.unsub(this.#subscriber);
      this.#buffer = undefined;
    }
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformRead(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT> {
    return this as STATE<ROUT, WOUT>;
  }
  get readOnly(): STATE_RES<ROUT, any, WOUT> {
    return this as STATE_RES<ROUT, any, WOUT>;
  }
  get readWrite(): STATE_RES_WS<ROUT, WOUT> {
    return this as STATE_RES_WS<ROUT, WOUT>;
  }

  //#Reader Context
  get rok(): false {
    return this.#state.rok as false;
  }
  get rsync(): true {
    return true;
  }
  async then<T = Result<ROUT, string>>(
    func: (value: Result<ROUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
  }
  get(): Result<ROUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transformRead(this.#state.get());
  }
  related(): Option<{}> {
    return None();
  }

  //#Writer Context
  get writable(): true {
    return true;
  }
  get wsync(): true {
    return true;
  }
  write(value: WOUT): Promise<Result<void, string>> {
    return this.#state.write(this.transformWrite(value));
  }
  writeSync(value: WOUT): Result<void, string> {
    return this.#state.writeSync(this.transformWrite(value));
  }
  limit(_value: WOUT): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }
  check(_value: WOUT): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
function res_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WS<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
function res_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WS<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
function res_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT> {
  return new RES_WS<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      _____  ______  _____  __          __
//     |  __ \|  ____|/ ____| \ \        / /\
//     | |__) | |__  | (___    \ \  /\  / /  \
//     |  _  /|  __|  \___ \    \ \/  \/ / /\ \
//     | | \ \| |____ ____) |    \  /\  / ____ \
//     |_|  \_\______|_____/      \/  \/_/    \_\
interface OWNER_WA<
  S,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformRead(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformWrite(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, any>;
  get readOnly(): STATE_RES<ROUT, any, WOUT>;
  get readWrite(): STATE_RES_WA<ROUT, WOUT>;
}

export type STATE_PROXY_RES_WA<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_RES_WA<ROUT, WOUT> & OWNER_WA<S, RIN, WIN, ROUT, WOUT>;

export class RES_WA<
    S extends STATE_RES_WA<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, Result<ROUT, string>>
  implements OWNER_WA<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transformRead: (value: ResultOk<RIN>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  ) {
    super();
    this.#state = state;
    if (transformRead) this.transformRead = transformRead;
    if (transformWrite) this.transformWrite = transformWrite;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transformRead(value);
    this.updateSubs(this.#buffer);
  };
  #buffer?: Result<ROUT, string>;

  private transformRead(value: Result<RIN, string>): Result<ROUT, string> {
    return value as Result<ROUT, string>;
  }
  private transformWrite(value: WOUT): WIN {
    return value as unknown as WIN;
  }
  protected onSubscribe(first: boolean): void {
    if (first) this.#state.sub(this.#subscriber, false);
  }
  protected onUnsubscribe(last: boolean): void {
    if (last) {
      this.#state.unsub(this.#subscriber);
      this.#buffer = undefined;
    }
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformRead(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT> {
    return this as STATE<ROUT, WOUT>;
  }
  get readOnly(): STATE_RES<ROUT, any, WOUT> {
    return this as STATE_RES<ROUT, any, WOUT>;
  }
  get readWrite(): STATE_RES_WA<ROUT, WOUT> {
    return this as STATE_RES_WA<ROUT, WOUT>;
  }

  //#Reader Context
  get rok(): false {
    return this.#state.rok as false;
  }
  get rsync(): true {
    return true;
  }
  async then<T = Result<ROUT, string>>(
    func: (value: Result<ROUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
  }
  get(): Result<ROUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transformRead(this.#state.get());
  }
  related(): Option<{}> {
    return None();
  }

  //#Writer Context
  get writable(): true {
    return true;
  }
  get wsync(): boolean {
    return this.#state.wsync;
  }
  write(value: WOUT): Promise<Result<void, string>> {
    return this.#state.write(this.transformWrite(value));
  }
  limit(_value: WOUT): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }
  check(_value: WOUT): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
function res_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WA<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
function res_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WA<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
function res_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT> {
  return new RES_WA<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy_res = {
  res: res_from,
  res_ws: res_ws_from,
  res_wa: res_wa_from,
};
