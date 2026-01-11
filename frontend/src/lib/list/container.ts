import { Base, define_element } from "@libBase";
import { some } from "@libResult";
import type { State } from "@libState";
import state from "@libState";
import { px_to_rem } from "@libTheme";
import type { StateArray, StateArrayRead } from "../state/array/array";
import "./container.scss";
import { text_field } from "./field";
import { ListRow } from "./row.ts";
import "./shared.ts";
import type {
  ListColumnOptions,
  ListRoot,
  ListRowParent,
  ListRowTransformer,
} from "./types.ts";

class HeaderField extends Base {
  static element_name() {
    return "headerfield";
  }

  #box = this.appendChild(document.createElement("div"));
  #text = this.#box.appendChild(document.createElement("span"));
  #sizer?: HTMLDivElement;

  constructor(text?: string) {
    super();
    if (text) this.text = text;
  }

  set text(value: string) {
    this.#text.innerHTML = value;
  }

  sizable(sizeable: boolean, sizer: (width: number | undefined) => void) {
    if (sizeable) {
      this.#sizer = this.#box.appendChild(document.createElement("div"));
      let double_timeout: number;
      this.#sizer.onpointerdown = (e) => {
        e.preventDefault();
        if (double_timeout) {
          sizer(undefined);
          return;
        }
        double_timeout = window.setTimeout(() => {
          double_timeout = 0;
        }, 300);
        this.setPointerCapture(e.pointerId);
        const start_x = e.pageX;
        const start_width = this.#box.offsetWidth;
        this.onpointermove = (ev: PointerEvent) => {
          sizer(px_to_rem(start_width + (ev.pageX - start_x)));
        };
        this.onpointerup = () => {
          this.releasePointerCapture(e.pointerId);
          this.onpointermove = null;
          this.onpointerup = null;
        };
      };
    } else if (this.#sizer) {
      this.#sizer.remove();
      this.#sizer = undefined;
    }
  }
}
define_element(HeaderField);

class HeaderRow extends Base {
  static element_name() {
    return "headerrow";
  }
  static element_name_space(): string {
    return "list";
  }

  set fields(fields: HeaderField[]) {
    this.replaceChildren(text_field(), ...fields);
  }
}
define_element(HeaderRow);

interface ContainerOptions<R, T extends {}> {
  transform: ListRowTransformer<R, T>;
  columns: { [K in keyof T]: ListColumnOptions<K, T[K]> };
  rows: R[] | State<R[]> | StateArray<R>;
}

class Container<R, T extends {}> extends Base {
  static element_name() {
    return "container";
  }
  static element_name_space() {
    return "list";
  }

  #root: ListRoot<R, T>;
  #parent: ListRowParent = {
    select_adjacent() {},
  };
  #box = this.appendChild(document.createElement("div"));
  #header: HeaderRow = this.#box.appendChild(new HeaderRow());
  #row_box: HTMLDivElement = this.#box.appendChild(
    document.createElement("div")
  );

  constructor(options: ContainerOptions<R, T>) {
    super();
    this.#root = {
      columns: new Map(),
      columns_visible: [],
      transform: options.transform,
    };
    this.columns = options.columns;
    if (state.a.is(options.rows)) this.rows_by_state_array = options.rows;
    else if (state.is(options.rows)) this.rows_by_state = options.rows;
    else this.rows = options.rows;
  }

  set columns(columns: { [K in keyof T]: ListColumnOptions<K, T[K]> }) {
    this.#root.columns.clear();
    this.#root.columns_visible = [];

    const fields: HeaderField[] = [];
    for (const key in columns) {
      this.#root.columns.set(key, columns[key as keyof T]);
      this.#root.columns_visible.push(key);
      const header = new HeaderField(columns[key].title);
      fields.push(header);
      header.sizable(
        typeof columns[key].fixed_width === "undefined",
        (width) => {
          this.#root.columns.get(key)!.init_width = width;
          this.#update_column_widths();
        }
      );
    }

    this.#update_column_widths();
    this.#header.fields = fields;
  }

  #update_column_widths() {
    const widths: string[] = [
      "min-content",
      ...this.#root.columns_visible.map((key) => {
        const col = this.#root.columns.get(key)!;
        const width = col.fixed_width ?? col.init_width;
        return typeof width === "undefined"
          ? "auto"
          : `${Math.max(width, 1)}rem`;
      }),
    ];
    this.#box.style.gridTemplateColumns = widths.join(" ");
  }

  set rows(rows: readonly R[]) {
    this.#row_box.replaceChildren(
      ...rows.map(
        (row) =>
          new ListRow<R, T>(
            this.#root,
            this.#parent,
            this.#root.transform(row),
            -1
          )
      )
    );
  }

  set rows_by_state_array_read(sar: StateArrayRead<R>) {
    if (sar.type === "added") {
      const rows = sar.items.map(
        (row) =>
          new ListRow<R, T>(
            this.#root,
            this.#parent,
            this.#root.transform(row),
            -1
          )
      );
      const child = this.#row_box.children[sar.index];
      if (child) child.before(...rows);
      else this.#row_box.append(...rows);
    } else if (sar.type === "removed") {
      if (sar.array.length === 0) this.rows = [];
      else
        for (let i = 0; i < sar.items.length; i++)
          this.#row_box.children[sar.index].remove();
    } else if (sar.type === "changed")
      for (let i = 0; i < sar.items.length; i++) {
        this.#row_box.replaceChild(
          new ListRow<R, T>(
            this.#root,
            this.#parent,
            this.#root.transform(sar.items[i]),
            -1
          ),
          this.#row_box.children[sar.index + i]
        );
      }
    else this.rows = sar.array;
  }

  set rows_by_state(state: State<R[]> | undefined) {
    if (state) {
      this.detach_state_from_prop("rows_by_state_array");
      this.attach_state_to_prop("rows", state, () => some([]));
    } else this.detach_state_from_prop("rows");
  }

  set rows_by_state_array(state: StateArray<R> | undefined) {
    if (state) {
      this.detach_state_from_prop("rows");

      this.attach_state_to_prop("rows_by_state_array_read", state, () =>
        some({
          type: "fresh",
          array: [],
          index: 0,
          items: [],
        } satisfies StateArrayRead<R>)
      );
    } else this.detach_state_from_prop("rows_by_state_array_read");
  }
}
define_element(Container);

export function container<R, T extends {}>(
  transform: ListRowTransformer<R, T>,
  columns: { [K in keyof T]: ListColumnOptions<K, T[K]> },
  rows: R[] | State<R[]> | StateArray<R>
) {
  return new Container<R, T>({ transform, columns, rows });
}
