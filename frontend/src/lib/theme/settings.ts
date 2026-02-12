import {
  material_action_touch_app_rounded,
  material_device_dark_mode_rounded,
  material_device_light_mode_rounded,
  material_hardware_mouse_rounded,
  material_image_edit_rounded,
} from "@libIcons";
import { settings_init } from "@libSettings";
import st from "@libState";
import { name, version } from "@package";

const SETTINGS = settings_init(
  name,
  version,
  "Theme/UI",
  "Settings for UI elements and and color themes"
);

//      _______ _    _ ______ __  __ ______
//     |__   __| |  | |  ____|  \/  |  ____|
//        | |  | |__| | |__  | \  / | |__
//        | |  |  __  |  __| | |\/| |  __|
//        | |  | |  | | |____| |  | | |____
//        |_|  |_|  |_|______|_|  |_|______|
export const Themes = {
  Light: "light",
  Dark: "dark",
} as const;
export type Themes = (typeof Themes)[keyof typeof Themes];

const THEMES = st.h.enums.list<Themes>({
  [Themes.Light]: {
    name: "Light",
    description: "Theme optimized for daylight",
    icon: material_device_light_mode_rounded,
  },
  [Themes.Dark]: {
    name: "Dark",
    description: "Theme optimized for night time",
    icon: material_device_dark_mode_rounded,
  },
});

const THEME_ID = "theme";
const PRIVATE_THEME = st.s.ros_ws.ok(
  SETTINGS.get(
    THEME_ID,
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? (Themes.Dark as Themes)
      : (Themes.Light as Themes)
  ),
  true,
  st.h.enums.helper(THEMES)
);
SETTINGS.register(THEME_ID, "Theme", "Theme to use for the UI", PRIVATE_THEME);

export const THEME = PRIVATE_THEME.read_write;

//Sets up automatic theme change based on operating system
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    PRIVATE_THEME.write(e.matches ? Themes.Dark : Themes.Light);
  });

//       _____  _____          _      ______
//      / ____|/ ____|   /\   | |    |  ____|
//     | (___ | |       /  \  | |    | |__
//      \___ \| |      / /\ \ | |    |  __|
//      ____) | |____ / ____ \| |____| |____
//     |_____/ \_____/_/    \_\______|______|
const SCALE_ID = "scale";
const PRIVATE_SCALE = st.s.ros_ws.ok(
  SETTINGS.get(SCALE_ID, 100),
  true,
  st.h.nums.helper(50, 400, "%", 0, 1)
);
SETTINGS.register(SCALE_ID, "Scale", "UI scale", PRIVATE_SCALE);
export const SCALE = PRIVATE_SCALE.read_write;

//       _____  _____ _____   ____  _      _      ____          _____
//      / ____|/ ____|  __ \ / __ \| |    | |    |  _ \   /\   |  __ \
//     | (___ | |    | |__) | |  | | |    | |    | |_) | /  \  | |__) |
//      \___ \| |    |  _  /| |  | | |    | |    |  _ < / /\ \ |  _  /
//      ____) | |____| | \ \| |__| | |____| |____| |_) / ____ \| | \ \
//     |_____/ \_____|_|  \_\\____/|______|______|____/_/    \_\_|  \_\
export const ScrollbarModes = {
  Thin: "thin",
  Medium: "medium",
  Wide: "wide",
} as const;
export type ScrollbarModes =
  (typeof ScrollbarModes)[keyof typeof ScrollbarModes];

const SCROLLBAR_MODES = st.h.enums.list<ScrollbarModes>({
  [ScrollbarModes.Thin]: {
    name: "Thin",
    description: "Thin modern scrollbar",
  },
  [ScrollbarModes.Medium]: { name: "Medium", description: "Normal scrollbar" },
  [ScrollbarModes.Wide]: {
    name: "Wide",
    description: "Large touch friendly scrollbar",
  },
});

const SCROLLBAR_ID = "scrollbar";
const PRIVATE_SCROLLBAR_MODE = st.s.ros_ws.ok(
  SETTINGS.get(SCROLLBAR_ID, ScrollbarModes.Thin as ScrollbarModes),
  true,
  st.h.enums.helper(SCROLLBAR_MODES)
);
SETTINGS.register(
  "scrollbar",
  "Scrollbar Mode",
  "Size of the scrollbar to use",
  PRIVATE_SCROLLBAR_MODE
);

export const SCROLLBAR_MODE = PRIVATE_SCROLLBAR_MODE.read_write;

//      _____ _   _ _____  _    _ _______   __  __  ____  _____  ______
//     |_   _| \ | |  __ \| |  | |__   __| |  \/  |/ __ \|  __ \|  ____|
//       | | |  \| | |__) | |  | |  | |    | \  / | |  | | |  | | |__
//       | | | . ` |  ___/| |  | |  | |    | |\/| | |  | | |  | |  __|
//      _| |_| |\  | |    | |__| |  | |    | |  | | |__| | |__| | |____
//     |_____|_| \_|_|     \____/   |_|    |_|  |_|\____/|_____/|______|
export const InputModes = {
  Mouse: "mouse",
  Pen: "pen",
  Touch: "touch",
} as const;
export type InputModes = (typeof InputModes)[keyof typeof InputModes];

const INPUT_MODES = st.h.enums.list<InputModes>({
  [InputModes.Mouse]: {
    name: "Mouse",
    description: "Mouse input",
    icon: material_hardware_mouse_rounded,
  },
  [InputModes.Pen]: {
    name: "Pen",
    description: "Pen input",
    icon: material_image_edit_rounded,
  },
  [InputModes.Touch]: {
    name: "Touch",
    description: "Touch input",
    icon: material_action_touch_app_rounded,
  },
});

const INPUT_MODE_ID = "inputMode";
const PRIVATE_INPUT_MODE = st.s.ros_ws.ok(
  SETTINGS.get(
    INPUT_MODE_ID,
    matchMedia("(pointer: coarse)").matches
      ? InputModes.Touch
      : (InputModes.Mouse as InputModes)
  ),
  true,
  st.h.enums.helper(INPUT_MODES)
);
SETTINGS.register(
  INPUT_MODE_ID,
  "Input Mode",
  "Setting for preffered input mode, changes UI elements to be more optimized for the selected input mode",
  PRIVATE_INPUT_MODE
);

export const INPUT_MODE = PRIVATE_INPUT_MODE.read_write;

//               _   _ _____ __  __       _______ _____ ____  _   _   _      ________      ________ _
//         /\   | \ | |_   _|  \/  |   /\|__   __|_   _/ __ \| \ | | | |    |  ____\ \    / /  ____| |
//        /  \  |  \| | | | | \  / |  /  \  | |    | || |  | |  \| | | |    | |__   \ \  / /| |__  | |
//       / /\ \ | . ` | | | | |\/| | / /\ \ | |    | || |  | | . ` | | |    |  __|   \ \/ / |  __| | |
//      / ____ \| |\  |_| |_| |  | |/ ____ \| |   _| || |__| | |\  | | |____| |____   \  /  | |____| |____
//     /_/    \_\_| \_|_____|_|  |_/_/    \_\_|  |_____\____/|_| \_| |______|______|   \/   |______|______|
export const AnimationLevels = {
  All: "all",
  Some: "some",
  None: "none",
} as const;
export type AnimationLevels =
  (typeof AnimationLevels)[keyof typeof AnimationLevels];

const ANIMATION_LEVELS = st.h.enums.list<AnimationLevels>({
  [AnimationLevels.All]: { name: "All", description: "All animations" },
  [AnimationLevels.Some]: {
    name: "Some",
    description: "Only animations that improve usability",
  },
  [AnimationLevels.None]: { name: "None", description: "No animations" },
});

const ANIMATION_LEVEL_ID = "animation";
const PRIVATE_ANIMATION_LEVEL = st.s.ros_ws.ok(
  SETTINGS.get(ANIMATION_LEVEL_ID, AnimationLevels.None as AnimationLevels),
  true,
  st.h.enums.helper(ANIMATION_LEVELS)
);
SETTINGS.register(
  ANIMATION_LEVEL_ID,
  "Animation Level",
  "Setting for animation level, changes the amount of animations used in the UI",
  PRIVATE_ANIMATION_LEVEL
);

export const ANIMATION_LEVEL = PRIVATE_ANIMATION_LEVEL.read_write;
