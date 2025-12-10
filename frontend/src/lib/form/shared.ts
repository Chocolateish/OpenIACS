import { blue, green, grey, orange, red, yellow } from "@libColors";
import { theme_init_variable_root } from "@libTheme";

const themeRoot = theme_init_variable_root(
  "form",
  "UI Form Elements",
  "Theme variables for UI form Elements"
);

//      _____  ______          _____     ____  _   _ _  __     __
//     |  __ \|  ____|   /\   |  __ \   / __ \| \ | | | \ \   / /
//     | |__) | |__     /  \  | |  | | | |  | |  \| | |  \ \_/ /
//     |  _  /|  __|   / /\ \ | |  | | | |  | | . ` | |   \   /
//     | | \ \| |____ / ____ \| |__| | | |__| | |\  | |____| |
//     |_|  \_\______/_/    \_\_____/   \____/|_| \_|______|_|
const readOnly = themeRoot.make_sub_group(
  "read",
  "Read Only",
  "Settings for form elements in read only mode"
);
readOnly.make_variable(
  "filter",
  "Read Only Filter",
  "Filter applied to form elements in read only mode",
  "opacity(0.6)",
  "opacity(0.6)",
  "Filter",
  undefined
);

//#################################################################################3
//#################################################################################3
//       _____ ____  _      ____  _____   _____
//      / ____/ __ \| |    / __ \|  __ \ / ____|
//     | |   | |  | | |   | |  | | |__) | (___
//     | |   | |  | | |   | |  | |  _  / \___ \
//     | |___| |__| | |___| |__| | | \ \ ____) |
//      \_____\____/|______\____/|_|  \_\_____/
const colors = themeRoot.make_sub_group(
  "colors",
  "Colors",
  "Colors used in all form elements"
);

//      _______ ________   _________    _____ ____  _      ____  _____   _____
//     |__   __|  ____\ \ / /__   __|  / ____/ __ \| |    / __ \|  __ \ / ____|
//        | |  | |__   \ V /   | |    | |   | |  | | |   | |  | | |__) | (___
//        | |  |  __|   > <    | |    | |   | |  | | |   | |  | |  _  / \___ \
//        | |  | |____ / . \   | |    | |___| |__| | |___| |__| | | \ \ ____) |
//        |_|  |______/_/ \_\  |_|     \_____\____/|______\____/|_|  \_\_____/
const colorsText = colors.make_sub_group(
  "text",
  "Text Colors",
  "Text colors used in all form elements"
);
colorsText.make_variable(
  "label",
  "Label Color",
  "Color of form elements labels",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
colorsText.make_variable(
  "normal",
  "Normal Text Color",
  "Normal text color in form elements",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
colorsText.make_variable(
  "selected",
  "Selected Text Color",
  "Selected text color in form elements",
  grey["900"],
  grey["50"],
  "Color",
  undefined
);
colorsText.make_variable(
  "unselected",
  "Unselected Text Color",
  "Unselected text color in form elements",
  grey["600"],
  grey["400"],
  "Color",
  undefined
);

//      _______ ________   _________   ____  _               _____ _  __
//     |__   __|  ____\ \ / /__   __| |  _ \| |        /\   / ____| |/ /
//        | |  | |__   \ V /   | |    | |_) | |       /  \ | |    | ' /
//        | |  |  __|   > <    | |    |  _ <| |      / /\ \| |    |  <
//        | |  | |____ / . \   | |    | |_) | |____ / ____ \ |____| . \
//        |_|  |______/_/ \_\  |_|    |____/|______/_/    \_\_____|_|\_\
//
//
const colorsTextBlack = colors.make_sub_group(
  "textBlack",
  "Text Colors Black Background",
  "Text colors used for black background in all form elements"
);
colorsTextBlack.make_variable(
  "normal",
  "Normal Text Color",
  "Normal text color in form elements",
  grey["200"],
  grey["200"],
  "Color",
  undefined
);
colorsTextBlack.make_variable(
  "selected",
  "Selected Text Color",
  "Selected text color in form elements",
  grey["50"],
  grey["50"],
  "Color",
  undefined
);
colorsTextBlack.make_variable(
  "unselected",
  "Unselected Text Color",
  "Unselected text color in form elements",
  grey["600"],
  grey["400"],
  "Color",
  undefined
);

//      _____ _____ ____  _   _    _____ ____  _      ____  _____   _____
//     |_   _/ ____/ __ \| \ | |  / ____/ __ \| |    / __ \|  __ \ / ____|
//       | || |   | |  | |  \| | | |   | |  | | |   | |  | | |__) | (___
//       | || |   | |  | | . ` | | |   | |  | | |   | |  | |  _  / \___ \
//      _| || |___| |__| | |\  | | |___| |__| | |___| |__| | | \ \ ____) |
//     |_____\_____\____/|_| \_|  \_____\____/|______\____/|_|  \_\_____/
const colorsIcon = colors.make_sub_group(
  "icon",
  "Icon Colors",
  "Icon colors used in all form elements"
);
colorsIcon.make_variable(
  "normal",
  "Normal Icon Color",
  "Color of icons in form elements",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
colorsIcon.make_variable(
  "selected",
  "Selected Icon Color",
  "Color of selected icons in form elements",
  grey["900"],
  grey["50"],
  "Color",
  undefined
);
colorsIcon.make_variable(
  "unselected",
  "Unselected Icon Color",
  "Color of unselected icons in form elements",
  grey["600"],
  grey["400"],
  "Color",
  undefined
);

//      ____          _____ _  _______ _____   ____  _    _ _   _ _____     _____ ____  _      ____  _____   _____
//     |  _ \   /\   / ____| |/ / ____|  __ \ / __ \| |  | | \ | |  __ \   / ____/ __ \| |    / __ \|  __ \ / ____|
//     | |_) | /  \ | |    | ' / |  __| |__) | |  | | |  | |  \| | |  | | | |   | |  | | |   | |  | | |__) | (___
//     |  _ < / /\ \| |    |  <| | |_ |  _  /| |  | | |  | | . ` | |  | | | |   | |  | | |   | |  | |  _  / \___ \
//     | |_) / ____ \ |____| . \ |__| | | \ \| |__| | |__| | |\  | |__| | | |___| |__| | |___| |__| | | \ \ ____) |
//     |____/_/    \_\_____|_|\_\_____|_|  \_\\____/ \____/|_| \_|_____/   \_____\____/|______\____/|_|  \_\_____/
const colorsBackground = colors.make_sub_group(
  "background",
  "Background Colors",
  "Background colors used in all form elements"
);
colorsBackground.make_variable(
  "normal",
  "Normal Background Color",
  "Color of normal form element backgrounds",
  grey["50"],
  grey["900"],
  "Color",
  undefined
);
colorsBackground.make_variable(
  "hover",
  "Hover Background Color",
  "Color of form element backgrounds when hovering",
  grey["400"],
  grey["700"],
  "Color",
  undefined
);
colorsBackground.make_variable(
  "unselected",
  "Unselected Background Color",
  "Color of unselected form element backgrounds",
  grey["300"],
  grey["800"],
  "Color",
  undefined
);

//      ____   ____  _____  _____  ______ _____     _____ ____  _      ____  _____   _____
//     |  _ \ / __ \|  __ \|  __ \|  ____|  __ \   / ____/ __ \| |    / __ \|  __ \ / ____|
//     | |_) | |  | | |__) | |  | | |__  | |__) | | |   | |  | | |   | |  | | |__) | (___
//     |  _ <| |  | |  _  /| |  | |  __| |  _  /  | |   | |  | | |   | |  | |  _  / \___ \
//     | |_) | |__| | | \ \| |__| | |____| | \ \  | |___| |__| | |___| |__| | | \ \ ____) |
//     |____/ \____/|_|  \_\_____/|______|_|  \_\  \_____\____/|______\____/|_|  \_\_____/
const colorsBorder = colors.make_sub_group(
  "border",
  "Border Colors",
  "Border colors used in all form elements"
);
colorsBorder.make_variable(
  "normal",
  "Normal Border Color",
  "Color of normal form element borders",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
colorsBorder.make_variable(
  "unselected",
  "Unselected Border Color",
  "Color of unselected form element borders",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);

//      ______ ____   _____ _    _  _____
//     |  ____/ __ \ / ____| |  | |/ ____|
//     | |__ | |  | | |    | |  | | (___
//     |  __|| |  | | |    | |  | |\___ \
//     | |   | |__| | |____| |__| |____) |
//     |_|    \____/ \_____|\____/|_____/
const colorsFocus = colors.make_sub_group(
  "focus",
  "Focus Colors",
  "Focus colors used in all form elements"
);
colorsFocus.make_variable(
  "normal",
  "Focus Color",
  "Color of focussed form element",
  orange["600"],
  orange["300"],
  "Color",
  undefined
);

//      ____           _____ _____ _____    _____ ____  _      ____  _____   _____
//     |  _ \   /\    / ____|_   _/ ____|  / ____/ __ \| |    / __ \|  __ \ / ____|
//     | |_) | /  \  | (___   | || |      | |   | |  | | |   | |  | | |__) | (___
//     |  _ < / /\ \  \___ \  | || |      | |   | |  | | |   | |  | |  _  / \___ \
//     | |_) / ____ \ ____) |_| || |____  | |___| |__| | |___| |__| | | \ \ ____) |
//     |____/_/    \_\_____/|_____\_____|  \_____\____/|______\____/|_|  \_\_____/
const colorsBasic = colors.make_sub_group(
  "basic",
  "Basic Colors",
  "Basic colors used in all form elements"
);
colorsBasic.make_variable(
  "green",
  "Basic Green Color",
  "Commonly used green color in form elements",
  green["300"],
  green["900"],
  "Color",
  undefined
);
colorsBasic.make_variable(
  "red",
  "Basic Red Color",
  "Commonly used red color in form elements",
  red["300"],
  red["900"],
  "Color",
  undefined
);
colorsBasic.make_variable(
  "blue",
  "Basic Blue Color",
  "Commonly used blue color in form elements",
  blue["300"],
  blue["900"],
  "Color",
  undefined
);
colorsBasic.make_variable(
  "yellow",
  "Basic Yellow Color",
  "Commonly used yellow color in form elements",
  yellow["300"],
  orange["900"],
  "Color",
  undefined
);

//#################################################################################3
//#################################################################################3
//       _____ _____ ____________  _____
//      / ____|_   _|___  /  ____|/ ____|
//     | (___   | |    / /| |__  | (___
//      \___ \  | |   / / |  __|  \___ \
//      ____) |_| |_ / /__| |____ ____) |
//     |_____/|_____/_____|______|_____/
const sizes = themeRoot.make_sub_group(
  "size",
  "Size",
  "Sizes used in all form elements"
);

sizes.make_variable(
  "cornerRadius",
  "Corner Radius",
  "Corner radius used in all form elements",
  "0.4rem",
  "0.4rem",
  "Length",
  { min: 0, max: 4 }
);

sizes.make_variable(
  "height",
  "Height",
  "Default height used in all form elements",
  "1.8rem",
  "1.8rem",
  "Length",
  { min: 0.1, max: 10 }
);

sizes.make_variable(
  "touchHeight",
  "Touch Height",
  "Minimum height for touch devices used in all form elements",
  "3rem",
  "3rem",
  "Length",
  { min: 0.1, max: 10 }
);

//#################################################################################3
//#################################################################################3
//               _   _ _____ __  __       _______ _____ ____  _   _
//         /\   | \ | |_   _|  \/  |   /\|__   __|_   _/ __ \| \ | |
//        /  \  |  \| | | | | \  / |  /  \  | |    | || |  | |  \| |
//       / /\ \ | . ` | | | | |\/| | / /\ \ | |    | || |  | | . ` |
//      / ____ \| |\  |_| |_| |  | |/ ____ \| |   _| || |__| | |\  |
//     /_/    \_\_| \_|_____|_|  |_/_/    \_\_|  |_____\____/|_| \_|
const animation = themeRoot.make_sub_group(
  "animation",
  "Animation",
  "Animation settings used in all form elements"
);

animation.make_variable(
  "transitionType",
  "Transition Type",
  "Type of transition used in form element animations",
  "ease-in-out",
  "ease-in-out",
  "TransitionType",
  undefined
);

animation.make_variable(
  "transitionDuration",
  "Transition Duration",
  "Duration of transitions used in form element animations",
  "200ms",
  "200ms",
  "Time",
  { min: 0, max: 5000 }
);

//#################################################################################3
//#################################################################################3
//               _   _ _____ __  __       _______ _____ ____  _   _
//         /\   | \ | |_   _|  \/  |   /\|__   __|_   _/ __ \| \ | |
//        /  \  |  \| | | | | \  / |  /  \  | |    | || |  | |  \| |
//       / /\ \ | . ` | | | | |\/| | / /\ \ | |    | || |  | | . ` |
//      / ____ \| |\  |_| |_| |  | |/ ____ \| |   _| || |__| | |\  |
//     /_/    \_\_| \_|_____|_|  |_/_/    \_\_|  |_____\____/|_| \_|
const font = themeRoot.make_sub_group(
  "font",
  "Font",
  "Font settings used in all form elements"
);

font.make_variable(
  "size",
  "Font Size",
  "Default font size used in all form elements",
  "1rem",
  "1rem",
  "Length",
  { min: 0.1, max: 10 }
);

font.make_variable(
  "touchSize",
  "Touch Font Size",
  "Font size used in all form elements for touch devices",
  "1.6rem",
  "1.6rem",
  "Length",
  { min: 0.1, max: 10 }
);
