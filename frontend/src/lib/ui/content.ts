import { Base } from "@libBase";
import { None, type Option } from "@libResult";
import state from "@libState";
import type { SVGFunc } from "@libSVG";

const _focused_content = state.err<Content>("No content focused");
export const focused_content = _focused_content.read_only;

class Content extends Base {
  private _name = state.s.ros.ok("");
  readonly name = this._name.read_only;
  private _icon = state.s.ros.ok<Option<SVGFunc>>(None());
  readonly icon = this._icon.read_only;
}
