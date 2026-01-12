import type { Option } from "@libResult";
import type { ListField } from "./field";
import type { ListRowOptions } from "./row";

export const ListDataType = {
  number: "number",
  string: "string",
  bool: "bool",
} as const;
export type ListDataType = (typeof ListDataType)[keyof typeof ListDataType];

export interface ListColumnOptions<V, C> {
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
  field_gen: () => ListField<C>;
  /**Function to transform the field value to something the field element understands */
  transform: (value: V) => C;
}

export type ListValidateCols<T> = {
  [K in keyof T]: T[K] extends ListColumnOptions<infer V, infer _C>
    ? ListColumnOptions<V, ReturnType<T[K]["transform"]>> // Force C to be the transform return type
    : never;
};

export type ListInferFieldTypes<T> = {
  [K in keyof T]: T[K] extends ListColumnOptions<infer V, any> ? V : never;
};

export type ListRowTransformer<R, T extends {}> = (
  row: R
) => ListRowOptions<R, ListInferFieldTypes<T>>;
export interface ListRoot<R, T extends {}> {
  /**Sub rows */
  sub_rows: boolean;
  /**Columns options mapped by column key */
  columns: Map<keyof T, ListColumnOptions<keyof T, T[keyof T]>>;
  /**Order of visible columns by column key */
  columns_visible: (keyof T)[];
  /**Function to transform a row data into row options */
  transform: ListRowTransformer<R, T>;
}

export interface ListRowParent {
  /**Sub row depth */
  depth: number;
  /**Whether the row is open to show sub rows */
  open: boolean;
  /**Selects the adjacent row in the given direction */
  select_adjacent(
    direction: "next" | "previous" | "p_next" | "p_previous" | "last",
    field: Option<number>
  ): void;
}
