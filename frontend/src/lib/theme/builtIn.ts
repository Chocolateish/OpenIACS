import { themeInitVariableRoot } from "./variables";

export let themeBuildInVariables = () => {
  let root = themeInitVariableRoot(
    "common",
    "Shared Variables",
    "Shared variables across features"
  );

  let colors = root.makeSubGroup("colors", "Colors", "Color variables");
  colors.makeVariable(
    "layer1",
    "UI Layer 1",
    "Color of the first layer of the UI",
    "rgba(255,255,255)",
    "rgba(255,255,255)",
    "Color",
    undefined
  );
};
