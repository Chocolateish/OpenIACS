import { Base, define_element } from "@libBase";
import { some, type Option } from "@libResult";
import state, {
  type State,
  type StateArray,
  type StateArrayRead,
  type StateInferSub,
} from "@libState";
import { ListAddRow, type ListAddRowOptions } from "./add_row";
import type { ListField } from "./field";
import { ListKeyField, type ListKeyFieldOptions } from "./key_field";
import "./row.scss";
import type { ListRoot, ListRowParent, ListType } from "./types";

export type ListSubRows<R> = () => R[] | State<R[]> | StateArray<R>;

export interface ListRowOptions<R, T extends {}> {
  opened?: true;
  openable?: boolean | State<boolean>;
  key_field?: ListKeyFieldOptions;
  sub_rows?: ListSubRows<R>;
  add_row?: ListAddRowOptions;
  values: T;
}

export class ListRow<R, T extends {}, A extends ListType<R>>
  extends Base
  implements ListRowParent<A>
{
  static element_name() {
    return "row";
  }
  static element_name_space(): string {
    return "list";
  }
  #root: ListRoot<R, T, A>;
  #parent: ListRowParent<A>;
  #sub_rows?: ListSubRows<R>;
  readonly depth: number;
  #key_field: ListKeyField<A>;
  #field_box: HTMLDivElement;
  #child_box: HTMLSpanElement;
  #add_row?: ListAddRow<A>;
  #fields: ListField[];
  #state_sub?: StateInferSub<State<R[]> | StateArray<R>>;
  state!: A;

  constructor(root: ListRoot<R, T, A>, parent: ListRowParent<A>, data: R) {
    super();
    this.#root = root;
    this.#parent = parent;
    this.depth = parent.depth + 1;
    this.style.setProperty("--i-" + this.depth, "var(--c)");
    this.#key_field = new ListKeyField(this);
    if (this.#root.observer)
      this.#key_field.attach_to_observer(this.#root.observer);
    this.#field_box = this.appendChild(document.createElement("div"));
    this.#child_box = this.appendChild(document.createElement("span"));

    this.#fields = this.#root.columns_visible.map((key) => {
      const field = this.#root.columns.get(key)!.field_gen();
      if (this.#root.observer) field.attach_to_observer(this.#root.observer);
      return field;
    });

    //Generate fields
    this.#field_box.replaceChildren(this.#key_field, ...this.#fields);

    //Updates row data
    this.data = data;
  }

  //      _____        _____  ______ _   _ _______
  //     |  __ \ /\   |  __ \|  ____| \ | |__   __|
  //     | |__) /  \  | |__) | |__  |  \| |  | |
  //     |  ___/ /\ \ |  _  /|  __| | . ` |  | |
  //     | |  / ____ \| | \ \| |____| |\  |  | |
  //     |_| /_/    \_\_|  \_\______|_| \_|  |_|

  select_adjacent(
    direction: "next" | "previous" | "p_next" | "p_previous" | "last",
    field: Option<number>
  ) {
    if (direction === "next" || direction === "p_next") {
      if (direction === "next" && this.open)
        (
          this.#child_box.firstElementChild! as ListRow<R, T, A>
        ).#key_field.focus();
      else {
        const sibling = this.nextElementSibling;
        if (sibling instanceof ListRow) sibling.#key_field.focus();
        else this.#parent.select_adjacent("p_next", field);
      }
    } else if (direction === "previous") {
      const sibling = this.previousElementSibling;
      if (sibling instanceof ListRow) {
        if (sibling.open) sibling.select_adjacent("last", field);
        else sibling.#key_field.focus();
      } else this.#parent.select_adjacent("p_previous", field);
    } else if (direction === "p_previous") this.#key_field.focus();
    else if (direction === "last") {
      if (this.open) {
        (this.#child_box.lastElementChild as ListRow<R, T, A>).select_adjacent(
          "last",
          field
        );
      } else this.#key_field.focus();
    }
  }

  //      _____       _______
  //     |  __ \   /\|__   __|/\
  //     | |  | | /  \  | |  /  \
  //     | |  | |/ /\ \ | | / /\ \
  //     | |__| / ____ \| |/ ____ \
  //     |_____/_/    \_\_/_/    \_\

  set data(data: R) {
    const row_options = this.#root.transform(data, this, this.#parent.state);
    this.#key_field.options = row_options.key_field;
    this.#sub_rows = row_options.sub_rows;

    this.add_row = row_options.add_row;

    //Generate fields
    this.#root.columns_visible.forEach((key, index) => {
      this.#root.columns
        .get(key)!
        .field_apply(this.#fields[index], row_options.values[key]);
    });

    //Setup openable
    if (state.is(row_options.openable))
      this.attach_state_to_prop("openable", row_options.openable, () => {
        this.open = false;
        return some(false);
      });
    else if (row_options.openable) {
      this.detach_state_from_prop("openable");
      this.openable = row_options.openable;
    }

    if (row_options.opened) {
      if (this.open) {
        if (this.#sub_rows) this.rows = this.#sub_rows?.();
      } else this.open = true;
    } else if (this.open) {
      if (this.#sub_rows) this.rows = this.#sub_rows?.();
      else this.open = false;
    }
  }

  set add_row(options: ListAddRowOptions | undefined) {
    if (!options && this.#add_row) {
      this.#add_row.remove();
      this.classList.remove("addrow");
      this.#add_row = undefined;
    } else if (options) {
      if (!this.#add_row) {
        this.classList.add("addrow");
        this.#add_row = this.appendChild(new ListAddRow<A>(this));
      }
      this.#add_row.options = options;
    }
  }

  //       ____  _____  ______ _   _ _____ _   _  _____
  //      / __ \|  __ \|  ____| \ | |_   _| \ | |/ ____|
  //     | |  | | |__) | |__  |  \| | | | |  \| | |  __
  //     | |  | |  ___/|  __| | . ` | | | | . ` | | |_ |
  //     | |__| | |    | |____| |\  |_| |_| |\  | |__| |
  //      \____/|_|    |______|_| \_|_____|_| \_|\_____|

  set openable(value: boolean) {
    if (!value) this.open = false;
    this.#key_field.openable = value;
  }
  get openable(): boolean {
    return this.#key_field.openable;
  }

  set open(open: boolean) {
    if (!this.openable) return;
    if (open && this.#child_box.childElementCount === 0) {
      if (this.#sub_rows) this.rows = this.#sub_rows?.();
      if (this.#child_box.childElementCount > 0 || this.#add_row)
        this.classList.add("open");
    } else if (!open && this.open) {
      this.rows = [];
      this.classList.remove("open");
    }
  }
  get open(): boolean {
    return this.classList.contains("open");
  }

  //      _____   ______          _______
  //     |  __ \ / __ \ \        / / ____|
  //     | |__) | |  | \ \  /\  / / (___
  //     |  _  /| |  | |\ \/  \/ / \___ \
  //     | | \ \| |__| | \  /\  /  ____) |
  //     |_|  \_\\____/   \/  \/  |_____/

  get index(): number {
    return Array.prototype.indexOf.call(this.parentElement!.children, this);
  }

  amount_rows(rec: boolean = false): number {
    let count = this.#child_box.childElementCount;
    if (rec)
      for (let i = 0; i < this.#child_box.childElementCount; i++)
        count += (this.#child_box.children[i] as ListRow<R, T, A>).amount_rows(
          true
        );
    return count;
  }

  set rows(rows: R[] | State<R[]> | StateArray<R>) {
    if (this.#state_sub) this.detach_state(this.#state_sub);
    this.#state_sub = undefined;
    this.state = rows as A;
    if (state.is(rows))
      if (state.a.is(rows))
        this.#state_sub = this.attach_state(rows, (r) => {
          if (r.ok) this.#update_rows_by_state_array_read(r.value);
          else this.#update_rows([]);
        });
      else
        this.#state_sub = this.attach_state(rows, (r) =>
          this.#update_rows(r.ok ? r.value : [])
        );
    else this.#update_rows(rows);
  }

  #update_rows(rows: readonly R[]) {
    if (rows.length === 0) this.#child_box.replaceChildren();
    else {
      const min = Math.min(this.#child_box.childElementCount, rows.length);
      for (let i = 0; i < min; i++)
        (this.#child_box.children[i] as ListRow<R, T, A>).data = rows[i];
      if (rows.length > this.#child_box.childElementCount)
        this.#child_box.append(
          ...rows
            .slice(this.#child_box.childElementCount)
            .map((row) => new ListRow<R, T, A>(this.#root, this, row))
        );
      else if (rows.length < this.#child_box.childElementCount) {
        for (
          let i = this.#child_box.childElementCount - 1;
          i >= rows.length;
          i--
        )
          (this.#child_box.children[i] as ListRow<R, T, A>).remove();
      }
    }
  }

  #update_rows_by_state_array_read(sar: StateArrayRead<R>) {
    if (sar.type === "added") {
      const child = this.#child_box.children[sar.index] as
        | ListRow<R, T, A>
        | undefined;
      const rows = sar.items.map(
        (row) => new ListRow<R, T, A>(this.#root, this, row)
      );
      if (child) child.before(...rows);
      else this.#child_box.append(...rows);
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
  }
}
define_element(ListRow);
