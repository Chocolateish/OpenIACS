import { Base, define_element } from "@libBase";
import "./field.scss";

export class ListKeyField extends Base {
  static element_name() {
    return "keyfield";
  }
  static element_name_space() {
    return "list";
  }
}
define_element(ListKeyField);
