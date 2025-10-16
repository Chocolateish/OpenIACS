import type { ESubscriber } from "@libEvent";
import type DocumentHandler from "../common/document";
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
import { bottomGroups, engines } from "./shared";

export class ThemeEngine {
  /**Reference to document handler*/
  private _handler: DocumentHandler;
  private _listener: ESubscriber<"added", DocumentHandler, Document>;

  constructor(documentHandler: DocumentHandler) {
    engines.push(this);
    this._handler = documentHandler;
    this._listener = this._handler.events.on("added", (e) => {
      this.applyAllToDoc(e.data);
    });
    documentHandler.forDocuments((doc) => {
      this.applyAllToDoc(doc);
    });
  }

  /**Run to clean up references to and from this engine*/
  destructor() {
    this._handler.events.off("added", this._listener);
    let index = engines.indexOf(this);
    if (index == -1) return console.warn("Theme engine already destructed");
    engines.splice(index, 1);
  }

  /**This applies the current theme to a document*/
  private async applyAllToDoc(doc: Document) {
    this.applyScrollbarToDoc(doc, (await scrollBarMode).unwrap);
    this.applyThemeToDoc(doc, (await theme).unwrap);
    this.applyInputToDoc(doc, (await inputMode).unwrap);
    this.applyScaleToDoc(doc, (await scale).unwrap / 100);
    await new Promise((a) => {
      setTimeout(a, 100);
    });
    this.applyAnimationToDoc(doc, (await animationLevel).unwrap);
  }

  /**This applies the current theme to a document*/
  applyScrollbar(scroll: ScrollbarModes) {
    this._handler.forDocuments((doc) => {
      this.applyScrollbarToDoc(doc, scroll);
    });
  }
  private applyScrollbarToDoc(doc: Document, scroll: ScrollbarModes) {
    doc.documentElement.style.setProperty(
      "--scrollbar",
      {
        [ScrollbarModes.THIN]: "0.4rem",
        [ScrollbarModes.MEDIUM]: "1rem",
        [ScrollbarModes.WIDE]: "1.875rem",
      }[scroll]
    );
  }

  /**This applies the current theme to a document*/
  applyAnimation(anim: AnimationLevels) {
    this._handler.forDocuments((doc) => {
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
    this._handler.forDocuments((doc) => {
      this.applyThemeToDoc(doc, theme);
    });
  }
  private applyThemeToDoc(doc: Document, theme: Themes) {
    for (const key in bottomGroups)
      bottomGroups[key].applyThemes(doc.documentElement.style, theme);
  }

  /**This applies the current scale to a document*/
  applyScale(scale: number) {
    this._handler.forDocuments((doc) => {
      this.applyScaleToDoc(doc, scale);
    });
  }
  private applyScaleToDoc(doc: Document, scale: number) {
    doc.documentElement.style.fontSize = scale * 16 + "px";
  }

  /**Auto Input Mode */
  applyInput(mode: InputModes) {
    this._handler.forDocuments((doc) => {
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

  //@ts-ignore
  private async applySingleProperty(
    key: string,
    variable: { [s: string]: string }
  ) {
    let themeBuff = (await theme).unwrap;
    this._handler.forDocuments((doc) => {
      doc.documentElement.style.setProperty(key, variable[themeBuff]);
    });
  }
}
