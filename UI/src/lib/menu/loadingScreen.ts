import { defineElement, type BaseOptions } from "@libBase";
import { blue, grey } from "@libColors";
import {
  arrayEquals,
  degreesToRadians,
  pointOnCircle,
  WebComponent,
} from "@libCommon";
import { addThemeVariable } from "@libTheme";
import { animations } from "@libUI";
import "./loadingScreen.scss";

addThemeVariable(
  "loadingScreenBackgroundColor",
  ["UI", "Loading Screen"],
  grey["300"],
  grey["800"]
);
addThemeVariable(
  "loadingScreenTextColor",
  ["UI", "Loading Screen"],
  grey["900"],
  grey["200"]
);
addThemeVariable(
  "loadingScreenLogoColor",
  ["UI", "Loading Screen"],
  grey["900"],
  grey["200"]
);
addThemeVariable(
  "loadingScreenProgressBackgroundColor",
  ["UI", "Loading Screen"],
  grey["100"],
  grey["700"]
);
addThemeVariable(
  "loadingScreenProgressBarColor",
  ["UI", "Loading Screen"],
  blue["700"],
  blue["200"]
);

/**Defines options for loading screen*/
export type LoadingScreenOptions = {
  /**logo in loading screen*/
  logo?: SVGSVGElement;
  /**text to display by the spinner*/
  text?: string;
  /**wether to show or not by default, shows if undefined*/
  show?: boolean;
  /**function to run when click combo is entered*/
  secrect?: (self: LoadingScreen) => void;
  /**loading bars to pass to loading screen*/
  bars?: LoadingScreenBar | LoadingScreenBar[];
} & BaseOptions;

let spinnerPoints = 12;

export class LoadingScreen extends WebComponent<LoadingScreenOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "loading-screen";
  }

  private __loading = this.appendChild(document.createElement("span"));
  private __loadingText = document.createElement("span");
  private __spinner = document.createElement("div");
  private __svg?: SVGSVGElement;
  private __progress = document.createElement("div");
  private __doRemove?: boolean;

  constructor() {
    super();
    let flip = false;
    let counter = 0;
    let timer: any = 0;
    this.__loading.onpointerdown = (ev) => {
      this.__loading.setPointerCapture(ev.pointerId);
      if (!flip) {
        timer = setTimeout(() => {
          flip = true;
          timer = setTimeout(() => {
            flip = false;
            counter = 0;
          }, 10000);
        }, 3000);
      }

      this.__loading.onpointerup = (eve) => {
        this.__loading.releasePointerCapture(eve.pointerId);
        clearTimeout(timer);
        if (flip) {
          timer = setTimeout(() => {
            flip = false;
            counter = 0;
          }, 10000);
          if (counter >= 5) {
            flip = false;
            counter = 0;
            this.__secret(this);
          } else {
            counter++;
          }
        }
      };
    };

    this.__loading.appendChild(this.__loadingText).innerHTML = "Loading";
    this.__loading
      .appendChild(document.createElement("div"))
      .appendChild(this.__spinner);
    for (let i = 0; i < spinnerPoints; i++) {
      let point = document.createElement("div");
      this.__spinner.appendChild(point);
      let pointCord = pointOnCircle(
        50,
        50,
        50,
        degreesToRadians((360 / spinnerPoints) * i)
      );
      point.style.left = pointCord[0] + "%";
      point.style.top = pointCord[1] + "%";
      point.style.animationDelay = (1 / spinnerPoints) * i + "s";
    }

    this.appendChild(this.__progress);

    this.onanimationend = (ev) => {
      if (ev.animationName == "curtain") {
        this.classList.add("trueHide");
      }
      if (this.__doRemove) {
        delete this.__doRemove;
        super.remove();
      }
    };
  }

  /**Sets options on loading screen*/
  options(options: LoadingScreenOptions): this {
    if (typeof options.logo !== "undefined") this.logo = options.logo;
    if (typeof options.text !== "undefined") this.text = options.text;
    if (typeof options.show !== "undefined") this.show = options.show;
    if (typeof options.bars !== "undefined") {
      if (options.bars instanceof Array) {
        for (let i = 0; i < options.bars.length; i++) {
          this.addLoadingBar(options.bars[i]);
        }
      } else {
        this.addLoadingBar(options.bars);
      }
    }
    if (typeof options.secrect !== "undefined") this.secret = options.secrect;
    return this;
  }

  /**Sets the function to run if the click combination is used*/
  set secret(func: (self: LoadingScreen) => void) {
    if (typeof func === "function") {
      this.__secret = func;
    } else {
      console.warn("none function passed");
    }
  }

  private __secret(_dis: LoadingScreen) {}

  /**Set the logo for the loading screen */
  set logo(logo: SVGSVGElement | undefined) {
    if (logo) {
      if (this.__svg) {
        this.replaceChild(logo, this.__svg);
        this.__svg = logo;
      } else {
        this.prepend((this.__svg = logo));
      }
    } else if (this.__svg) {
      this.removeChild(this.__svg);
      delete this.__svg;
    }
  }

  /**Returns the logo set in the loading screen */
  get logo(): SVGSVGElement | undefined {
    return this.__svg;
  }

  /**Set the loading headline*/
  set text(text: string) {
    this.__loadingText.innerHTML = text;
  }

  /** Toggles if the loading screen is shown*/
  set show(show: boolean) {
    if (show) {
      this.classList.remove("hidden", "trueHide");
    } else {
      this.classList.add("hidden");
    }
  }

  /**Removes the loading screen from its parent
   * If animations are used, it will play the hide animation first then be removed */
  remove() {
    if (animations.get) {
      this.__doRemove = true;
      this.show = false;
    } else {
      super.remove();
    }
  }

  /**Appends a loading bar to the loading screen*/
  addLoadingBar(bar: LoadingScreenBar) {
    if (bar instanceof LoadingScreenBar) {
      this.__progress.appendChild(bar);
      //@ts-expect-error
      bar.__top = this;
    } else {
      console.warn("None loading bar passed");
    }
  }

  protected __sortProgress() {
    if (this.__progress.children.length > 1) {
      let children = [...(this.__progress.children as any)];
      let sorted = [...children].sort((a, b) => {
        return b.__procent - a.__procent;
      });
      if (!arrayEquals(children, sorted)) {
        for (let i = 0; i < sorted.length; i++) {
          this.__progress.appendChild(sorted[i]);
        }
      }
    }
  }
}
defineElement(LoadingScreen);

/**Defines options for loading screen progress bar*/
export type LoadingScreenBarOptions = {
  /**text to display by the bar */
  text?: string;
  /**text to call the items which are counting */
  itemName?: string;
  /**wether to show or not by default, shows if undefined */
  max?: number;
  /**wether to show or not by default, shows if undefined */
  progress?: number;
  /**wether to show item count */
  showItems?: boolean;
} & BaseOptions;

export class LoadingScreenBar extends WebComponent<LoadingScreenBarOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "loading-screen-bar";
  }

  private __textContainer = this.appendChild(document.createElement("span"));
  private __statsNode = document.createTextNode("");
  private ___progress = document.createElement("progress");
  private __procentNode = document.createTextNode("");
  private __procent = 0;
  private __itemName?: string;
  private __prog?: number;
  private __max?: number;
  private __top: any;

  constructor() {
    super();
    this.appendChild(document.createElement("div")).appendChild(
      this.__statsNode
    );
    this.appendChild(this.___progress);
    this.___progress.value = 0;
    this.appendChild(document.createElement("div")).appendChild(
      this.__procentNode
    );
    this.__progress();
  }

  /**Sets options on loading screen*/
  options(options: LoadingScreenBarOptions): this {
    if (typeof options.text !== "undefined") this.text = options.text;
    if (typeof options.itemName !== "undefined")
      this.itemName = options.itemName;
    if (typeof options.max !== "undefined") this.max = options.max;
    else this.max = 100;
    if (typeof options.progress !== "undefined")
      this.progress = options.progress;
    else this.progress = 0;
    if (typeof options.showItems !== "undefined")
      this.showItems = options.showItems;
    return this;
  }

  /**Set the loading headline*/
  set text(text: string) {
    if (typeof text == "string") {
      this.__textContainer.innerHTML = text;
    } else {
      console.warn("None text passed");
    }
  }

  /**Set the name of the items wich the progress is counting*/
  set itemName(text: string) {
    if (typeof text == "string") {
      this.__itemName = text;
      this.__progress();
    } else {
      console.warn("None text passed");
    }
  }

  /**Sets the progress of the bar*/
  set progress(prog: number) {
    if (typeof prog === "number") {
      this.__prog = prog;
      this.___progress.value = prog;
      this.__progress();
    } else {
      console.warn("None number passed");
    }
  }

  /**Sets the maximum progress of the bar*/
  set max(max: number) {
    if (typeof max === "number") {
      this.__max = max;
      this.___progress.max = max;
      this.__progress();
    } else {
      console.warn("None number passed");
    }
  }

  /**Sets wether the item count is shown*/
  set showItems(show: boolean) {
    if (show) {
      //@ts-expect-error
      this.__statsNode.classList.remove("h");
    } else {
      //@ts-expect-error
      this.__statsNode.classList.add("h");
    }
  }

  private __progress() {
    this.__statsNode.textContent = `(${this.__prog}/${this.__max}) ${
      this.__itemName || ""
    }`;
    this.__procent = Math.min(
      100,
      Math.round((this.__prog! / this.__max! || 0) * 100)
    );
    this.__procentNode.textContent = this.__procent + "%";
    if (this.__top) {
      this.__top.__sortProgress();
    }
  }
}
defineElement(LoadingScreenBar);
