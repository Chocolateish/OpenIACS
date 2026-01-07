import { Base, define_element } from "@libBase";
import { none, type Option } from "@libResult";
import state, { type StateROS } from "@libState";
import type { SVGFunc } from "@libSVG";
import "./content.scss";
import "./shared";

const PRIVATE_FOCUSED_CONTENT = state.err<ContentBase>("No content focused");
export const FOCUSED_CONTENT = PRIVATE_FOCUSED_CONTENT.read_only;

export abstract class ContentBase<Close = void> extends Base {
  static element_name() {
    return "@abstract@";
  }
  static element_name_space() {
    return "@abstract@";
  }

  abstract readonly name: StateROS<string>;
  abstract readonly icon: StateROS<Option<SVGFunc>>;
  abstract close(args: Close): Promise<Option<Close>>;
  abstract on_close(): Promise<Close>;

  constructor() {
    super();
    this.tabIndex = 0;
    this.classList.add("content");
  }
}

export class Content extends ContentBase {
  static element_name() {
    return "content";
  }
  static element_name_space() {
    return "ui";
  }

  private _name = state.s.ros.ok("");
  get name() {
    return this._name.read_only;
  }
  set_name(value: string) {
    this._name.set_ok(value);
  }

  private _icon = state.s.ros.ok<Option<SVGFunc>>(none());
  get icon() {
    return this._icon.read_only;
  }
  set_icon(value: Option<SVGFunc>) {
    this._icon.set_ok(value);
  }

  constructor() {
    super();
  }
}
define_element(Content);
