import type { Option } from "@libResult";
import type { State, StateArray } from "@libState";
import type { ListField } from "./field";

export interface ListRoot<R, T extends {}> {
  /**Columns options mapped by column key */
  columns: Map<keyof T, ListColumnOptions<keyof T, T[keyof T]>>;
  /**Order of visible columns by column key */
  columns_visible: (keyof T)[];
  transform: ListRowTransformer<R, T>;
}

export interface ListRowParent {
  /**Selects the adjacent row in the given direction */
  select_adjacent(
    direction: "next" | "previous" | "p_next" | "p_previous" | "last",
    field: Option<number>
  ): void;
}

export const ListDataType = {
  number: "number",
  string: "string",
  bool: "bool",
} as const;
export type ListDataType = (typeof ListDataType)[keyof typeof ListDataType];

type FieldGen<K, V> = (key: K, value: V) => [ListField<V>];

export interface ListColumnOptions<K, V> {
  /**Initial width of the column in rem, auto when undefined*/
  init_width?: number;
  /**If the column has a fixed width in rem, overrides init_width and disables resizing*/
  fixed_width?: number;
  /**Initial order of the column, lower numbers appear first, will order by column object if undefined*/
  order?: number;
  /**Whether the column is reorderable by the user*/
  reorderable?: boolean;
  /**Data type of the column, used for sorting, will attempt auto detect if undefined*/
  type?: ListDataType;
  /**Column title*/
  title: string;
  /**Function generate a field element*/
  field_gen<T = V>(key: K, value: V): [(v: V) => T, ListField<T>];
}

export interface ListRowOptions<R, T extends {}> {
  openable?: boolean | State<boolean>;
  sub_rows?(): R[] | State<R[]> | StateArray<R>;
  values: T;
}

export type ListRowTransformer<R, T extends {}> = (
  row: R
) => ListRowOptions<R, T>;
