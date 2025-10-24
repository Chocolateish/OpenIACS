if (typeof navigator.clipboard === "undefined") {
  console.warn("Clipboard API not supported, using fallback");

  let clip: any = null;
  let clipItems: ClipboardItems = [];
  // @ts-expect-error
  navigator.clipboard = {
    async write(_data: ClipboardItems) {
      clipItems = _data;
    },
    async writeText(text: string) {
      clip = text;
    },
    async read() {
      return clipItems;
    },
    readText() {
      return clip;
    },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent(_event: Event): boolean {
      return false;
    },
  } satisfies Clipboard;
}

//###################################################################################
//#     _____                                        _____                 _ _      #
//#    / ____|                                      |  __ \               | | |     #
//#   | |     ___  _ __ ___  _ __ ___   ___  _ __   | |__) |___  ___ _   _| | |_    #
//#   | |    / _ \| '_ ` _ \| '_ ` _ \ / _ \| '_ \  |  _  // _ \/ __| | | | | __|   #
//#   | |___| (_) | | | | | | | | | | | (_) | | | | | | \ \  __/\__ \ |_| | | |_    #
//#    \_____\___/|_| |_| |_|_| |_| |_|\___/|_| |_| |_|  \_\___||___/\__,_|_|\__|   #
//###################################################################################
/**Class for returning results*/
export class ResultWrapper {
  readonly success: boolean;
  readonly reason: string;
  /**Constructor for result
   * @param  success wether the result was a success true is success
   * @param  reason reason for result
   * @param  logWarn if the reason should be logged at the same time */
  constructor(
    success: boolean | { reason?: string; success?: boolean },
    reason: string,
    logWarn?: boolean
  ) {
    if (typeof success == "object") {
      if (success.reason) {
        reason = success.reason;
      }
      if (success.success) {
        success = success.success;
      }
    }
    this.success = Boolean(success);
    this.reason = String(reason);
    if (logWarn) {
      if (success) {
        console.log(reason);
      } else {
        console.warn(reason);
      }
    }
  }
}

//###################################################################################################
//#     _____ _             _        ______                _   _                   _ _ _            #
//#    / ____(_)           | |      |  ____|              | | (_)                 | (_) |           #
//#   | (___  _ _ __   __ _| | ___  | |__ _   _ _ __   ___| |_ _  ___  _ __   __ _| |_| |_ _   _    #
//#    \___ \| | '_ \ / _` | |/ _ \ |  __| | | | '_ \ / __| __| |/ _ \| '_ \ / _` | | | __| | | |   #
//#    ____) | | | | | (_| | |  __/ | |  | |_| | | | | (__| |_| | (_) | | | | (_| | | | |_| |_| |   #
//#   |_____/|_|_| |_|\__, |_|\___| |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|\__,_|_|_|\__|\__, |   #
//#                    __/ |                                                                __/ |   #
//#                   |___/                                                                |___/    #
//###################################################################################################
/**This method converts an ip address to a number of 4 byte size
 * @param  ip ip address as a string eg. 123.456.789.123
 * @returns  number between 0 and 4294967295*/
export let ipAddressToU32 = (ip: string): number => {
  return (
    ip.split(".").reduce(function (ipInt, octet) {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
};
/**This method converts a number of 4 byte size to an ip address
 * @param ipInt number between 0 and 4294967295
 * @returns ip address eg. 123.456.789.123*/
export let u32ToIpAddress = (ipInt: number): string => {
  return (
    (ipInt >>> 24) +
    "." +
    ((ipInt >> 16) & 255) +
    "." +
    ((ipInt >> 8) & 255) +
    "." +
    (ipInt & 255)
  );
};
/**This method validates an ip address
 * @param ip ip address eg. 123.456.789.123*/
export let validateIP = (ip: string): string | boolean => {
  if (typeof ip != "string") {
    return false;
  }
  let split = ip.split(".");
  if (split.length == 4) {
    for (let i = 0; i < split.length; i++) {
      // @ts-expect-error
      split[i] = parseInt(split[i]);
      // @ts-expect-error
      if (split[i] > 255 || split[i] < 0) {
        return false;
      }
    }
    return split[0] + "." + split[1] + "." + split[2] + "." + split[3];
  }
  return false;
};
/**This deep compares two arrays, returns true if they are equal
 * It compares all indexes in the array, with the exception of arrays which have an objectEquals method, which can provide a custom comparisson*/
export let arrayEquals = (array1: any[], array2: any[]): boolean => {
  if (!array1 || !array2) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (var i = 0, l = array1.length; i < l; i++) {
    let e1 = array1[i];
    let e2 = array2[i];
    let type = typeof e1;
    if (type !== typeof e2) {
      return false;
    }
    switch (type) {
      case "object": {
        if (e1.__proto__ != e2.__proto__) {
          return false;
        }
        if (e1 instanceof Array) {
          if (!arrayEquals(e1, e2)) {
            return false;
          }
          break;
        }
        if ("objectEquals" in e1) {
          if (!e1.objectEquals(e2)) {
            return false;
          }
          break;
        }
        if (!objectEquals(e1, e2)) {
          return false;
        }
        break;
      }
      default: {
        if (e1 !== e2) {
          return false;
        }
        break;
      }
    }
  }
  return true;
};
/**This deep compares two objects, returns true if they are equal
 * It compares all keys in the object, with the exception of objects which have an objectEquals method, which can provide a custom comparisson*/
export let objectEquals = (object1: {}, object2: {}): boolean => {
  if (!object1 || !object2) {
    return false;
  }
  let props = Object.keys(object1);
  let props2 = Object.keys(object2);
  if (props.length != props2.length) {
    return false;
  }
  for (let i = 0, m = props.length; i < m; i++) {
    if (props[i] in object2) {
      return false;
    }
    //@ts-expect-error
    let e1 = object1[props[i]];
    //@ts-expect-error
    let e2 = object2[props[i]];
    let type = typeof e1;
    if (type !== typeof e2) {
      return false;
    }
    switch (type) {
      case "object": {
        if (e1.__proto__ != e2.__proto__) {
          return false;
        }
        if (e1 instanceof Array) {
          if (!arrayEquals(e1, e2)) {
            return false;
          }
          break;
        }
        if ("objectEquals" in e1) {
          if (!e1.objectEquals(e2)) {
            return false;
          }
          break;
        }
        if (!objectEquals(e1, e2)) {
          return false;
        }
        break;
      }
      default: {
        if (e1 !== e2) {
          return false;
        }
        break;
      }
    }
  }
  return true;
};
/**Checks of the given object is empty only checks for objects own properties*/
export let objectEmpty = (obj: {}): boolean => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

/**This compares two values of any type, returns true if they are equal
 * For any object type it will deep compare, with the exception of objects which have an objectEquals method, which can provide a custom comparisson
 * Will return true for NaN equal to NaN*/
export let anyEquals = (any1: any, any2: any): boolean => {
  let type1 = typeof any1;
  let type2 = typeof any2;
  if (type1 !== type2) {
    return false;
  }
  switch (type1) {
    case "object":
      return objectEquals(any1, any2);
    case "number": {
      if (any1 !== any1) {
        if (any2 !== any2) {
          return true;
        } else {
          return false;
        }
      } else {
        return any1 === any2;
      }
    }
    default:
      return any1 === any2;
  }
};

/**Sets the caret position in an html element
 * @param  elem element in question
 * @param  caretPos caret position */
export let setCaretPosition = (elem: HTMLElement, caretPos: number) => {
  var setpos = document.createRange();
  var set = window.getSelection();
  setpos.setStart(elem.childNodes[0], caretPos);
  setpos.collapse(true);
  // @ts-expect-error
  set.removeAllRanges();
  // @ts-expect-error
  set.addRange(setpos);
  elem.focus();
};

/** Checks whether a variable is a promise
 * @param variable variable to check
 * @returns true means promise, false is everything else*/
export let isPromise = (variable: any): boolean => {
  return (
    variable && Object.prototype.toString.call(variable) === "[object Promise]"
  );
};

/**Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds (or once per browser frame). The throttled function
 * comes with a `cancel` method to cancel delayed `func` invocations and a
 * `flush` method to immediately invoke them. Provide `options` to indicate
 * whether `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
 * invocation will be deferred until the next frame is drawn (typically about
 * 16ms).
 * @param  func The function to throttle.
 * @param  wait The number of milliseconds to throttle invocations to; if omitted, `requestAnimationFrame` is used (if available).
 * @param  options.leading Specify invoking on the leading edge of the timeout.
 * @param  options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns  Returns the new throttled function.*/
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait?: number,
  options?: { leading?: boolean; trailing?: boolean }
): T {
  let leading = true;
  let trailing = true;

  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  if (typeof options === "object") {
    leading = "leading" in options ? Boolean(options.leading) : leading;
    trailing = "trailing" in options ? Boolean(options.trailing) : trailing;
  }
  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait,
  });
}

/**Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked, or until the next browser frame is drawn. The debounced function
 * comes with a `cancel` method to cancel delayed `func` invocations and a
 * `flush` method to immediately invoke them. Provide `options` to indicate
 * whether `func` should be invoked on the leading and/or trailing edge of the
 * `wait` timeout. The `func` is invoked with the last arguments provided to the
 * debounced function. Subsequent calls to the debounced function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
 * invocation will be deferred until the next frame is drawn (typically about
 * 16ms).
 * @param  func The function to debounce.
 * @param  wait The number of milliseconds to delay; if omitted, `requestAnimationFrame` is used (if available).
 * @param  options The options object.
 * @param  options.leading Specify invoking on the leading edge of the timeout.
 * @param  options.maxWait The maximum time `func` is allowed to be delayed before it's invoked.
 * @param  options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns the new debounced function. */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 0,
  options: { leading?: boolean; maxWait?: number; trailing?: boolean } = {
    maxWait: 0,
  }
): T {
  let lastArgs: any;
  let lastThis: any;
  let maxWait: any;
  let result: any;
  let timerId: any;
  let lastCallTime: any;

  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  const useRAF =
    // @ts-expect-error
    !wait && wait !== 0 && typeof root.requestAnimationFrame === "function";

  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  wait = +wait || 0;
  if (typeof options === "object") {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    // @ts-expect-error
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time: any) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc: any, wait: any) {
    if (useRAF) {
      // @ts-expect-error
      root.cancelAnimationFrame(timerId);
      // @ts-expect-error
      return root.requestAnimationFrame(pendingFunc);
    }
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id: any) {
    if (useRAF) {
      // @ts-expect-error
      return root.cancelAnimationFrame(id);
    }
    clearTimeout(id);
  }

  function leadingEdge(time: any) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: any) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: any) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: any) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timerId !== undefined;
  }

  function debounced(...args: any[]) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    // @ts-expect-error
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced as any;
}
