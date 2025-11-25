import { Err, None, ResultOk, type Option, type Result } from "@libResult";
import {
  RES,
  RES_WA,
  RES_WS,
  ROS,
  ROS_WA,
  ROS_WS,
  type STATE,
  type STATE_REX_WA,
  type STATE_REX_WS,
  type STATE_ROX_WA,
  type STATE_ROX_WS,
  type STATE_RXS,
  type STATE_RXS_WA,
  type STATE_RXS_WS,
} from "../types";

//##################################################################################################################################################
//      _____  ______  _____
//     |  __ \|  ____|/ ____|
//     | |__) | |__  | (___
//     |  _  /|  __|  \___ \
//     | | \ \| |____ ____) |
//     |_|  \_\______|_____/
export class STATE_PROXY_RES<
  S extends STATE_RXS<IN>,
  IN = S extends STATE<infer RT> ? RT : never,
  OUT = IN
> extends RES<OUT> {
  constructor(
    state: ROS<IN>,
    transform?: (value: ResultOk<IN>) => Result<OUT, string>
  );
  constructor(
    state: RES<IN>,
    transform?: (value: Result<IN, string>) => Result<OUT, string>
  );
  constructor(state: S, transform: any) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: S;
  #subscriber = (value: Result<IN, string>) => {
    this.#buffer = this.transform(value);
    this.updateSubs(this.#buffer);
  };
  #buffer?: Result<OUT, string>;

  async then<T = Result<OUT, string>>(
    func: (value: Result<OUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }

  get(): Result<OUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get());
  }

  related(): Option<{}> {
    return None();
  }

  private transform(value: Result<IN, string>): Result<OUT, string> {
    return value as Result<OUT, string>;
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
  setTransform(transform: (val: Result<IN, string>) => Result<OUT, string>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
}

/**Creates a sync proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function res_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: ROS<IN>,
  transform?: (value: ResultOk<IN>) => Result<OUT, string>
): STATE_PROXY_RES<S, IN, OUT>;
function res_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: RES<IN>,
  transform?: (value: Result<IN, string>) => Result<OUT, string>
): STATE_PROXY_RES<S, IN, OUT>;
function res_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: S,
  transform: any
): STATE_PROXY_RES<S, IN, OUT> {
  return new STATE_PROXY_RES<S, IN, OUT>(state as any, transform);
}
const res = {
  from: res_from,
  class: STATE_PROXY_RES,
};

//##################################################################################################################################################
//      _____  ______  _____  __          _______
//     |  __ \|  ____|/ ____| \ \        / / ____|
//     | |__) | |__  | (___    \ \  /\  / / (___
//     |  _  /|  __|  \___ \    \ \/  \/ / \___ \
//     | | \ \| |____ ____) |    \  /\  /  ____) |
//     |_|  \_\______|_____/      \/  \/  |_____/

export class STATE_PROXY_RES_WS<
  S extends STATE_RXS_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> extends RES_WS<ROUT, WOUT> {
  constructor(
    state: ROS_WS<RIN, WIN>,
    transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  );
  constructor(
    state: RES_WS<RIN, WIN>,
    transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  );
  constructor(state: S, transformRead: any, transformWrite?: any) {
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
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
function rea_ws_from<
  S extends STATE_RXS_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROX_WS<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
function rea_ws_from<
  S extends STATE_RXS_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REX_WS<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>;
function rea_ws_from<
  S extends STATE_RXS_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT> {
  return new STATE_PROXY_RES_WS<S, RIN, WIN, ROUT, WOUT>(
    state as any,
    transformRead,
    transformWrite
  );
}
const res_ws = {
  from: rea_ws_from,
  class: STATE_PROXY_RES_WS,
};

//##################################################################################################################################################
//      _____  ______  _____  __          __
//     |  __ \|  ____|/ ____| \ \        / /\
//     | |__) | |__  | (___    \ \  /\  / /  \
//     |  _  /|  __|  \___ \    \ \/  \/ / /\ \
//     | | \ \| |____ ____) |    \  /\  / ____ \
//     |_|  \_\______|_____/      \/  \/_/    \_\

export class STATE_PROXY_RES_WA<
  S extends STATE_RXS_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> extends RES_WA<ROUT, WOUT> {
  constructor(
    state: ROS_WA<RIN, WIN>,
    transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  );
  constructor(
    state: RES_WA<RIN, WIN>,
    transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  );
  constructor(state: S, transformRead: any, transformWrite?: any) {
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

  write(value: WOUT): Promise<Result<void, string>> {
    return this.#state.write(this.transformWrite(value));
  }

  limit(_value: WOUT): Result<WOUT, string> {
    return Err("Limit not supported on proxy states");
  }

  check(_value: WOUT): Result<WOUT, string> {
    return Err("Check not supported on proxy states");
  }

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
}

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transformRead - Function to transform value of proxy*/
function rea_wa_from<
  S extends STATE_RXS_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROX_WA<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
function rea_wa_from<
  S extends STATE_RXS_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REX_WA<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>;
function rea_wa_from<
  S extends STATE_RXS_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT> {
  return new STATE_PROXY_RES_WA<S, RIN, WIN, ROUT, WOUT>(
    state as any,
    transformRead,
    transformWrite
  );
}
const res_wa = {
  from: rea_wa_from,
  class: STATE_PROXY_RES_WA,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy_res = {
  res,
  res_ws,
  res_wa,
};
