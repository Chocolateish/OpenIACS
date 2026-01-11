import { Base, define_element } from "@libBase";
import { array_from_length } from "@libCommon";
import { material_navigation_chevron_right_rounded } from "@libIcons";
import { none, some, type Option } from "@libResult";
import state, {
  type State,
  type StateArray,
  type StateArrayRead,
} from "@libState";
import "./row.scss";
import type { ListRoot, ListRowOptions, ListRowParent } from "./types";

export class ListRow<R, T extends {}> extends Base implements ListRowParent {
  static element_name() {
    return "row";
  }
  static element_name_space(): string {
    return "list";
  }
  #root: ListRoot<R, T>;
  #parent: ListRowParent;
  #row: ListRowOptions<R, T>;
  #depth: number;
  #opener: SVGSVGElement;
  #key_field: HTMLDivElement;
  #field_box: HTMLDivElement;
  #child_box: HTMLSpanElement;

  constructor(
    root: ListRoot<R, T>,
    parent: ListRowParent,
    row: ListRowOptions<R, T>,
    depth: number
  ) {
    super();
    this.#root = root;
    this.#parent = parent;
    this.#row = row;
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

    //Generate fields
    this.#field_box.replaceChildren(
      this.#key_field,
      ...root.columns_visible.map((key) =>
        root.columns.get(key)!.field_gen(key, row.values[key])
      )
    );

    //Setup openable
    if (state.is(row.openable))
      this.attach_state_to_prop("openable", row.openable, () => {
        this.open = false;
        return some(false);
      });
    else if (row.openable) this.openable = row.openable;

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

  set row(row: ListRowOptions<R, T>) {
    this.#row = row;
  }

  //       ____  _____  ______ _   _ _____ _   _  _____
  //      / __ \|  __ \|  ____| \ | |_   _| \ | |/ ____|
  //     | |  | | |__) | |__  |  \| | | | |  \| | |  __
  //     | |  | |  ___/|  __| | . ` | | | | . ` | | |_ |
  //     | |__| | |    | |____| |\  |_| |_| |\  | |__| |
  //      \____/|_|    |______|_| \_|_____|_| \_|\_____|

  set openable(value: boolean) {
    if (value && this.#row.sub_rows) this.#key_field.classList.add("openable");
    else this.#key_field.classList.remove("openable");
  }
  get openable(): boolean {
    return this.#key_field.classList.contains("openable");
  }

  set open(open: boolean) {
    if (open && this.#child_box.childElementCount === 0) {
      if (this.#row.sub_rows) {
        const rows = this.#row.sub_rows?.();
        if (state.a.is(rows)) this.rows_by_state_array = rows;
        else if (state.is(rows)) this.rows_by_state = rows;
        else this.rows = rows;
      }
      if (this.#child_box.childElementCount > 0)
        this.#opener.classList.add("open");
    } else if (!open && this.open) {
      this.#child_box.replaceChildren();
      this.#opener.classList.remove("open");
    }
  }
  get open(): boolean {
    return this.#opener.classList.contains("open");
  }

  //      _____   ______          _______
  //     |  __ \ / __ \ \        / / ____|
  //     | |__) | |  | \ \  /\  / / (___
  //     |  _  /| |  | |\ \/  \/ / \___ \
  //     | | \ \| |__| | \  /\  /  ____) |
  //     |_|  \_\\____/   \/  \/  |_____/
  set rows(rows: R[]) {
    this.#child_box.replaceChildren(
      ...rows.map(
        (row) =>
          new ListRow<R, T>(
            this.#root,
            this,
            this.#root.transform(row),
            this.#depth
          )
      )
    );
  }

  set rows_by_state_array_read(sar: StateArrayRead<R>) {}

  set rows_by_state(state: State<R[]> | undefined) {
    if (state) this.attach_state_to_prop("rows", state, () => some([]));
    else this.detach_state_from_prop("rows");
  }

  set rows_by_state_array(state: StateArray<R>) {
    if (state)
      this.attach_state_to_prop("rows_by_state_array_read", state, () =>
        some({
          type: "fresh",
          array: [],
          index: 0,
          items: [],
        } satisfies StateArrayRead<R>)
      );
    else this.detach_state_from_prop("rows_by_state_array_read");
  }
}
define_element(ListRow);
