import { Err, None, ResultOk, type Option, type Result } from "@libResult";
import {
  STATE_REA_BASE,
  STATE_REA_WA,
  STATE_REA_WS,
  type STATE,
  type STATE_REX,
  type STATE_REX_WA,
  type STATE_REX_WS,
  type STATE_ROX,
  type STATE_ROX_WA,
  type STATE_ROX_WS,
  type STATE_RXX_WA,
  type STATE_RXX_WS,
} from "../types";

//##################################################################################################################################################
//      _____  ______
//     |  __ \|  ____|   /\
//     | |__) | |__     /  \
//     |  _  /|  __|   / /\ \
//     | | \ \| |____ / ____ \
//     |_|  \_\______/_/    \_\

export class STATE_PROXY_REA<
  S extends STATE<IN>,
  IN = S extends STATE<infer RT> ? RT : never,
  OUT = IN
> extends STATE_REA_BASE<OUT> {
  constructor(
    state: STATE_ROX<IN>,
    transform?: (value: ResultOk<IN>) => Result<OUT, string>
  );
  constructor(
    state: STATE_REX<IN>,
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
    if (this.#buffer) return func(this.#buffer);
    return func(this.transform(await this.#state));
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

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function rea_from<S extends STATE<IN>, IN, OUT = IN>(
  state: STATE_ROX<IN>,
  transform?: (value: ResultOk<IN>) => Result<OUT, string>
): STATE_PROXY_REA<S, IN, OUT>;
function rea_from<S extends STATE<IN>, IN, OUT = IN>(
  state: STATE_REX<IN>,
  transform?: (value: Result<IN, string>) => Result<OUT, string>
): STATE_PROXY_REA<S, IN, OUT>;
function rea_from<S extends STATE<IN>, IN, OUT = IN>(
  state: S,
  transform: any
): STATE_PROXY_REA<S, IN, OUT> {
  return new STATE_PROXY_REA<S, IN, OUT>(state as any, transform);
}
const rea = {
  from: rea_from,
  class: STATE_PROXY_REA,
};

//##################################################################################################################################################
//      _____  ______           __          _______
//     |  __ \|  ____|   /\     \ \        / / ____|
//     | |__) | |__     /  \     \ \  /\  / / (___
//     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
//     | | \ \| |____ / ____ \     \  /\  /  ____) |
//     |_|  \_\______/_/    \_\     \/  \/  |_____/

export class STATE_PROXY_REA_WS<
  S extends STATE_RXX_WS<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> extends STATE_REA_WS<ROUT, WOUT> {
  constructor(
    state: STATE_ROX_WS<RIN, WIN>,
    transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  );
  constructor(
    state: STATE_REX_WS<RIN, WIN>,
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
  S extends STATE_RXX_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROX_WS<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT>;
function rea_ws_from<
  S extends STATE_RXX_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REX_WS<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT>;
function rea_ws_from<
  S extends STATE_RXX_WS<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT> {
  return new STATE_PROXY_REA_WS<S, RIN, WIN, ROUT, WOUT>(
    state as any,
    transformRead,
    transformWrite
  );
}
const rea_ws = {
  from: rea_ws_from,
  class: STATE_PROXY_REA_WS,
};

//##################################################################################################################################################
//      _____  ______           __          __
//     |  __ \|  ____|   /\     \ \        / /\
//     | |__) | |__     /  \     \ \  /\  / /  \
//     |  _  /|  __|   / /\ \     \ \/  \/ / /\ \
//     | | \ \| |____ / ____ \     \  /\  / ____ \
//     |_|  \_\______/_/    \_\     \/  \/_/    \_\
export class STATE_PROXY_REA_WA<
  S extends STATE_RXX_WA<RIN, WIN>,
  RIN = S extends STATE<infer RT> ? RT : never,
  WIN = S extends STATE<any, infer WT> ? WT : never,
  ROUT = RIN,
  WOUT = WIN
> extends STATE_REA_WA<ROUT, WOUT> {
  constructor(
    state: STATE_ROX_WA<RIN, WIN>,
    transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
    transformWrite?: (value: WOUT) => WIN
  );
  constructor(
    state: STATE_REX_WA<RIN, WIN>,
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
  S extends STATE_RXX_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_ROX_WA<RIN, WIN>,
  transformRead?: (value: ResultOk<RIN>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT>;
function rea_wa_from<
  S extends STATE_RXX_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: STATE_REX_WA<RIN, WIN>,
  transformRead?: (value: Result<RIN, string>) => Result<ROUT, string>,
  transformWrite?: (value: WOUT) => WIN
): STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT>;
function rea_wa_from<
  S extends STATE_RXX_WA<RIN, WIN>,
  RIN,
  WIN,
  ROUT = RIN,
  WOUT = WIN
>(
  state: S,
  transformRead: any,
  transformWrite: any
): STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT> {
  return new STATE_PROXY_REA_WA<S, RIN, WIN, ROUT, WOUT>(
    state as any,
    transformRead,
    transformWrite
  );
}
const rea_wa = {
  from: rea_wa_from,
  class: STATE_PROXY_REA_WA,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy_rea = {
  rea,
  rea_ws,
  rea_wa,
};
