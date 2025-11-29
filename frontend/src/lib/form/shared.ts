import { blue, green, grey, orange, red, yellow } from "@libColors";
import { theme_init_variable_root } from "@libTheme";
import "./shared.scss";

let themeRoot = theme_init_variable_root(
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
let readOnly = themeRoot.make_sub_group(
  "read",
  "Read Only",
  "Settings for form elements in read only mode"
);
export let formReadOnlyOpacity = readOnly.make_variable(
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
let colors = themeRoot.make_sub_group(
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
let colorsText = colors.make_sub_group(
  "text",
  "Text Colors",
  "Text colors used in all form elements"
);
export let formColorsTextLabel = colorsText.make_variable(
  "label",
  "Label Color",
  "Color of form elements labels",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
export let formColorsTextNormal = colorsText.make_variable(
  "normal",
  "Normal Text Color",
  "Normal text color in form elements",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
export let formColorsTextUnselected = colorsText.make_variable(
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
let colorsIcon = colors.make_sub_group(
  "icon",
  "Icon Colors",
  "Icon colors used in all form elements"
);
export let formColorsIconNormal = colorsIcon.make_variable(
  "normal",
  "Normal Icon Color",
  "Color of icons in form elements",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
export let formColorsIconUnselected = colorsIcon.make_variable(
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
let colorsBackground = colors.make_sub_group(
  "background",
  "Background Colors",
  "Background colors used in all form elements"
);
export let formColorsBackgroundNormal = colorsBackground.make_variable(
  "normal",
  "Normal Background Color",
  "Color of normal form element backgrounds",
  grey["50"],
  grey["900"],
  "Color",
  undefined
);
export let formColorsBackgroundHover = colorsBackground.make_variable(
  "hover",
  "Hover Background Color",
  "Color of form element backgrounds when hovering",
  grey["400"],
  grey["700"],
  "Color",
  undefined
);
export let formColorsBackgroundUnselected = colorsBackground.make_variable(
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
let colorsBorder = colors.make_sub_group(
  "border",
  "Border Colors",
  "Border colors used in all form elements"
);
export let formColorsBorderNormal = colorsBorder.make_variable(
  "normal",
  "Normal Border Color",
  "Color of normal form element borders",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
export let formColorsBorderUnselected = colorsBorder.make_variable(
  "unselected",
  "Unselected Border Color",
  "Color of unselected form element borders",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);

//       ____  _    _ _______ _      _____ _   _ ______    _____ ____  _      ____  _____   _____
//      / __ \| |  | |__   __| |    |_   _| \ | |  ____|  / ____/ __ \| |    / __ \|  __ \ / ____|
//     | |  | | |  | |  | |  | |      | | |  \| | |__    | |   | |  | | |   | |  | | |__) | (___
//     | |  | | |  | |  | |  | |      | | | . ` |  __|   | |   | |  | | |   | |  | |  _  / \___ \
//     | |__| | |__| |  | |  | |____ _| |_| |\  | |____  | |___| |__| | |___| |__| | | \ \ ____) |
//      \____/ \____/   |_|  |______|_____|_| \_|______|  \_____\____/|______\____/|_|  \_\_____/
let colorsOutline = colors.make_sub_group(
  "outline",
  "Outline Colors",
  "Outline colors used in all form elements"
);
export let formColorsOutlineNormal = colorsOutline.make_variable(
  "focus",
  "Focus Outline Color",
  "Color of focussed form element outlines",
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
let colorsBasic = colors.make_sub_group(
  "basic",
  "Basic Colors",
  "Basic colors used in all form elements"
);
export let formColorsBasicGreen = colorsBasic.make_variable(
  "green",
  "Basic Green Color",
  "Commonly used green color in form elements",
  green["300"],
  green["900"],
  "Color",
  undefined
);
export let formColorsBasicRed = colorsBasic.make_variable(
  "red",
  "Basic Red Color",
  "Commonly used red color in form elements",
  red["300"],
  red["900"],
  "Color",
  undefined
);
export let formColorsBasicBlue = colorsBasic.make_variable(
  "blue",
  "Basic Blue Color",
  "Commonly used blue color in form elements",
  blue["300"],
  blue["900"],
  "Color",
  undefined
);
export let formColorsBasicYellow = colorsBasic.make_variable(
  "yellow",
  "Basic Yellow Color",
  "Commonly used yellow color in form elements",
  yellow["300"],
  yellow["900"],
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
let sizes = themeRoot.make_sub_group(
  "size",
  "Size",
  "Sizes used in all form elements"
);

export let formSizeCornerRadius = sizes.make_variable(
  "cornerRadius",
  "Corner Radius",
  "Corner radius used in all form elements",
  "0.4rem",
  "0.4rem",
  "Length",
  { min: 0, max: 4 }
);

export let formSizeHeight = sizes.make_variable(
  "height",
  "Height",
  "Default height used in all form elements",
  "2.5rem",
  "2.5rem",
  "Length",
  { min: 0.1, max: 10 }
);

export let formSizeTourchHeight = sizes.make_variable(
  "touchHeight",
  "Touch Height",
  "Minimum height for touch devices used in all form elements",
  "3.5rem",
  "3.5rem",
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
let animation = themeRoot.make_sub_group(
  "animation",
  "Animation",
  "Animation settings used in all form elements"
);

export let formAnimationTransitionType = animation.make_variable(
  "transitionType",
  "Transition Type",
  "Type of transition used in form element animations",
  "ease-in-out",
  "ease-in-out",
  "TransitionType",
  undefined
);

export let formAnimationTransitionDuration = animation.make_variable(
  "transitionDuration",
  "Transition Duration",
  "Duration of transitions used in form element animations",
  "200ms",
  "200ms",
  "Time",
  { min: 0, max: 5000 }
);
