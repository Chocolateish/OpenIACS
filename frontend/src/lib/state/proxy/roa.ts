import { Err, None, ResultOk, type Option, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE,
  type STATE_REA,
  type STATE_REA_WA,
  type STATE_REA_WS,
  type STATE_ROA,
  type STATE_ROA_WA,
  type STATE_ROA_WS,
} from "../types";

//##################################################################################################################################################
//      _____   ____
//     |  __ \ / __ \   /\
//     | |__) | |  | | /  \
//     |  _  /| |  | |/ /\ \
//     | | \ \| |__| / ____ \
//     |_|  \_\\____/_/    \_\
interface OWNER<S extends STATE<any, any>, RIN, ROUT, WIN, WOUT> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformRead(transform: ROA_TRANSFORM<S, RIN, ROUT>): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransformWrite(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, any>;
  get readOnly(): STATE_ROA<ROUT, any, WOUT>;
}

type ROA_TRANSFORM<S extends STATE<any, any>, IN, OUT> = (
  value: S extends STATE_ROA<any>
    ? ResultOk<IN>
    : IN extends STATE_REA<any>
    ? Result<IN, string>
    : never
) => ResultOk<OUT>;

export type STATE_PROXY_ROA<
  S extends STATE<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer WT> ? WT : any,
  WOUT = WIN
> = STATE_ROA<ROUT, any, WOUT> & OWNER<S, RIN, ROUT, WIN, WOUT>;

export class ROA<
    S extends STATE<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    ROUT = RIN,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, ResultOk<ROUT>>
  implements OWNER<S, RIN, ROUT, WIN, WOUT>
{
  constructor(
    state: S,
    transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>
  ) {
    super();
    this.#state = state;
    if (transformRead) this.transformRead = transformRead;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transformRead(value);
    this.updateSubs(this.#buffer);
  };
  #buffer?: ResultOk<ROUT>;

  private transformRead(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
  }
  private transformWrite?: (value: WOUT) => WIN;
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
  setTransformRead(transform: ROA_TRANSFORM<S, RIN, ROUT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT, any> {
    return this as STATE<ROUT, WOUT, any>;
  }
  get readOnly(): STATE_ROA<ROUT, any, WOUT> {
    return this as STATE_ROA<ROUT, any, WOUT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): false {
    return this.#state.rsync as false;
  }
  async then<T = ResultOk<ROUT>>(
    func: (value: ResultOk<ROUT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
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
  async write(value: WOUT): Promise<Result<void, string>> {
    if (!this.#state.write) return Err("State not writable");
    if (!this.transformWrite) return Err("State not writable");
    return this.#state.write(this.transformWrite(value));
  }
  writeSync(value: WOUT): Result<void, string> {
    if (!this.#state.writeSync) return Err("State not writable");
    if (!this.transformWrite) return Err("State not writable");
    return this.#state.writeSync(this.transformWrite(value));
  }
  limit(_value: WOUT): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }
  check(_value: WOUT): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }
}

/**Creates a guarenteed ok proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function roa_from<
  S extends STATE_ROA<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer RT> ? RT : any,
  WOUT = WIN
>(
  state: STATE_ROA<RIN, any, WIN>,
  transform?: (value: ResultOk<RIN>) => ResultOk<ROUT>
): STATE_PROXY_ROA<S, RIN, ROUT, WIN, WOUT>;
function roa_from<
  S extends STATE_REA<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer RT> ? RT : any,
  WOUT = WIN
>(
  state: STATE_REA<RIN, any, WIN>,
  transform: (value: Result<RIN, string>) => ResultOk<ROUT>
): STATE_PROXY_ROA<S, RIN, ROUT, WIN, WOUT>;
function roa_from<
  S extends STATE_REA<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer RT> ? RT : any,
  WOUT = WIN
>(state: S, transform: any): STATE_PROXY_ROA<S, RIN, ROUT, WIN, WOUT> {
  return new ROA<S, RIN, ROUT, WIN, WOUT>(state, transform) as STATE_PROXY_ROA<
    S,
    RIN,
    ROUT,
    WIN,
    WOUT
  >;
}

//##################################################################################################################################################
//      _____   ____           __          _______
//     |  __ \ / __ \   /\     \ \        / / ____|
//     | |__) | |  | | /  \     \ \  /\  / / (___
//     |  _  /| |  | |/ /\ \     \ \/  \/ / \___ \
//     | | \ \| |__| / ____ \     \  /\  /  ____) |
//     |_|  \_\\____/_/    \_\     \/  \/  |_____/

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
  get readOnly(): STATE_ROA<ROUT, any, WOUT>;
  get readWrite(): STATE_ROA_WS<ROUT, WOUT>;
}

export type STATE_PROXY_ROA_WS<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_ROA_WS<ROUT, WOUT> & OWNER_WS<S, RIN, WIN, ROUT, WOUT>;

export class ROA_WS<
    S extends STATE_REA_WS<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, ResultOk<ROUT>>
  implements OWNER_WS<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
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
  #buffer?: ResultOk<ROUT>;

  private transformRead(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
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
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  setTransformRead(transform: (val: Result<RIN, string>) => ResultOk<ROUT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT> {
    return this as STATE<ROUT, WOUT>;
  }
  get readOnly(): STATE_ROA<ROUT, any, WOUT> {
    return this as STATE_ROA<ROUT, any, WOUT>;
  }
  get readWrite(): STATE_ROA_WS<ROUT, WOUT> {
    return this as STATE_ROA_WS<ROUT, WOUT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): false {
    return this.#state.rsync as false;
  }
  async then<T = ResultOk<ROUT>>(
    func: (value: ResultOk<ROUT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
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
function roa_ws_from<
  S extends STATE_ROA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WS<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT>;
function roa_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WS<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT>;
function roa_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT> {
  return new ROA_WS<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      _____   ____           __          __
//     |  __ \ / __ \   /\     \ \        / /\
//     | |__) | |  | | /  \     \ \  /\  / /  \
//     |  _  /| |  | |/ /\ \     \ \/  \/ / /\ \
//     | | \ \| |__| / ____ \     \  /\  / ____ \
//     |_|  \_\\____/_/    \_\     \/  \/_/    \_\

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
  get readOnly(): STATE_ROA<ROUT, any, WOUT>;
  get readWrite(): STATE_ROA_WA<ROUT, WOUT>;
}

export type STATE_PROXY_ROA_WA<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_ROA_WA<ROUT, WOUT> & OWNER_WA<S, RIN, WIN, ROUT, WOUT>;

export class ROA_WA<
    S extends STATE_REA_WA<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, ResultOk<ROUT>>
  implements OWNER_WA<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
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
  #buffer?: ResultOk<ROUT>;

  private transformRead(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
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
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  setTransformRead(transform: (val: Result<RIN, string>) => ResultOk<ROUT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT> {
    return this as STATE<ROUT, WOUT>;
  }
  get readOnly(): STATE_ROA<ROUT, any, WOUT> {
    return this as STATE_ROA<ROUT, any, WOUT>;
  }
  get readWrite(): STATE_ROA_WA<ROUT, WOUT> {
    return this as STATE_ROA_WA<ROUT, WOUT>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): false {
    return this.#state.rsync as false;
  }
  async then<T = ResultOk<ROUT>>(
    func: (value: ResultOk<ROUT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
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
function roa_wa_from<
  S extends STATE_ROA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WA<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT>;
function roa_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WA<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT>;
function roa_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT> {
  return new ROA_WA<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy_roa = {
  roa: roa_from,
  roa_ws: roa_ws_from,
  roa_wa: roa_wa_from,
};
