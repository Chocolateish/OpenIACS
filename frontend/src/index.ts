import { IPAddress, IPVersion } from "@libCommon";
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
import { err, ok, type Result } from "@libResult";
import type { StateSyncROSWS } from "@libState";
import { default as st, default as state } from "@libState";
import { ANIMATION_LEVEL, INPUT_MODE, THEME } from "@libTheme";
import "@libUI";
import { main_panel_container } from "@libUI";
import "./index.scss";
import { form } from "./lib/form";
import { FormColors } from "./lib/form/base";
import { FormDateTimeType } from "./lib/form/special/dateTime/dateTimeInput";

interface CharacterData {
  uuid: string;
  name: string;
}
class Character {
  readonly uuid: string;
  #name: StateSyncROSWS<string>;

  constructor(uuid: string = crypto.randomUUID(), name: string) {
    this.uuid = uuid;
    this.#name = st.s.ros_ws.ok(name);
  }

  static deserialize(data: Partial<CharacterData>): Result<Character, string> {
    if (!data.uuid) return err("Missing uuid");
    if (!data.name) return err("Missing name");
    return ok(new Character(data.uuid, data.name));
  }

  serialize(): CharacterData {
    return {
      uuid: this.uuid,
      name: this.#name.ok(),
    };
  }
}

console.warn(Character.deserialize({ uuid: "1234", name: "Hero" }));

main_panel_container.create_panel({
  // top: 5,
  // left: 5,
  width: 10,
  height: 10,
});

const FORM_CONT = document.body.appendChild(document.createElement("div"));
FORM_CONT.style.flexGrow = "1";
FORM_CONT.style.maxWidth = "40rem";
FORM_CONT.style.overflow = "auto";

FORM_CONT.appendChild(
  form.group.from({
    label: "Group Box",
    border: "inset",
    max_height: 16,
    collapsible: true,
    collapsed: true,
    collapse_text: "Theme",
    components: [
      form.toggle_button.from({
        label: "Theme",
        value_by_state: THEME,
      }),
      form.toggle_button.from({
        label: "Input Mode",
        value_by_state: INPUT_MODE,
      }),
      form.toggle_button.from({
        label: "Animation Level",
        value_by_state: ANIMATION_LEVEL,
      }),
    ],
  })
);

//      _____         _____ _______          ______  _____  _____
//     |  __ \ /\    / ____/ ____\ \        / / __ \|  __ \|  __ \
//     | |__) /  \  | (___| (___  \ \  /\  / / |  | | |__) | |  | |
//     |  ___/ /\ \  \___ \\___ \  \ \/  \/ /| |  | |  _  /| |  | |
//     | |  / ____ \ ____) |___) |  \  /\  / | |__| | | \ \| |__| |
//     |_| /_/    \_\_____/_____/    \/  \/   \____/|_|  \_\_____/
const PASSWORD_STATE = state.s.ros_ws.ok("");
PASSWORD_STATE.sub(console.error);
FORM_CONT.appendChild(
  form.password_input.from({
    label: "IP Input",
    value_by_state: PASSWORD_STATE,
    filter: /[0-9]/,
  })
);

//      _____ _____    _____ _   _ _____  _    _ _______
//     |_   _|  __ \  |_   _| \ | |  __ \| |  | |__   __|
//       | | | |__) |   | | |  \| | |__) | |  | |  | |
//       | | |  ___/    | | | . ` |  ___/| |  | |  | |
//      _| |_| |       _| |_| |\  | |    | |__| |  | |
//     |_____|_|      |_____|_| \_|_|     \____/   |_|
const IP_STATE = state.s.ros_ws.ok(new IPAddress("192.168.1.1"));
IP_STATE.sub(console.error);
FORM_CONT.appendChild(
  form.ip_input.from({
    type: IPVersion.V4,
    label: "IP Input",
    value_by_state: IP_STATE,
  })
);
FORM_CONT.appendChild(
  form.ip_input.from({
    type: IPVersion.V6,
    label: "IP Input",
  })
);

//       _____ ____  _      ____  _____    _____ _   _ _____  _    _ _______
//      / ____/ __ \| |    / __ \|  __ \  |_   _| \ | |  __ \| |  | |__   __|
//     | |   | |  | | |   | |  | | |__) |   | | |  \| | |__) | |  | |  | |
//     | |   | |  | | |   | |  | |  _  /    | | | . ` |  ___/| |  | |  | |
//     | |___| |__| | |___| |__| | | \ \   _| |_| |\  | |    | |__| |  | |
//      \_____\____/|______\____/|_|  \_\ |_____|_| \_|_|     \____/   |_|
const COLOR_STATE = state.s.ros_ws.ok("#00ff00");
FORM_CONT.appendChild(
  form.color_input.from({
    label: "Color Input",
    value_by_state: COLOR_STATE,
  })
);

FORM_CONT.appendChild(
  form.color_input.from({
    label: "Color Input 2",
    live: true,
    value_by_state: COLOR_STATE,
  })
);

//      _____       _______ ______ _______ _____ __  __ ______
//     |  __ \   /\|__   __|  ____|__   __|_   _|  \/  |  ____|
//     | |  | | /  \  | |  | |__     | |    | | | \  / | |__
//     | |  | |/ /\ \ | |  |  __|    | |    | | | |\/| |  __|
//     | |__| / ____ \| |  | |____   | |   _| |_| |  | | |____
//     |_____/_/    \_\_|  |______|  |_|  |_____|_|  |_|______|
const DATE_TIME_STATE = state.s.ros_ws.ok(new Date());
FORM_CONT.appendChild(
  form.date_time_input.from({
    label: "Date Time Input",
    type: FormDateTimeType.TIME,
    value_by_state: DATE_TIME_STATE,
  })
);
FORM_CONT.appendChild(
  form.date_time_input.from({
    label: "Date Time Input",
    value_by_state: DATE_TIME_STATE,
  })
);
FORM_CONT.appendChild(
  form.date_time_input.from({
    label: "Date Time Input",
    value: 5000 as number,
  })
);

//      _______ ________   _________   _____ _   _ _____  _    _ _______
//     |__   __|  ____\ \ / /__   __| |_   _| \ | |  __ \| |  | |__   __|
//        | |  | |__   \ V /   | |      | | |  \| | |__) | |  | |  | |
//        | |  |  __|   > <    | |      | | | . ` |  ___/| |  | |  | |
//        | |  | |____ / . \   | |     _| |_| |\  | |    | |__| |  | |
//        |_|  |______/_/ \_\  |_|    |_____|_| \_|_|     \____/   |_|
const TEXT_STATE = state.s.ros_ws.ok("");
FORM_CONT.appendChild(
  form.input_text.from({
    label: "Text Input",
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: TEXT_STATE,
    filter: /[a-zA-Z ]/,
  })
);
FORM_CONT.appendChild(
  form.input_text.from({
    label: "Text Input2",
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: TEXT_STATE,
  })
);

const MULTI_LINE_TEXT_STATE = state.s.ros_ws.ok("");
FORM_CONT.appendChild(
  form.multiline_text.from({
    label: "Multiline Text Input",
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: MULTI_LINE_TEXT_STATE,
  })
);

FORM_CONT.appendChild(
  form.multiline_text.from({
    label: "Multiline Text Input2",
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: MULTI_LINE_TEXT_STATE,
  })
);

//      _   _ _    _ __  __ ____  ______ _____    _____ _   _ _____  _    _ _______
//     | \ | | |  | |  \/  |  _ \|  ____|  __ \  |_   _| \ | |  __ \| |  | |__   __|
//     |  \| | |  | | \  / | |_) | |__  | |__) |   | | |  \| | |__) | |  | |  | |
//     | . ` | |  | | |\/| |  _ <|  __| |  _  /    | | | . ` |  ___/| |  | |  | |
//     | |\  | |__| | |  | | |_) | |____| | \ \   _| |_| |\  | |    | |__| |  | |
//     |_| \_|\____/|_|  |_|____/|______|_|  \_\ |_____|_| \_|_|     \____/   |_|
FORM_CONT.appendChild(
  form.input_number.from({
    label: "Number Input",
    unit: "mA",
    min: -100,
    max: 100,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
);

//       _____ _____   ____  _    _ _____
//      / ____|  __ \ / __ \| |  | |  __ \
//     | |  __| |__) | |  | | |  | | |__) |
//     | | |_ |  _  /| |  | | |  | |  ___/
//     | |__| | | \ \| |__| | |__| | |
//      \_____|_|  \_\\____/ \____/|_|
const grouptest = FORM_CONT.appendChild(
  form.group.from({
    label: "Group Box",
    border: "outset",
    max_height: 6,
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

FORM_CONT.appendChild(
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

FORM_CONT.appendChild(
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

FORM_CONT.appendChild(
  form.text.from({
    text: "Hello World!",
    size: 2,
  })
);

const bool = state.s.ros_ws.ok(false);
FORM_CONT.appendChild(
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

FORM_CONT.appendChild(
  form.switch.from({
    label: "Toggle Me",
  })
).value_by_state = bool;

FORM_CONT.appendChild(
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
FORM_CONT.appendChild(
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

FORM_CONT.appendChild(
  form.dropdown.from({
    label: "Dropdown",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    default_icon: material_av_add_to_queue_rounded,
    selections: Array.from({ length: 100 }, (_v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
        icon: material_av_remove_from_queue_rounded,
      };
    }),
  })
).value_by_state = num;

FORM_CONT.appendChild(
  form.dropdown.from({
    label: "Dropdown",
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    default_icon: material_av_add_to_queue_rounded,
    selections: Array.from({ length: 100 }, (_v, i) => {
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
FORM_CONT.appendChild(
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

FORM_CONT.appendChild(
  form.toggle_button.from({
    label: "Toggle Buttons",
    selections: Array.from({ length: 20 }, (_v, i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
        icon: material_av_remove_from_queue_rounded,
      };
    }),
  })
).value_by_state = num;

FORM_CONT.appendChild(
  form.toggle_button.from({
    label: "Toggle Buttons",
    selections: Array.from({ length: 20 }, (_v, i) => {
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
const SLIDER_NUM = state.s.ros_ws.ok(0);
FORM_CONT.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = SLIDER_NUM;
FORM_CONT.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    live: true,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = SLIDER_NUM;
FORM_CONT.appendChild(
  form.slider.from({
    label: "Slider",
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = SLIDER_NUM;
FORM_CONT.appendChild(
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
).value_by_state = SLIDER_NUM;

FORM_CONT.appendChild(
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
);

//       _____ _______ ______ _____  _____  ______ _____
//      / ____|__   __|  ____|  __ \|  __ \|  ____|  __ \
//     | (___    | |  | |__  | |__) | |__) | |__  | |__) |
//      \___ \   | |  |  __| |  ___/|  ___/|  __| |  _  /
//      ____) |  | |  | |____| |    | |    | |____| | \ \
//     |_____/   |_|  |______|_|    |_|    |______|_|  \_\
const STEPPER_NUM = state.s.ros_ws.ok(0);
FORM_CONT.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = STEPPER_NUM;
FORM_CONT.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    live: true,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = STEPPER_NUM;
FORM_CONT.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = STEPPER_NUM;
FORM_CONT.appendChild(
  form.stepper.from({
    label: "Stepper",
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
);

//      _____  _____   ____   _____ _____  ______  _____ _____
//     |  __ \|  __ \ / __ \ / ____|  __ \|  ____|/ ____/ ____|
//     | |__) | |__) | |  | | |  __| |__) | |__  | (___| (___
//     |  ___/|  _  /| |  | | | |_ |  _  /|  __|  \___ \\___ \
//     | |    | | \ \| |__| | |__| | | \ \| |____ ____) |___) |
//     |_|    |_|  \_\\____/ \_____|_|  \_\______|_____/_____/
FORM_CONT.appendChild(
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
