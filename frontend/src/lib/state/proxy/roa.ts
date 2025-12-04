import { Err, None, OptionNone, ResultOk, type Result } from "@libResult";
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
  set_state(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(transform: ROA_TRANSFORM<S, RIN, ROUT>): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, OptionNone>;
  get read_only(): STATE_ROA<ROUT, OptionNone, WOUT>;
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
> = STATE_ROA<ROUT, OptionNone, WOUT> & OWNER<S, RIN, ROUT, WIN, WOUT>;

export class ROA<
    S extends STATE<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    ROUT = RIN,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, OptionNone, ResultOk<ROUT>>
  implements OWNER<S, RIN, ROUT, WIN, WOUT>
{
  constructor(
    state: S,
    transform_read?: (value: ResultOk<RIN>) => ResultOk<ROUT>
  ) {
    super();
    this.#state = state;
    if (transform_read) this.transform_read = transform_read;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transform_read(value);
    this.update_subs(this.#buffer);
  };
  #buffer?: ResultOk<ROUT>;

  private transform_read(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
  }
  private transformWrite?: (value: WOUT) => WIN;
  protected on_subscribe(first: boolean, run: boolean = false): void {
    if (first) this.#state.sub(this.#subscriber, run);
  }
  protected on_unsubscribe(last: boolean): void {
    if (last) {
      this.#state.unsub(this.#subscriber);
      this.#buffer = undefined;
    }
  }

  //#Owner Context
  set_state(state: S) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.#state = state;
      this.on_subscribe(true, true);
    } else this.#state = state;
  }
  set_transform_read(transform: ROA_TRANSFORM<S, RIN, ROUT>) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.transform_read = transform;
      this.on_subscribe(true, true);
    } else this.transform_read = transform;
  }
  set_transform_write(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT, OptionNone> {
    return this as STATE<ROUT, WOUT, OptionNone>;
  }
  get read_only(): STATE_ROA<ROUT, OptionNone, WOUT> {
    return this as STATE_ROA<ROUT, OptionNone, WOUT>;
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
    return func(this.transform_read(await this.#state));
  }
  related(): OptionNone {
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
  write_sync(value: WOUT): Result<void, string> {
    if (!this.#state.write_sync) return Err("State not writable");
    if (!this.transformWrite) return Err("State not writable");
    return this.#state.write_sync(this.transformWrite(value));
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
  set_state(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, OptionNone>;
  get read_only(): STATE_ROA<ROUT, OptionNone, WOUT>;
  get read_write(): STATE_ROA_WS<ROUT, WOUT, OptionNone>;
}

export type STATE_PROXY_ROA_WS<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_ROA_WS<ROUT, WOUT, OptionNone> & OWNER_WS<S, RIN, WIN, ROUT, WOUT>;

export class ROA_WS<
    S extends STATE_REA_WS<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, OptionNone, ResultOk<ROUT>>
  implements OWNER_WS<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transform_read?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
    transform_write?: (value: WOUT) => WIN
  ) {
    super();
    this.#state = state;
    if (transform_read) this.transform_read = transform_read;
    if (transform_write) this.transform_write = transform_write;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transform_read(value);
    this.update_subs(this.#buffer);
  };
  #buffer?: ResultOk<ROUT>;

  private transform_read(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
  }
  private transform_write(value: WOUT): WIN {
    return value as unknown as WIN;
  }
  protected on_subscribe(first: boolean, run: boolean = false): void {
    if (first) this.#state.sub(this.#subscriber, run);
  }
  protected on_unsubscribe(last: boolean): void {
    if (last) {
      this.#state.unsub(this.#subscriber);
      this.#buffer = undefined;
    }
  }

  //#Owner Context
  set_state(state: S) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.#state = state;
      this.on_subscribe(true, true);
    } else this.#state = state;
  }
  set_transform_read(transform: (val: Result<RIN, string>) => ResultOk<ROUT>) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.transform_read = transform;
      this.on_subscribe(true, true);
    } else this.transform_read = transform;
  }
  set_transform_write(transform: (val: WOUT) => WIN) {
    this.transform_write = transform;
  }
  get state(): STATE<ROUT, WOUT, OptionNone> {
    return this as STATE<ROUT, WOUT, OptionNone>;
  }
  get read_only(): STATE_ROA<ROUT, OptionNone, WOUT> {
    return this as STATE_ROA<ROUT, OptionNone, WOUT>;
  }
  get read_write(): STATE_ROA_WS<ROUT, WOUT, OptionNone> {
    return this as STATE_ROA_WS<ROUT, WOUT, OptionNone>;
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
    return func(this.transform_read(await this.#state));
  }
  related(): OptionNone {
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
    return this.#state.write(this.transform_write(value));
  }
  write_sync(value: WOUT): Result<void, string> {
    return this.#state.write_sync(this.transform_write(value));
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
 * @param transform_read - Function to transform value of proxy*/
function roa_ws_from<
  S extends STATE_ROA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WS<RIN, WIN>,
  transform_read?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT>;
function roa_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WS<RIN, WIN>,
  transform_read?: (value: Result<RIN, string>) => ResultOk<ROUT>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT>;
function roa_ws_from<
  S extends STATE_REA_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transform_read: any,
  transform_write: any
): STATE_PROXY_ROA_WS<S, RIN, WIN, ROUT, WOUT> {
  return new ROA_WS<S, RIN, WIN, ROUT, WOUT>(
    state,
    transform_read,
    transform_write
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
  set_state(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, OptionNone>;
  get read_only(): STATE_ROA<ROUT, OptionNone, WOUT>;
  get read_write(): STATE_ROA_WA<ROUT, WOUT, OptionNone>;
}

export type STATE_PROXY_ROA_WA<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_ROA_WA<ROUT, WOUT, OptionNone> & OWNER_WA<S, RIN, WIN, ROUT, WOUT>;

export class ROA_WA<
    S extends STATE_REA_WA<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, OptionNone, ResultOk<ROUT>>
  implements OWNER_WA<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transform_read?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
    transform_write?: (value: WOUT) => WIN
  ) {
    super();
    this.#state = state;
    if (transform_read) this.transform_read = transform_read;
    if (transform_write) this.transform_write = transform_write;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transform_read(value);
    this.update_subs(this.#buffer);
  };
  #buffer?: ResultOk<ROUT>;

  private transform_read(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
  }
  private transform_write(value: WOUT): WIN {
    return value as unknown as WIN;
  }
  protected on_subscribe(first: boolean, run: boolean = false): void {
    if (first) this.#state.sub(this.#subscriber, run);
  }
  protected on_unsubscribe(last: boolean): void {
    if (last) {
      this.#state.unsub(this.#subscriber);
      this.#buffer = undefined;
    }
  }

  //#Owner Context
  set_state(state: S) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.#state = state;
      this.on_subscribe(true, true);
    } else this.#state = state;
  }
  set_transform_read(transform: (val: Result<RIN, string>) => ResultOk<ROUT>) {
    if (this.in_use()) {
      this.on_unsubscribe(true);
      this.transform_read = transform;
      this.on_subscribe(true, true);
    } else this.transform_read = transform;
  }
  set_transform_write(transform: (val: WOUT) => WIN) {
    this.transform_write = transform;
  }
  get state(): STATE<ROUT, WOUT, OptionNone> {
    return this as STATE<ROUT, WOUT, OptionNone>;
  }
  get read_only(): STATE_ROA<ROUT, OptionNone, WOUT> {
    return this as STATE_ROA<ROUT, OptionNone, WOUT>;
  }
  get read_write(): STATE_ROA_WA<ROUT, WOUT, OptionNone> {
    return this as STATE_ROA_WA<ROUT, WOUT, OptionNone>;
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
    return func(this.transform_read(await this.#state));
  }
  related(): OptionNone {
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
    return this.#state.write(this.transform_write(value));
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
 * @param transform_read - Function to transform value of proxy*/
function roa_wa_from<
  S extends STATE_ROA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WA<RIN, WIN>,
  transform_read?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT>;
function roa_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WA<RIN, WIN>,
  transform_read?: (value: Result<RIN, string>) => ResultOk<ROUT>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT>;
function roa_wa_from<
  S extends STATE_REA_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transform_read: any,
  transform_write: any
): STATE_PROXY_ROA_WA<S, RIN, WIN, ROUT, WOUT> {
  return new ROA_WA<S, RIN, WIN, ROUT, WOUT>(
    state,
    transform_read,
    transform_write
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
