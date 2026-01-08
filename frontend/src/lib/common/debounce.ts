/** Creates a debounced version of a function that delays execution until after
 * 'wait' milliseconds have elapsed since the last time it was invoked.
 * @template A - The type of the arguments array.
 * @template T - The type of the function to debounce.
 * @param {T} func - The function to debounce.
 * @param {number} [wait=0] - The delay in milliseconds, when 0 or unspecified it only removes calls to the function in the same cycle.
 * @param {boolean} [leading=false] - If true, triggers the function on the leading edge of the timeout.
 * @returns {(...args: A) => void} A new debounced function. */
export function debounce<A extends any[], T extends (...args: A) => any>(
  func: T,
  wait: number = 0,
  leading: boolean = false
): (...args: A) => void {
  let running = false;
  let args_buffer: A;
  let has_args = false;
  let timeout: number;
  return (...args: A) => {
    if (running) {
      args_buffer = args;
      has_args = true;
    } else {
      if (leading) func(...(args ?? []));
      else {
        args_buffer = args;
        has_args = true;
      }
      running = true;
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (has_args) {
        func(...(args_buffer ?? []));
        has_args = false;
      }
      if (!leading) running = false;
      else
        timeout = setTimeout(() => {
          running = false;
        }, wait);
    }, wait);
  };
}
