import {
  context_line,
  context_menu,
  context_menu_default,
  context_sub,
} from "@libContextmenu";
import { material_av_add_to_queue_rounded } from "@libIcons";
import { Err, Ok, type Result } from "@libResult";
import type { STATE_SYNC_ROS_WS } from "@libState";
import { default as st, default as state } from "@libState";
import "./index.scss";
import { form } from "./lib/form";
import { FormColors } from "./lib/form/base";

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
      name: this.#name.ok(),
    };
  }
}

console.warn(Character.deserialize({ uuid: "1234", name: "Hero" }));

let bool = state.s.ros_ws.ok(false);

let formCont = document.body.appendChild(document.createElement("div"));
formCont.style.flexGrow = "1";

formCont.appendChild(
  form.text.from({
    text: "Hello World!",
    size: 2,
  })
);

formCont.appendChild(
  form.button
    .from({
      label: "YOYOYOY",
      text: "YOYOYOYO",
      icon: material_av_add_to_queue_rounded,
      color: FormColors.Yellow,
    })
    .opts({
      access: "w",
    })
).value_by_state = bool;

formCont.appendChild(
  form.switch.from({
    label: "Toggle Me",
  })
).value_by_state = bool;

context_menu_default(
  context_menu([
    context_line("Default Option", () => console.warn("Clicked")),
    context_line("Default Option", () => console.warn("Clicked")),
    context_sub(
      "Default Submenu",
      context_menu([
        context_line("Sub Option", () => console.warn("Sub Clicked")),
        context_line("Sub Option", () => console.warn("Sub Clicked")),
      ])
    ),
    context_line("Default Option", () => console.warn("Clicked")),
    context_line("Default Option", () => console.warn("Clicked")),
    context_line("Default Option", () => console.warn("Clicked")),
    context_line("Default Option", () => console.warn("Clicked")),
    context_line("Default Option", () => console.warn("Clicked")),
    context_line("Default Option", () => console.warn("Clicked")),
    context_sub(
      "Default Submenu",
      context_menu([
        context_line("Sub Option", () => console.warn("Sub Clicked")),
        context_line("Sub Option", () => console.warn("Sub Clicked")),
      ])
    ),
  ])
);
