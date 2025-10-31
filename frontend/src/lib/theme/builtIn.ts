import { grey } from "@libColors";
import "./theme.scss";
import { themeInitVariableRoot } from "./variables";

let root = themeInitVariableRoot(
  "common",
  "Shared Variables",
  "Shared variables across features"
);

let scrollBar = root.makeSubGroup(
  "scrollbar",
  "Scrollbar",
  "Scrollbar variables"
);
let scrollBarThumb = scrollBar.makeSubGroup(
  "thumb",
  "Thumb",
  "Scrollbar Thumb variables"
);
scrollBarThumb.makeVariable(
  "color",
  "Thumb Color",
  "Color of the scrollbar thumb in normal state",
  grey["400"],
  grey["800"],
  "Font",
  undefined
);
scrollBarThumb.makeVariable(
  "hoverColor",
  "Thumb Hover Color",
  "Color of the scrollbar thumb when hovered",
  grey["600"],
  grey["600"],
  "Font",
  undefined
);
scrollBarThumb.makeVariable(
  "activeColor",
  "Thumb Color",
  "Color of the scrollbar thumb in normal state",
  grey["500"],
  grey["700"],
  "Font",
  undefined
);

let fonts = root.makeSubGroup("fonts", "Fonts", "Font variables");
export let themeBuiltBaseFont = fonts.makeVariable(
  "base",
  "UI Base Font",
  "The base font for the UI",
  '"Roboto", Arial, Helvetica, sans-serif',
  '"Roboto", Arial, Helvetica, sans-serif',
  "Font",
  undefined
);

let colors = root.makeSubGroup("colors", "Colors", "Color variables");
export let themeBuiltInLayer1Color = colors.makeVariable(
  "layer1",
  "UI Layer 1",
  "Color of the first layer of the UI",
  "rgba(255,255,255)",
  "rgba(255,255,255)",
  "Color",
  undefined
);
