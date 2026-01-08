import { Base, define_element } from "@libBase";
import "./container.scss";
import { Field } from "./field";

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
  #rows: Row[] = [];

  constructor(
    columns: { [K in keyof T]: Column<K, T[K]> },
    rows: R[],
    transform?: (row: R) => T
  ) {
    super();
    for (const key in columns) {
      this.#column_map.set(key, columns[key as keyof T]);
      this.#column_ids.push(key);
    }

    const test = rows.map((row) => {
      const values = transform ? transform(row) : (row as unknown as T);
      const fields = this.#column_ids.map((col_key) => {
        const field = columns[col_key].transform(col_key, values[col_key]);
        return field;
      });
      return new Row(fields);
    });

    this.#box.replaceChildren(...test);
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
