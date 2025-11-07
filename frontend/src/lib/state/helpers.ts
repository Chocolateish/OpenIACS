import { None, Ok, Some, type Option, type Result } from "@libResult";
import type {
  StateHelper,
  StateRead,
  StateRelated,
  StateSubscriber,
} from "./types";

export async function state_await_value<T>(
  value: T,
  state: StateRead<T, true>,
  timeout: number = 500
): Promise<boolean> {
  let func: StateSubscriber<T>;
  let res = await Promise.race([
    new Promise<false>((a) => setTimeout(a, timeout, false)),
    new Promise<true>((a) => {
      func = state.subscribe((res) => {
        if (res.ok && res.value === value) a(true);
      });
    }),
  ]);
  //@ts-expect-error
  state.unsubscribe(func);
  return res;
}

export interface StateNumberHelperType {
  min?: number;
  max?: number;
  unit?: string;
  decimals?: number;
}

export class StateNumberHelper
  implements StateNumberHelperType, StateHelper<number, StateNumberHelperType>
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

  check(value: number): Option<string> {
    if ("max" in this && value > (this.max as number))
      return Some(value + " is bigger than the limit of " + this.max);
    if ("min" in this && value < (this.min as number))
      return Some(value + " is smaller than the limit of " + this.max);
    return None();
  }

  related(): Option<StateNumberHelperType> {
    return Some(this as StateNumberHelperType);
  }
}

export interface StateStringHelperType {
  maxLength?: number;
  maxLengthBytes?: number;
}

export class StateStringHelper
  implements StateStringHelperType, StateHelper<string, StateStringHelperType>
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
  check(value: string): Option<string> {
    if ("maxLength" in this && value.length > this.maxLength!)
      return Some(
        "the text is longer than the limit of " + this.maxLength + " characters"
      );
    if (
      "maxLengthBytes" in this &&
      new TextEncoder().encode(value).length > this.maxLengthBytes!
    )
      return Some(
        "the text is longer than the limit of " + this.maxLengthBytes + " bytes"
      );
    return None();
  }
  related(): Option<StateStringHelperType> {
    return Some(this as StateStringHelperType);
  }
}

export type StateEnumHelperList = {
  [key: string | number | symbol]: {
    name: string;
    description?: string;
    icon?: () => SVGSVGElement;
  };
};

export interface StateEnumHelperType<T extends StateEnumHelperList>
  extends StateRelated {
  list: T;
}
export interface StateEnumHelperAnyType {
  list?: { [key: string | number | symbol]: { name: string } };
}

export class StateEnumHelper<
  K extends string | number | symbol,
  T extends StateEnumHelperList,
  R extends StateRelated = StateEnumHelperType<T>
> implements StateHelper<K, R>, StateEnumHelperType<T>
{
  list: T;

  constructor(list: T) {
    this.list = list;
  }

  limit(value: K): Result<K, string> {
    return Ok(value);
  }
  check(value: K): Option<string> {
    if (value in this.list) return None();
    return Some(String(value) + " is not in list");
  }

  related(): Option<R> {
    return Some(this as unknown as R);
  }
}

export function state_enum_iterate<T, R extends StateEnumHelperType<any>>(
  related: R,
  func: (key: keyof R["list"], val: R["list"][keyof R["list"]]) => T
) {
  return Object.keys(related.list).map((key) => {
    return func(key, related.list[key]);
  });
}

export async function state_compare(
  state1: StateRead<any, true>,
  state2: StateRead<any, true>
): Promise<boolean> {
  let res1 = await state1;
  let res2 = await state2;
  if (res1.err || res2.err) return false;
  return res1.value === res2.value;
}

export function state_compare_sync(
  state1: StateRead<any, true>,
  state2: StateRead<any, true>
): boolean {
  let res1 = state1.get();
  let res2 = state2.get();
  if (res1.err || res2.err) return false;
  return res1.value === res2.value;
}
