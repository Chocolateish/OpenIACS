import { Base, define_element } from "@libBase";
import { some } from "@libResult";
import type { State } from "@libState";
import state from "@libState";
import type { StateArray } from "../state/array/array";
import "./container.scss";
import { Field, TextField } from "./field";

interface Column<K, V> {
  title: string;
  transform: (key: K, value: V) => Field;
}

class Row extends Base {
  static element_name() {
    return "row";
  }
  static element_name_space(): string {
    return "list";
  }

  constructor(fields: Field[]) {
    super();
    this.replaceChildren(...fields);
  }
}
define_element(Row);

class HeaderField extends Field {
  static element_name() {
    return "headerfield";
  }

  constructor(text?: string) {
    super();
    if (text) this.innerHTML = text;
  }

  set text(value: string) {
    this.innerHTML = value;
  }

  get text(): string {
    return this.innerHTML;
  }
}
define_element(HeaderField);

class Container<R extends {}, T extends {}> extends Base {
  static element_name() {
    return "container";
  }
  static element_name_space() {
    return "list";
  }

  #box = this.appendChild(document.createElement("div"));
  #column_map: Map<keyof T, Column<keyof T, T[keyof T]>> = new Map();
  #column_ids: (keyof T)[] = [];
  #column_row?: Row;
  #rows: Row[] = [];
  #state?: State<R[]>;
  #transform?: (row: R) => T;

  constructor(
    columns: { [K in keyof T]: Column<K, T[K]> },
    rows: R[] | State<R[]> | StateArray<R>,
    transform?: (row: R) => T
  ) {
    super();
    this.#transform = transform;
    this.columns = columns;
    if (state.a.is(rows)) this.rows_by_state_array = rows;
    else if (state.is(rows)) this.rows_by_state = rows;
    else this.rows = rows;
  }

  set columns(columns: { [K in keyof T]: Column<K, T[K]> }) {
    this.#column_map.clear();
    this.#column_ids = [];
    const fields: TextField[] = [];
    for (const key in columns) {
      this.#column_map.set(key, columns[key as keyof T]);
      this.#column_ids.push(key);
      fields.push(new HeaderField(columns[key].title));
    }
    const row = new Row(fields);
    if (this.#column_row) this.#box.replaceChild(row, this.#column_row);
    else this.#box.appendChild(row);
    this.#column_row = row;
  }

  set rows(rows: R[]) {
    rows.forEach((row) => {
      const values = this.#transform
        ? this.#transform(row)
        : (row as unknown as T);
      const row_element = new Row(
        this.#column_ids.map((col_key) =>
          this.#column_map.get(col_key)!.transform(col_key, values[col_key])
        )
      );
      this.#rows.push(this.#box.appendChild(row_element));
    });
  }

  set rows_by_state(state: State<R[]>) {
    this.attach_state_to_prop("rows", state, () => some([]));
  }

  set rows_by_state_array(state: StateArray<R>) {
    console.error("NO");
  }
}
define_element(Container);

export function container<T extends {}>(
  rows: T[],
  columns: { [K in keyof T]: Column<K, T[K]> }
) {
  return new Container(columns, rows);
}

export function container_transform<R extends {}, T extends {}>(
  rows: R[],
  transform: (row: R) => T,
  columns: { [K in keyof T]: Column<K, T[K]> }
) {
  return new Container(columns, rows, transform);
}
