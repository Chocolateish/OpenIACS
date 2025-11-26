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
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\

interface OWNER<S, RIN = S extends STATE<infer RT> ? RT : never, ROUT = RIN> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransform(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  get state(): STATE<ROUT, any, any>;
  get readOnly(): STATE_REA<ROUT, any>;
}

export type STATE_PROXY_REA<
  S extends STATE<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
> = STATE_REA<ROUT, any> & OWNER<S, RIN, ROUT>;

export class REA<
    S extends STATE<RIN>,
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
  get state(): STATE<ROUT, any, any> {
    return this as STATE<ROUT, any, any>;
  }
  get readOnly(): STATE_REA<ROUT, any> {
    return this as STATE_REA<ROUT, any>;
  }

  //#Reader Context
  get rok(): false {
    return this.#state.rok as false;
  }
  get rsync(): false {
    return this.#state.rsync as false;
  }
  async then<T = Result<ROUT, string>>(
    func: (value: Result<ROUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transform(await this.#state));
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

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function rea_from<
  S extends STATE<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
>(
  state: STATE_ROA<RIN>,
  transform?: (value: ResultOk<RIN>) => Result<ROUT, string>
): STATE_PROXY_REA<S, RIN, ROUT>;
function rea_from<
  S extends STATE<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
>(
  state: STATE_REA<RIN>,
  transform?: (value: Result<RIN, string>) => Result<ROUT, string>
): STATE_PROXY_REA<S, RIN, ROUT>;
function rea_from<
  S extends STATE<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
>(state: S, transform: any): STATE_PROXY_REA<S, RIN, ROUT> {
  return new REA<S, RIN, ROUT>(state, transform) as STATE_PROXY_REA<
    S,
    RIN,
    ROUT
  >;
}

//##################################################################################################################################################
//      _____  ______           __          _______
//     |  __ \|  ____|   /\     \ \        / / ____|
//     | |__) | |__     /  \     \ \  /\  / / (___
//     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
//     | | \ \| |____ / ____ \     \  /\  /  ____) |
//     |_|  \_\______/_/    \_\     \/  \/  |_____/
interface OWNER_WX<
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
  get readOnly(): STATE_REA<ROUT, any>;
}

export type STATE_PROXY_REA_WS<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_REA_WS<ROUT, WOUT> & OWNER_WX<S, RIN, WIN, ROUT, WOUT>;

export class REA_WS<
    S extends STATE_REA_WS<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, Result<ROUT, string>>
  implements OWNER_WX<S, RIN, WIN, ROUT, WOUT>
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
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  setTransformRead(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, any, any> {
    return this as STATE<ROUT, any, any>;
  }
  get readOnly(): STATE_REA<ROUT, any> {
    return this as STATE_REA<ROUT, any>;
  }

  //#Reader Context
  get rok(): false {
    return this.#state.rok as false;
  }
  get rsync(): false {
    return this.#state.rsync as false;
  }
  async then<T = Result<ROUT, string>>(
    func: (value: Result<ROUT, string>) => T | PromiseLike<T>
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
function rea_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WS<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT>;
function rea_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WS<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT>;
function rea_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT> {
  return new REA_WS<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      _____  ______           __          __
//     |  __ \|  ____|   /\     \ \        / /\
//     | |__) | |__     /  \     \ \  /\  / /  \
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \
//     | | \ \| |____ / ____ \     \  /\  / ____ \
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\

export type STATE_PROXY_REA_WA<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_REA_WA<ROUT, WOUT> & OWNER_WX<S, RIN, WIN, ROUT, WOUT>;

export class REA_WA<
    S extends STATE_REA_WA<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, Result<ROUT, string>>
  implements OWNER_WX<S, RIN, WIN, ROUT, WOUT>
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
  setState(state: S) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.#state = state;
      this.onSubscribe(true);
    } else this.#state = state;
  }
  setTransformRead(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transformRead = transform;
      this.onSubscribe(true);
    } else this.transformRead = transform;
  }
  setTransformWrite(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, any, any> {
    return this as STATE<ROUT, any, any>;
  }
  get readOnly(): STATE_REA<ROUT, any> {
    return this as STATE_REA<ROUT, any>;
  }

  //#Reader Context
  get rok(): false {
    return this.#state.rok as false;
  }
  get rsync(): false {
    return this.#state.rsync as false;
  }
  async then<T = Result<ROUT, string>>(
    func: (value: Result<ROUT, string>) => T | PromiseLike<T>
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
function rea_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WA<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT>;
function rea_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WA<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT>;
function rea_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT> {
  return new REA_WA<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy_rea = {
  rea: rea_from,
  rea_ws: rea_wa_from,
  rea_wa: rea_ws_from,
};
