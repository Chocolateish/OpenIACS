import { blue, green, grey, orange, red, yellow } from "@libColors";
import { themeInitVariableRoot } from "@libTheme";
import "./shared.scss";

let themeRoot = themeInitVariableRoot(
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
let readOnly = themeRoot.makeSubGroup(
  "read",
  "Read Only",
  "Settings for form elements in read only mode"
);
export let formReadOnlyOpacity = readOnly.makeVariable(
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
let colors = themeRoot.makeSubGroup(
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
let colorsText = colors.makeSubGroup(
  "text",
  "Text Colors",
  "Text colors used in all form elements"
);
export let formColorsTextLabel = colorsText.makeVariable(
  "label",
  "Label Color",
  "Color of form elements labels",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
export let formColorsTextNormal = colorsText.makeVariable(
  "normal",
  "Normal Text Color",
  "Normal text color in form elements",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
export let formColorsTextUnselected = colorsText.makeVariable(
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
let colorsIcon = colors.makeSubGroup(
  "icon",
  "Icon Colors",
  "Icon colors used in all form elements"
);
export let formColorsIconNormal = colorsIcon.makeVariable(
  "normal",
  "Normal Icon Color",
  "Color of icons in form elements",
  grey["800"],
  grey["200"],
  "Color",
  undefined
);
export let formColorsIconUnselected = colorsIcon.makeVariable(
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
let colorsBackground = colors.makeSubGroup(
  "background",
  "Background Colors",
  "Background colors used in all form elements"
);
export let formColorsBackgroundNormal = colorsBackground.makeVariable(
  "normal",
  "Normal Background Color",
  "Color of normal form element backgrounds",
  grey["50"],
  grey["900"],
  "Color",
  undefined
);
export let formColorsBackgroundHover = colorsBackground.makeVariable(
  "hover",
  "Hover Background Color",
  "Color of form element backgrounds when hovering",
  grey["400"],
  grey["700"],
  "Color",
  undefined
);
export let formColorsBackgroundUnselected = colorsBackground.makeVariable(
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
let colorsBorder = colors.makeSubGroup(
  "border",
  "Border Colors",
  "Border colors used in all form elements"
);
export let formColorsBorderNormal = colorsBorder.makeVariable(
  "normal",
  "Normal Border Color",
  "Color of normal form element borders",
  grey["700"],
  grey["300"],
  "Color",
  undefined
);
export let formColorsBorderUnselected = colorsBorder.makeVariable(
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
let colorsOutline = colors.makeSubGroup(
  "outline",
  "Outline Colors",
  "Outline colors used in all form elements"
);
export let formColorsOutlineNormal = colorsOutline.makeVariable(
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
let colorsBasic = colors.makeSubGroup(
  "basic",
  "Basic Colors",
  "Basic colors used in all form elements"
);
export let formColorsBasicGreen = colorsBasic.makeVariable(
  "green",
  "Basic Green Color",
  "Commonly used green color in form elements",
  green["300"],
  green["900"],
  "Color",
  undefined
);
export let formColorsBasicRed = colorsBasic.makeVariable(
  "red",
  "Basic Red Color",
  "Commonly used red color in form elements",
  red["300"],
  red["900"],
  "Color",
  undefined
);
export let formColorsBasicBlue = colorsBasic.makeVariable(
  "blue",
  "Basic Blue Color",
  "Commonly used blue color in form elements",
  blue["300"],
  blue["900"],
  "Color",
  undefined
);
export let formColorsBasicYellow = colorsBasic.makeVariable(
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
let sizes = themeRoot.makeSubGroup(
  "size",
  "Size",
  "Sizes used in all form elements"
);

export let formSizeCornerRadius = sizes.makeVariable(
  "cornerRadius",
  "Corner Radius",
  "Corner radius used in all form elements",
  "0.4rem",
  "0.4rem",
  "Length",
  { min: 0, max: 4 }
);

export let formSizeHeight = sizes.makeVariable(
  "height",
  "Height",
  "Default height used in all form elements",
  "2.5rem",
  "2.5rem",
  "Length",
  { min: 0.1, max: 10 }
);

export let formSizeTourchHeight = sizes.makeVariable(
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
let animation = themeRoot.makeSubGroup(
  "animation",
  "Animation",
  "Animation settings used in all form elements"
);

export let formAnimationTransitionType = animation.makeVariable(
  "transitionType",
  "Transition Type",
  "Type of transition used in form element animations",
  "ease-in-out",
  "ease-in-out",
  "TransitionType",
  undefined
);

export let formAnimationTransitionDuration = animation.makeVariable(
  "transitionDuration",
  "Transition Duration",
  "Duration of transitions used in form element animations",
  "200ms",
  "200ms",
  "Time",
  { min: 0, max: 5000 }
);
