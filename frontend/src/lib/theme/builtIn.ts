import { grey } from "@libColors";
import "./theme.scss";
import { theme_init_variable_root } from "./variables";

export const BUILT_IN = 0;

let root = theme_init_variable_root(
  "common",
  "Shared Variables",
  "Shared variables across features"
);

let scroll_bar = root.make_sub_group(
  "scrollbar",
  "Scrollbar",
  "Scrollbar variables"
);
let scroll_bar_thumb = scroll_bar.make_sub_group(
  "thumb",
  "Thumb",
  "Scrollbar Thumb variables"
);
scroll_bar_thumb.make_variable(
  "color",
  "Thumb Color",
  "Color of the scrollbar thumb in normal state",
  grey["400"],
  grey["800"],
  "Font",
  undefined
);
scroll_bar_thumb.make_variable(
  "hoverColor",
  "Thumb Hover Color",
  "Color of the scrollbar thumb when hovered",
  grey["600"],
  grey["600"],
  "Font",
  undefined
);
scroll_bar_thumb.make_variable(
  "activeColor",
  "Thumb Color",
  "Color of the scrollbar thumb in normal state",
  grey["500"],
  grey["700"],
  "Font",
  undefined
);

let fonts = root.make_sub_group("fonts", "Fonts", "Font variables");
fonts.make_variable(
  "base",
  "UI Base Font",
  "The base font for the UI",
  '"Roboto", Arial, Helvetica, sans-serif',
  '"Roboto", Arial, Helvetica, sans-serif',
  "Font",
  undefined
);

let colors = root.make_sub_group("colors", "Colors", "Color variables");
colors.make_variable(
  "layer1",
  "UI Layer 1",
  "Color of the first layer of the UI",
  "rgba(255,255,255)",
  "rgba(255,255,255)",
  "Color",
  undefined
);
