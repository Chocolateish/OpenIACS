import { type Option, type Result, type ResultOk } from "@libResult";

/**Function used to subscribe to state changes
 * @template RT - The type of the state’s value when read.*/
export type StateSubscriber<RT> = (value: Result<RT, string>) => void;

/**Function used to subscribe to state changes with guarenteed Ok value
 * @template RT - The type of the state’s value when read.*/
export type StateSubscriberOk<RT> = (value: ResultOk<RT>) => void;

/**Map of values or states related to a state */
export type StateRelated = {
  [key: string | symbol | number]: any;
};

export type StateHelper<RT, L extends StateRelated = {}> = {
  limit?: (value: RT) => Result<RT, string>;
  check?: (value: RT) => Result<RT, string>;
  related?: () => Option<L>;
};

export type StateSetterBase<TYPE extends Result<any, string>, STATE, WRITE> = (
  value: WRITE,
  state: STATE,
  old?: TYPE
) => Promise<Result<void, string>>;

export type StateSetter<TYPE, STATE, WRITE = TYPE> = StateSetterBase<
  Result<TYPE, string>,
  STATE,
  WRITE
>;

export type StateSetterOk<TYPE, STATE, WRITE = TYPE> = StateSetterBase<
  ResultOk<TYPE>,
  STATE,
  WRITE
>;

export type StateSetterSyncBase<
  TYPE extends Result<any, string>,
  STATE,
  WRITE
> = (value: WRITE, state: STATE, old?: TYPE) => Result<void, string>;

export type StateSetterSync<TYPE, STATE, WRITE = TYPE> = StateSetterSyncBase<
  Result<TYPE, string>,
  STATE,
  WRITE
>;

export type StateSetterSyncOk<TYPE, STATE, WRITE = TYPE> = StateSetterSyncBase<
  ResultOk<TYPE>,
  STATE,
  WRITE
>;

//###########################################################################################################################################################
//      _____  ______          _____  ______ _____     _____ ____  _   _ _______ ________   _________
//     |  __ \|  ____|   /\   |  __ \|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |__) | |__     /  \  | |  | | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     |  _  /|  __|   / /\ \ | |  | |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | | \ \| |____ / ____ \| |__| | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//     |_|  \_\______/_/    \_\_____/|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
//###########################################################################################################################################################
/** Represents a readable state object with subscription and related utilities.
 * @template RT - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export interface StateRead<RT, RELATED extends StateRelated = {}> {
  /**Allows getting value of state*/
  then<TResult1 = Result<RT, string>>(
    func: (value: Result<RT, string>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;
  /**Gets the current value of the state if state is sync*/
  get?(): Result<RT, string>;
  /**Gets the value of the state without result, only works when state is OK */
  getOk?(): RT;
  /**This adds a function as a subscriber to changes to the state
   * @param update set true to update subscriber immediatly*/
  subscribe<B extends StateSubscriber<RT>>(func: B, update?: boolean): B;
  /**This removes a function as a subscriber to the state*/
  unsubscribe<B extends StateSubscriber<RT>>(func: B): B;
  /**This returns related states if any*/
  related(): Option<RELATED>;
  /**Returns state as a readable state type*/
  readonly readable: StateRead<RT, RELATED>;
}

/** Represents a readable state object with guarenteed Ok value and subscription and related utilities.
 * @template RT - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export interface StateReadOk<RT, RELATED extends StateRelated = {}>
  extends StateRead<RT, RELATED> {
  then<TResult1 = ResultOk<RT>>(
    func: (value: ResultOk<RT>) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;
  subscribe<B extends StateSubscriberOk<RT>>(func: B, update?: boolean): B;
  unsubscribe<B extends StateSubscriberOk<RT>>(func: B): B;
  readonly readable: StateReadOk<RT, RELATED>;
}

/** Represents a readable state object with subscription and related utilities.
 * @template RT - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export interface StateReadSync<RT, RELATED extends StateRelated = {}>
  extends StateRead<RT, RELATED> {
  /**Gets the current value of the state if state is sync*/
  get(): Result<RT, string>;
  /**Returns state as a readable state type*/
  readonly readable: StateReadSync<RT, RELATED>;
}

/** Represents a readable state object with subscription and related utilities.
 * @template RT - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export interface StateReadOkSync<RT, RELATED extends StateRelated = {}>
  extends StateReadOk<RT, RELATED> {
  /**Gets the current value of the state if state is sync*/
  get(): Result<RT, string>;
  /**Gets the value of the state without result, only works when state is OK */
  getOk(): RT;
  /**Returns state as a readable state type*/
  readonly readable: StateReadOkSync<RT, RELATED>;
}

/** Represents a readable state object with subscription and related utilities.
 * @template RT - The type of the state’s value when read.
 * @template RELATED - The type of related states, defaults to an empty object.*/
export type StateReadSyncOk<
  RT,
  RELATED extends StateRelated = {}
> = StateReadOkSync<RT, RELATED>;

//###########################################################################################################################################################
//     __          _______  _____ _______ ______ _____     _____ ____  _   _ _______ ________   _________
//     \ \        / /  __ \|_   _|__   __|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//      \ \  /\  / /| |__) | | |    | |  | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//       \ \/  \/ / |  _  /  | |    | |  |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//        \  /\  /  | | \ \ _| |_   | |  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//         \/  \/   |_|  \_\_____|  |_|  |______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
//###########################################################################################################################################################
/** Represents a writable state object with subscription and related utilities.
 * @template WT - The type which can be written to the state.*/
export interface StateWrite<WT> {
  /** This attempts a write to the state, write is not guaranteed to succeed
   * @returns promise of result with error for the write*/
  write(value: WT): Promise<Result<void, string>>;
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  writeSync?(value: WT): Result<void, string>;
  /**Limits given value to valid range if possible returns None if not possible */
  limit: (value: WT) => Result<WT, string>;
  /**Checks if the value is valid and returns reason for invalidity */
  check: (value: WT) => Result<WT, string>;
  /**Returns the same state as just a writable, for access management*/
  readonly writeable: StateWrite<WT>;
}

/** Represents a writable state object with guarenteed Ok value and subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.*/
export interface StateWriteSync<WT> extends StateWrite<WT> {
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  writeSync(value: WT): Result<void, string>;
  /**Returns the same state as just a writable, for access management*/
  readonly writeable: StateWriteSync<WT>;
}

//###########################################################################################################################################################
//       ______          ___   _ ______ _____     _____ ____  _   _ _______ ________   _________
//      / __ \ \        / / \ | |  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |  | \ \  /\  / /|  \| | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     | |  | |\ \/  \/ / | . ` |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | |__| | \  /\  /  | |\  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//      \____/   \/  \/   |_| \_|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
//###########################################################################################################################################################
/** Represents the standard owner interface for a state object.
 * @template OT - The type of the state’s value when read.*/
export interface StateOwnerBase<OT> {
  /** This sets the value of the state to a result and updates all subscribers */
  set(value: Result<OT, string>): void;
  /** This sets the value of the state to a ok result and updates all subscribers */
  setOk?(value: OT): void;
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr?(err: OT): void;
  /**Returns the same state as just a owner, for access management*/
  readonly owner: StateOwnerBase<OT>;
}

/** Represents the standard owner interface for a state object.
 * @template OT - The type of the state’s value when read.*/
export interface StateOwner<OT> extends StateOwnerBase<OT> {
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr(err: OT): void;
  /**Returns the same state as just a owner, for access management*/
  readonly owner: StateOwner<OT>;
}

/** Represents the standard owner interface for a state object, that is guarenteed to be Ok.
 * @template OT - The type of the state’s value when read.*/
export interface StateOwnerOk<OT> extends StateOwnerBase<OT> {
  /** This sets the value of the state to a ok result and updates all subscribers */
  setOk(value: OT): void;
  /**Returns the same state as just a owner, for access management*/
  readonly owner: StateOwnerOk<OT>;
}
