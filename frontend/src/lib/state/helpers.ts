import { number_step_start_decimal } from "@libMath";
import { err, ok, OptionSome, some, type Result } from "@libResult";
import type { SVGFunc } from "@libSVG";
import { STATE_BASE } from "./base";
import {
  type STATE,
  type STATE_HELPER,
  type STATE_REA,
  type STATE_REA_WA,
  type STATE_REA_WS,
  type STATE_RELATED,
  type STATE_RES,
  type STATE_RES_WA,
  type STATE_RES_WS,
  type STATE_ROA,
  type STATE_ROA_WA,
  type STATE_ROA_WS,
  type STATE_ROS,
  type STATE_ROS_WA,
  type STATE_ROS_WS,
  type STATE_SUB,
} from "./types";

//##################################################################################################################################################
//      _   _ _    _ __  __ ____  ______ _____
//     | \ | | |  | |  \/  |  _ \|  ____|  __ \
//     |  \| | |  | | \  / | |_) | |__  | |__) |
//     | . ` | |  | | |\/| |  _ <|  __| |  _  /
//     | |\  | |__| | |  | | |_) | |____| | \ \
//     |_| \_|\____/|_|  |_|____/|______|_|  \_\
export interface STATE_NUMBER_RELATED extends STATE_RELATED {
  min?: number;
  max?: number;
  unit?: string;
  decimals?: number;
}

export class STATE_NUMBER_HELPER
  implements
    STATE_NUMBER_RELATED,
    STATE_HELPER<number, OptionSome<STATE_NUMBER_RELATED>>
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
    return ok(
      Math.min(
        this.max ?? Infinity,
        Math.max(
          this.min ?? -Infinity,
          number_step_start_decimal(value, this.step, this.start, this.decimals)
        )
      )
    );
  }

  check(value: number): Result<number, string> {
    if (this.max !== undefined && value > this.max)
      return err(value + " is bigger than the limit of " + this.max);
    if (this.min !== undefined && value < this.min)
      return err(value + " is smaller than the limit of " + this.min);
    return ok(value);
  }

  related(): OptionSome<STATE_NUMBER_RELATED> {
    return some(this);
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
//       _____ _______ _____  _____ _   _  _____
//      / ____|__   __|  __ \|_   _| \ | |/ ____|
//     | (___    | |  | |__) | | | |  \| | |  __
//      \___ \   | |  |  _  /  | | | . ` | | |_ |
//      ____) |  | |  | | \ \ _| |_| |\  | |__| |
//     |_____/   |_|  |_|  \_\_____|_| \_|\_____|
export interface STATE_STRING_RELATED extends STATE_RELATED {
  max_length?: number;
  max_length_bytes?: number;
}

export class STATE_STRING_HELPER
  implements
    STATE_STRING_RELATED,
    STATE_HELPER<string, OptionSome<STATE_STRING_RELATED>>
{
  max_length: number | undefined;
  max_length_bytes: number | undefined;
  constructor(max_length?: number, max_length_bytes?: number) {
    if (max_length !== undefined) this.max_length = max_length;
    if (max_length_bytes !== undefined)
      this.max_length_bytes = max_length_bytes;
  }
  limit(value: string): Result<string, string> {
    if (this.max_length && value.length > this.max_length)
      value = value.slice(0, this.max_length);
    if (this.max_length_bytes) {
      value = new TextDecoder().decode(
        new TextEncoder().encode(value).slice(0, this.max_length_bytes)
      );
      if (value.at(-1)?.charCodeAt(0) === 65533) value = value.slice(0, -1);
    }
    return ok(value);
  }
  check(value: string): Result<string, string> {
    if (this.max_length !== undefined && value.length > this.max_length)
      return err(
        "the text is longer than the limit of " +
          this.max_length +
          " characters"
      );
    if (
      this.max_length_bytes !== undefined &&
      new TextEncoder().encode(value).length > this.max_length_bytes
    )
      return err(
        "the text is longer than the limit of " +
          this.max_length_bytes +
          " bytes"
      );
    return ok(value);
  }
  related(): OptionSome<STATE_STRING_RELATED> {
    return some(this);
  }
}

const strings = {
  /**String limiter struct
   * @param max_length max length for string
   * @param max_length_bytes max byte length for string*/
  helper(max_length?: number, max_length_bytes?: number) {
    return new STATE_STRING_HELPER(max_length, max_length_bytes);
  },
};

//##################################################################################################################################################
//      ______ _   _ _    _ __  __
//     |  ____| \ | | |  | |  \/  |
//     | |__  |  \| | |  | | \  / |
//     |  __| | . ` | |  | | |\/| |
//     | |____| |\  | |__| | |  | |
//     |______|_| \_|\____/|_|  |_|
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
> implements STATE_HELPER<K, OptionSome<R>>, STATE_ENUM_RELATED<L>
{
  list: L;

  constructor(list: L) {
    this.list = list;
  }

  map<T>(func: (key: K, val: ENUM_HELPER_ENTRY) => T): T[] {
    return Object.keys(this.list).map((key) =>
      func(key as K, this.list[key as K])
    );
  }
  limit(value: K): Result<K, string> {
    return ok(value);
  }
  check(value: K): Result<K, string> {
    if (value in this.list) return ok(value);
    return err(String(value) + " is not in list");
  }
  related(): OptionSome<R> {
    return some(this as unknown as R);
  }
}

const enums = {
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
  const res = await Promise.race([
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
  const res1 = await state1;
  const res2 = await state2;
  if (res1.err || res2.err) return false;
  return res1.value === res2.value;
}

//##################################################################################################################################################
//##################################################################################################################################################
/**Compare two sync states for equality
 * @param state1 first state
 * @param state2 second state
 * @returns true if states are equal*/
function compare_sync(state1: STATE_RES<any>, state2: STATE_RES<any>): boolean {
  const res1 = state1.get();
  const res2 = state2.get();
  if (res1.err || res2.err) return true;
  return res1.value !== res2.value;
}

//##################################################################################################################################################
//##################################################################################################################################################
const is = {
  rea(s: any): s is STATE_REA<any> {
    return s instanceof STATE_BASE;
  },
  roa(s: any): s is STATE_ROA<any> {
    return s instanceof STATE_BASE && s.rok;
  },
  res(s: any): s is STATE_RES<any> {
    return s instanceof STATE_BASE && s.rsync;
  },
  ros(s: any): s is STATE_ROS<any> {
    return s instanceof STATE_BASE && s.rsync && s.rok;
  },
  rea_wa(s: any): s is STATE_REA_WA<any> {
    return s instanceof STATE_BASE && s.writable;
  },
  rea_ws(s: any): s is STATE_REA_WS<any> {
    return s instanceof STATE_BASE && s.writable && s.wsync;
  },
  roa_wa(s: any): s is STATE_ROA_WA<any> {
    return s instanceof STATE_BASE && s.writable && s.rok;
  },
  roa_ws(s: any): s is STATE_ROA_WS<any> {
    return s instanceof STATE_BASE && s.writable && s.wsync && s.rok;
  },
  res_wa(s: any): s is STATE_RES_WA<any> {
    return s instanceof STATE_BASE && s.writable && s.rsync;
  },
  res_ws(s: any): s is STATE_RES_WS<any> {
    return s instanceof STATE_BASE && s.writable && s.wsync && s.rsync;
  },
  ros_wa(s: any): s is STATE_ROS_WA<any> {
    return s instanceof STATE_BASE && s.writable && s.rsync && s.rok;
  },
  ros_ws(s: any): s is STATE_ROS_WS<any> {
    return s instanceof STATE_BASE && s.writable && s.wsync && s.rsync && s.rok;
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
