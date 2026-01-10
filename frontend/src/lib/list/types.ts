import type { State, StateArray } from "@libState";
import type { ListField } from "./field";

export const ListDataType = {
  number: "number",
  string: "string",
  bool: "bool",
} as const;
export type ListDataType = (typeof ListDataType)[keyof typeof ListDataType];

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
  /**Function to transform the value into a Field element*/
  transform: (key: K, value: V) => ListField;
}

export interface ListRowOptions<R extends {}, T extends {}> {
  openable?: boolean | State<boolean>;
  sub_rows?(): R[] | State<R[]> | StateArray<R>;
  values: T;
}

export type ListRowTransformer<R extends {}, T extends {}> = (
  row: R
) => ListRowOptions<R, T>;

export interface ListRoot<R extends {}, T extends {}> {
  /**Columns options mapped by column key */
  columns: Map<keyof T, ListColumnOptions<keyof T, T[keyof T]>>;
  /**Order of visible columns by column key */
  columns_visible: (keyof T)[];
  transform: ListRowTransformer<R, T>;
}
