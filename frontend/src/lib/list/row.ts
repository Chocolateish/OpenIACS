import { Base, define_element } from "@libBase";
import { array_from_length } from "@libCommon";
import { material_navigation_chevron_right_rounded } from "@libIcons";
import { none, some, type Option } from "@libResult";
import state, {
  type State,
  type StateArray,
  type StateArrayRead,
  type StateInferSub,
} from "@libState";
import { ListAddRow } from "./add_row";
import type { ListField } from "./field";
import "./row.scss";
import type { ListRoot, ListRowParent, ListSubRows } from "./types";

export class ListRow<R, T extends {}> extends Base implements ListRowParent {
  static element_name() {
    return "row";
  }
  static element_name_space(): string {
    return "list";
  }
  #root: ListRoot<R, T>;
  #parent: ListRowParent;
  #sub_rows?: ListSubRows<R>;
  #depth: number;
  #opener: SVGSVGElement;
  #key_field: HTMLDivElement;
  #field_box: HTMLDivElement;
  #child_box: HTMLSpanElement;
  #add_row?: ListAddRow;
  #fields: ListField<any>[];
  #state_sub?: StateInferSub<State<R[]> | StateArray<R>>;

  constructor(
    root: ListRoot<R, T>,
    parent: ListRowParent,
    data: R,
    depth: number
  ) {
    super();
    this.#root = root;
    this.#parent = parent;
    this.#depth = depth + 1;
    this.#key_field = document.createElement("div");
    this.#field_box = this.appendChild(document.createElement("div"));
    this.#child_box = this.appendChild(document.createElement("span"));

    this.#key_field.tabIndex = 0;
    this.#key_field.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        this.open = !this.open;
      } else if (e.key === "ArrowRight") {
        this.open = true;
      } else if (e.key === "ArrowLeft") {
        this.open = false;
      } else if (e.key === "ArrowDown") {
        this.select_adjacent("next", none());
      } else if (e.key === "ArrowUp") {
        this.select_adjacent("previous", none());
      } else {
        return;
      }
      e.preventDefault();
    };

    const opener_box = document.createElement("span");
    this.#opener = opener_box.appendChild(
      material_navigation_chevron_right_rounded()
    );
    this.#key_field.replaceChildren(
      ...array_from_length(this.#depth, () => document.createElement("div")),
      opener_box
    );
    this.#opener.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.open = !this.open;
    });

    this.#fields = this.#root.columns_visible.map((key) =>
      this.#root.columns.get(key)!.field_gen()
    );

    //Generate fields
    this.#field_box.replaceChildren(this.#key_field, ...this.#fields);

    //Updates row data
    this.data = data;
  }

  select_adjacent(
    direction: "next" | "previous" | "p_next" | "p_previous" | "last",
    field: Option<number>
  ) {
    if (direction === "next" || direction === "p_next") {
      if (direction === "next" && this.open)
        (
          this.#child_box.firstElementChild! as ListRow<R, T>
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
        (this.#child_box.lastElementChild as ListRow<R, T>).select_adjacent(
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
    const row_options = this.#root.transform(data);
    this.#sub_rows = row_options.sub_rows;

    if (row_options.add_row) {
      if (!this.#add_row) this.#add_row = this.appendChild(new ListAddRow());
      this.#add_row.options = row_options.add_row;
    } else if (this.#add_row) {
      this.#add_row.remove();
      this.#add_row = undefined;
    }

    //Generate fields
    this.#root.columns_visible.forEach((key, index) => {
      this.#fields[index].data = row_options.values[key];
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
  }

  //       ____  _____  ______ _   _ _____ _   _  _____
  //      / __ \|  __ \|  ____| \ | |_   _| \ | |/ ____|
  //     | |  | | |__) | |__  |  \| | | | |  \| | |  __
  //     | |  | |  ___/|  __| | . ` | | | | . ` | | |_ |
  //     | |__| | |    | |____| |\  |_| |_| |\  | |__| |
  //      \____/|_|    |______|_| \_|_____|_| \_|\_____|

  set openable(value: boolean) {
    if (value && this.#sub_rows) this.#key_field.classList.add("openable");
    else {
      this.open = false;
      this.#key_field.classList.remove("openable");
    }
  }
  get openable(): boolean {
    return this.#key_field.classList.contains("openable");
  }

  set open(open: boolean) {
    if (!this.openable) return;
    if (open && this.#child_box.childElementCount === 0) {
      if (this.#sub_rows) this.rows = this.#sub_rows?.();
      if (this.#child_box.childElementCount > 0) this.classList.add("open");
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
  set rows(rows: R[] | State<R[]> | StateArray<R>) {
    if (this.#state_sub) this.detach_state(this.#state_sub);
    this.#state_sub = undefined;
    if (state.a.is(rows))
      this.#state_sub = this.attach_state(rows, (r) => {
        if (r.ok) this.#update_rows_by_state_array_read(r.value);
        else this.#update_rows([]);
      });
    else if (state.is(rows))
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
        (this.#child_box.children[i] as ListRow<R, T>).data = rows[i];
      if (rows.length > this.#child_box.childElementCount) {
        this.#child_box.append(
          ...rows
            .slice(this.#child_box.childElementCount)
            .map(
              (row) =>
                new ListRow<R, T>(this.#root, this.#parent, row, this.#depth)
            )
        );
      } else if (rows.length < this.#child_box.childElementCount) {
        for (
          let i = this.#child_box.childElementCount - 1;
          i >= rows.length;
          i--
        )
          this.#child_box.children[i].remove();
      }
    }
  }

  #update_rows_by_state_array_read(sar: StateArrayRead<R>) {
    if (sar.type === "added") {
      const rows = sar.items.map(
        (row) => new ListRow<R, T>(this.#root, this.#parent, row, this.#depth)
      );
      const child = this.#child_box.children[sar.index];
      if (child) child.before(...rows);
      else this.#child_box.append(...rows);
    } else if (sar.type === "removed") {
      if (sar.array.length === 0) this.#update_rows([]);
      else
        for (let i = 0; i < sar.items.length; i++)
          this.#child_box.children[sar.index].remove();
    } else if (sar.type === "changed")
      for (let i = 0; i < sar.items.length; i++)
        (this.#child_box.children[sar.index + i] as ListRow<R, T>).data =
          sar.items[i];
    else this.#update_rows(sar.array);
  }
}
define_element(ListRow);
