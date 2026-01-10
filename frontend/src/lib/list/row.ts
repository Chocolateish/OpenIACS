import { Base, define_element } from "@libBase";
import { array_from_length } from "@libCommon";
import { material_navigation_chevron_right_rounded } from "@libIcons";
import { some } from "@libResult";
import state, {
  type State,
  type StateArray,
  type StateArrayRead,
} from "@libState";
import "./row.scss";
import type { ListRoot, ListRowOptions } from "./types";

export class ListRow<R extends {}, T extends {}> extends Base {
  static element_name() {
    return "row";
  }
  static element_name_space(): string {
    return "list";
  }
  #root: ListRoot<R, T>;
  #row: ListRowOptions<R, T>;
  #depth: number;
  #opener: SVGSVGElement;
  #key_field: HTMLDivElement;
  #field_box: HTMLDivElement;
  #child_box: HTMLSpanElement;

  constructor(root: ListRoot<R, T>, row: ListRowOptions<R, T>, depth: number) {
    super();
    this.#root = root;
    this.#row = row;
    this.#depth = depth + 1;
    this.#key_field = document.createElement("div");
    this.#field_box = this.appendChild(document.createElement("div"));
    this.#child_box = this.appendChild(document.createElement("span"));

    //Generate fields
    this.#field_box.replaceChildren(
      this.#key_field,
      ...root.columns_visible.map((key) =>
        root.columns.get(key)!.transform(key, row.values[key])
      )
    );

    //Setup openable
    if (state.is(row.openable))
      this.attach_state_to_prop("openable", row.openable, () => {
        this.open = false;
        return some(false);
      });
    else if (row.openable) this.openable = row.openable;

    this.#opener = material_navigation_chevron_right_rounded();
    this.#key_field.replaceChildren(
      ...array_from_length(this.#depth, () => document.createElement("div")),
      this.#opener,
      document.createElement("hr")
    );
    this.#opener.addEventListener("click", () => {
      this.open = !this.open;
    });
  }

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
          new ListRow<R, T>(this.#root, this.#root.transform(row), this.#depth)
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
