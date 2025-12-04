import {
  context_line,
  context_menu,
  context_menu_default,
  context_sub,
} from "@libContextmenu";
import {
  material_av_add_to_queue_rounded,
  material_av_remove_from_queue_rounded,
} from "@libIcons";
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

let formCont = document.body.appendChild(document.createElement("div"));
formCont.style.flexGrow = "1";
formCont.style.maxWidth = "40rem";
formCont.style.overflow = "auto";

formCont.appendChild(
  form.text.from({
    text: "Hello World!",
    size: 2,
  })
);

let bool = state.s.ros_ws.ok(false);
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

formCont.appendChild(
  form.lamp.from({
    text: "Status Lamp",
    colors: [FormColors.Red, FormColors.Green],
    icon: material_av_add_to_queue_rounded,
  })
).value_by_state = bool;

let num = state.s.ros_ws.ok(0);
formCont.appendChild(
  form.dropdown.from({
    label: "Status Lamp",
    selections: [
      {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
        value: 2,
        icon: material_av_add_to_queue_rounded,
      },
      {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
        value: 3,
        icon: material_av_remove_from_queue_rounded,
      },
      {
        text: "YPYP",
        value: 6,
        icon: material_av_remove_from_queue_rounded,
      },
    ],
  })
).value_by_state = num;

formCont.appendChild(
  form.dropdown.from({
    label: "Status Lamp",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    defaultIcon: material_av_add_to_queue_rounded,
    selections: Array.from({ length: 100 }, (v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
        icon: material_av_remove_from_queue_rounded,
      };
    }),
  })
).value_by_state = num;

formCont.appendChild(
  form.dropdown.from({
    label: "Status Lamp",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    defaultIcon: material_av_add_to_queue_rounded,
    selections: Array.from({ length: 100 }, (v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
      };
    }),
  })
).value_by_state = num;

formCont.appendChild(
  form.toggle_button.from({
    label: "Status Lamp",
    selections: [
      {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
        value: 2,
        icon: material_av_add_to_queue_rounded,
      },
      {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
        value: 3,
        icon: material_av_remove_from_queue_rounded,
      },
      {
        text: "YPYP",
        value: 6,
        icon: material_av_remove_from_queue_rounded,
      },
    ],
  })
).value_by_state = num;

formCont.appendChild(
  form.toggle_button.from({
    label: "Status Lamp",
    selections: Array.from({ length: 20 }, (v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
        icon: material_av_remove_from_queue_rounded,
      };
    }),
  })
).value_by_state = num;

formCont.appendChild(
  form.toggle_button.from({
    label: "Status Lamp",
    selections: Array.from({ length: 20 }, (v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
      };
    }),
  })
).value_by_state = num;

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
