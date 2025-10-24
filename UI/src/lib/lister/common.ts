import { grey, orange } from "@libColors";
import { addThemeVariable } from "@libTheme";
import "./common.scss";

addThemeVariable("listerBorderColor", ["Lister"], grey["700"], grey["300"]);
addThemeVariable("listerOpenerIconColor", ["Lister"], grey["900"], grey["50"]);
addThemeVariable("listerEvenBackColor", ["Lister"], grey["200"], grey["800"]);
addThemeVariable("listerOddBackColor", ["Lister"], grey["50"], grey["900"]);
addThemeVariable("listerTextColor", ["Lister"], grey["900"], grey["50"]);
addThemeVariable("listerFocusColor", ["Lister"], orange["600"], orange["300"]);
addThemeVariable("listerShadowColor", ["Lister"], grey["900"], grey["900"]);
addThemeVariable("listerColBorderColor", ["Lister"], grey["400"], grey["700"]);
addThemeVariable(
  "listerColBorderHoverColor",
  ["Lister"],
  grey["300"],
  grey["800"]
);

export let listerComponentNameStart = "lister-";
