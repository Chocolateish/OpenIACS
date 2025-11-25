import { type Option, type Result, type ResultOk } from "@libResult";

/**Function used to subscribe to state changes
 * @template RT - The type of the state’s value when read.*/
export type STATE_SUB<RRT extends Result<any, string>> = (value: RRT) => void;

export type STATE_INFER_RESULT<S extends STATE<any>> = S extends STATE_ROX<
  infer RT
>
  ? ResultOk<RT>
  : S extends STATE_REX<infer RT>
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

export interface STATE_HELPER<REL extends STATE_RELATED = {}> {
  related?: () => Option<REL>;
}
export interface STATE_HELPER_WRITE<WT, REL extends STATE_RELATED = {}>
  extends STATE_HELPER<REL> {
  limit?: (value: WT) => Result<WT, string>;
  check?: (value: WT) => Result<WT, string>;
}

export type STATE_SET_REX_WA<RT, S extends STATE<any>, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Promise<Result<void, string>>;

export type STATE_SET_ROX_WA<RT, S extends STATE<any>, WT = RT> = (
  value: WT,
  state: S,
  old?: ResultOk<RT>
) => Promise<Result<void, string>>;

export type STATE_SET_REX_WS<RT, S extends STATE<any>, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Result<void, string>;

export type STATE_SET_ROX_WS<RT, S extends STATE<any>, WT = RT> = (
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

interface STATE_BASE<
  RT,
  WT,
  REL extends STATE_RELATED,
  RRT extends Result<RT, string>
> {
  //#Reader Context
  /**Can state value be retrieved syncronously*/
  readonly rsync: boolean;
  /**Is state guarenteed to be Ok */
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
  unsub(func: STATE_SUB<RRT>): STATE_SUB<RRT>;
  /**This returns related states if any*/
  related(): Option<REL>;

  /**Returns if the state is being used */
  inUse(): this | undefined;
  /**Returns if the state has a subscriber */
  hasSubscriber(subscriber: STATE_SUB<RRT>): this | undefined;
  /**Returns if the state has a subscriber */
  amountSubscriber(): number;

  /**Is state writable*/
  readonly writable: boolean;
  /**Can state be written syncronously*/
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

export interface STATE_REA<RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, any, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: false;
  readonly wsync: false;
}

export interface STATE_ROA<RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, any, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: false;
  readonly wsync: false;
}

export interface STATE_RES<RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, any, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: false;
  readonly wsync: false;
  get(): Result<RT, string>;
}

export interface STATE_ROS<RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, any, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: false;
  readonly wsync: false;
  get(): ResultOk<RT>;
  getOk(): RT;
}

export interface STATE_REA_WA<RT, WT = RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: false;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

export interface STATE_REA_WS<RT, WT = RT, REL extends STATE_RELATED = {}>
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

export interface STATE_ROA_WA<RT, WT = RT, REL extends STATE_RELATED = {}>
  extends STATE_BASE<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: false;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

export interface STATE_ROA_WS<RT, WT = RT, REL extends STATE_RELATED = {}>
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

export interface STATE_RES_WA<RT, WT = RT, REL extends STATE_RELATED = {}>
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

export interface STATE_RES_WS<RT, WT = RT, REL extends STATE_RELATED = {}>
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

export interface STATE_ROS_WA<RT, WT = RT, REL extends STATE_RELATED = {}>
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

export interface STATE_ROS_WS<RT, WT = RT, REL extends STATE_RELATED = {}>
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
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_REX<RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_REA_WA<RT, any, REL>
  | STATE_REA_WS<RT, any, REL>
  | STATE_RES_WA<RT, any, REL>
  | STATE_RES_WS<RT, any, REL>;

export type STATE_ROX<RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_ROA_WA<RT, any, REL>
  | STATE_ROA_WS<RT, any, REL>
  | STATE_ROS_WA<RT, any, REL>
  | STATE_ROS_WS<RT, any, REL>;

export type STATE_RXA<RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_REA_WA<RT, any, REL>
  | STATE_REA_WS<RT, any, REL>
  | STATE_ROA_WA<RT, any, REL>
  | STATE_ROA_WS<RT, any, REL>;

export type STATE_RXS<RT, REL extends STATE_RELATED = {}> =
  | STATE_REA<RT, REL>
  | STATE_ROA<RT, REL>
  | STATE_RES<RT, REL>
  | STATE_ROS<RT, REL>
  | STATE_RES_WA<RT, any, REL>
  | STATE_RES_WS<RT, any, REL>
  | STATE_ROS_WA<RT, any, REL>
  | STATE_ROS_WS<RT, any, REL>;

//###########################################################################################################################################################
export type STATE_RXX_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXX_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_RXX_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_REX_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>;

export type STATE_REX_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_RES_WA<RT, WT, REL>;

export type STATE_REX_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WS<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_ROX_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_ROX_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_ROX_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_ROA_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_RXA_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>;

export type STATE_RXA_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WA<RT, WT, REL>
  | STATE_ROA_WA<RT, WT, REL>;

export type STATE_RXA_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_REA_WS<RT, WT, REL>
  | STATE_ROA_WS<RT, WT, REL>;

//###########################################################################################################################################################
export type STATE_RXS_WX<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES_WA<RT, WT, REL>
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

export type STATE_RXS_WA<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES_WA<RT, WT, REL>
  | STATE_ROS_WA<RT, WT, REL>;

export type STATE_RXS_WS<RT, WT = RT, REL extends STATE_RELATED = {}> =
  | STATE_RES_WS<RT, WT, REL>
  | STATE_ROS_WS<RT, WT, REL>;

//###########################################################################################################################################################
//       ______          ___   _ ______ _____     _____ ____  _   _ _______ ________   _________
//      / __ \ \        / / \ | |  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |  | \ \  /\  / /|  \| | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     | |  | |\ \/  \/ / | . ` |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | |__| | \  /\  /  | |\  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//      \____/   \/  \/   |_| \_|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
/** Represents the standard owner interface for a state object.
 * @template OT - The type of the state’s value.*/
export interface StateOwnerAll<OT> {
  /** This sets the value of the state to a result and updates all subscribers */
  set(value: Result<OT, string>): void;
  /** This sets the value of the state to a ok result and updates all subscribers */
  setOk(value: OT): void;
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr?(err: OT): void;
}

/** Represents the standard owner interface for a state object.
 * @template OT - The type of the state’s value.*/
export interface StateOwnerOk<OT> extends StateOwnerAll<OT> {
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr(err: OT): void;
}
