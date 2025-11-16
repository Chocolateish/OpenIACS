import { None, ResultOk, type Option, type Result } from "@libResult";
import { sync } from "./sync";
import {
  STATE_REA,
  STATE_RES,
  STATE_ROA,
  STATE_ROS,
  type STATE,
  type STATE_EX,
  type STATE_OX,
  type STATE_XS,
  type StateSub,
} from "./types";

export type StateProxyTransform<
  IN extends STATE<any, any>,
  OUT = IN extends STATE<infer T, any> ? T : never
> = (
  value: IN extends STATE_OX<infer T, any>
    ? ResultOk<T>
    : IN extends STATE_EX<infer T, any>
    ? Result<T, string>
    : never
) => Result<OUT, string>;

export type StateProxyTransformOk<
  IN extends STATE<any, any>,
  OUT = IN extends STATE<infer T, any> ? T : never
> = (
  value: IN extends STATE_OX<infer T, any>
    ? ResultOk<T>
    : IN extends STATE_EX<infer T, any>
    ? Result<T, string>
    : never
) => ResultOk<OUT>;

//##################################################################################################################################################
//       _____ _                _____ _____ ______  _____
//      / ____| |        /\    / ____/ ____|  ____|/ ____|
//     | |    | |       /  \  | (___| (___ | |__  | (___
//     | |    | |      / /\ \  \___ \\___ \|  __|  \___ \
//     | |____| |____ / ____ \ ____) |___) | |____ ____) |
//      \_____|______/_/    \_\_____/_____/|______|_____/

export class STATE_PROXY_REA<
  IN extends STATE<any, any>,
  OUT = IN extends STATE<infer T, any> ? T : never
> extends STATE_REA<OUT> {
  constructor(state: IN, transform?: StateProxyTransform<IN, OUT>) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: IN;
  #subscriber?: StateSub<any>;
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

  private transform(
    value: Result<IN extends STATE<infer T, any> ? T : never, string>
  ): Result<OUT, string> {
    return value;
  }

  #connect() {
    this.#subscriber = this.#state.subscribe((value) => {
      this.#buffer = this.transform(value);
      this.updateSubscribers(this.#buffer);
    }, false);
  }

  #disconnect() {
    if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
    this.#subscriber = undefined;
    this.#buffer = undefined;
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: IN) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransform(transform: StateProxyTransform<IN, OUT>) {
    if (this.inUse()) {
      this.#disconnect();
      this.transform = transform;
      this.#connect();
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_PROXY_RES<
  IN extends STATE_XS<any, any>,
  OUT = IN extends STATE<infer T, any> ? T : never
> extends STATE_RES<OUT> {
  constructor(state: IN, transform?: StateProxyTransform<IN, OUT>) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: IN;
  #subscriber?: StateSub<any>;
  #buffer?: Result<OUT, string>;

  async then<T = Result<OUT, string>>(
    func: (value: Result<OUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transform(await this.#state));
  }

  get(): Result<OUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get());
  }

  related(): Option<{}> {
    return None();
  }

  private transform(
    value: Result<IN extends STATE<infer T, any> ? T : never, string>
  ): Result<OUT, string> {
    return value;
  }

  #connect() {
    this.#subscriber = this.#state.subscribe((value) => {
      this.#buffer = this.transform(value);
      this.updateSubscribers(this.#buffer);
    }, false);
  }

  #disconnect() {
    if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
    this.#subscriber = undefined;
    this.#buffer = undefined;
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: IN) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransform(transform: StateProxyTransform<IN, OUT>) {
    if (this.inUse()) {
      this.#disconnect();
      this.transform = transform;
      this.#connect();
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_PROXY_ROA<
  IN extends STATE<any, any>,
  OUT = IN extends STATE<infer T, any> ? T : never
> extends STATE_ROA<OUT> {
  constructor(state: IN, transform?: StateProxyTransformOk<IN, OUT>) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: IN;
  #subscriber?: StateSub<any>;
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

  private transform(
    value: Result<IN extends STATE<infer T, any> ? T : never, string>
  ): ResultOk<OUT> {
    return value;
  }

  #connect() {
    this.#subscriber = this.#state.subscribe((value) => {
      this.#buffer = this.transform(value);
      this.updateSubscribers(this.#buffer);
    }, false);
  }

  #disconnect() {
    if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
    this.#subscriber = undefined;
    this.#buffer = undefined;
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: IN) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransform(transform: StateProxyTransform<IN, OUT>) {
    if (this.inUse()) {
      this.#disconnect();
      this.transform = transform;
      this.#connect();
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//##################################################################################################################################################
export class STATE_PROXY_ROS<
  IN extends STATE_XS<any, any>,
  OUT = IN extends STATE<infer T, any> ? T : never
> extends STATE_ROS<OUT> {
  constructor(state: IN, transform?: StateProxyTransform<IN, OUT>) {
    super();
    this.#state = state;
    if (transform) this.transform = transform;
  }

  #state: IN;
  #subscriber?: StateSub<any>;
  #buffer?: Result<OUT, string>;

  async then<T = Result<OUT, string>>(
    func: (value: Result<OUT, string>) => T | PromiseLike<T>
  ): Promise<T> {
    if (this.#buffer) return func(this.#buffer);
    return func(this.transform(await this.#state));
  }

  get(): Result<OUT, string> {
    if (this.#buffer) return this.#buffer;
    return this.transform(this.#state.get());
  }

  related(): Option<{}> {
    return None();
  }

  private transform(
    value: Result<IN extends STATE<infer T, any> ? T : never, string>
  ): Result<OUT, string> {
    return value as any as Result<OUT, string>;
  }

  #connect() {
    this.#subscriber = this.#state.subscribe((value) => {
      this.#buffer = this.transform(value);
      this.updateSubscribers(this.#buffer);
    }, false);
  }

  #disconnect() {
    if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
    this.#subscriber = undefined;
    this.#buffer = undefined;
  }

  //#Owner Context
  /**Sets the state that is being proxied, and updates subscribers with new value*/
  setState(state: IN) {
    if (this.inUse()) {
      this.#disconnect();
      this.#state = state;
      this.#connect();
    } else this.#state = state;
  }

  /**Changes the transform function of the proxy, and updates subscribers with new value*/
  async setTransform(transform: StateProxyTransform<IN, OUT>) {
    if (this.inUse()) {
      this.#disconnect();
      this.transform = transform;
      this.#connect();
    } else this.transform = transform;
  }
}

//##################################################################################################################################################
//      _____ _   _ _____ _______ _____          _      _____ ____________ _____
//     |_   _| \ | |_   _|__   __|_   _|   /\   | |    |_   _|___  /  ____|  __ \
//       | | |  \| | | |    | |    | |    /  \  | |      | |    / /| |__  | |__) |
//       | | | . ` | | |    | |    | |   / /\ \ | |      | |   / / |  __| |  _  /
//      _| |_| |\  |_| |_   | |   _| |_ / ____ \| |____ _| |_ / /__| |____| | \ \
//     |_____|_| \_|_____|  |_|  |_____/_/    \_\______|_____/_____|______|_|  \_\

let rea = {
  /**Creates a proxy state which mirrors another state, with an optional transform function.
   * @param state - state to proxy.
   * @param transform - Function to transform value of proxy*/
  from<
    IN extends STATE<any, any>,
    OUT = IN extends STATE<infer T, any> ? T : never
  >(state: IN, transform?: StateProxyTransform<IN, OUT>) {
    return new STATE_PROXY_REA<IN, OUT>(state, transform);
  },
  class: STATE_PROXY_REA,
};

let res = {
  /**Creates a sync proxy state which mirrors another state, with an optional transform function.
   * @param state - state to proxy.
   * @param transform - Function to transform value of proxy*/
  from<
    IN extends STATE_XS<any, any>,
    OUT = IN extends STATE<infer T, any> ? T : never
  >(state: IN, transform?: StateProxyTransform<IN, OUT>) {
    return new STATE_PROXY_RES<IN, OUT>(state, transform);
  },
  class: STATE_PROXY_RES,
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

export let proxy = {
  rea,
  res,
};

let s = sync.res.ok(42);
let s2 = sync.ros.ok(42);

let p = proxy.rea.from(s, (v) => v);
p.setState(s2);

class A {
  #x = 1;

  // A method that accepts an A and reads its private field
  readX(other: A) {
    return other.#x; // valid only if 'other' truly has A's private slot
  }
}

class B {
  #x = 1;
}

const b = new B();

// This is rejected by TS:
const a: A = b;

a.readX(a);

// export type StateProxyTransformBase<
//   INPUT extends Result<any, string>,
//   OUTPUT extends Result<any, string>
// > = (value: INPUT) => OUTPUT;

// export type StateProxyTransform<INPUT, OUTPUT> = StateProxyTransformBase<
//   Result<INPUT, string>,
//   Result<OUTPUT, string>
// >;

// export type StateProxyTransformFromOk<INPUT, OUTPUT> = StateProxyTransformBase<
//   ResultOk<INPUT>,
//   Result<OUTPUT, string>
// >;

// export type StateProxyTransformOk<INPUT, OUTPUT> = StateProxyTransformBase<
//   Result<INPUT, string>,
//   ResultOk<OUTPUT>
// >;

// export type StateProxyTransformOkFromOk<INPUT, OUTPUT> =
//   StateProxyTransformBase<ResultOk<INPUT>, ResultOk<OUTPUT>>;

// export class StateProxyInternal<
//   OUTPUT extends Result<any, string>,
//   SYNC extends boolean,
//   RELATED extends Related,
//   INPUT extends Result<any, string>
// > extends StateBaseRead<OUTPUT, SYNC, RELATED> {
//   /**Creates a state which is derived from other states. The derived state will update when any of the other states update.
//    * @param transform - Function to translate value of state or states to something else, false means first states values is used.
//    * @param state - The other states to be used in the derived state.*/
//   constructor(
//     state: State<INPUT, SYNC, RELATED>,
//     transform?: StateProxyTransformBase<INPUT, OUTPUT>
//   ) {
//     super();
//     this.#state = state;
//     if (transform) this.transform = transform;
//   }

//   #state: State<INPUT, SYNC, RELATED>;
//   #subscriber?: StateSubscriberBase<INPUT>;
//   #buffer?: OUTPUT;

//   protected transform(value: INPUT): OUTPUT {
//     return value as any as OUTPUT;
//   }

//   protected subOnSubscribe(_first: boolean) {
//     if (_first) this.#connect();
//   }

//   protected subOnUnsubscribe(_last: boolean) {
//     if (_last) this.#disconnect();
//   }

//   #connect() {
//     this.#subscriber = this.#state.subscribe((value) => {
//       this.#buffer = this.transform(value);
//       this.fulfillReadPromises(this.#buffer);
//       this.updateSubscribers(this.#buffer);
//     }, !Boolean(this.#buffer));
//   }

//   #disconnect() {
//     if (this.#subscriber) this.#state.unsubscribe(this.#subscriber);
//     this.#subscriber = undefined;
//     this.#buffer = undefined;
//   }

//   //##################################################################################################################################################
//   //Reader Context
//   async then<TResult1 = OUTPUT>(
//     func: (value: OUTPUT) => TResult1 | PromiseLike<TResult1>
//   ): Promise<TResult1> {
//     if (this.#buffer) return func(this.#buffer);
//     return func(this.transform(await this.#state));
//   }

//   get(): SYNC extends true ? OUTPUT : unknown {
//     if (this.#buffer) return this.#buffer;
//     return this.transform(this.#state.get() as INPUT);
//   }

//   getOk(): SYNC extends true
//     ? OUTPUT extends ResultOk<infer T>
//       ? T
//       : unknown
//     : unknown {
//     if (this.#buffer) return this.#buffer.unwrap;
//     return this.transform(this.#state.get() as INPUT).unwrap;
//   }

//   related(): Option<RELATED> {
//     return this.#state.related();
//   }

//   get readable(): State<OUTPUT, SYNC, RELATED> {
//     return this;
//   }

//   //##################################################################################################################################################
//   //Owner Context
//   /**Sets the state that is being proxied, and updates subscribers with new value*/
//   setState(state: State<INPUT, SYNC, RELATED>) {
//     if (this.inUse()) {
//       this.#disconnect();
//       this.#state = state;
//       this.#connect();
//     } else this.#state = state;
//   }

//   /**Changes the transform function of the proxy, and updates subscribers with new value*/
//   async setTransform(transform: StateProxyTransformBase<INPUT, OUTPUT>) {
//     this.transform = transform;
//     if (this.inUse()) {
//       this.#buffer = undefined;
//       this.#buffer = this.transform(await this.#state);
//       this.updateSubscribers(this.#buffer);
//       this.fulfillReadPromises(this.#buffer);
//     }
//   }
// }

// export interface StateProxy<
//   OUTPUT,
//   SYNC extends boolean = any,
//   RELATED extends Related = {},
//   INPUT = OUTPUT
// > extends StateProxyInternal<
//     Result<OUTPUT, string>,
//     SYNC,
//     RELATED,
//     Result<INPUT, string>
//   > {
//   readonly readable: State<OUTPUT, SYNC, RELATED>;
//   setState(state: State<INPUT, SYNC, RELATED>): void;
//   setTransform(transform: StateProxyTransform<INPUT, OUTPUT>): Promise<void>;
// }
// export interface StateProxyFromOK<
//   OUTPUT,
//   SYNC extends boolean = any,
//   RELATED extends Related = {},
//   INPUT = OUTPUT
// > extends StateProxyInternal<
//     Result<OUTPUT, string>,
//     SYNC,
//     RELATED,
//     ResultOk<INPUT>
//   > {
//   readonly readable: State<OUTPUT, SYNC, RELATED>;
//   setState(state: StateReadOk<INPUT, SYNC, RELATED>): void;
//   setTransform(
//     transform: StateProxyTransformFromOk<INPUT, OUTPUT>
//   ): Promise<void>;
// }
// export interface StateProxyOk<
//   OUTPUT,
//   SYNC extends boolean = any,
//   RELATED extends Related = {},
//   INPUT = OUTPUT
// > extends StateProxyInternal<
//     ResultOk<OUTPUT>,
//     SYNC,
//     RELATED,
//     Result<INPUT, string>
//   > {
//   readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
//   setState(state: State<INPUT, SYNC, RELATED>): void;
//   setTransform(transform: StateProxyTransformOk<INPUT, OUTPUT>): Promise<void>;
// }

// export interface StateProxyOkFromOk<
//   OUTPUT,
//   SYNC extends boolean = any,
//   RELATED extends Related = {},
//   INPUT = OUTPUT
// > extends StateProxyInternal<ResultOk<OUTPUT>, SYNC, RELATED, ResultOk<INPUT>> {
//   readonly readable: StateReadOk<OUTPUT, SYNC, RELATED>;
//   setState(state: StateReadOk<INPUT, SYNC, RELATED>): void;
//   setTransform(
//     transform: StateProxyTransformOkFromOk<INPUT, OUTPUT>
//   ): Promise<void>;
// }

// /**Creates a proxy state which mirrors another state, with an optional transform function.
//  * @param state - state to proxy.
//  * @param transform - Function to transform value of proxy*/
// export function state_proxy_from<
//   INPUT,
//   SYNC extends boolean,
//   RELATED extends Related = {},
//   OUTPUT = INPUT
// >(
//   state: State<INPUT, SYNC, RELATED>,
//   transform?: StateProxyTransform<INPUT, OUTPUT>
// ) {
//   return new StateProxyInternal<
//     Result<OUTPUT, string>,
//     SYNC,
//     RELATED,
//     Result<INPUT, string>
//   >(state, transform) as StateProxy<OUTPUT, SYNC, RELATED, INPUT>;
// }

// /**Creates a proxy state which mirrors another state, with an optional transform function.
//  * @param state - state to proxy.
//  * @param transform - Function to transform value of proxy*/
// export function state_proxy_from_ok<
//   INPUT,
//   SYNC extends boolean,
//   RELATED extends Related = {},
//   OUTPUT = INPUT
// >(
//   state: StateReadOk<INPUT, SYNC, RELATED>,
//   transform?: StateProxyTransformFromOk<INPUT, OUTPUT>
// ) {
//   return new StateProxyInternal<
//     Result<OUTPUT, string>,
//     SYNC,
//     RELATED,
//     Result<INPUT, string>
//   >(state, transform as any) as StateProxyFromOK<OUTPUT, SYNC, RELATED, INPUT>;
// }

// /**Creates a proxy state which mirrors another state, with an optional transform function.
//  * @param state - state to proxy.
//  * @param transform - Function to transform value of proxy*/
// export function state_proxy_ok<
//   INPUT,
//   SYNC extends boolean,
//   RELATED extends Related = {},
//   OUTPUT = INPUT
// >(
//   state: State<INPUT, SYNC, RELATED>,
//   transform: StateProxyTransformOk<INPUT, OUTPUT>
// ): StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
// export function state_proxy_ok<
//   INPUT,
//   SYNC extends boolean,
//   RELATED extends Related = {},
//   OUTPUT = INPUT
// >(
//   state: StateReadOk<INPUT, SYNC, RELATED>,
//   transform?: StateProxyTransformOk<INPUT, OUTPUT>
// ): StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
// export function state_proxy_ok<
//   INPUT,
//   SYNC extends boolean,
//   RELATED extends Related = {},
//   OUTPUT = INPUT
// >(
//   state: State<INPUT, SYNC, RELATED>,
//   transform?: StateProxyTransformOk<INPUT, OUTPUT>
// ) {
//   return new StateProxyInternal<
//     Result<OUTPUT, string>,
//     SYNC,
//     RELATED,
//     Result<INPUT, string>
//   >(state, transform) as StateProxyOk<OUTPUT, SYNC, RELATED, INPUT>;
// }

// /**Creates a proxy state which mirrors another state, with an optional transform function.
//  * @param state - state to proxy.
//  * @param transform - Function to transform value of proxy*/
// export function state_proxy_ok_from_ok<
//   INPUT,
//   SYNC extends boolean,
//   RELATED extends Related = {},
//   OUTPUT = INPUT
// >(
//   state: StateReadOk<INPUT, SYNC, RELATED>,
//   transform?: StateProxyTransformOkFromOk<INPUT, OUTPUT>
// ) {
//   return new StateProxyInternal<
//     Result<OUTPUT, string>,
//     SYNC,
//     RELATED,
//     Result<INPUT, string>
//   >(state, transform as any) as StateProxyOkFromOk<
//     OUTPUT,
//     SYNC,
//     RELATED,
//     INPUT
//   >;
// }
