import { Base } from "@libBase";
import { none, type Option } from "@libResult";
import state from "@libState";
import type { SVGFunc } from "@libSVG";

const PRIVATE_FOCUSED_CONTENT = state.err<Content>("No content focused");
export const FOCUSED_CONTENT = PRIVATE_FOCUSED_CONTENT.read_only;

class Content extends Base {
  private _name = state.s.ros.ok("");
  readonly name = this._name.read_only;
  private _icon = state.s.ros.ok<Option<SVGFunc>>(none());
  readonly icon = this._icon.read_only;
}
