/**This library contains functions used for formatting value for displaying to the user
 * Reminder, use toLocaleString to pad and limit a numbers digits
 */

//    _____        __
//   |_   _|      / _|
//     | |  _ __ | |_ ___
//     | | | '_ \|  _/ _ \
//    _| |_| | | | || (_) |
//   |_____|_| |_|_| \___/

/**Returns the length of a string accounting for encoding
 * @param string the string to measure*/
export let stringByteLength = (string: string): number => {
  switch (typeof string) {
    case "string": {
      let s = string.length;
      if (s > 2048) {
        return new TextEncoder().encode(string).length;
      } else {
        for (let i = s - 1; i >= 0; i--) {
          let code = string.charCodeAt(i);
          if (code > 0x7f && code <= 0x7ff) s++;
          else if (code > 0x7ff && code <= 0xffff) s += 2;
          if (code >= 0xdc00 && code <= 0xdfff) i--;
        }
        return s;
      }
    }
    default:
      return 0;
  }
};

//    _      _           _ _
//   | |    (_)         (_) |
//   | |     _ _ __ ___  _| |_ ___ _ __ ___
//   | |    | | '_ ` _ \| | __/ _ \ '__/ __|
//   | |____| | | | | | | | ||  __/ |  \__ \
//   |______|_|_| |_| |_|_|\__\___|_|  |___/

/**This limits the amount of characters in a string, and appends ... if it is longer
 * @param  string string to limit
 * @param  max max amount of characters*/
export let stringLimitLenght = (string: string, max: number): string => {
  if (string.length <= max) return string;
  return string.substring(0, max - 3) + "...";
};

/**Limits the length of a string to an amount of bytes accounting for encoding
 * @param  string the string to limit
 * @param  bytes the byte amount*/
export let limitStringToByteAmount = (
  string: string,
  bytes: number
): string => {
  let val = new TextEncoder().encode(string);
  if (val.length > bytes) {
    string = new TextDecoder()
      .decode(val.slice(0, bytes))
      .replace(/[\u{FFFD}]/gu, "");
  }
  return string;
};

//    _____          _   _           _____      _       _
//   |  __ \        | | | |         |  __ \    (_)     | |
//   | |__) | __ ___| |_| |_ _   _  | |__) | __ _ _ __ | |_ ___ _ __ ___
//   |  ___/ '__/ _ \ __| __| | | | |  ___/ '__| | '_ \| __/ _ \ '__/ __|
//   | |   | | |  __/ |_| |_| |_| | | |   | |  | | | | | ||  __/ |  \__ \
//   |_|   |_|  \___|\__|\__|\__, | |_|   |_|  |_|_| |_|\__\___|_|  |___/
//                            __/ |
//                           |___/

/** This function formats an amount of seconds to a readable string devided into time parts
 * it always picks the biggest parts
 * eg. 249 seconds = 4Min 9Sec and 529385 = 6Days 3Hours
 * @param  seconds amount of seconds
 * @param  amount how manu parts should be shown */
export let secondsCountDownFormatted = (
  seconds: number,
  amount: number
): string => {
  if (seconds == 0 || typeof seconds !== "number") return "Now";
  let res = "";
  if (seconds > 31536000) {
    res += ~~(seconds / 31536000) + "Years ";
    seconds = seconds % 31536000;
    if (seconds == 0) return res;
  }
  if (seconds > 86400) {
    res += ~~(seconds / 86400) + "Days ";
    seconds = seconds % 86400;
    amount--;
    if (seconds == 0 || amount == 0) return res;
  }
  if (seconds > 3600) {
    res += ~~(seconds / 3600) + "Hours ";
    seconds = seconds % 3600;
    amount--;
    if (seconds == 0 || amount == 0) return res;
  }
  if (seconds > 60) {
    res += ~~(seconds / 60) + "Min ";
    seconds = seconds % 60;
    amount--;
    if (seconds == 0 || amount == 0) return res;
  }
  return (res += seconds + "Sec");
};

/** This function formats an amount of bytes to a readable string devided into parts
 * it always picks the biggest parts
 * eg. 1249 bytes = 1kB 249B and 1529385 = 1MB 529kB 385B
 * @param  bytes amount of bytes
 * @param  amount how manu parts should be shown*/
export let bytesToFormatted = (bytes: number, amount: number): string => {
  if (bytes == 0 || typeof bytes !== "number") return "0B";
  let res = "";
  if (bytes > 1000000000000) {
    res += ~~(bytes / 1000000000000) + "TB ";
    bytes = bytes % 1000000000000;
    if (bytes == 0) return res;
  }
  if (bytes > 1000000000) {
    res += ~~(bytes / 1000000000) + "GB ";
    bytes = bytes % 1000000000;
    amount--;
    if (bytes == 0 || amount == 0) return res;
  }
  if (bytes > 1000000) {
    res += ~~(bytes / 1000000) + "MB ";
    bytes = bytes % 1000000;
    amount--;
    if (bytes == 0 || amount == 0) return res;
  }
  if (bytes > 1000) {
    res += ~~(bytes / 1000) + "kB ";
    bytes = bytes % 1000;
    amount--;
    if (bytes == 0 || amount == 0) return res;
  }
  return (res += bytes + "B");
};

/** Converts Date instance to human readable date time string*/
export let dateTimeFromDate = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")} ${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth()
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

/** Converts Date instance to human readable date time string */
export let dateTimeFromDateTwoLine = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}<br>${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth()
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

/** Converts Date instance to human readable date time string including seconds*/
export let dateTimeSecondsFromDate = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${date.getFullYear()}`;
};

/** Converts Date instance to human readable date time string including seconds*/
export let dateTimeSecondsFromDateTwoLine = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}<br>${String(
    date.getDate()
  ).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${date.getFullYear()}`;
};

/** Converts Date instance to human readable text including seconds*/
export let dateFromDate = (date: Date): string => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getFullYear()).padStart(2, "0")}`;
};

/** Converts Date instance to human readable time string*/
export let timeFromDate = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

/** Converts Date instance to human readable time string including seconds*/
export let timeSecondsFromDate = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};
