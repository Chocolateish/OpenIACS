import { type Option, type Result, type ResultOk } from "@libResult";

/**Function used to subscribe to state changes
 * @template RT - The type of the state’s value when read.*/
export type StateSub<RRT extends Result<any, string>> = (value: RRT) => void;

export type StateInferResult<S extends State<any>> = S extends StateROA<
  infer RT
>
  ? ResultOk<RT>
  : S extends StateREA<infer RT>
  ? Result<RT, string>
  : never;

export type StateInferType<S extends State<any>> = S extends State<infer RT>
  ? RT
  : never;

export type StateInferSub<S extends State<any>> = StateSub<StateInferResult<S>>;

/**Map of values or states related to a state */
export type StateRelated = {
  [key: string | symbol | number]: any;
};

export interface StateHelper<WT, REL extends Option<StateRelated>> {
  related?: () => REL;
  limit?: (value: WT) => Result<WT, string>;
  check?: (value: WT) => Result<WT, string>;
}

export type StateSetREXWA<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Promise<Result<void, string>>;

export type StateSetROXWA<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: ResultOk<RT>
) => Promise<Result<void, string>>;

export type StateSetREXWS<RT, S, WT = RT> = (
  value: WT,
  state: S,
  old?: Result<RT, string>
) => Result<void, string>;

export type StateSetROXWS<RT, S, WT = RT> = (
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

export interface StateBase<
  RT,
  WT,
  REL extends Option<StateRelated>,
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
  ok?(): RT;
  /**This adds a function as a subscriber to changes to the state
   * @param update set true to update subscriber immediatly*/
  sub<T = StateSub<RRT>>(func: StateSub<RRT>, update?: boolean): T;
  /**This removes a function as a subscriber to the state*/
  unsub<T = StateSub<RRT>>(func: T): T;
  /**This returns related states if any*/
  related(): REL;

  /**Returns if the state is being used */
  in_use(): this | undefined;
  /**Returns if the state has a subscriber */
  has(subscriber: StateSub<RRT>): this | undefined;
  /**Returns if the state has a subscriber */
  amount(): number;

  readonly writable: boolean;
  readonly wsync?: boolean;
  /** This attempts a write to the state, write is not guaranteed to succeed
   * @returns promise of result with error for the write*/
  write?(value: WT): Promise<Result<void, string>>;
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  write_sync?(value: WT): Result<void, string>;
  /**Limits given value to valid range if possible returns None if not possible */
  limit?(value: WT): Result<WT, string>;
  /**Checks if the value is valid and returns reason for invalidity */
  check?(value: WT): Result<WT, string>;
}

interface REA<RT, REL extends Option<StateRelated>, WT>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: false;
  readonly wsync: false;
}

interface ROA<RT, REL extends Option<StateRelated>, WT>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: false;
  readonly wsync: false;
}

interface RES<RT, REL extends Option<StateRelated>, WT>
  extends StateBase<RT, WT, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: false;
  readonly wsync: false;
  get(): Result<RT, string>;
}

interface ROS<RT, REL extends Option<StateRelated>, WT>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: false;
  readonly wsync: false;
  get(): ResultOk<RT>;
  ok(): RT;
}

interface REAWA<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: false;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface REAWS<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: true;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  write_sync(value: WT): Result<void, string>;
}

interface ROAWA<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: false;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface ROAWS<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: false;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: true;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  write_sync(value: WT): Result<void, string>;
}

interface RESWA<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: false;
  get(): Result<RT, string>;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface RESWS<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, Result<RT, string>> {
  readonly rsync: true;
  readonly rok: false;
  readonly writable: true;
  readonly wsync: true;
  get(): Result<RT, string>;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  write_sync(value: WT): Result<void, string>;
}

interface ROSWA<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: false;
  get(): ResultOk<RT>;
  ok(): RT;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
}

interface ROSWS<RT, WT, REL extends Option<StateRelated>>
  extends StateBase<RT, WT, REL, ResultOk<RT>> {
  readonly rsync: true;
  readonly rok: true;
  readonly writable: true;
  readonly wsync: true;
  get(): ResultOk<RT>;
  ok(): RT;
  write(value: WT): Promise<Result<void, string>>;
  limit(value: WT): Result<WT, string>;
  check(value: WT): Result<WT, string>;
  write_sync(value: WT): Result<void, string>;
}

//###########################################################################################################################################################
//      _________     _______  ______  _____
//     |__   __\ \   / /  __ \|  ____|/ ____|
//        | |   \ \_/ /| |__) | |__  | (___
//        | |    \   / |  ___/|  __|  \___ \
//        | |     | |  | |    | |____ ____) |
//        |_|     |_|  |_|    |______|_____/

export type State<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> =
  | StateREA<RT, REL, WT>
  | StateROA<RT, REL, WT>
  | StateRES<RT, REL, WT>
  | StateROS<RT, REL, WT>
  | StateREAWA<RT, WT, REL>
  | StateREAWS<RT, WT, REL>
  | StateROAWA<RT, WT, REL>
  | StateROAWS<RT, WT, REL>
  | StateRESWA<RT, WT, REL>
  | StateRESWS<RT, WT, REL>
  | StateROSWA<RT, WT, REL>
  | StateROSWS<RT, WT, REL>;

export type StateREA<
  RT,
  REL extends Option<StateRelated> = Option<any>,
  WT = any
> =
  | REA<RT, REL, WT>
  | StateREAWA<RT, WT, REL>
  | StateREAWS<RT, WT, REL>
  | StateROA<RT, REL, WT>
  | StateROS<RT, REL, WT>
  | StateRES<RT, REL, WT>;

export type StateROA<
  RT,
  REL extends Option<StateRelated> = Option<any>,
  WT = any
> =
  | ROA<RT, REL, WT>
  | StateROAWA<RT, WT, REL>
  | StateROAWS<RT, WT, REL>
  | StateROS<RT, REL, WT>;

export type StateRES<
  RT,
  REL extends Option<StateRelated> = Option<any>,
  WT = any
> =
  | RES<RT, REL, WT>
  | StateRESWA<RT, WT, REL>
  | StateRESWS<RT, WT, REL>
  | StateROS<RT, REL, WT>;

export type StateROS<
  RT,
  REL extends Option<StateRelated> = Option<any>,
  WT = any
> = ROS<RT, REL, WT> | StateROSWA<RT, WT, REL> | StateROSWS<RT, WT, REL>;

export type StateREAWA<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> =
  | REAWA<RT, WT, REL>
  | StateREAWS<RT, WT, REL>
  | StateROAWA<RT, WT, REL>
  | StateROSWA<RT, WT, REL>
  | StateRESWA<RT, WT, REL>;

export type StateREAWS<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> =
  | REAWS<RT, WT, REL>
  | StateROAWS<RT, WT, REL>
  | StateROSWS<RT, WT, REL>
  | StateRESWS<RT, WT, REL>;

export type StateROAWA<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> = ROAWA<RT, WT, REL> | StateROAWS<RT, WT, REL> | StateROSWA<RT, WT, REL>;

export type StateROAWS<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> = ROAWS<RT, WT, REL> | StateROSWS<RT, WT, REL>;

export type StateRESWA<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> = RESWA<RT, WT, REL> | StateRESWS<RT, WT, REL> | StateROSWA<RT, WT, REL>;

export type StateRESWS<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> = RESWS<RT, WT, REL> | StateROSWS<RT, WT, REL>;

export type StateROSWA<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> = ROSWA<RT, WT, REL> | StateROSWS<RT, WT, REL>;

export type StateROSWS<
  RT,
  WT = RT,
  REL extends Option<StateRelated> = Option<any>
> = ROSWS<RT, WT, REL>;
