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

const formCont = document.body.appendChild(document.createElement("div"));
formCont.style.flexGrow = "1";
formCont.style.maxWidth = "40rem";
formCont.style.overflow = "auto";

//       _____ _____   ____  _    _ _____
//      / ____|  __ \ / __ \| |  | |  __ \
//     | |  __| |__) | |  | | |  | | |__) |
//     | | |_ |  _  /| |  | | |  | |  ___/
//     | |__| | | \ \| |__| | |__| | |
//      \_____|_|  \_\\____/ \____/|_|
const grouptest = formCont.appendChild(
  form.group.from({
    label: "Group Box",
    border: "outset",
    components: [
      form.button
        .from({
          id: "test",
          label: "Button in Group",
          text: "Click Me",
        })
        .opts({ access: "r" }),
      form.button
        .from({
          id: "test2",
          label: "Button in Group",
          text: "Click Me",
        })
        .opts({ access: "r" }),
      form.slider.from({
        label: "Slider in Group",
        id: "slider_in_group",
        unit: "mA",
        min: -100,
        max: 100,
      }),
    ],
  })
);

grouptest.value = {
  test: true,
  slider_in_group: 50,
};
grouptest.value.map(console.error);

formCont.appendChild(
  form.group.from({
    label: "Group Box",
    border: "outset",
    collapsible: true,
    collapse_text: "Toggle",
    components: [
      form.text.from({ text: "Hello inside group!", size: 2 }),
      form.button
        .from({ label: "Button in Group", text: "Click Me" })
        .opts({ access: "r" }),
    ],
  })
);

formCont.appendChild(
  form.group.from({
    label: "Group Box",
    border: "inset",
    collapsible: true,
    collapsed: true,
    collapse_text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    components: [
      form.text.from({ text: "Hello inside group!", size: 2 }),
      form.button
        .from({ label: "Button in Group", text: "Click Me" })
        .opts({ access: "r" }),
    ],
  })
);

formCont.appendChild(
  form.text.from({
    text: "Hello World!",
    size: 2,
  })
);

const bool = state.s.ros_ws.ok(false);
formCont.appendChild(
  form.button
    .from({
      id: "test",
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

//      _____  _____   ____  _____  _____   ______          ___   _
//     |  __ \|  __ \ / __ \|  __ \|  __ \ / __ \ \        / / \ | |
//     | |  | | |__) | |  | | |__) | |  | | |  | \ \  /\  / /|  \| |
//     | |  | |  _  /| |  | |  ___/| |  | | |  | |\ \/  \/ / | . ` |
//     | |__| | | \ \| |__| | |    | |__| | |__| | \  /\  /  | |\  |
//     |_____/|_|  \_\\____/|_|    |_____/ \____/   \/  \/   |_| \_|
const num = state.s.ros.ok(0);
formCont.appendChild(
  form.dropdown.from({
    label: "Dropdown",
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
    label: "Dropdown",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    default_icon: material_av_add_to_queue_rounded,
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
    label: "Dropdown",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    default_icon: material_av_add_to_queue_rounded,
    selections: Array.from({ length: 100 }, (v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
      };
    }),
  })
).value_by_state = num;

//      _______ ____   _____  _____ _      ______   ____  _    _ _______ _______ ____  _   _  _____
//     |__   __/ __ \ / ____|/ ____| |    |  ____| |  _ \| |  | |__   __|__   __/ __ \| \ | |/ ____|
//        | | | |  | | |  __| |  __| |    | |__    | |_) | |  | |  | |     | | | |  | |  \| | (___
//        | | | |  | | | |_ | | |_ | |    |  __|   |  _ <| |  | |  | |     | | | |  | | . ` |\___ \
//        | | | |__| | |__| | |__| | |____| |____  | |_) | |__| |  | |     | | | |__| | |\  |____) |
//        |_|  \____/ \_____|\_____|______|______| |____/ \____/   |_|     |_|  \____/|_| \_|_____/
formCont.appendChild(
  form.toggle_button.from({
    label: "Toggle Buttons",
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
    label: "Toggle Buttons",
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
    label: "Toggle Buttons",
    selections: Array.from({ length: 20 }, (v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
      };
    }),
  })
).value_by_state = num;

//       _____ _      _____ _____  ______ _____
//      / ____| |    |_   _|  __ \|  ____|  __ \
//     | (___ | |      | | | |  | | |__  | |__) |
//      \___ \| |      | | | |  | |  __| |  _  /
//      ____) | |____ _| |_| |__| | |____| | \ \
//     |_____/|______|_____|_____/|______|_|  \_\
const slideNum = state.s.ros_ws.ok(0);
formCont.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = slideNum;
formCont.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    live: true,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = slideNum;
formCont.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = slideNum;
formCont.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
    live: true,
  })
).value_by_state = slideNum;

//       _____ _______ ______ _____  _____  ______ _____
//      / ____|__   __|  ____|  __ \|  __ \|  ____|  __ \
//     | (___    | |  | |__  | |__) | |__) | |__  | |__) |
//      \___ \   | |  |  __| |  ___/|  ___/|  __| |  _  /
//      ____) |  | |  | |____| |    | |    | |____| | \ \
//     |_____/   |_|  |______|_|    |_|    |______|_|  \_\
const stepperNum = state.s.ros_ws.ok(0);
formCont.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = stepperNum;
formCont.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    live: true,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = stepperNum;
formCont.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = stepperNum;

//      _____  _____   ____   _____ _____  ______  _____ _____
//     |  __ \|  __ \ / __ \ / ____|  __ \|  ____|/ ____/ ____|
//     | |__) | |__) | |  | | |  __| |__) | |__  | (___| (___
//     |  ___/|  _  /| |  | | | |_ |  _  /|  __|  \___ \\___ \
//     | |    | | \ \| |__| | |__| | | \ \| |____ ____) |___) |
//     |_|    |_|  \_\\____/ \_____|_|  \_\______|_____/_____/
formCont.appendChild(
  form.progress.from({
    label: "Progress",
    unit: "mA",
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
