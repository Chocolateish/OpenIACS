export * from "./equals";

export function nodeClone<T extends Node>(node: T): T {
  return node.cloneNode(true) as T;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**Checks of the given object is empty only checks for objects own properties*/
export let objectEmpty = (obj: {}): boolean => {
  for (let key in obj) if (obj.hasOwnProperty(key)) return false;
  return true;
};

//                _______     ___   _  _____
//         /\    / ____\ \   / / \ | |/ ____|
//        /  \  | (___  \ \_/ /|  \| | |
//       / /\ \  \___ \  \   / | . ` | |
//      / ____ \ ____) |  | |  | |\  | |____
//     /_/    \_\_____/   |_|  |_| \_|\_____|

export function sleep<T = void>(ms: number, arg?: T): Promise<T> {
  return new Promise((a) => setTimeout(a, ms, arg));
}
export function sleepLazy<T = void>(ms: number, arg?: () => T): Promise<T> {
  return new Promise((a) => setTimeout((arg: () => T) => a(arg()), ms, arg));
}

//      _____ _____ ______ ______ _____ _   _  _____
//     |  __ \_   _|  ____|  ____|_   _| \ | |/ ____|
//     | |  | || | | |__  | |__    | | |  \| | |  __
//     | |  | || | |  __| |  __|   | | | . ` | | |_ |
//     | |__| || |_| |    | |     _| |_| |\  | |__| |
//     |_____/_____|_|    |_|    |_____|_| \_|\_____|

export function arrayDiff<T>(
  main: T[],
  second: T[]
): { added: T[]; removed: T[] } {
  let added = second.filter((x) => !main.includes(x));
  let removed = main.filter((x) => !second.includes(x));
  return { added, removed };
}

export function objectKeyDiff<T1 extends {}, T2 extends {}>(
  main: T1,
  second: T2
): { added: string[]; removed: string[] } {
  return arrayDiff(Object.keys(main), Object.keys(second));
}
