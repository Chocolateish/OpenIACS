import { material_maps_remove_road_rounded } from "@libIcons";
import { Err, Ok, type Result } from "@libResult";
import type { STATE_SYNC_ROS_WS } from "@libState";
import st from "@libState";
import "./index.scss";
import { form } from "./lib/form";

interface CharacterData {
  uuid: string;
  name: string;
}
class Character {
  readonly uuid: string;
  #name: STATE_SYNC_ROS_WS<string>;

  constructor(uuid: string = crypto.randomUUID(), name: string) {
    this.uuid = uuid;
    this.#name = st.s.ros_ws.ok(name);
  }

  static deserialize(data: Partial<CharacterData>): Result<Character, string> {
    if (!data.uuid) return Err("Missing uuid");
    if (!data.name) return Err("Missing name");
    return Ok(new Character(data.uuid, data.name));
  }

  serialize(): CharacterData {
    return {
      uuid: this.uuid,
      name: this.#name.getOk(),
    };
  }
}

console.warn(Character.deserialize({ uuid: "1234", name: "Hero" }));

document.body.appendChild(
  form.button.from(false, "Click Me!").opts({
    access: "w",
    icon: material_maps_remove_road_rounded,
  })
);
