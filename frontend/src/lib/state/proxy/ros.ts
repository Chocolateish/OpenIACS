import { Err, None, ResultOk, type Option, type Result } from "@libResult";
import { STATE_BASE } from "../base";
import {
  type STATE,
  type STATE_REA_WS,
  type STATE_RES,
  type STATE_RES_WA,
  type STATE_RES_WS,
  type STATE_ROA_WA,
  type STATE_ROA_WS,
  type STATE_ROS,
  type STATE_ROS_WA,
  type STATE_ROS_WS,
} from "../types";

interface OWNER<
  S extends STATE_RES<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
> {
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: S): void;
  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  setTransform(transform: ROS_TRANSFORM<S, RIN, ROUT>): void;
  get state(): STATE<ROUT, any, any>;
  get readOnly(): STATE_ROS<ROUT, any>;
}

//##################################################################################################################################################
//      _____   ____   _____
//     |  __ \ / __ \ / ____|
//     | |__) | |  | | (___
//     |  _  /| |  | |\___ \
//     | | \ \| |__| |____) |
//     |_|  \_\\____/|_____/

type ROS_TRANSFORM<S extends STATE_RES<any, any>, IN, OUT> = (
  value: S extends STATE_ROS<any>
    ? ResultOk<IN>
    : IN extends STATE_RES<any>
    ? Result<IN, string>
    : never
) => ResultOk<OUT>;

export type STATE_PROXY_ROS<
  S extends STATE_RES<RIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  ROUT = RIN
> = STATE_ROS<ROUT, any> & OWNER<S, RIN, ROUT>;

export class ROS<
    S extends STATE_RES<RIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    ROUT = RIN
  >
  extends STATE_BASE<ROUT, any, any, ResultOk<ROUT>>
  implements OWNER<S, RIN, ROUT>
{
  constructor(state: S, transform?: (value: ResultOk<RIN>) => ResultOk<ROUT>) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: S;
  #subscriber = (value: Result<RIN, string>) => {
    this.#buffer = this.transform(value);
    this.updateSubs(this.#buffer);
  };
  #buffer?: ResultOk<ROUT>;

  private transform(value: Result<RIN, string>): ResultOk<ROUT> {
    return value as unknown as ResultOk<ROUT>;
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
  setTransform(transform: ROS_TRANSFORM<S, RIN, ROUT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
  get state(): STATE<ROUT, any, any> {
    return this as STATE<ROUT, any, any>;
  }
  get readOnly(): STATE_ROS<ROUT, any> {
    return this as STATE_ROS<ROUT, any>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = ResultOk<ROUT>>(
    func: (value: ResultOk<ROUT>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }
  get(): ResultOk<ROUT> {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get());
  }
  getOk(): ROUT {
    return this.get().value;
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
function ros_from<S extends STATE_RES<IN>, IN, OUT = IN>(
  state: STATE_ROS<IN>,
  transform?: (value: ResultOk<IN>) => ResultOk<OUT>
): STATE_PROXY_ROS<S, IN, OUT>;
function ros_from<S extends STATE_RES<IN>, IN, OUT = IN>(
  state: STATE_RES<IN>,
  transform: (value: Result<IN, string>) => ResultOk<OUT>
): STATE_PROXY_ROS<S, IN, OUT>;
function ros_from<S extends STATE_RES<IN>, IN, OUT = IN>(
  state: S,
  transform: any
): STATE_PROXY_ROS<S, IN, OUT> {
  return new ROS<S, IN, OUT>(state, transform) as STATE_PROXY_ROS<S, IN, OUT>;
}

//##################################################################################################################################################
//      _____   ____   _____  __          _______
//     |  __ \ / __ \ / ____| \ \        / / ____|
//     | |__) | |  | | (___    \ \  /\  / / (___
//     |  _  /| |  | |\___ \    \ \/  \/ / \___ \
//     | | \ \| |__| |____) |    \  /\  /  ____) |
//     |_|  \_\\____/|_____/      \/  \/  |_____/
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
  get readOnly(): STATE_ROS<ROUT, any>;
}

export type STATE_PROXY_ROS_WS<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_ROS_WS<ROUT, WOUT> & OWNER_WX<S, RIN, WIN, ROUT, WOUT>;

export class ROS_WS<
    S extends STATE_RES_WS<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, ResultOk<ROUT>>
  implements OWNER_WX<S, RIN, WIN, ROUT, WOUT>
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
  get state(): STATE<ROUT, WOUT, any> {
    return this as STATE<ROUT, WOUT, any>;
  }
  get readOnly(): STATE_ROS<ROUT, any> {
    return this as STATE_ROS<ROUT, any>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = ResultOk<ROUT>>(
    func: (value: ResultOk<ROUT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
  }
  get(): ResultOk<ROUT> {
    if (this.#buffer) return this.#buffer;
    return this.transformRead(this.#state.get());
  }
  getOk(): ROUT {
    return this.get().value;
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
function ros_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WS<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROS_WS<S, RIN, WIN, ROUT, WOUT>;
function ros_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REA_WS<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROS_WS<S, RIN, WIN, ROUT, WOUT>;
function ros_ws_from<
  S extends STATE_RES_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_ROS_WS<S, RIN, WIN, ROUT, WOUT> {
  return new ROS_WS<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_ROS_WS<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      _____   ____   _____  __          __
//     |  __ \ / __ \ / ____| \ \        / /\
//     | |__) | |  | | (___    \ \  /\  / /  \
//     |  _  /| |  | |\___ \    \ \/  \/ / /\ \
//     | | \ \| |__| |____) |    \  /\  / ____ \
//     |_|  \_\\____/|_____/      \/  \/_/    \_\
export type STATE_PROXY_ROS_WA<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> = STATE_ROS_WA<ROUT, WOUT> & OWNER_WX<S, RIN, WIN, ROUT, WOUT>;

export class ROS_WA<
    S extends STATE_RES_WA<RIN, WIN>,
    RIN = S extends STATE<infer RT> ? RT : never,
    WIN = S extends STATE<any, infer WT> ? WT : never,
    ROUT = RIN,
    WOUT = WIN
  >
  extends STATE_BASE<ROUT, WOUT, any, ResultOk<ROUT>>
  implements OWNER_WX<S, RIN, WIN, ROUT, WOUT>
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
  get state(): STATE<ROUT, WOUT, any> {
    return this as STATE<ROUT, WOUT, any>;
  }
  get readOnly(): STATE_ROS<ROUT, any> {
    return this as STATE_ROS<ROUT, any>;
  }

  //#Reader Context
  get rok(): true {
    return true;
  }
  get rsync(): true {
    return true;
  }
  async then<T = ResultOk<ROUT>>(
    func: (value: ResultOk<ROUT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transformRead(await this.#state));
  }
  get(): ResultOk<ROUT> {
    if (this.#buffer) return this.#buffer;
    return this.transformRead(this.#state.get());
  }
  getOk(): ROUT {
    return this.get().value;
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
function ros_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROA_WA<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROS_WA<S, RIN, WIN, ROUT, WOUT>;
function ros_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_RES_WA<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => ResultOk<ROUT>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_ROS_WA<S, RIN, WIN, ROUT, WOUT>;
function ros_wa_from<
  S extends STATE_RES_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_ROS_WA<S, RIN, WIN, ROUT, WOUT> {
  return new ROS_WA<S, RIN, WIN, ROUT, WOUT>(
    state,
    transformRead,
    transformWrite
  ) as STATE_PROXY_ROS_WA<S, RIN, WIN, ROUT, WOUT>;
}

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy_ros = {
  ros: ros_from,
  ros_ws: ros_ws_from,
  ros_wa: ros_wa_from,
};
