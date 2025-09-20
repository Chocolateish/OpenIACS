//###########################################################################################################################################################
//       ____  _____ _______ _____ ____  _   _
//      / __ \|  __ \__   __|_   _/ __ \| \ | |
//     | |  | | |__) | | |    | || |  | |  \| |
//     | |  | |  ___/  | |    | || |  | | . ` |
//     | |__| | |      | |   _| || |__| | |\  |
//      \____/|_|      |_|  |_____\____/|_| \_|
//###########################################################################################################################################################
interface OptionBase<T> {
  /**Is true when a value is available*/
  readonly some: boolean;
  /**Is true when no value is available*/
  readonly none: boolean;
  /**The value*/
  readonly value?: T;

  /**Returns the contained value, if exists. Throws an error if not.
   * @param msg the message to throw if no value exists.*/
  expect(msg: string): T;

  /**Returns the contained value, if exists. Throws an error if not.*/
  get unwrap(): T;

  /**Returns the contained value or a provided default.
   * @param value value to use as default*/
  unwrapOr<T2>(value: T2): T | T2;

  /**Calls mapper if the Option is `Some`, otherwise returns `None`.
   * This function can be used for control flow based on `Optional` values.*/
  andThen<T2>(mapper: (value: T) => OptionSome<T2>): Option<T2>;
  andThen(mapper: (value: T) => OptionNone): Option<T>;
  andThen<T2>(mapper: (value: T) => Option<T2>): Option<T2>;

  /**Calls mapper if the Option is `None`, otherwise returns `Some`.
   * This function can be used for control flow based on `Optional` values.*/
  orElse<T2>(mapper: () => OptionSome<T2>): Option<T2>;
  orElse(mapper: () => OptionNone): Option<T>;
  orElse<T2>(mapper: () => Option<T2>): Option<T2>;

  /**Maps an `Optional<T>` to `Optional<U>` by applying a function to a contained `Some` value, leaving a `None` value untouched.
   * This function can be used to compose the Options of two functions.*/
  map<U>(mapper: (value: T) => U): Option<U>;

  /**Maps an `Optional<T>` to a `Result<T, E>`.*/
  toResult<E>(error: E): Result<T, E>;
}

class OptionSome<T> implements OptionBase<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }
  get valid(): true {
    return true;
  }
  get some(): true {
    return true;
  }
  get none(): false {
    return false;
  }

  expect(): T {
    return this.value;
  }

  get unwrap(): T {
    return this.value;
  }

  unwrapOr(): T {
    return this.value;
  }

  andThen<T2>(mapper: (value: T) => OptionSome<T2>): OptionSome<T2>;
  andThen(mapper: (value: T) => OptionNone): OptionNone;
  andThen<T2>(mapper: (value: T) => Option<T2>): Option<T2>;
  andThen<T2>(mapper: (value: T) => Option<T2>) {
    return mapper(this.value);
  }

  orElse(): OptionSome<T> {
    return this;
  }

  map<U>(mapper: (value: T) => U): OptionSome<U> {
    return new OptionSome(mapper(this.value));
  }

  toResult(): ResultOk<T> {
    return new ResultOk(this.value);
  }
}

class OptionNone implements OptionBase<never> {
  get valid(): false {
    return false;
  }
  get some(): false {
    return false;
  }
  get none(): true {
    return true;
  }

  expect(msg: string): never {
    throw new Error(msg);
  }

  get unwrap(): never {
    throw new Error(`Tried to unwrap None`);
  }

  unwrapOr<T2>(val: T2): T2 {
    return val;
  }

  andThen(): OptionNone {
    return this;
  }

  orElse<T2>(mapper: () => OptionSome<T2>): OptionSome<T2>;
  orElse(mapper: () => OptionNone): OptionNone;
  orElse<T2>(mapper: () => Option<T2>): Option<T2>;
  orElse<T2>(mapper: () => Option<T2>) {
    return mapper();
  }

  map(): OptionNone {
    return this;
  }

  toResult<E>(error: E): ResultErr<E> {
    return new ResultErr(error);
  }
}

//###########################################################################################################################################################
//      _____                 _ _
//     |  __ \               | | |
//     | |__) |___  ___ _   _| | |_
//     |  _  // _ \/ __| | | | | __|
//     | | \ \  __/\__ \ |_| | | |_
//     |_|  \_\___||___/\__,_|_|\__|
//###########################################################################################################################################################

interface ResultBase<T, E> {
  /**Is true when the result is valid and false when it is invalid*/
  readonly ok: boolean;
  /**Is false when the result is valid and true when it is invalid*/
  readonly err: boolean;
  /**The value for the result, only exists when it is valid*/
  readonly value?: T;
  /**The error for the result, only exists when it is invalid*/
  readonly error?: E;

  /**Returns the contained valid value, if exists. Throws an error if not.
   * @param msg the message to throw if the value is invalid.*/
  expect(msg: string): T;

  /**Returns the contained valid value, if does not exist. Throws an error if it does.
   * @param msg the message to throw if the value is valid.*/
  expectErr(msg: string): E;

  /**Returns the contained valid value.
   * Throws if the value is invalid, with a message provided by the error's value.*/
  get unwrap(): T;

  /**Returns the contained valid value or a provided default.*/
  unwrapOr<T2>(value: T2): T | T2;

  /**Calls mapper function if the result is valid, otherwise returns the error value of self.
   * This function can be used for control flow based on `Result` values.*/
  andThen<T2>(mapper: (value: T) => ResultOk<T2>): Result<T2, E>;
  andThen<E2>(mapper: (value: T) => ResultErr<E2>): Result<T, E2>;
  andThen<T2, E2>(mapper: (value: T) => Result<T2, E2>): Result<T2, E2>;

  /**Calls mapper function if the result is an error, otherwise returns the value self.
   * This function can be used for control flow based on `Result` values.*/
  orElse<T2>(mapper: (error: E) => ResultOk<T2>): Result<T2, E>;
  orElse<E2>(mapper: (error: E) => ResultErr<E2>): Result<T, E2>;
  orElse<T2, E2>(mapper: (error: E) => Result<T2, E2>): Result<T2, E2>;

  /**Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained valid value, leaving an error value untouched.
   * This function can be used to compose the results of two functions.*/
  map<U>(mapper: (value: T) => U): Result<U, E>;

  /**Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained error value, leaving a valid value untouched.
   * This function can be used to pass through a successful result while handling an error.*/
  mapErr<F>(mapper: (error: E) => F): Result<T, F>;

  /**Converts from `Result<T, E>` to `Optional<T>`, discarding the error if any*/
  get toOptional(): Option<T>;
}

class ResultOk<T> implements ResultBase<T, never> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }
  get ok(): true {
    return true;
  }
  get err(): false {
    return false;
  }

  expect(): T {
    return this.value;
  }

  expectErr(msg: string): never {
    throw new Error(msg);
  }

  get unwrap(): T {
    return this.value;
  }

  unwrapOr(): T {
    return this.value;
  }

  andThen<T2>(mapper: (value: T) => ResultOk<T2>): ResultOk<T2>;
  andThen<E2>(mapper: (value: T) => ResultErr<E2>): ResultErr<E2>;
  andThen<T2, E2>(mapper: (value: T) => Result<T2, E2>): Result<T2, E2>;
  andThen<T2, E2>(mapper: (value: T) => Result<T2, E2>) {
    return mapper(this.value);
  }

  orElse(): ResultOk<T> {
    return this;
  }

  map<U>(func: (value: T) => U): ResultOk<U> {
    return new ResultOk(func(this.value));
  }

  mapErr(): ResultOk<T> {
    return this;
  }

  get toOptional(): OptionSome<T> {
    return new OptionSome(this.value);
  }

  /**Returns the contained valid value, but never throws.
   * Unlike `unwrap()`, this method doesn't throw and is only callable on an Ok<T>
   * Therefore, it can be used instead of `unwrap()` as a maintainability safeguard
   * that will fail to compile if the error type of the Result is later changed to an error that can actually occur.*/
  safeUnwrap(): T {
    return this.value;
  }
}

class ResultErr<E> implements ResultBase<never, E> {
  readonly error: E;
  #stack: string | undefined = new Error().stack;

  constructor(error: E) {
    this.error = error;
  }

  get valid(): false {
    return false;
  }
  get ok(): false {
    return false;
  }
  get err(): true {
    return true;
  }

  expect(msg: string): never {
    throw new Error(msg + "\nOriginal " + this.#stack + "\nExpect Error");
  }

  expectErr(): E {
    return this.error;
  }

  get unwrap(): never {
    throw new Error(
      "Tried to unwrap Error\nOriginal " + this.#stack + "\nUnwrap Error"
    );
  }

  unwrapOr<T2>(val: T2): T2 {
    return val;
  }

  andThen(): ResultErr<E> {
    return this;
  }

  orElse<T2>(mapper: (error: E) => ResultOk<T2>): ResultOk<T2>;
  orElse<E2>(mapper: (error: E) => ResultErr<E2>): ResultErr<E2>;
  orElse<T2, E2>(mapper: (error: E) => Result<T2, E2>): Result<T2, E2>;
  orElse<T2, E2>(mapper: (error: E) => Result<T2, E2>) {
    return mapper(this.error);
  }

  map(): ResultErr<E> {
    return this;
  }

  mapErr<F>(mapper: (error: E) => F): ResultErr<F> {
    return new ResultErr(mapper(this.error));
  }

  get toOptional(): OptionNone {
    return new OptionNone();
  }

  /**Returns the stored stack string to the error*/
  get stack(): string | undefined {
    return this.#stack;
  }
}

//###########################################################################################################################################################
//      ______                       _
//     |  ____|                     | |
//     | |__  __  ___ __   ___  _ __| |_
//     |  __| \ \/ / '_ \ / _ \| '__| __|
//     | |____ >  <| |_) | (_) | |  | |_
//     |______/_/\_\ .__/ \___/|_|   \__|
//                 | |
//                 |_|
//###########################################################################################################################################################

export type Result<T, E = T> = ResultOk<T> | ResultErr<E>;
export type ResultAsync<T, E = T> = Promise<Result<T, E>>;
export type Option<T> = OptionSome<T> | OptionNone;
export type OptionAsync<T> = Promise<Option<T>>;

export function Ok<T>(value: T) {
  return new ResultOk<T>(value);
}
export function Err<E>(error: E) {
  return new ResultErr<E>(error);
}
export function Some<T>(value: T) {
  return new OptionSome<T>(value);
}
export function None() {
  return new OptionNone();
}
