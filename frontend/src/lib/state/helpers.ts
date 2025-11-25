import { Err, Ok, Some, type Option, type Result } from "@libResult";
import type { SVGFunc } from "@libSVG";
import {
  REA,
  REA_WA,
  REA_WS,
  RES,
  RES_WA,
  RES_WS,
  ROA,
  ROA_WA,
  ROA_WS,
  ROS,
  ROS_WA,
  ROS_WS,
  STATE_IS,
  type STATE,
  type STATE_HELPER_WRITE,
  type STATE_RELATED,
  type STATE_REX,
  type STATE_ROX,
  type STATE_RXA,
  type STATE_RXS,
  type STATE_SUB,
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

const nums = {
  /**Number limiter struct
   * @param min minimum allowed number
   * @param max maximum allowed number
   * @param unit unit for number
   * @param decimals number of suggested decimals to show
   * @param step allowed step size for number 0.1 allows 0,0.1,0.2,0.3...
   * @param start start offset for step, 0.5 and step 2 allows 0.5,2.5,4.5,6.5*/
  helper(
    min?: number,
    max?: number,
    unit?: string,
    decimals?: number,
    step?: number,
    start?: number
  ) {
    return new STATE_NUMBER_HELPER(min, max, unit, decimals, step, start);
  },
};

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

const strings = {
  /**String limiter struct
   * @param maxLength max length for string
   * @param maxLengthBytes max byte length for string*/
  helper(maxLength?: number, maxLengthBytes?: number) {
    return new STATE_STRING_HELPER(maxLength, maxLengthBytes);
  },
};

//##################################################################################################################################################
//##################################################################################################################################################

type ENUM_HELPER_ENTRY = {
  name: string;
  description?: string;
  icon?: SVGFunc;
};

type STATE_ENUM_HELPER_LIST<K extends PropertyKey> = {
  [P in K]: ENUM_HELPER_ENTRY;
};

export interface STATE_ENUM_RELATED<T extends STATE_ENUM_HELPER_LIST<any>>
  extends STATE_RELATED {
  list: T;
}

export class STATE_ENUM_HELPER<
  L extends STATE_ENUM_HELPER_LIST<any>,
  K extends PropertyKey = keyof L,
  R extends STATE_RELATED = STATE_ENUM_RELATED<L>
> implements STATE_HELPER_WRITE<K, R>, STATE_ENUM_RELATED<L>
{
  list: L;

  constructor(list: L) {
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

/**Iterates a enum description list*/
function iterate<T, R extends STATE_ENUM_RELATED<any>>(
  related: R,
  func: (key: keyof R["list"], val: R["list"][keyof R["list"]]) => T
): T[] {
  return Object.keys(related.list).map((key) => {
    return func(key, related.list[key]);
  });
}

const enums = {
  iterate,
  /**Creates an enum helper struct, use list method to make a list with correct typing*/
  helper<
    L extends STATE_ENUM_HELPER_LIST<any>,
    K extends PropertyKey = keyof L,
    R extends STATE_RELATED = STATE_ENUM_RELATED<L>
  >(list: L) {
    return new STATE_ENUM_HELPER<L, K, R>(list);
  },
  /**Creates an enum description list, passing the enum as a generic type to this function makes things look a bit nicer */
  list<K extends PropertyKey>(list: STATE_ENUM_HELPER_LIST<K>): typeof list {
    return list;
  },
};

//##################################################################################################################################################
//##################################################################################################################################################
/**Waits for a state to have a specific value or until timeout is reached
 * @param value value to wait for
 * @param state state to wait on
 * @param timeout timeout in milliseconds, default 500ms
 * @returns true if value was reached before timeout, false if timeout was reached*/
async function await_value<T>(
  value: T,
  state: STATE<T>,
  timeout: number = 500
): Promise<boolean> {
  let func: STATE_SUB<Result<T, string>> = () => {};
  let res = await Promise.race([
    new Promise<false>((a) => setTimeout(a, timeout, false)),
    new Promise<true>((a) => {
      func = state.sub((res) => {
        if (res.ok && res.value === value) a(true);
      });
    }),
  ]);
  state.unsub(func);
  return res;
}

//##################################################################################################################################################
//##################################################################################################################################################
/**Compare two states for equality
 * @param state1 first state
 * @param state2 second state
 * @returns true if states are equal*/
async function compare(
  state1: STATE<any>,
  state2: STATE<any>
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
//      _____  _____    _____ _______    _______ ______    _____ _    _ ______ _____ _  __ _____
//     |_   _|/ ____|  / ____|__   __|/\|__   __|  ____|  / ____| |  | |  ____/ ____| |/ // ____|
//       | | | (___   | (___    | |  /  \  | |  | |__    | |    | |__| | |__ | |    | ' /| (___
//       | |  \___ \   \___ \   | | / /\ \ | |  |  __|   | |    |  __  |  __|| |    |  <  \___ \
//      _| |_ ____) |  ____) |  | |/ ____ \| |  | |____  | |____| |  | | |___| |____| . \ ____) |
//     |_____|_____/  |_____/   |_/_/    \_\_|  |______|  \_____|_|  |_|______\_____|_|\_\_____/
/**Functions to check if something is a state */
const is = {
  /**Checks if something is a STATE */
  state<T = any>(s: any): s is STATE<T> {
    return s instanceof STATE_IS;
  },
  /**Checks if something is a STATE_REX */
  rex<T = any>(s: any): s is STATE_REX<T> {
    return s instanceof STATE_REA_BASE || s instanceof STATE_RES_BASE;
  },
  /**Checks if something is a STATE_ROX */
  rox<T = any>(s: any): s is STATE_ROX<T> {
    return s instanceof STATE_ROA_BASE || s instanceof STATE_ROS_BASE;
  },
  /**Checks if something is a STATE_RXA */
  rxa<T = any>(s: any): s is STATE_RXA<T> {
    return s instanceof STATE_REA_BASE || s instanceof STATE_ROA_BASE;
  },
  /**Checks if something is a STATE_RXS */
  rxs<T = any>(s: any): s is STATE_RXS<T> {
    return s instanceof STATE_RES_BASE || s instanceof STATE_ROS_BASE;
  },
  /**Checks if something is a STATE_REA */
  rea<T = any>(s: any): s is REA<T> {
    return s instanceof STATE_REA_BASE;
  },
  /**Checks if something is a STATE_ROA */
  roa<T = any>(s: any): s is ROA<T> {
    return s instanceof STATE_ROA_BASE;
  },
  /**Checks if something is a STATE_RES */
  res<T = any>(s: any): s is RES<T> {
    return s instanceof STATE_RES_BASE;
  },
  /**Checks if something is a STATE_ROS */
  ros<T = any>(s: any): s is ROS<T> {
    return s instanceof STATE_ROS_BASE;
  },
  /**Checks if something is a STATE_REA_WA */
  rea_wa<T = any>(s: any): s is REA_WA<T> {
    return s instanceof STATE_REA_WA;
  },
  /**Checks if something is a STATE_ROA_WA */
  roa_wa<T = any>(s: any): s is ROA_WA<T> {
    return s instanceof STATE_ROA_WA;
  },
  /**Checks if something is a STATE_RES_WA */
  res_wa<T = any>(s: any): s is RES_WA<T> {
    return s instanceof STATE_RES_WA;
  },
  /**Checks if something is a STATE_ROS_WA */
  ros_wa<T = any>(s: any): s is ROS_WA<T> {
    return s instanceof STATE_ROS_WA;
  },
  /**Checks if something is a STATE_REA_WS */
  rea_ws<T = any>(s: any): s is REA_WS<T> {
    return s instanceof STATE_REA_WS;
  },
  /**Checks if something is a STATE_ROA_WS */
  roa_ws<T = any>(s: any): s is ROA_WS<T> {
    return s instanceof STATE_ROA_WS;
  },
  /**Checks if something is a STATE_RES_WS */
  res_ws<T = any>(s: any): s is RES_WS<T> {
    return s instanceof STATE_RES_WS;
  },
  /**Checks if something is a STATE_ROS_WS */
  ros_ws<T = any>(s: any): s is ROS_WS<T> {
    return s instanceof STATE_ROS_WS;
  },
};

//##################################################################################################################################################
//      ________   _______   ____  _____ _______ _____
//     |  ____\ \ / /  __ \ / __ \|  __ \__   __/ ____|
//     | |__   \ V /| |__) | |  | | |__) | | | | (___
//     |  __|   > < |  ___/| |  | |  _  /  | |  \___ \
//     | |____ / . \| |    | |__| | | \ \  | |  ____) |
//     |______/_/ \_\_|     \____/|_|  \_\ |_| |_____/

/**Helper function and types for states */
export const state_helpers = {
  is,
  nums,
  strings,
  enums,
  await_value,
  compare,
  compare_sync,
};
