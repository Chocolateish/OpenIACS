import type { Option, Result, ResultOk } from "@libResult";

/**Struct returned when a state errors*/
export type StateError = {
  /**Description of the reason for the error*/
  reason: string;
  /**Max 4 letter code representing the type of error*/
  code: string;
};

/**Function used to subscribe to state changes
 * @template TYPE - The type of the state’s value when read.*/
export type StateSubscriberBase<TYPE extends Result<any, StateError>> = (
  value: TYPE
) => void;

/**Function used to subscribe to state changes
 * @template TYPE - The type of the state’s value when read.*/
export type StateSubscriber<TYPE> = (value: Result<TYPE, StateError>) => void;

/**Function used to subscribe to state changes with guarenteed Ok value
 * @template TYPE - The type of the state’s value when read.*/
export type StateSubscriberOk<TYPE> = (value: ResultOk<TYPE>) => void;

/**Map of values or states related to a state */
export type StateRelated = {
  [key: string | symbol | number]: any;
};

export type StateHelper<TYPE, L extends StateRelated = {}> = {
  limit?: (value: TYPE) => Option<TYPE>;
  check?: (value: TYPE) => Option<string>;
  related?: () => Option<L>;
};

export type StateSetterBase<TYPE extends Result<any, StateError>, WRITE> = (
  value: WRITE
) => Option<TYPE>;

export type StateSetter<TYPE> = StateSetterBase<Result<TYPE, StateError>, TYPE>;

export type StateSetterOk<TYPE> = StateSetterBase<ResultOk<TYPE>, TYPE>;

//###########################################################################################################################################################
//      _____  ______          _____  ______ _____     _____ ____  _   _ _______ ________   _________
//     |  __ \|  ____|   /\   |  __ \|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//     | |__) | |__     /  \  | |  | | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//     |  _  /|  __|   / /\ \ | |  | |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//     | | \ \| |____ / ____ \| |__| | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//     |_|  \_\______/_/    \_\_____/|______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
//###########################################################################################################################################################
/** Represents a readable state object with subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export interface StateReadBase<
  TYPE extends Result<any, StateError>,
  SYNC extends boolean,
  RELATED extends StateRelated = {}
> {
  /**Allows getting value of state*/
  then<TResult1 = TYPE>(
    func: (value: TYPE) => TResult1 | PromiseLike<TResult1>
  ): PromiseLike<TResult1>;
  /**Gets the current value of the state if state is sync*/
  get(): SYNC extends true ? TYPE : unknown;
  /**Gets the value of the state without result, only works when state is OK */
  getOk(): SYNC extends true
    ? TYPE extends ResultOk<infer T>
      ? T
      : unknown
    : unknown;
  /**This adds a function as a subscriber to the state
   * @param update set true to update subscriber*/
  subscribe<B extends StateSubscriberBase<TYPE>>(func: B, update?: boolean): B;
  /**This removes a function as a subscriber to the state*/
  unsubscribe<B extends StateSubscriberBase<TYPE>>(func: B): B;
  /**This returns related states if any*/
  related(): Option<RELATED>;
  /**Returns state as a readable state type*/
  readonly readable: StateReadBase<TYPE, SYNC, RELATED>;
}

/** Represents a readable state object with subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export type StateRead<
  TYPE,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {}
> = StateReadBase<Result<TYPE, StateError>, SYNC, RELATED>;

/** Represents a readable state object with guarenteed Ok value and subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export type StateReadOk<
  TYPE,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {}
> = StateReadBase<ResultOk<TYPE>, SYNC, RELATED>;

//###########################################################################################################################################################
//     __          _______  _____ _______ ______ _____     _____ ____  _   _ _______ ________   _________
//     \ \        / /  __ \|_   _|__   __|  ____|  __ \   / ____/ __ \| \ | |__   __|  ____\ \ / /__   __|
//      \ \  /\  / /| |__) | | |    | |  | |__  | |__) | | |   | |  | |  \| |  | |  | |__   \ V /   | |
//       \ \/  \/ / |  _  /  | |    | |  |  __| |  _  /  | |   | |  | | . ` |  | |  |  __|   > <    | |
//        \  /\  /  | | \ \ _| |_   | |  | |____| | \ \  | |___| |__| | |\  |  | |  | |____ / . \   | |
//         \/  \/   |_|  \_\_____|  |_|  |______|_|  \_\  \_____\____/|_| \_|  |_|  |______/_/ \_\  |_|
//###########################################################################################################################################################
/** Represents a writable state object with subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.
 * @template WRITE - The type which can be written to the state.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export interface StateWriteBase<
  TYPE extends Result<any, StateError>,
  SYNC extends boolean,
  RELATED extends StateRelated = {},
  WRITE = TYPE extends Result<infer T, StateError> ? T : never
> extends StateReadBase<TYPE, SYNC, RELATED> {
  /** This sets the value of the state and updates all subscribers
   * @returns true if value was accepted, true does not guarentee that the value is set, as values can represent remote resources*/
  write(value: WRITE): boolean;
  /**Limits given value to valid range if possible returns None if not possible */
  limit: (value: WRITE) => Option<WRITE>;
  /**Checks if the value is valid and returns reason for invalidity */
  check: (value: WRITE) => Option<string>;
  /**Returns the same state as just a writable, for access management*/
  readonly writeable: StateWriteBase<TYPE, SYNC, RELATED, WRITE>;
}

/** Represents a writable state object with subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export type StateWrite<
  TYPE,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {}
> = StateWriteBase<Result<TYPE, StateError>, SYNC, RELATED, TYPE>;

/** Represents a writable state object with guarenteed Ok value and subscription and related utilities.
 * @template TYPE - The type of the state’s value when read.
 * @template SYNC - Whether `get()` is available synchronously (true = available).
 * @template RELATED - The type of related states, defaults to an empty object.*/
export type StateWriteOk<
  TYPE,
  SYNC extends boolean = any,
  RELATED extends StateRelated = {}
> = StateWriteBase<ResultOk<TYPE>, SYNC, RELATED, TYPE>;

//###########################################################################################################################################################
//       ____                              _____            _            _
//      / __ \                            / ____|          | |          | |
//     | |  | |_      ___ __   ___ _ __  | |     ___  _ __ | |_ _____  _| |_
//     | |  | \ \ /\ / / '_ \ / _ \ '__| | |    / _ \| '_ \| __/ _ \ \/ / __|
//     | |__| |\ V  V /| | | |  __/ |    | |___| (_) | | | | ||  __/>  <| |_
//      \____/  \_/\_/ |_| |_|\___|_|     \_____\___/|_| |_|\__\___/_/\_\\__|
//###########################################################################################################################################################
/** Represents the standard owner interface for a state object.
 * @template TYPE - The type of the state’s value when read.*/
export interface StateOwnerBase<TYPE extends Result<any, StateError>> {
  /** This sets the value of the state to a result and updates all subscribers */
  set(value: Result<any, StateError>): void;
  /** This sets the value of the state to a ok result and updates all subscribers */
  setOk(value: TYPE extends Result<infer T, StateError> ? T : never): void;
  /** This sets the value of the state to an err result and updates all subscribers */
  setErr(err: TYPE extends ResultOk<any> ? unknown : StateError): void;
  /**Returns the same state as just a owner, for access management*/
  readonly owner: StateOwnerBase<TYPE>;
}

/** Represents the standard owner interface for a state object.
 * @template TYPE - The type of the state’s value when read.*/
export type StateOwner<TYPE> = StateOwnerBase<Result<TYPE, StateError>>;

/** Represents the standard owner interface for a state object, that is guarenteed to be Ok.
 * @template TYPE - The type of the state’s value when read.*/
export type StateOwnerOk<TYPE> = StateOwnerBase<ResultOk<TYPE>>;
