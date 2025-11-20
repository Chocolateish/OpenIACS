import { documentHandler } from "@libDocument";
import {
  AnimationLevels,
  InputModes,
  ScrollbarModes,
  Themes,
  animationLevel,
  inputMode,
  scale,
  scrollBarMode,
  theme,
} from "./settings";
import { bottomGroups } from "./shared";

export let themeEngine = new (class ThemeEngine {
  constructor() {
    documentHandler.events.on("added", (e) => {
      this.applyAllToDoc(e.data);
    });
    documentHandler.forDocuments((doc) => {
      this.applyAllToDoc(doc);
    });
  }

  /**This applies the current theme to a document*/
  private applyAllToDoc(doc: Document) {
    this.applyScrollbarToDoc(doc, scrollBarMode.getOk());
    this.applyThemeToDoc(doc, theme.getOk());
    this.applyInputToDoc(doc, inputMode.getOk());
    this.applyScaleToDoc(doc, scale.getOk() / 100);
    this.applyAnimationToDoc(doc, animationLevel.getOk());
  }

  /**This applies the current theme to a document*/
  applyScrollbar(scroll: ScrollbarModes) {
    documentHandler.forDocuments((doc) => {
      this.applyScrollbarToDoc(doc, scroll);
    });
  }
  private applyScrollbarToDoc(doc: Document, scroll: ScrollbarModes) {
    doc.documentElement.style.setProperty(
      "--scrollbar",
      {
        [ScrollbarModes.THIN]: "0.6rem",
        [ScrollbarModes.MEDIUM]: "1rem",
        [ScrollbarModes.WIDE]: "2.6rem",
      }[scroll]
    );
  }

  /**This applies the current theme to a document*/
  applyAnimation(anim: AnimationLevels) {
    documentHandler.forDocuments((doc) => {
      this.applyAnimationToDoc(doc, anim);
    });
  }
  private applyAnimationToDoc(doc: Document, anim: AnimationLevels) {
    doc.documentElement.classList.remove("anim-all", "anim-most", "anim-some");
    switch (anim) {
      //@ts-ignore
      case AnimationLevels.ALL:
        doc.documentElement.classList.add("anim-all");
      //@ts-ignore
      case AnimationLevels.MOST:
        doc.documentElement.classList.add("anim-most");
      case AnimationLevels.SOME:
        doc.documentElement.classList.add("anim-some");
        break;
    }
  }

  /**This applies the current theme to a document*/
  applyTheme(theme: Themes) {
    documentHandler.forDocuments((doc) => {
      this.applyThemeToDoc(doc, theme);
    });
  }
  private applyThemeToDoc(doc: Document, theme: Themes) {
    for (const key in bottomGroups)
      bottomGroups[key].applyThemes(doc.documentElement.style, theme);
  }

  /**This applies the current scale to a document*/
  applyScale(scale: number) {
    documentHandler.forDocuments((doc) => {
      this.applyScaleToDoc(doc, scale);
    });
  }
  private applyScaleToDoc(doc: Document, scale: number) {
    doc.documentElement.style.fontSize = scale * 16 + "px";
  }

  /**Auto Input Mode */
  applyInput(mode: InputModes) {
    documentHandler.forDocuments((doc) => {
      this.applyInputToDoc(doc, mode);
    });
  }
  private applyInputToDoc(doc: Document, mode: InputModes) {
    let style = doc.documentElement.style;
    style.setProperty("--mouse", "0");
    style.setProperty("--pen", "0");
    style.setProperty("--touch", "0");
    doc.documentElement.classList.remove("mouse", "pen", "touch");
    switch (mode) {
      case InputModes.MOUSE:
        style.setProperty("--mouse", "1");
        doc.documentElement.classList.add("mouse");
        break;
      case InputModes.PEN:
        style.setProperty("--pen", "1");
        doc.documentElement.classList.add("pen");
        break;
      case InputModes.TOUCH:
        style.setProperty("--touch", "1");
        doc.documentElement.classList.add("touch");
        break;
    }
  }

  applySingleProperty(key: string, variable: { [s: string]: string }) {
    let themeBuff = theme.getOk();
    documentHandler.forDocuments((doc) => {
      doc.documentElement.style.setProperty(key, variable[themeBuff]);
    });
  }
})();

theme.sub((val) => {
  themeEngine.applyTheme(val.value);
});
let scaleValue = 16;
let scaleRem = 16;
scale.sub((val) => {
  scaleValue = val.value / 100;
  scaleRem = scaleValue * 16;
  themeEngine.applyScale(scaleValue);
});
/**Converts the given rems to pixels */
export const remToPx = (rem: number) => {
  return rem * scaleRem;
};
/**Converts the given pixels to rems */
export const pxToRem = (px: number) => {
  return px / scaleRem;
};
scrollBarMode.sub((val) => {
  themeEngine.applyScrollbar(val.value);
});
inputMode.sub((val) => {
  themeEngine.applyInput(val.value);
});
animationLevel.sub((val) => {
  themeEngine.applyAnimation(val.value);
});
