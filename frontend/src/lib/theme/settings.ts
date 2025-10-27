import { settingsInit } from "@libCommon";
import {
  material_action_touch_app_rounded,
  material_device_dark_mode_rounded,
  material_device_light_mode_rounded,
  material_hardware_mouse_rounded,
  material_image_edit_rounded,
} from "@libIcons";
import { state, state_helper, type StateEnumHelperList } from "@libState";
import { name, version } from "@package";
import { engines } from "./shared";

const settings = settingsInit(
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
const ThemeID = "theme";
export const Themes = {
  Light: "light",
  Dark: "dark",
} as const;
export type Themes = (typeof Themes)[keyof typeof Themes];

const themesInternal = {
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
} satisfies StateEnumHelperList;

const themeInternal = state.ok<Themes>(
  settings.get(
    ThemeID,
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Themes.Dark
      : Themes.Light
  ),
  true,
  new state_helper.StateEnumHelper(themesInternal)
);
themeInternal.subscribe((val) => {
  engines.forEach((engine) => {
    engine.applyTheme(val.unwrap);
  });
});
settings.register(ThemeID, "Theme", "Theme to use for the UI", themeInternal);
export const theme = themeInternal.writeable;

//Sets up automatic theme change based on operating system
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    themeInternal.write(e.matches ? Themes.Dark : Themes.Light);
  });

//       _____  _____          _      ______
//      / ____|/ ____|   /\   | |    |  ____|
//     | (___ | |       /  \  | |    | |__
//      \___ \| |      / /\ \ | |    |  __|
//      ____) | |____ / ____ \| |____| |____
//     |_____/ \_____/_/    \_\______|______|
const ScaleID = "scale";
let scaleValue = 1;
const scaleInternal = state.ok(
  settings.get(ScaleID, 100),
  true,
  new state_helper.StateNumberHelper(50, 400, "%", 0, 1)
);
settings.register(ScaleID, "Scale", "UI scale", scaleInternal);
scaleInternal.subscribe((val) => {
  scaleValue = val.unwrap / 100;
  engines.forEach((engine) => {
    engine.applyScale(scaleValue);
  });
});
export const scale = scaleInternal.writeable;

/**Converts the given rems to pixels */
export const remToPx = (rem: number) => {
  return rem * scaleValue;
};
/**Converts the given pixels to rems */
export const pxToRem = (px: number) => {
  return px / scaleValue;
};

//       _____  _____ _____   ____  _      _      ____          _____
//      / ____|/ ____|  __ \ / __ \| |    | |    |  _ \   /\   |  __ \
//     | (___ | |    | |__) | |  | | |    | |    | |_) | /  \  | |__) |
//      \___ \| |    |  _  /| |  | | |    | |    |  _ < / /\ \ |  _  /
//      ____) | |____| | \ \| |__| | |____| |____| |_) / ____ \| | \ \
//     |_____/ \_____|_|  \_\\____/|______|______|____/_/    \_\_|  \_\
const ScrollbarID = "scrollbar";
export const ScrollbarModes = {
  THIN: "thin",
  MEDIUM: "medium",
  WIDE: "wide",
} as const;
export type ScrollbarModes =
  (typeof ScrollbarModes)[keyof typeof ScrollbarModes];

const scrollbarModesInternal = {
  [ScrollbarModes.THIN]: {
    name: "Thin",
    description: "Thin modern scrollbar",
  },
  [ScrollbarModes.MEDIUM]: { name: "Medium", description: "Normal scrollbar" },
  [ScrollbarModes.WIDE]: {
    name: "Wide",
    description: "Large touch friendly scrollbar",
  },
} satisfies StateEnumHelperList;

const scrollBarModeInternal = state.ok<ScrollbarModes>(
  settings.get(ScrollbarID, ScrollbarModes.THIN),
  true,
  new state_helper.StateEnumHelper(scrollbarModesInternal)
);
settings.register(
  "scrollbar",
  "Scrollbar Mode",
  "Size of the scrollbar to use",
  scrollBarModeInternal
);
scrollBarModeInternal.subscribe((val) => {
  engines.forEach((engine) => {
    engine.applyScrollbar(val.unwrap);
  });
});
export const scrollBarMode = scrollBarModeInternal.writeable;

//      _____ _   _ _____  _    _ _______   __  __  ____  _____  ______
//     |_   _| \ | |  __ \| |  | |__   __| |  \/  |/ __ \|  __ \|  ____|
//       | | |  \| | |__) | |  | |  | |    | \  / | |  | | |  | | |__
//       | | | . ` |  ___/| |  | |  | |    | |\/| | |  | | |  | |  __|
//      _| |_| |\  | |    | |__| |  | |    | |  | | |__| | |__| | |____
//     |_____|_| \_|_|     \____/   |_|    |_|  |_|\____/|_____/|______|
const InputModeID = "inputMode";
export const InputModes = {
  MOUSE: "mouse",
  PEN: "pen",
  TOUCH: "touch",
} as const;
export type InputModes = (typeof InputModes)[keyof typeof InputModes];

const inputModesInternal = {
  [InputModes.MOUSE]: {
    name: "Mouse",
    description: "Mouse input",
    icon: material_hardware_mouse_rounded,
  },
  [InputModes.PEN]: {
    name: "Pen",
    description: "Pen input",
    icon: material_image_edit_rounded,
  },
  [InputModes.TOUCH]: {
    name: "Touch",
    description: "Touch input",
    icon: material_action_touch_app_rounded,
  },
} satisfies StateEnumHelperList;

const inputModeInternal = state.ok<InputModes>(
  settings.get(InputModeID, InputModes.TOUCH),
  true,
  new state_helper.StateEnumHelper(inputModesInternal)
);
settings.register(
  InputModeID,
  "Input Mode",
  "Setting for preffered input mode, changes UI elements to be more optimized for the selected input mode",
  inputModeInternal
);
inputModeInternal.subscribe((val) => {
  engines.forEach((engine) => {
    engine.applyInput(val.unwrap);
  });
});
export const inputMode = inputModeInternal.writeable;

//               _   _ _____ __  __       _______ _____ ____  _   _   _      ________      ________ _
//         /\   | \ | |_   _|  \/  |   /\|__   __|_   _/ __ \| \ | | | |    |  ____\ \    / /  ____| |
//        /  \  |  \| | | | | \  / |  /  \  | |    | || |  | |  \| | | |    | |__   \ \  / /| |__  | |
//       / /\ \ | . ` | | | | |\/| | / /\ \ | |    | || |  | | . ` | | |    |  __|   \ \/ / |  __| | |
//      / ____ \| |\  |_| |_| |  | |/ ____ \| |   _| || |__| | |\  | | |____| |____   \  /  | |____| |____
//     /_/    \_\_| \_|_____|_|  |_/_/    \_\_|  |_____\____/|_| \_| |______|______|   \/   |______|______|
const AnimationLevelID = "animation";
export const AnimationLevels = {
  ALL: "all",
  MOST: "most",
  SOME: "some",
  NONE: "none",
} as const;
export type AnimationLevels =
  (typeof AnimationLevels)[keyof typeof AnimationLevels];

const animationLevelsInternal = {
  [AnimationLevels.ALL]: { name: "All", description: "All animations" },
  [AnimationLevels.MOST]: {
    name: "Most",
    description: "All but the heaviest animations",
  },
  [AnimationLevels.SOME]: {
    name: "Some",
    description: "Only the lightest animations",
  },
  [AnimationLevels.NONE]: { name: "None", description: "No animations" },
} satisfies StateEnumHelperList;

const animationLevelInternal = state.ok<AnimationLevels>(
  settings.get(AnimationLevelID, AnimationLevels.ALL),
  true,
  new state_helper.StateEnumHelper(animationLevelsInternal)
);
settings.register(
  AnimationLevelID,
  "Animation Level",
  "Setting for animation level, changes the amount of animations used in the UI",
  animationLevelInternal
);
animationLevelInternal.subscribe((val) => {
  engines.forEach((engine) => {
    engine.applyAnimation(val.unwrap);
  });
});

export const animationLevel = animationLevelInternal.writeable;
