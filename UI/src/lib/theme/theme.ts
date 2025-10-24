import {
  alert_running_color,
  element_active_color,
  element_neutral_color,
  grey,
  normal_enabled_border_color,
} from "@libColors";
import { light_mode, mode_night } from "@libIcons";
import { Value } from "@libValues";
import "./theme.scss";

export let theme = new Value("");
theme.addListener((value) => {
  changeTheme(value);
}, false);
//Loading saved theme from local storage
(async () => {
  await new Promise<void>((a) => {
    a();
  });
  if ("theme" in localStorage) {
    theme.set = localStorage.theme;
  } else {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      theme.set = "night";
    } else {
      theme.set = "day";
    }
  }
})();

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    theme.set = e.matches ? "night" : "day";
  });

/**This changes the theme variables in the document root element
 * if a theme doesn't contain a value for a specific variable, it falls back on the day theme*/
function changeTheme(theme: keyof typeof themes) {
  if (theme in themes) {
    themeCurIndex = themeList.indexOf(theme);
    localStorage.theme = theme;
    //@ts-expect-error
    if (theme != themes.day) {
      curTheme = { ...themes.day, ...themes[theme] };
    }
    applyTheme(document);
  } else {
    console.warn("Invalid theme selected");
  }
}

let curTheme: { [key: string]: string } = {};
/**This applies the current theme to a document */
export let applyTheme = (docu: Document) => {
  let style = docu.documentElement.style;
  for (let key in curTheme) {
    style.setProperty("--" + key, curTheme[key]);
  }
};

//Text list of theme names
let themeList = ["day", "night"];
//Buffer for array index of theme in use
let themeCurIndex = 0;
//Storage of themes
export let themes: {
  day: { [key: string]: string };
  night: { [key: string]: string };
} = {
  day: {},
  night: {},
};

export let themeIterator = [
  { name: "Day", value: "day", symbol: light_mode },
  { name: "Night", value: "night", symbol: mode_night },
];

if (!("customThemes" in localStorage)) {
  localStorage.customThemes = JSON.stringify({});
}

/**This toggles the theme of the ui
 * If the input is undefined it will simply rotate between the themes
 * If the input is an index it will change to that index in the theme array
 * If the input is a key value it will change the colors to the template specified*/
export let toggleTheme = (themeTog: string | null | undefined | number) => {
  if (themeTog === undefined || themeTog === null) {
    let themeIndex = themeCurIndex + 1;
    if (themeIndex >= themeList.length) {
      themeIndex = 0;
    }
    theme.set = themeList[themeIndex];
  } else if (typeof themeTog === "number") {
    Math.min(Math.max(themeTog, 0), themeList.length);
    theme.set = themeList[themeTog];
  } else if (typeof themeTog === "string") {
    if (themeTog in themes) {
      theme.set = themeTog;
    }
  }
};

/**This lets one add an variable to the theme engine
 * variable are added to the document root CSS ass --variables
 * @param name name of variable
 * @param group group of variable, used for editing
 * @param defaultDay default value in day mode
 * @param defaultNight defult value in night mode*/
export let addThemeVariable = (
  name: string,
  _group: string[],
  defaultDay: string,
  defaultNight: string
) => {
  if (!(name in themes.day)) {
    themes.day[name] = defaultDay;
    themes.night[name] = defaultNight;
  }
};

//Custom themes are retrieved from localstorage
let storThemes = JSON.parse(localStorage.customThemes);
let customKeys = Object.keys(storThemes);
for (let i = 0, m = customKeys.length; i < m; i++) {
  if (!(customKeys[i] in themes)) {
    //@ts-expect-error
    themes[customKeys[i]] = {};
  }
  let cusTheKeys = Object.keys(storThemes[customKeys[i]]);
  for (let y = 0, m = cusTheKeys.length; y < m; y++) {
    if (cusTheKeys[y] in themes.day) {
      //@ts-expect-error
      themes[customKeys[i]][cusTheKeys[y]] =
        storThemes[customKeys[i]][cusTheKeys[y]];
    }
  }
}

addThemeVariable("backgroundColor", ["UI"], grey["50"], grey["900"]);
addThemeVariable("hover", ["UI"], "0.8", "1.2");
addThemeVariable("pressed", ["UI"], "0.6", "1.4");

addThemeVariable("sizeTransitionTime", ["UI"], "300ms", "300ms");
addThemeVariable("sizeTransitionType", ["UI"], "ease", "ease");
addThemeVariable("colorTransitionTime", ["UI"], "1000ms", "1000ms");
addThemeVariable("colorTransitionType", ["UI"], "ease", "ease");

addThemeVariable("readOpacityFilter", ["UI"], "opacity(50%)", "opacity(50%)");

addThemeVariable(
  "alertRunningColor",
  ["Colors"],
  alert_running_color.day,
  alert_running_color.dusk
);
addThemeVariable(
  "elementNeutralColor",
  ["Colors"],
  element_neutral_color.day,
  element_neutral_color.dusk
);
addThemeVariable(
  "elementActiveColor",
  ["Colors"],
  element_active_color.day,
  element_active_color.dusk
);
addThemeVariable(
  "normalEnabledBorderColor",
  ["Colors"],
  normal_enabled_border_color.day,
  normal_enabled_border_color.dusk
);
