import { Err, Ok, Some, type Option, type Result } from "@libResult";
import type {
  STATE_HELPER_WRITE,
  STATE_RELATED,
  STATE_RXS,
  STATE_RXX,
  STATE_SUB,
} from "./types";

export interface STATE_NUMBER_RELATED extends STATE_RELATED {
  min?: number;
  max?: number;
  unit?: string;
  decimals?: number;
}

export class STATE_NUMBER_HELPER
  implements
    STATE_NUMBER_RELATED,
    STATE_HELPER_WRITE<number, STATE_NUMBER_RELATED>
{
  min: number | undefined;
  max: number | undefined;
  unit: string | undefined;
  decimals: number | undefined;
  step: number | undefined;
  start: number | undefined;
  /**Number limiter struct
   * @param min minimum allowed number
   * @param max maximum allowed number
   * @param step allowed step size for number 0.1 allows 0,0.1,0.2,0.3...
   * @param start start offset for step, 0.5 and step 2 allows 0.5,2.5,4.5,6.5*/
  constructor(
    min?: number,
    max?: number,
    unit?: string,
    decimals?: number,
    step?: number,
    start?: number
  ) {
    if (min !== undefined) this.min = min;
    if (max !== undefined) this.max = max;
    if (unit !== undefined) this.unit = unit;
    if (decimals !== undefined) {
      this.decimals = decimals;
      if (step !== undefined) this.step = step;
      if (start !== undefined) this.start = start;
    } else {
      if (step !== undefined) {
        this.step = step;
        const match = String(step).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        this.decimals = match
          ? Math.max(
              0,
              (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
            )
          : 0;
        if (start !== undefined) {
          this.start = start;
          const match = String(start).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
          this.decimals = Math.max(
            this.decimals,
            match
              ? Math.max(
                  0,
                  (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
                )
              : 0
          );
        }
      }
    }
  }

  limit(value: number): Result<number, string> {
    if (this.step)
      if (this.start)
        value = parseFloat(
          (
            Math.round((value - this.start + Number.EPSILON) / this.step) *
              this.step +
            this.start
          ).toFixed(this.decimals)
        );
      else
        value = parseFloat(
          (
            Math.round((value + Number.EPSILON) / this.step) * this.step
          ).toFixed(this.decimals)
        );
    return Ok(
      Math.min(this.max ?? Infinity, Math.max(this.min ?? -Infinity, value))
    );
  }

  check(value: number): Result<number, string> {
    if ("max" in this && value > (this.max as number))
      return Err(value + " is bigger than the limit of " + this.max);
    if ("min" in this && value < (this.min as number))
      return Err(value + " is smaller than the limit of " + this.max);
    return Ok(value);
  }

  related(): Option<STATE_NUMBER_RELATED> {
    return Some(this as STATE_NUMBER_RELATED);
  }
}

//##################################################################################################################################################
//##################################################################################################################################################

export interface STATE_STRING_RELATED extends STATE_RELATED {
  maxLength?: number;
  maxLengthBytes?: number;
}

export class STATE_STRING_HELPER
  implements
    STATE_STRING_RELATED,
    STATE_HELPER_WRITE<string, STATE_STRING_RELATED>
{
  maxLength: number | undefined;
  maxLengthBytes: number | undefined;
  /**String limiter struct
   * @param maxLength max length for string
   * @param maxLengthBytes max byte length for string*/
  constructor(maxLength?: number, maxLengthBytes?: number) {
    if (maxLength !== undefined) this.maxLength = maxLength;
    if (maxLengthBytes !== undefined) this.maxLengthBytes = maxLengthBytes;
  }
  limit(value: string): Result<string, string> {
    if (this.maxLength && value.length > this.maxLength)
      value = value.slice(0, this.maxLength);
    if (this.maxLengthBytes) {
      value = new TextDecoder().decode(
        new TextEncoder().encode(value).slice(0, this.maxLengthBytes)
      );
      if (value.at(-1)?.charCodeAt(0) === 65533) value = value.slice(0, -1);
    }
    return Ok(value);
  }
  check(value: string): Result<string, string> {
    if ("maxLength" in this && value.length > this.maxLength!)
      return Err(
        "the text is longer than the limit of " + this.maxLength + " characters"
      );
    if (
      "maxLengthBytes" in this &&
      new TextEncoder().encode(value).length > this.maxLengthBytes!
    )
      return Err(
        "the text is longer than the limit of " + this.maxLengthBytes + " bytes"
      );
    return Ok(value);
  }
  related(): Option<STATE_STRING_RELATED> {
    return Some(this as STATE_STRING_RELATED);
  }
}

//##################################################################################################################################################
//##################################################################################################################################################

export type STATE_ENUM_HELPER_LIST = {
  [key: string | number | symbol]: {
    name: string;
    description?: string;
    icon?: () => SVGSVGElement;
  };
};

export interface STATE_ENUM_RELATED<T extends STATE_ENUM_HELPER_LIST>
  extends STATE_RELATED {
  list: T;
}

export class STATE_ENUM_HELPER<
  K extends string | number | symbol,
  T extends STATE_ENUM_HELPER_LIST,
  R extends STATE_RELATED = STATE_ENUM_RELATED<T>
> implements STATE_HELPER_WRITE<K, R>, STATE_ENUM_RELATED<T>
{
  list: T;

  constructor(list: T) {
    this.list = list;
  }

  limit(value: K): Result<K, string> {
    return Ok(value);
  }
  check(value: K): Result<K, string> {
    if (value in this.list) return Ok(value);
    return Err(String(value) + " is not in list");
  }

  related(): Option<R> {
    return Some(this as unknown as R);
  }
}

function enum_iterate<T, R extends STATE_ENUM_RELATED<any>>(
  related: R,
  func: (key: keyof R["list"], val: R["list"][keyof R["list"]]) => T
) {
  return Object.keys(related.list).map((key) => {
    return func(key, related.list[key]);
  });
}

//##################################################################################################################################################
//##################################################################################################################################################
/**Waits for a state to have a specific value or until timeout is reached
 * @param value value to wait for
 * @param state state to wait on
 * @param timeout timeout in milliseconds, default 500ms
 * @returns true if value was reached before timeout, false if timeout was reached*/
async function await_value<T>(
  value: T,
  state: STATE_RXX<T>,
  timeout: number = 500
): Promise<boolean> {
  let func: STATE_SUB<T> = () => {};
  let res = await Promise.race([
    new Promise<false>((a) => setTimeout(a, timeout, false)),
    new Promise<true>((a) => {
      func = state.subscribe((res) => {
        if (res.ok && res.value === value) a(true);
      });
    }),
  ]);
  state.unsubscribe(func);
  return res;
}

//##################################################################################################################################################
//##################################################################################################################################################
/**Compare two states for equality
 * @param state1 first state
 * @param state2 second state
 * @returns true if states are equal*/
async function compare(
  state1: STATE_RXX<any>,
  state2: STATE_RXX<any>
): Promise<boolean> {
  let res1 = await state1;
  let res2 = await state2;
  if (res1.err || res2.err) return false;
  return res1.value === res2.value;
}

//##################################################################################################################################################
//##################################################################################################################################################
/**Compare two sync states for equality
 * @param state1 first state
 * @param state2 second state
 * @returns true if states are equal*/
function compare_sync(state1: STATE_RXS<any>, state2: STATE_RXS<any>): boolean {
  let res1 = state1.get();
  let res2 = state2.get();
  if (res1.err || res2.err) return true;
  return res1.value !== res2.value;
}

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Helper function and types for states */
export const state_helpers = {
  enum_iterate,
  await_value,
  compare,
  compare_sync,
};
