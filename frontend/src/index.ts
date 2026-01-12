import {
  array_from_length,
  array_from_range,
  IPAddress,
  IPVersion,
} from "@libCommon";
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
import { list } from "@libList";
import { err, ok, type Result } from "@libResult";
import type { StateSyncROSWS } from "@libState";
import { default as st, default as state } from "@libState";
import { ANIMATION_LEVEL, INPUT_MODE, SCALE, THEME } from "@libTheme";
import "./index.scss";
import "./lib/composition";
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

const yo = state.l.ros.ok(() => 1);
yo.ok();

console.warn(Character.deserialize({ uuid: "1234", name: "Hero" }));

// main_panel_container.create_panel({
//   // top: 5,
//   // left: 5,
//   width: 10,
//   height: 10,
//   sizeable: "all",
//   content: new Content(),
// });
// main_panel_container.create_panel({
//   top: 5,
//   left: 5,
//   width: 10,
//   height: 10,
//   content: new Content(),
// });
// main_panel_container.create_panel({
//   top: 5,
//   left: 20,
//   width: 10,
//   height: 10,
//   sizeable: "e",
// });

const FORM_CONT = document.getElementById("app")!;
FORM_CONT.style.flexGrow = "1";
FORM_CONT.style.overflow = "auto";

FORM_CONT.appendChild(
  form.group({
    border: "inset",
    max_height: 16,
    collapsible: true,
    collapsed: true,
    collapse_text: "Theme",
    components: [
      form.text({ text: "Theme" }),
      form.toggle_button({ value_by_state: THEME }),
      form.text({ text: "Input Mode" }),
      form.toggle_button({ value_by_state: INPUT_MODE }),
      form.text({ text: "Animation Level" }),
      form.toggle_button({ value_by_state: ANIMATION_LEVEL }),
      form.text({ text: "UI Scale" }),
      form.stepper({ value_by_state: SCALE }),
    ],
  })
);

const test: number[] = [];
const st_rows = state.a.ros.ok(array_from_length(10, (i) => i));

const test_list = list.container(
  {
    col1: {
      init_width: 15,
      title: "Column 1, the one and only, the best, the biggest",
      // title: "Column 1",
      transform: (v: number) => v.toString(),
      field_gen: () => list.text_field(),
    },
    col2: {
      title: "Column 2",
      transform: (v: number) => v.toString(),
      field_gen: () => list.text_field(),
    },
    col3: {
      fixed_width: 10,
      title: "Column 3",
      transform: (v: number) => v.toString(),
      field_gen: () => list.text_field(),
    },
  },
  (item) => {
    const sub_rows = state.a.ros.ok(array_from_length(3, (i) => i));
    return {
      openable: Math.random() > 0.5,
      sub_rows: () => sub_rows,
      add_row: {
        text: "Add New Row",
        on_add: () => {
          sub_rows.push(sub_rows.length);
        },
      },
      values: {
        col1: item,
        col2: item,
        col3: item,
      },
    };
  },
  st_rows,
  {
    sub_rows: true,
    add_row: {
      text: "Add Row",
      on_add: () => {
        st_rows.push(st_rows.length);
      },
    },
  }
);
FORM_CONT.appendChild(test_list);

//      _____         _____ _______          ______  _____  _____
//     |  __ \ /\    / ____/ ____\ \        / / __ \|  __ \|  __ \
//     | |__) /  \  | (___| (___  \ \  /\  / / |  | | |__) | |  | |
//     |  ___/ /\ \  \___ \\___ \  \ \/  \/ /| |  | |  _  /| |  | |
//     | |  / ____ \ ____) |___) |  \  /\  / | |__| | | \ \| |__| |
//     |_| /_/    \_\_____/_____/    \/  \/   \____/|_|  \_\_____/
const PASSWORD_STATE = state.s.ros_ws.ok("");
PASSWORD_STATE.sub(console.error);
FORM_CONT.appendChild(form.text({ text: "IP Input" }));
FORM_CONT.appendChild(
  form.password_input({
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
FORM_CONT.appendChild(form.text({ text: "IP Input" }));
FORM_CONT.appendChild(
  form.ip_input({
    type: IPVersion.V4,
    value_by_state: IP_STATE,
  })
);
FORM_CONT.appendChild(form.text({ text: "IP Input" }));
FORM_CONT.appendChild(
  form.ip_input({
    type: IPVersion.V6,
  })
);

//       _____ ____  _      ____  _____    _____ _   _ _____  _    _ _______
//      / ____/ __ \| |    / __ \|  __ \  |_   _| \ | |  __ \| |  | |__   __|
//     | |   | |  | | |   | |  | | |__) |   | | |  \| | |__) | |  | |  | |
//     | |   | |  | | |   | |  | |  _  /    | | | . ` |  ___/| |  | |  | |
//     | |___| |__| | |___| |__| | | \ \   _| |_| |\  | |    | |__| |  | |
//      \_____\____/|______\____/|_|  \_\ |_____|_| \_|_|     \____/   |_|
const COLOR_STATE = state.s.ros_ws.ok("#00ff00");
FORM_CONT.appendChild(form.text({ text: "Color Input" }));
FORM_CONT.appendChild(
  form.color_input({
    value_by_state: COLOR_STATE,
  })
);
FORM_CONT.appendChild(form.text({ text: "Color Input 2" }));
FORM_CONT.appendChild(
  form.color_input({
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
FORM_CONT.appendChild(form.text({ text: "Date Time Input" }));
FORM_CONT.appendChild(
  form.date_time_input({
    type: FormDateTimeType.TIME,
    value_by_state: DATE_TIME_STATE,
  })
);
FORM_CONT.appendChild(form.text({ text: "Date Time Input" }));
FORM_CONT.appendChild(
  form.date_time_input({
    value_by_state: DATE_TIME_STATE,
  })
);
FORM_CONT.appendChild(form.text({ text: "Date Time Input" }));
FORM_CONT.appendChild(
  form.date_time_input({
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
FORM_CONT.appendChild(form.text({ text: "Text Input" }));
FORM_CONT.appendChild(
  form.input_text({
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: TEXT_STATE,
    filter: /[a-zA-Z ]/,
  })
);
FORM_CONT.appendChild(form.text({ text: "Text Input 2" }));
FORM_CONT.appendChild(
  form.input_text({
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: TEXT_STATE,
  })
);

const MULTI_LINE_TEXT_STATE = state.s.ros_ws.ok("");
FORM_CONT.appendChild(form.text({ text: "Multiline Text Input" }));
FORM_CONT.appendChild(
  form.multiline_text({
    placeholder: "Enter text here...",
    max_length: 20,
    max_bytes: 20,
    value_by_state: MULTI_LINE_TEXT_STATE,
  })
);

FORM_CONT.appendChild(form.text({ text: "Multiline Text Input2" }));
FORM_CONT.appendChild(
  form.multiline_text({
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
FORM_CONT.appendChild(form.text({ text: "Number Input" }));
FORM_CONT.appendChild(
  form.input_number({
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
FORM_CONT.appendChild(form.text({ text: "Group Box" }));
const grouptest = FORM_CONT.appendChild(
  form.group({
    border: "outset",
    max_height: 6,
    components: [
      form.text({ text: "Button in Group" }),
      form
        .button({
          id: "test",
          text: "Click Me",
        })
        .opts({ access: "r" }),
      form.text({ text: "Button in Group" }),
      form
        .button({
          id: "test2",
          text: "Click Me",
        })
        .opts({ access: "r" }),
      form.text({ text: "Slider in Group" }),
      form.slider({
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

FORM_CONT.appendChild(form.text({ text: "Group Box" }));
FORM_CONT.appendChild(
  form.group({
    border: "outset",
    collapsible: true,
    collapse_text: "Toggle",
    components: [
      form.text({ text: "Hello inside group!", size: 2 }),
      form.text({ text: "Button in Group" }),
      form.button({ text: "Click Me" }).opts({ access: "r" }),
    ],
  })
);

FORM_CONT.appendChild(form.text({ text: "Group Box" }));
FORM_CONT.appendChild(
  form.group({
    border: "inset",
    collapsible: true,
    collapsed: true,
    collapse_text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    components: [
      form.text({ text: "Hello inside group!", size: 2 }),
      form.text({ text: "Button in Group" }),
      form.button({ text: "Click Me" }).opts({ access: "r" }),
    ],
  })
);

FORM_CONT.appendChild(
  form.text({
    text: "Hello World!",
    size: 2,
  })
);

const bool = state.s.ros_ws.ok(false);
FORM_CONT.appendChild(form.text({ text: "YOYOYOY" }));
FORM_CONT.appendChild(
  form
    .button({
      id: "test",
      text: "YOYOYOYO",
      icon: material_av_add_to_queue_rounded,
      color: FormColors.Yellow,
    })
    .opts({
      access: "w",
    })
).value_by_state = bool;

FORM_CONT.appendChild(form.text({ text: "Toggle Me" }));
FORM_CONT.appendChild(form.switch({})).value_by_state = bool;

FORM_CONT.appendChild(
  form.lamp({
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
const num = state.s.ros_ws.ok(0);
FORM_CONT.appendChild(form.text({ text: "Dropdown" }));
FORM_CONT.appendChild(
  form.dropdown({
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

FORM_CONT.appendChild(form.text({ text: "Dropdown" }));
FORM_CONT.appendChild(
  form.dropdown({
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    default_icon: material_av_add_to_queue_rounded,
    selections: array_from_range(0, 100, (i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
        icon: material_av_remove_from_queue_rounded,
      };
    }),
  })
).value_by_state = num;

FORM_CONT.appendChild(form.text({ text: "Dropdown" }));
FORM_CONT.appendChild(
  form.dropdown({
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel risus sem. Curabitur a morbi.",
    default_icon: material_av_add_to_queue_rounded,
    selections: array_from_range(0, 100, (i) => {
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
FORM_CONT.appendChild(form.text({ text: "Toggle Buttons" }));
FORM_CONT.appendChild(
  form.toggle_button({
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

FORM_CONT.appendChild(form.text({ text: "Toggle Buttons" }));
FORM_CONT.appendChild(
  form.toggle_button({
    selections: array_from_range(0, 5, (i) => {
      return {
        value: i,
        text: `Option ${i + 1}`,
        icon: material_av_remove_from_queue_rounded,
      };
    }),
  })
).value_by_state = num;

FORM_CONT.appendChild(form.text({ text: "Toggle Buttons" }));
FORM_CONT.appendChild(
  form.toggle_button({
    selections: array_from_range(0, 20, (i) => {
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
FORM_CONT.appendChild(form.text({ text: "Slider" }));
FORM_CONT.appendChild(
  form.slider({
    unit: "mA",
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = SLIDER_NUM;
FORM_CONT.appendChild(form.text({ text: "Slider" }));
FORM_CONT.appendChild(
  form.slider({
    unit: "mA",
    live: true,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = SLIDER_NUM;
FORM_CONT.appendChild(form.text({ text: "Slider" }));
FORM_CONT.appendChild(
  form.slider({
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = SLIDER_NUM;
FORM_CONT.appendChild(form.text({ text: "Slider" }));
FORM_CONT.appendChild(
  form.slider({
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
    live: true,
  })
).value_by_state = SLIDER_NUM;

FORM_CONT.appendChild(form.text({ text: "Slider" }));
FORM_CONT.appendChild(
  form.slider({
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
FORM_CONT.appendChild(form.text({ text: "Stepper" }));
FORM_CONT.appendChild(
  form.stepper({
    unit: "mA",
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = STEPPER_NUM;
FORM_CONT.appendChild(form.text({ text: "Stepper" }));
FORM_CONT.appendChild(
  form.stepper({
    unit: "mA",
    live: true,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = STEPPER_NUM;
FORM_CONT.appendChild(form.text({ text: "Stepper" }));
FORM_CONT.appendChild(
  form.stepper({
    unit: "mA",
    min: -50,
    max: 50,
    step: 0.5,
    start: 0.1,
    decimals: 1,
  })
).value_by_state = STEPPER_NUM;
FORM_CONT.appendChild(form.text({ text: "Stepper" }));
FORM_CONT.appendChild(
  form.stepper({
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
FORM_CONT.appendChild(form.text({ text: "Progress" }));
FORM_CONT.appendChild(form.progress({ unit: "mA" })).value_by_state = num;

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
