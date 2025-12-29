import { GREY, ORANGE } from "@libColors";
import { theme_init_variable_root } from "@libTheme";

const theme_root = theme_init_variable_root(
  "ui",
  "UI Elements",
  "Theme variables for UI Elements"
);

//       _____ ____  _      ____  _____   _____
//      / ____/ __ \| |    / __ \|  __ \ / ____|
//     | |   | |  | | |   | |  | | |__) | (___
//     | |   | |  | | |   | |  | |  _  / \___ \
//     | |___| |__| | |___| |__| | | \ \ ____) |
//      \_____\____/|______\____/|_|  \_\_____/
const colors = theme_root.make_sub_group(
  "colors",
  "Colors",
  "Colors used in all form elements"
);

colors.make_variable(
  "titlebar",
  "Title Bar Background",
  "Background color for the title bar of UI panels",
  GREY[500],
  GREY[700],
  "Color",
  undefined
);

colors.make_variable(
  "background",
  "Content Background",
  "Default background color for content areas",
  GREY[100],
  "#000000",
  "Color",
  undefined
);

colors.make_variable(
  "icons",
  "Icons Color",
  "Default color for icons",
  GREY[900],
  GREY[100],
  "Color",
  undefined
);

colors.make_variable(
  "sizers",
  "Content Background",
  "Default background color for content areas",
  GREY[300],
  GREY[900],
  "Color",
  undefined
);

colors.make_variable(
  "shadow",
  "Border Shadow",
  "Shadow color for borders and outlines",
  "#000000",
  GREY[50],
  "Color",
  undefined
);

colors.make_variable(
  "shadowFocus",
  "Border Shadow In Focus",
  "Shadow color for borders and outlines when in focus",
  ORANGE[500],
  ORANGE[500],
  "Color",
  undefined
);
