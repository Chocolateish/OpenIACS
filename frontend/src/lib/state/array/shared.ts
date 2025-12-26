export const StateArrayWriteType = {
  added: "added",
  removed: "removed",
  changed: "changed",
} as const;
export type StateArrayWriteType =
  (typeof StateArrayWriteType)[keyof typeof StateArrayWriteType];

export type StateArrayReadType = StateArrayWriteType | "none";

export interface StateArrayWrite<TYPE> {
  type: StateArrayWriteType;
  index: number;
  items: readonly TYPE[];
}

export interface StateArrayRead<TYPE> {
  array: readonly TYPE[];
  type: StateArrayReadType;
  index: number;
  items: readonly TYPE[];
}

export interface StateArray<AT> {
  push(...items: AT[]): number;
  pop(): AT | undefined;
  shift(): AT | undefined;
  unshift(...items: AT[]): number;
  splice(start: number, deleteCount?: number, ...items: AT[]): AT[];
  /** Removes all instances of a value in the array*/
  delete(val: AT): void;
}

/** Applies a read from a state array to another array
 * @template AT - Types allowed in both arrays.
 * @template TAT - Optional type if state array type is different from array
 * @param array Array to modify in place
 * @param read Read struct from state array
 * @param transform optional tranform function for when state array is not same type of array*/
export function apply_read<AT>(array: AT[], read: StateArrayRead<AT>): AT[];
export function apply_read<AT, TAT = AT>(
  array: AT[],
  read: StateArrayRead<TAT>,
  transform: (value: TAT, index: number, array: readonly TAT[]) => AT
): AT[];
export function apply_read<AT, TAT = AT>(
  array: AT[],
  read: StateArrayRead<TAT & AT>,
  transform?: (value: TAT, index: number, array: readonly TAT[]) => AT
): AT[] {
  const a = array;
  const t = transform;
  const { type: ty, index: ix, items: it } = read;
  if (ty === "none") a.splice(ix, a.length, ...(t ? it.map(t) : it));
  else if (ty === "added") a.splice(ix, 0, ...(t ? it.map(t) : it));
  else if (ty === "removed") a.splice(ix, it.length);
  else if (ty === "changed")
    for (let i = 0; i < it.length; i++) a[ix + i] = t ? t(it[i], i, it) : it[i];
  return a;
}

/**States representing arrays */
export const STATE_ARRAY_SHARED = {
  apply_read,
};
