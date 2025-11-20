import { None, ResultOk, type Option, type Result } from "@libResult";
import {
  STATE_REA,
  STATE_RES,
  STATE_ROA,
  STATE_ROS,
  type STATE_REX,
  type STATE_ROX,
  type STATE_RXS,
  type STATE_RXX,
} from "./types";

//##################################################################################################################################################
//      _____  ______          _____     _____ _                _____ _____ ______  _____
//     |  __ \|  ____|   /\   |  __ \   / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |__) | |__     /  \  | |  | | | |    | |       /  \  | (___| (___ | |__  | (___
//     |  _  /|  __|   / /\ \ | |  | | | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | | \ \| |____ / ____ \| |__| | | |____| |____ / ____ \ ____) |___) | |____ ____) |
//     |_|  \_\______/_/    \_\_____/   \_____|______/_/    \_\_____/_____/|______|_____/

export class STATE_PROXY_REA<
  S extends STATE_RXX<IN>,
  IN,
  OUT = IN
> extends STATE_REA<OUT> {
  constructor(
    state: STATE_ROX<IN>,
    transform?: (value: ResultOk<IN>) => ResultOk<OUT>
  );
  constructor(
    state: STATE_REX<IN>,
    transform?: (value: Result<IN, string>) => ResultOk<OUT>
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
  async setTransform(
    transform: (val: Result<IN, string>) => Result<OUT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################

type ROA_TRANSFORM<S extends STATE_RXX<any, any>, IN, OUT> = (
  value: S extends STATE_ROX<any>
    ? ResultOk<IN>
    : IN extends STATE_REX<any>
    ? Result<IN, string>
    : never
) => ResultOk<OUT>;

export class STATE_PROXY_ROA<
  S extends STATE_RXX<IN>,
  IN,
  OUT = IN
> extends STATE_ROA<OUT> {
  constructor(
    state: STATE_ROX<IN>,
    transform?: (value: ResultOk<IN>) => ResultOk<OUT>
  );
  constructor(
    state: STATE_REX<IN>,
    transform: (value: Result<IN, string>) => ResultOk<OUT>
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
  #buffer?: ResultOk<OUT>;

  async then<T = ResultOk<OUT>>(
    func: (value: ResultOk<OUT>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transform(await this.#state));
  }

  related(): Option<{}> {
    return None();
  }

  private transform(value: Result<IN, string>): ResultOk<OUT> {
    return value as unknown as ResultOk<OUT>;
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
  async setTransform(transform: ROA_TRANSFORM<S, IN, OUT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################

export class STATE_PROXY_RES<
  S extends STATE_RXS<IN>,
  IN,
  OUT = IN
> extends STATE_RES<OUT> {
  constructor(
    state: STATE_ROS<IN>,
    transform?: (value: ResultOk<IN>) => ResultOk<OUT>
  );
  constructor(
    state: STATE_RES<IN>,
    transform?: (value: Result<IN, string>) => ResultOk<OUT>
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
  async setTransform(
    transform: (val: Result<IN, string>) => Result<OUT, string>
  ) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################

type ROS_TRANSFORM<S extends STATE_RXX<any, any>, IN, OUT> = (
  value: S extends STATE_ROS<any>
    ? ResultOk<IN>
    : IN extends STATE_RES<any>
    ? Result<IN, string>
    : never
) => ResultOk<OUT>;
export class STATE_PROXY_ROS<
  S extends STATE_RXS<IN>,
  IN,
  OUT = IN
> extends STATE_ROS<OUT> {
  constructor(
    state: STATE_ROS<IN>,
    transform?: (value: ResultOk<IN>) => ResultOk<OUT>
  );
  constructor(
    state: STATE_RES<IN>,
    transform: (value: Result<IN, string>) => ResultOk<OUT>
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
  #buffer?: ResultOk<OUT>;

  async then<T = ResultOk<OUT>>(
    func: (value: ResultOk<OUT>) => T | PromiseLike<T>
  ): Promise<T> {
    return func(this.get());
  }

  get(): ResultOk<OUT> {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get());
  }

  getOk(): OUT {
    return this.get().value;
  }

  related(): Option<{}> {
    return None();
  }

  private transform(value: Result<IN, string>): ResultOk<OUT> {
    return value as unknown as ResultOk<OUT>;
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
  async setTransform(transform: ROS_TRANSFORM<S, IN, OUT>) {
    if (this.inUse()) {
      this.onUnsubscribe(true);
      this.transform = transform;
      this.onSubscribe(true);
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//      _____  ______          _____    _____ _   _ _____ _______ _____          _      _____ ____________ _____   _____
//     |  __ \|  ____|   /\   |  __ \  |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \ / ____|
//     | |__) | |__     /  \  | |  | |   | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) | (___
//     |  _  /|  __|   / /\ \ | |  | |   | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  / \___ \
//     | | \ \| |____ / ____ \| |__| |  _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \ ____) |
//     |_|  \_\______/_/    \_\_____/  |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\_____/

/**Creates a proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function rea_from<S extends STATE_RXX<IN>, IN, OUT = IN>(
  state: STATE_ROX<IN>,
  transform?: (value: ResultOk<IN>) => ResultOk<OUT>
): STATE_PROXY_REA<S, IN, OUT>;
function rea_from<S extends STATE_RXX<IN>, IN, OUT = IN>(
  state: STATE_REX<IN>,
  transform?: (value: Result<IN, string>) => ResultOk<OUT>
): STATE_PROXY_REA<S, IN, OUT>;
function rea_from<S extends STATE_RXX<IN>, IN, OUT = IN>(
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
/**Creates a guarenteed ok proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function roa_from<S extends STATE_RXX<IN>, IN, OUT = IN>(
  state: STATE_ROX<IN>,
  transform?: (value: ResultOk<IN>) => ResultOk<OUT>
): STATE_PROXY_ROA<S, IN, OUT>;
function roa_from<S extends STATE_RXX<IN>, IN, OUT = IN>(
  state: STATE_REX<IN>,
  transform: (value: Result<IN, string>) => ResultOk<OUT>
): STATE_PROXY_ROA<S, IN, OUT>;
function roa_from<S extends STATE_RXX<IN>, IN, OUT = IN>(
  state: S,
  transform: any
): STATE_PROXY_ROA<S, IN, OUT> {
  return new STATE_PROXY_ROA<S, IN, OUT>(state as any, transform);
}
const roa = {
  from: roa_from,
  class: STATE_PROXY_ROA,
};

//##################################################################################################################################################
/**Creates a sync proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function res_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: STATE_ROS<IN>,
  transform?: (value: ResultOk<IN>) => ResultOk<OUT>
): STATE_PROXY_RES<S, IN, OUT>;
function res_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: STATE_RES<IN>,
  transform?: (value: Result<IN, string>) => ResultOk<OUT>
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
/**Creates a sync proxy state which mirrors another state, with an optional transform function.
 * @param state - state to proxy.
 * @param transform - Function to transform value of proxy*/
function ros_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: STATE_ROS<IN>,
  transform?: (value: ResultOk<IN>) => ResultOk<OUT>
): STATE_PROXY_ROS<S, IN, OUT>;
function ros_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: STATE_RES<IN>,
  transform: (value: Result<IN, string>) => ResultOk<OUT>
): STATE_PROXY_ROS<S, IN, OUT>;
function ros_from<S extends STATE_RXS<IN>, IN, OUT = IN>(
  state: S,
  transform: any
): STATE_PROXY_ROS<S, IN, OUT> {
  return new STATE_PROXY_ROS<S, IN, OUT>(state as any, transform);
}
const ros = {
  from: ros_from,
  class: STATE_PROXY_ROS,
};

//##################################################################################################################################################
//     __          _______  _____ _______ ______    _____ _                _____ _____ ______  _____
//     \ \        / /  __ \|_   _|__   __|  ____|  / ____| |        /\    / ____/ ____|  ____|/ ____|
//      \ \  /\  / /| |__) | | |    | |  | |__    | |    | |       /  \  | (___| (___ | |__  | (___
//       \ \/  \/ / |  _  /  | |    | |  |  __|   | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//        \  /\  /  | | \ \ _| |_   | |  | |____  | |____| |____ / ____ \ ____) |___) | |____ ____) |
//         \/  \/   |_|  \_\_____|  |_|  |______|  \_____|______/_/    \_\_____/_____/|______|_____/

//##################################################################################################################################################
//     __          _______  _____ _______ ______   _____ _   _ _____ _______ _____          _      _____ ____________ _____   _____
//     \ \        / /  __ \|_   _|__   __|  ____| |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \ / ____|
//      \ \  /\  / /| |__) | | |    | |  | |__      | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) | (___
//       \ \/  \/ / |  _  /  | |    | |  |  __|     | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  / \___ \
//        \  /\  /  | | \ \ _| |_   | |  | |____   _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \ ____) |
//         \/  \/   |_|  \_\_____|  |_|  |______| |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\_____/

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Proxy state redirecting another state */
export const state_proxy = {
  rea,
  roa,
  res,
  ros,
};
