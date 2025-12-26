import { GREY } from "@libColors";
import "./theme.scss";
import { theme_init_variable_root } from "./variables";

export const BUILT_IN = 0;

const root = theme_init_variable_root(
  "common",
  "Shared Variables",
  "Shared variables across features"
);

const scroll_bar = root.make_sub_group(
  "scrollbar",
  "Scrollbar",
  "Scrollbar variables"
);
const scroll_bar_thumb = scroll_bar.make_sub_group(
  "thumb",
  "Thumb",
  "Scrollbar Thumb variables"
);
scroll_bar_thumb.make_variable(
  "color",
  "Thumb Color",
  "Color of the scrollbar thumb in normal state",
  GREY["400"],
  GREY["800"],
  "Font",
  undefined
);
scroll_bar_thumb.make_variable(
  "hoverColor",
  "Thumb Hover Color",
  "Color of the scrollbar thumb when hovered",
  GREY["600"],
  GREY["600"],
  "Font",
  undefined
);
scroll_bar_thumb.make_variable(
  "activeColor",
  "Thumb Color",
  "Color of the scrollbar thumb in normal state",
  GREY["500"],
  GREY["700"],
  "Font",
  undefined
);

const fonts = root.make_sub_group("fonts", "Fonts", "Font variables");
fonts.make_variable(
  "base",
  "UI Base Font",
  "The base font for the UI",
  '"Roboto", Arial, Helvetica, sans-serif',
  '"Roboto", Arial, Helvetica, sans-serif',
  "Font",
  undefined
);

const colors = root.make_sub_group("colors", "Colors", "Color variables");
colors.make_variable(
  "layer1",
  "UI Layer 1",
  "Color of the first layer of the UI",
  "rgba(255,255,255)",
  "rgba(255,255,255)",
  "Color",
  undefined
);
