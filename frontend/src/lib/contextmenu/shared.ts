import { blue, grey } from "@libColors";
import { theme_init_variable_root } from "@libTheme";

let variables = theme_init_variable_root(
  "contextmenu",
  "Context Menu",
  "Right click or touch and hold context menu appearance"
);
variables.make_variable(
  "background",
  "Background Color",
  "Color of background",
  grey["50"],
  grey["900"],
  "Color",
  undefined
);
variables.make_variable(
  "text",
  "Text Color",
  "Color of text",
  grey["600"],
  grey["400"],
  "Color",
  undefined
);
variables.make_variable(
  "hover",
  "Hover Color",
  "Background color of line when hovering over it",
  blue["200"],
  blue["900"],
  "Color",
  undefined
);
variables.make_variable(
  "hoverText",
  "Text Color",
  "Standard text color",
  grey["900"],
  grey["50"],
  "Color",
  undefined
);
variables.make_variable(
  "border",
  "Border Color",
  "Color of border and deviders",
  grey["300"],
  grey["800"],
  "Color",
  undefined
);
