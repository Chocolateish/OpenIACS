import { type Option, type Result, type ResultOk } from "@libResult";

/**Function used to subscribe to state changes
 * @template RT - The type of the state’s value when read.*/
export type STATE_SUB<RRT extends Result<any, string>> = (value: RRT) => void;

export type STATE_INFER_RESULT<S extends STATE<any>> = S extends STATE_ROA<
  infer RT
>
  ? ResultOk<RT>
  : S extends STATE_REA<infer RT>
  ? Result<RT, string>
  : never;

export type STATE_INFER_TYPE<S extends STATE<any>> = S extends STATE<infer RT>
  ? RT
  : never;

export type STATE_INFER_SUB<S extends STATE<any>> = STATE_SUB<
  STATE_INFER_RESULT<S>
>;

/**Map of values or states related to a state */
export type STATE_RELATED = {
  [key: string | symbol | number]: any;
};

export interface STATE_HELPER<WT, REL extends STATE_RELATED = {}> {
  related?: () => Option<REL>;
  limit?: (value: WT) => Result<WT, string>;
  check?: (value: WT) => Result<WT, string>;
}

export type STATE_SET_REX_WA<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Promise<Result<void, string>>;

export type STATE_SET_ROX_WA<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: ResultOk<RT>
) => Promise<Result<void, string>>;

export type STATE_SET_REX_WS<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Result<void, string>;

export type STATE_SET_ROX_WS<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: ResultOk<RT>
) => Result<void, string>;

//###########################################################################################################################################################
//###########################################################################################################################################################
//      _____  ______          _____  ______ _____     _____ ____  _   _ _______ ________   _________
//     |  __ \|  ____|   /\   |  __ \|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |__) | |__     /  \  | |  | | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     |  _  /|  __|   / /\ \ | |  | |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | | \ \| |____ / ____ \| |__| | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//     |_|  \_\______/_/    \_\_____/|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|

export interface STATE_BASE<
  RT,
  WT,
  REL extends STATE_RELATED,
  RRT extends Result<RT, string>
> {
  //#Reader Context
  readonly rsync: boolean;
  readonly rok: boolean;

  /**Allows getting value of state*/
  then<T = RRT>(func: (value: RRT) => T | PromiseLike<T>): PromiseLike<T>;
  /**Gets the current value of the state if state is sync*/
  get?(): RRT;
  /**Gets the value of the state without result, only works when state is OK */
  getOk?(): RT;
  /**This adds a function as a subscriber to changes to the state
   * @param update set true to update subscriber immediatly*/
  sub<T = STATE_SUB<RRT>>(func: STATE_SUB<RRT>, update?: boolean): T;
  /**This removes a function as a subscriber to the state*/
  unsub<T = STATE_SUB<RRT>>(func: STATE_SUB<RRT>): T;
  /**This returns related states if any*/
  related(): Option<REL>;

  /**Returns if the state is being used */
  inUse(): this | undefined;
  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: STATE_SUB<RRT>): this | undefined;
  /**Returns if the state has a subscriber */
  amountSubscriber(): number;

  readonly writable: boolean;
  readonly wsync?: boolean;
  /** This attempts a write to the state, write is not guaranteed to succeed
   * @returns promise of result with error for the write*/
  write?(value: WT): Promise<Result<void, string>>;
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  writeSync?(value: WT): Result<void, string>;
  /**Limits given value to valid range if possible returns None if not possible */
  limit?(value: WT): Result<WT, string>;
  /**Checks if the value is valid and returns reason for invalidity */
  check?(value: WT): Result<WT, string>;
}

interface REA<RT, REL extends STATE_RELATED, WT>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: false;
  readonly wsync: false;
}

interface ROA<RT, REL extends STATE_RELATED, WT>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: false;
  readonly wsync: false;
}

interface RES<RT, REL extends STATE_RELATED, WT>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: false;
  readonly wsync: false;
  get(): Result<RT, string>;
}

interface ROS<RT, REL extends STATE_RELATED, WT>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: false;
  readonly wsync: false;
  get(): ResultOk<RT>;
  getOk(): RT;
}

interface REA_WA<RT, WT, REL extends STATE_RELATED>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: false;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface REA_WS<RT, WT = RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: true;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  writeSync(value: WT): Result<void, string>;
}

interface ROA_WA<RT, WT = RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: false;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface ROA_WS<RT, WT = RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: true;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  writeSync(value: WT): Result<void, string>;
}

interface RES_WA<RT, WT = RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: false;
  get(): Result<RT, string>;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface RES_WS<RT, WT, REL extends STATE_RELATED>
  extends STATE_BASE<RT, WT, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: true;
  get(): Result<RT, string>;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  writeSync(value: WT): Result<void, string>;
}

interface ROS_WA<RT, WT, REL extends STATE_RELATED>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: false;
  get(): ResultOk<RT>;
  getOk(): RT;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface ROS_WS<RT, WT, REL extends STATE_RELATED>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: true;
  get(): ResultOk<RT>;
  getOk(): RT;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  writeSync(value: WT): Result<void, string>;
}

//###########################################################################################################################################################
//      _________     _______  ______  _____
//     |__   __\ \   / /  __ \|  ____|/ ____|
//        | |   \ \_/ /| |__) | |__  | (___
//        | |    \   / |  ___/|  __|  \___ \
//        | |     | |  | |    | |____ ____) |
//        |_|     |_|  |_|    |______|_____/

export type STATE<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL, WT>
  | STATE_ROA<RT, REL, WT>
  | STATE_RES<RT, REL, WT>
  | STATE_ROS<RT, REL, WT>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_REA<RT, REL extends STATE_RELATED = {}, WT = any> =
  | REA<RT, REL, WT>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA<RT, REL, WT>
  | STATE_ROS<RT, REL, WT>
  | STATE_RES<RT, REL, WT>;

export type STATE_ROA<RT, REL extends STATE_RELATED = {}, WT = any> =
  | ROA<RT, REL, WT>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS<RT, REL, WT>;

export type STATE_RES<RT, REL extends STATE_RELATED = {}, WT = any> =
  | RES<RT, REL, WT>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS<RT, REL, WT>;

export type STATE_ROS<RT, REL extends STATE_RELATED = {}, WT = any> =
  | ROS<RT, REL, WT>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_REA_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>;

export type STATE_REA_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | REA_WS<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>;

export type STATE_ROA_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_ROA_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | ROA_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RES_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_RES_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | RES_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_ROS_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_ROS_WS<RT, WT = RT, REL extends STATE_RELATED = {}> = ROS_WS<
  RT,
  WT,
  REL
>;
