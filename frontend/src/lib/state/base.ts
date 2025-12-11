import { type Option, type Result } from "@libResult";
import type { STATE_BASE as BASE, STATE_RELATED, STATE_SUB } from "./types";

export abstract class STATE_BASE<
  RT,
  WT,
  REL extends Option<STATE_RELATED>,
  RRT extends Result<RT, string>
> implements BASE<RT, WT, REL, RRT>
{
  #subscribers: Set<STATE_SUB<RRT>> = new Set();
  #read_promises?: ((val: RRT) => void)[];

  //#Reader Context
  /**Can state value be retrieved syncronously*/
  abstract readonly rsync: boolean;
  /**Is state guarenteed to be Ok */
  abstract readonly rok: boolean;
  /**Allows getting value of state*/
  abstract then<T = RRT>(
    func: (value: RRT) => T | PromiseLike<T>
  ): PromiseLike<T>;
  /**Gets the current value of the state if state is sync*/
  get?(): RRT;
  /**Gets the value of the state without result, only works when state is OK */
  ok?(): RT;
  /**This adds a function as a subscriber to changes to the state
   * @param update set true to update subscriber immediatly*/
  sub<T = STATE_SUB<RRT>>(func: STATE_SUB<RRT>, update?: boolean): T {
    if (this.#subscribers.has(func)) {
      console.error("Function already registered as subscriber", this, func);
      return func as T;
    }
    if (this.#subscribers.size === 0) this.on_subscribe();
    this.#subscribers.add(func);
    if (update) this.then(func as (value: Result<RT, string>) => void);
    return func as T;
  }
  /**This removes a function as a subscriber to the state*/
  unsub<T = STATE_SUB<RRT>>(func: T): T {
    if (this.#subscribers.delete(func as STATE_SUB<RRT>)) {
      if (this.#subscribers.size == 0) this.on_unsubscribe();
    } else console.error("Subscriber not found with state", this, func);
    return func;
  }
  /**This returns related states if any*/
  abstract related(): REL;

  /**Returns if the state is being used */
  in_use(): this | undefined {
    return this.#subscribers.size > 0 ? this : undefined;
  }
  /**Returns if the state has a subscriber */
  has(subscriber: STATE_SUB<RRT>): this | undefined {
    return this.#subscribers.has(subscriber) ? this : undefined;
  }
  /**Returns if the state has a subscriber */
  amount(): number {
    return this.#subscribers.size;
  }

  /**Can state be written syncronously*/
  abstract readonly wsync: boolean;
  /**Is state writable*/
  abstract readonly writable: boolean;

  /** This attempts a write to the state, write is not guaranteed to succeed
   * @returns promise of result with error for the write*/
  write?(value: WT): Promise<Result<void, string>>;
  /**Limits given value to valid range if possible returns None if not possible */
  limit?(value: WT): Result<WT, string>;
  /**Checks if the value is valid and returns reason for invalidity */
  check?(value: WT): Result<WT, string>;
  /** This attempts a write to the state, write is not guaranteed to succeed, this sync method is available on sync states
   * @returns result with error for the write*/
  write_sync?(value: WT): Result<void, string>;

  /**Called when subscriber is added*/
  protected on_subscribe(): void {}
  /**Called when subscriber is removed*/
  protected on_unsubscribe(): void {}

  /**Updates all subscribers with a value */
  protected update_subs(value: RRT): void {
    for (const subscriber of this.#subscribers) {
      try {
        subscriber(value);
      } catch (e) {
        console.error("Failed while calling subscribers ", e, this, subscriber);
      }
    }
  }

  //Promises
  /**Creates a promise which can be fulfilled later with fulRProm */
  protected async append_R_prom<
    T = Result<RT, string>,
    TResult1 = Result<RT, string>
  >(func: (value: T) => TResult1 | PromiseLike<TResult1>): Promise<TResult1> {
    return func(
      await new Promise<T>((a) => {
        (this.#read_promises ??= []).push(
          a as (val: Result<RT, string>) => void
        );
      })
    );
  }
  /**Fulfills all read promises with given value */
  protected ful_R_prom(value: RRT): RRT {
    if (this.#read_promises)
      for (let i = 0; i < this.#read_promises.length; i++)
        this.#read_promises[i](value);
    this.#read_promises = [];
    return value;
  }
}
