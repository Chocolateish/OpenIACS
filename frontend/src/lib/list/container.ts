import { Base, define_element, type BaseObserverOptions } from "@libBase";
import type { State, StateInferSub } from "@libState";
import state from "@libState";
import { px_to_rem } from "@libTheme";
import type { StateArray, StateArrayRead } from "../state/array/array";
import { ListAddRow, type ListAddRowOptions } from "./add_row.ts";
import "./container.scss";
import { text_field } from "./field";
import { ListRow } from "./row.ts";
import "./shared.ts";
import type {
  ListColumnOptions,
  ListRoot,
  ListRowParent,
  ListRowTransformer,
  ListType,
  ListTypeExtract,
} from "./types.ts";

class HeaderField extends Base {
  static element_name() {
    return "headerfield";
  }
  static element_name_space(): string {
    return "list";
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

interface ContainerOptions {
  /**Can rows have sub rows */
  sub_rows: boolean;
  /**Options for an add row button */
  add_row?: ListAddRowOptions;
  /**If list should use a container to give fields the option of attach/detach to states when visible */
  observer?: BaseObserverOptions;
}

class Container<
  A extends ListType<any>,
  T extends { [key: string]: ListColumnOptions<any, any> },
  R = ListTypeExtract<A>
> extends Base {
  static element_name() {
    return "container";
  }
  static element_name_space() {
    return "list";
  }

  #root: ListRoot<R, T, A>;
  #parent: ListRowParent<A>;
  #box = this.appendChild(document.createElement("div"));
  #header: HeaderRow;
  #child_box: HTMLDivElement;
  #add_row?: ListAddRow;
  #state_sub?: StateInferSub<State<R[]> | StateArray<R>>;

  constructor(
    columns: { [K in keyof T]: ListColumnOptions<T[K], any> },
    transform: ListRowTransformer<R, T, A>,
    rows: A,
    options?: ContainerOptions
  ) {
    super();
    this.#root = {
      sub_rows: options?.sub_rows ?? false,
      columns: new Map(),
      columns_visible: [],
      transform,
      observer: options?.observer ? this.observer(options.observer) : undefined,
    };
    this.#parent = {
      depth: -1,
      open: false,
      select_adjacent() {},
      state: rows,
      global_index: 0,
      global_amount: 0,
    };

    this.#header = this.#box.appendChild(new HeaderRow());
    this.#child_box = this.#box.appendChild(document.createElement("div"));
    if (options?.sub_rows) this.#box.classList.add("sub-rows");
    this.add_row = options?.add_row;

    this.columns = columns;
    this.rows = rows;
  }

  set columns(columns: { [K in keyof T]: ListColumnOptions<T[K], any> }) {
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
        if (width) {
          if (width === "min") return "min-content";
          else if (width === "max") return "max-content";
          return `${Math.max(width, 1)}rem`;
        }
        return "auto";
      }),
    ];
    this.#box.style.gridTemplateColumns = widths.join(" ");
  }

  set add_row(options: ListAddRowOptions | undefined) {
    if (!options && this.#add_row) {
      this.#add_row.remove();
      this.#parent.global_amount--;
      this.#add_row = undefined;
    } else if (options) {
      if (!this.#add_row) {
        this.#parent.global_amount++;
        this.#add_row = this.#box.appendChild(new ListAddRow(this.#parent));
      }
      this.#add_row.options = options;
    }
  }

  //      _____   ______          _______
  //     |  __ \ / __ \ \        / / ____|
  //     | |__) | |  | \ \  /\  / / (___
  //     |  _  /| |  | |\ \/  \/ / \___ \
  //     | | \ \| |__| | \  /\  /  ____) |
  //     |_|  \_\\____/   \/  \/  |_____/
  set rows(rows: R[] | State<R[]> | StateArray<R>) {
    if (this.#state_sub) this.detach_state(this.#state_sub);
    this.#state_sub = undefined;
    this.#parent.state = rows as A;
    if (state.is(rows)) {
      if (state.a.is(rows))
        this.#state_sub = this.attach_state(rows, (r) => {
          if (r.ok) this.#update_rows_by_state_array_read(r.value);
          else this.#update_rows([]);
        });
      else
        this.#state_sub = this.attach_state(rows, (r) =>
          this.#update_rows(r.ok ? r.value : [])
        );
    } else this.#update_rows(rows);
  }

  #update_rows(rows: readonly R[]) {
    if (rows.length === 0) {
      this.#child_box.replaceChildren();
      this.#parent.global_amount = 0;
    } else {
      const min = Math.min(this.#child_box.childElementCount, rows.length);
      for (let i = 0; i < min; i++)
        (this.#child_box.children[i] as ListRow<R, T, A>).data = rows[i];
      if (rows.length > this.#child_box.childElementCount) {
        const offset = this.#parent.global_amount;
        const row_elements = rows
          .slice(this.#child_box.childElementCount)
          .map(
            (row, i) =>
              new ListRow<R, T, A>(this.#root, this.#parent, row, offset + i)
          );
        this.#child_box.append(...row_elements);
        this.#parent.global_amount += row_elements.length;
      } else if (rows.length < this.#child_box.childElementCount) {
        for (
          let i = this.#child_box.childElementCount - 1;
          i >= rows.length;
          i--
        ) {
          const row = this.#child_box.children[i] as ListRow<R, T, A>;
          this.#parent.global_amount -= row.global_amount;
          row.remove();
        }
      }
    }
    console.error(this.#parent.global_amount);
  }

  #update_rows_by_state_array_read(sar: StateArrayRead<R>) {
    if (sar.type === "added") {
      const child = this.#child_box.children[sar.index] as
        | ListRow<R, T, A>
        | undefined;
      const offset = child ? child.global_index : this.#parent.global_amount;
      const rows = sar.items.map(
        (row, i) =>
          new ListRow<R, T, A>(this.#root, this.#parent, row, offset + i)
      );
      if (child) {
        child.before(...rows);
      } else this.#child_box.append(...rows);
      this.#parent.global_amount += rows.length;
    } else if (sar.type === "removed") {
      if (sar.array.length === 0) this.#update_rows([]);
      else
        for (let i = 0; i < sar.items.length; i++)
          this.#child_box.children[sar.index].remove();
    } else if (sar.type === "changed")
      for (let i = 0; i < sar.items.length; i++)
        (this.#child_box.children[sar.index + i] as ListRow<R, T, A>).data =
          sar.items[i];
    else this.#update_rows(sar.array);
    console.error(this.#parent.global_amount);
  }
}
define_element(Container);

export function container<
  A extends ListType<any>,
  T extends {},
  R = ListTypeExtract<A>
>(
  columns: { [K in keyof T]: ListColumnOptions<T[K], any> },
  transform: ListRowTransformer<R, NoInfer<T>, A>,
  rows: A,
  options?: ContainerOptions
) {
  return new Container<A, T, R>(columns, transform, rows, options);
}
