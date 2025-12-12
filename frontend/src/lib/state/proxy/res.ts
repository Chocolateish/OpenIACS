import { Err, None, OptionNone, ResultOk, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE,
  type STATE_RES,
  type STATE_RES_WA,
  type STATE_RES_WS,
  type STATE_ROS,
  type STATE_ROS_WA,
  type STATE_ROS_WS,
} from "../types";

//##################################################################################################################################################
//      _____  ______  _____
//     |  __ \|  ____|/ ____|
//     | |__) | |__  | (___
//     |  _  /|  __|  \___ \
//     | | \ \| |____ ____) |
//     |_|  \_\______|_____/
interface OWNER<S, RIN, ROUT, WIN, WOUT> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  set_state(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, OptionNone>;
  get read_only(): STATE_RES<ROUT, OptionNone, WOUT>;
}

export type STATE_PROXY_RES<
  S extends STATE_RES<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer WT> ? WT : any,
  WOUT = WIN
> = STATE_RES<ROUT, OptionNone, WOUT> & OWNER<S, RIN, ROUT, WIN, WOUT>;

export class RES<
    S extends STATE_RES<RIN, any, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    ROUT = RIN,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, OptionNone, Result<ROUT, string>>
  implements OWNER<S, RIN, ROUT, WIN, WOUT>
{
  constructor(
    state: S,
    transform_read?: (value: ResultOk<RIN>) => Result<ROUT, string>
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
  #buffer?: Result<ROUT, string>;

  private transform_read(value: Result<RIN, string>): Result<ROUT, string> {
    return value as Result<ROUT, string>;
  }
  private transformWrite?: (value: WOUT) => WIN;
  protected on_subscribe(run: boolean = false): void {
    this.#state.sub(this.#subscriber, run);
  }
  protected on_unsubscribe(): void {
    this.#state.unsub(this.#subscriber);
    this.#buffer = undefined;
  }

  //#Owner Context
  set_state(state: S) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.#state = state;
      this.on_subscribe(true);
    } else this.#state = state;
  }
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.transform_read = transform;
      this.on_subscribe(true);
    } else this.transform_read = transform;
  }
  set_transform_write(transform: (val: WOUT) => WIN) {
    this.transformWrite = transform;
  }
  get state(): STATE<ROUT, WOUT, OptionNone> {
    return this as STATE<ROUT, WOUT, OptionNone>;
  }
  get read_only(): STATE_RES<ROUT, OptionNone, WOUT> {
    return this as STATE_RES<ROUT, OptionNone, WOUT>;
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
    return this.transform_read(this.#state.get());
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
  limit(): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }
  check(): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }
}

/**Creates a sync proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function res_from<
  S extends STATE_ROS<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer WT> ? WT : any,
  WOUT = WIN
>(
  state: STATE_ROS<RIN, any, WIN>,
  transform?: (value: ResultOk<RIN>) => Result<ROUT, string>
): STATE_PROXY_RES<S, RIN, ROUT, WIN, WOUT>;
function res_from<
  S extends STATE_RES<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer RT> ? RT : any,
  WOUT = WIN
>(
  state: STATE_RES<RIN, any, WIN>,
  transform?: (value: Result<RIN, string>) => Result<ROUT, string>
): STATE_PROXY_RES<S, RIN, ROUT, WIN, WOUT>;
function res_from<
  S extends STATE_RES<RIN, any, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN,
  WIN = S extends STATE<any, infer RT> ? RT : any,
  WOUT = WIN
>(
  state: S,
  transform?:
    | ((value: ResultOk<RIN>) => Result<ROUT, string>)
    | ((value: Result<RIN, string>) => Result<ROUT, string>)
): STATE_PROXY_RES<S, RIN, ROUT, WIN, WOUT> {
  return new RES<S, RIN, ROUT, WIN, WOUT>(state, transform) as STATE_PROXY_RES<
    S,
    RIN,
    ROUT,
    WIN,
    WOUT
  >;
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
  set_state(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, OptionNone>;
  get read_only(): STATE_RES<ROUT, OptionNone, WOUT>;
  get read_write(): STATE_RES_WS<ROUT, WOUT, OptionNone>;
}

export type STATE_PROXY_RES_WS<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_RES_WS<ROUT, WOUT, OptionNone> & OWNER_WS<S, RIN, WIN, ROUT, WOUT>;

export class RES_WS<
    S extends STATE_RES_WS<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, OptionNone, Result<ROUT, string>>
  implements OWNER_WS<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transform_read?: (value: ResultOk<RIN>) => Result<ROUT, string>,
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
  #buffer?: Result<ROUT, string>;

  private transform_read(value: Result<RIN, string>): Result<ROUT, string> {
    return value as Result<ROUT, string>;
  }
  private transform_write(value: WOUT): WIN {
    return value as unknown as WIN;
  }
  protected on_subscribe(run: boolean = false): void {
    this.#state.sub(this.#subscriber, run);
  }
  protected on_unsubscribe(): void {
    this.#state.unsub(this.#subscriber);
    this.#buffer = undefined;
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  set_state(state: S) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.#state = state;
      this.on_subscribe(true);
    } else this.#state = state;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.transform_read = transform;
      this.on_subscribe(true);
    } else this.transform_read = transform;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN) {
    this.transform_write = transform;
  }
  get state(): STATE<ROUT, WOUT, OptionNone> {
    return this as STATE<ROUT, WOUT, OptionNone>;
  }
  get read_only(): STATE_RES<ROUT, OptionNone, WOUT> {
    return this as STATE_RES<ROUT, OptionNone, WOUT>;
  }
  get read_write(): STATE_RES_WS<ROUT, WOUT, OptionNone> {
    return this as STATE_RES_WS<ROUT, WOUT, OptionNone>;
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
    return func(this.transform_read(await this.#state));
  }
  get(): Result<ROUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transform_read(this.#state.get());
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
  limit(): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }
  check(): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform_read - Function to transform value of proxy*/
function res_ws_from<
  S extends STATE_ROS_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROS_WS<RIN, WIN>,
  transform_read?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
function res_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_RES_WS<RIN, WIN>,
  transform_read?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
function res_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transform_read?:
    | ((value: ResultOk<RIN>) => Result<ROUT, string>)
    | ((value: Result<RIN, string>) => Result<ROUT, string>),
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT> {
  return new RES_WS<S, RIN, WIN, ROUT, WOUT>(
    state,
    transform_read,
    transform_write
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
  set_state(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN): void;
  get state(): STATE<ROUT, WOUT, OptionNone>;
  get read_only(): STATE_RES<ROUT, OptionNone, WOUT>;
  get read_write(): STATE_RES_WA<ROUT, WOUT, OptionNone>;
}

export type STATE_PROXY_RES_WA<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_RES_WA<ROUT, WOUT, OptionNone> & OWNER_WA<S, RIN, WIN, ROUT, WOUT>;

export class RES_WA<
    S extends STATE_RES_WA<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, OptionNone, Result<ROUT, string>>
  implements OWNER_WA<S, RIN, WIN, ROUT, WOUT>
{
  constructor(
    state: S,
    transform_read?: (value: ResultOk<RIN>) => Result<ROUT, string>,
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
  #buffer?: Result<ROUT, string>;

  private transform_read(value: Result<RIN, string>): Result<ROUT, string> {
    return value as Result<ROUT, string>;
  }
  private transform_write(value: WOUT): WIN {
    return value as unknown as WIN;
  }
  protected on_subscribe(run: boolean = false): void {
    this.#state.sub(this.#subscriber, run);
  }
  protected on_unsubscribe(): void {
    this.#state.unsub(this.#subscriber);
    this.#buffer = undefined;
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  set_state(state: S) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.#state = state;
      this.on_subscribe(true);
    } else this.#state = state;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_read(
    transform: (val: Result<RIN, string>) => Result<ROUT, string>
  ) {
    if (this.in_use()) {
      this.on_unsubscribe();
      this.transform_read = transform;
      this.on_subscribe(true);
    } else this.transform_read = transform;
  }
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  set_transform_write(transform: (val: WOUT) => WIN) {
    this.transform_write = transform;
  }
  get state(): STATE<ROUT, WOUT, OptionNone> {
    return this as STATE<ROUT, WOUT, OptionNone>;
  }
  get read_only(): STATE_RES<ROUT, OptionNone, WOUT> {
    return this as STATE_RES<ROUT, OptionNone, WOUT>;
  }
  get read_write(): STATE_RES_WA<ROUT, WOUT, OptionNone> {
    return this as STATE_RES_WA<ROUT, WOUT, OptionNone>;
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
    return func(this.transform_read(await this.#state));
  }
  get(): Result<ROUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transform_read(this.#state.get());
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
  limit(): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }
  check(): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform_read - Function to transform value of proxy*/
function res_wa_from<
  S extends STATE_ROS_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROS_WA<RIN, WIN>,
  transform_read?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
function res_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_RES_WA<RIN, WIN>,
  transform_read?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
function res_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transform_read?:
    | ((value: ResultOk<RIN>) => Result<ROUT, string>)
    | ((value: Result<RIN, string>) => Result<ROUT, string>),
  transform_write?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT> {
  return new RES_WA<S, RIN, WIN, ROUT, WOUT>(
    state,
    transform_read,
    transform_write
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
