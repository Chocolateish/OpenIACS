import type { BaseObserver } from "@libBase";
import { type Option } from "@libResult";
import type { State, StateArray } from "@libState";
import type { ListField } from "./field";
import type { ListRow, ListRowOptions } from "./row";

export type ListType<R> = R[] | State<R[]> | StateArray<R>;

export type ListTypeExtract<A extends ListType<any>> = A extends (infer U)[]
  ? U
  : A extends State<(infer U)[]>
  ? U
  : A extends StateArray<infer V>
  ? V
  : never;

export const ListDataType = {
  number: "number",
  string: "string",
  bool: "bool",
} as const;
export type ListDataType = (typeof ListDataType)[keyof typeof ListDataType];

export interface ListColumnOptions<V, C extends ListField> {
  /**Initial width of the column in rem, auto when undefined*/
  init_width?: number;
  /**If the column has a fixed width in rem, overrides init_width and disables resizing*/
  fixed_width?: number | "min" | "max";
  /**Initial order of the column, lower numbers appear first, will order by column object if undefined*/
  order?: number;
  /**Whether the column is reorderable by the user*/
  reorderable?: boolean;
  /**Data type of the column, used for sorting, will attempt auto detect if undefined*/
  type?: ListDataType;
  /**Column title*/
  title: string;
  /**Generates the field element, only called during row or column creation */
  field_gen(): C;
  /**Applies the value to the field */
  field_apply(field: C, value: V): void;
}

export function column<V, C extends ListField>(
  options: ListColumnOptions<V, C>
): ListColumnOptions<V, C> {
  return options;
}

export type ListRowTransformer<R, T extends {}, A extends ListType<any>> = (
  /**Test */
  data: R,
  row: ListRow<R, T, A>,
  state: A
) => ListRowOptions<R, T>;

export interface ListRoot<R, T extends {}, A extends ListType<any>> {
  /**Sub rows */
  readonly sub_rows: boolean;
  /**Columns options mapped by column key */
  readonly columns: Map<keyof T, ListColumnOptions<T[keyof T], ListField>>;
  /**Order of visible columns by column key */
  columns_visible: (keyof T)[];
  /**Function to transform a row data into row options */
  transform: ListRowTransformer<R, T, A>;
  /**Observer for the container if observer is active */
  observer?: BaseObserver;
}

export interface ListRowParent<A> {
  /**Sub row depth */
  readonly depth: number;
  /**Whether the row is open to show sub rows */
  readonly open: boolean;
  /**Selects the adjacent row in the given direction */
  select_adjacent(
    direction: "next" | "previous" | "p_next" | "p_previous" | "last",
    field: Option<number>
  ): void;
  /**State associated with the row parent, if state is used */
  state: A;
  /**Total amount of rows including sub rows */
  global_amount: number;
  /**Row global index in list accounting for sub rows */
  global_index: number;
}
