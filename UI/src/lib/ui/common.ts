import type { BaseEvents } from "@libBase";
import type { WebComponent } from "@libCommon";
import type { EventConsumer } from "@libEvent";
import { Value } from "@libValues";

/**All event types available for content*/
export type ContentEvents = {
  name: { name: string };
  symbol: { symFunc?: () => SVGSVGElement };
  notification: {};
  removed: {};
  closing: { closing: boolean };
  closeable: { closeable: boolean };
  focused: {};
  minSize: {
    width: number;
    height: number;
  };
} & BaseEvents;

export interface ContentBase extends WebComponent {
  readonly contentEvents: EventConsumer<ContentEvents, any>;
  readonly minSize: { width: number; height: number };
  readonly name: string;
  readonly closeable: boolean;
  readonly symbol: (() => SVGSVGElement) | undefined;
  isClosed: boolean;
  container?: ContextBase | WindowBase | ContentContainerBase;
  close(): Promise<{ content: ContentBase; reason: string } | undefined>;
  select(): void;
  readonly whenClosed: Promise<{}>;
}

/**All event types available for window */
export type ContentContainerEvents = {
  lastClosed: {};
};
export interface ContentContainerBase extends WebComponent {
  readonly contentContainerEvents: EventConsumer<ContentContainerEvents, any>;
  readonly topContainer: WindowBase | HTMLElement;
  content: ContentBase | HTMLDivElement | undefined;
}

export interface ContextBase extends ContentBase {
  readonly topContainer: WindowBase | HTMLElement;
  addContent<T extends ContentBase>(content: T, index?: number): T;
  readonly amountContent: number;
}

export interface ContextContainerBase extends ContentBase {
  addContent<T extends ContentBase>(content: T, index?: number): T;
}

/**All event types available for window */
export type WindowEvents = {
  moved: {};
  resized: {};
};

export interface WindowBase {
  readonly windowEvents: EventConsumer<WindowEvents, any>;
  readonly topContainer: WindowBase | HTMLElement;
  showContent: boolean;
  hide: boolean;
}

//######################################################
//UI Scaling and rem conversion
let uiScale: number = 16;
/**This converts an amount of pixels to the correct rem value at the current scaling*/
export let pxToRem = function (px: number) {
  return px / uiScale;
};
/**This converts an amount of rem to the correct pixels at the current scaling*/
export let remToPx = function (rem: number) {
  return rem * uiScale;
};
/**This function applies the current scale to a document*/
export let applyScale = (docu: Document) => {
  docu.documentElement.style.fontSize = uiScale + "px";
};
/**This adds the scale property to the export used to change the scale of the system ui*/
export let scale = new Value(-1, (val) => {
  if (typeof val !== "number") {
    return;
  } else {
    return Math.min(Math.max(val, 0.25), 4);
  }
});
scale.addListener((value) => {
  uiScale = value * 16;
  applyScale(document);
  localStorage.uiScale = value;
});

//######################################################
//Touchscreen mode
var touchMode: boolean;
/**This function applies the current touch mode to a document*/
export let applyTouch = (docu: Document) => {
  if (touchMode) {
    docu.documentElement.classList.add("touch");
  } else {
    docu.documentElement.classList.remove("touch");
  }
};
/**This adds the touch property to the export used to change the touch mode*/
export let touch = new Value(-1, (val) => {
  if (typeof val !== "boolean") {
    return;
  } else {
    return val;
  }
});
touch.addListener((value) => {
  touchMode = Boolean(value);
  applyTouch(document);
  localStorage.uiTouch = touchMode;
});

//######################################################
//Animations mode
var animationsOn: boolean;
/**This function applies the current animation mode to a document*/
export let applyAnimation = (docu: Document) => {
  if (animationsOn) {
    docu.documentElement.classList.add("anim");
  } else {
    docu.documentElement.classList.remove("anim");
  }
};
/**This adds the animation property to the export used to change the animation mode*/
export let animations = new Value(-1, (val) => {
  if (typeof val !== "boolean") {
    return;
  } else {
    return val;
  }
});
animations.addListener((value) => {
  animationsOn = Boolean(value);
  applyAnimation(document);
  localStorage.uiAnimations = animationsOn;
});

//######################################################
//Scroll bar style*/
let scrollBarStyle: number = 1;

/**Possible scrollbar styles*/
export let ScrollBarStyles = { MODERN: 0, NORMAL: 1, LARGE: 2 };
let scrollBarStylesIterable = Object.values(ScrollBarStyles);

/**List of possible scroll bar styles*/
export let scrollBarStylesOptions = [
  { text: "Modern", value: 0 },
  { text: "Normal", value: 1 },
  { text: "Large", value: 2 },
];

/**This function applies the current scale to a document*/
export let applyScrollbar = (docu: Document) => {
  docu.documentElement.classList.remove(
    "scrollModern",
    "scrollNormal",
    "scrollLarge"
  );
  docu.documentElement.classList.add(
    ["scrollModern", "scrollNormal", "scrollLarge"][scrollBarStyle]
  );
};
/**This adds the scale property to the export used to change the scale of the system ui*/
export let scrollStyle = new Value(-1, (val) => {
  if (!scrollBarStylesIterable.includes(val)) {
    return;
  } else {
    return val;
  }
});
scrollStyle.addListener((value) => {
  scrollBarStyle = value;
  applyScrollbar(document);
  localStorage["scrollBarStyle"] = JSON.stringify(
    scrollBarStylesOptions[value].text
  );
});

//######################################################
//Css Management
let sheet = document.createElement("style");
document.documentElement.appendChild(sheet);
export let addStyle = (text: string) => {
  sheet.appendChild(document.createTextNode(text.trim()));
};

document.documentElement.oncontextmenu = (e) => {
  e.preventDefault();
};

(async () => {
  await new Promise<void>((a) => a());
  if (!("uiScale" in localStorage)) {
    scale.set = 1;
  } else {
    scale.set = JSON.parse(localStorage.uiScale);
  }
  if (!("uiTouch" in localStorage)) {
    touch.set = navigator.maxTouchPoints > 0;
  } else {
    touch.set = JSON.parse(localStorage.uiTouch);
  }
  if (!("uiAnimations" in localStorage)) {
    animations.set = false;
  } else {
    animations.set = JSON.parse(localStorage.uiAnimations);
  }
  if (!("scrollBarStyle" in localStorage)) {
    scrollStyle.set = ScrollBarStyles.NORMAL;
  } else {
    let style = JSON.parse(localStorage["scrollBarStyle"]);
    let num = scrollBarStylesOptions.find((e) => {
      return e.text == style;
    });
    if (num) {
      scrollStyle.set = num.value;
    }
  }
})();

document.body.tabIndex = -1;

export let applyGlobalCopyPaste = (docu: Document) => {
  //Global paste functionality
  docu.addEventListener("paste", (event: ClipboardEvent) => {
    if (event.clipboardData && docu.activeElement) {
      if (event.clipboardData.types.includes("text/plain")) {
        if ("onpasteglobal" in docu.activeElement) {
          try {
            //@ts-expect-error
            docu.activeElement.onpasteglobal(event);
          } catch (error) {
            console.warn(error);
          }
        }
      }
    }
  });
  //Global copy functionality
  docu.addEventListener("copy", (event) => {
    if (event.clipboardData && docu.activeElement) {
      if ("oncopyglobal" in docu.activeElement) {
        try {
          //@ts-expect-error
          docu.activeElement.oncopyglobal(event);
        } catch (error) {
          console.warn(error);
        }
      }
    }
  });
};

applyGlobalCopyPaste(document);
