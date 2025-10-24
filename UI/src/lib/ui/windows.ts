import { defineElement, type BaseOptions } from "@libBase";
import { grey, orange } from "@libColors";
import { svg, WebComponent, WebComponentSide } from "@libCommon";
import { E, EventHandler, type ESubscriber } from "@libEvent";
import { close, drag_handle_horz, drag_handle_vert } from "@libIcons";
import { addThemeVariable, applyTheme, theme } from "@libTheme";
import {
  animations,
  applyAnimation,
  applyGlobalCopyPaste,
  applyScale,
  applyTouch,
  remToPx,
  scale,
  touch,
  type ContentBase,
  type ContentContainerBase,
  type ContentContainerEvents,
  type ContentEvents,
  type ContextContainerBase,
  type WindowBase,
  type WindowEvents,
} from "./common";
import { Content, ContentContainer, selectedContent } from "./content";
import { attachContextMenu } from "./contextMenu";
import "./windows.scss";

addThemeVariable(
  "windowTitleColor",
  ["UI", "Window"],
  grey["500"],
  grey["600"]
);
addThemeVariable(
  "windowTitleTextColor",
  ["UI", "Window"],
  grey["900"],
  grey["300"]
);
addThemeVariable(
  "windowTitleIconColor",
  ["UI", "Window"],
  grey["900"],
  grey["300"]
);
addThemeVariable("windowCornerRadius", ["UI", "Window"], "0.4rem", "0.4rem");
addThemeVariable(
  "windowShadowColor",
  ["UI", "Window"],
  grey["900"],
  grey["800"]
);
addThemeVariable(
  "windowFocusColor",
  ["UI", "Window"],
  orange["900"],
  orange["600"]
);
addThemeVariable(
  "windowSizerColor",
  ["UI", "Window"],
  grey["300"],
  grey["700"]
);

//Limits for window position in rems (how much is left of the window when it cannot be moved further)
let topWindowLimit = 0;
let bottomWindowLimit = 0;
let leftWindowLimit = 0;
let rightWindowLimit = 0;

//Listener for ui scale to recalculate window min sizes
let titleHeight = remToPx(2);
touch.addListener((val) => {
  titleHeight = remToPx(val ? 2.5 : 2);
});
scale.addListener(() => {
  titleHeight = remToPx(touch.get ? 2.5 : 2);
  topWindowLimit = remToPx(0);
  bottomWindowLimit = remToPx(3);
  leftWindowLimit = remToPx(4);
  rightWindowLimit = remToPx(3);
});

type WindowInsets = {
  windowTop?: number;
  windowBottom?: number;
  windowLeft?: number;
  windowRight?: number;
};
export let elementToWindowPosition = (
  elem: Element,
  elementSide: WebComponentSide,
  windowSide: WebComponentSide,
  alignment: WebComponentSide
): WindowInsets | undefined => {
  let box = elem.getBoundingClientRect();
  switch (elementSide) {
    case WebComponentSide.LEFT: {
      switch (windowSide) {
        case WebComponentSide.LEFT:
          {
            switch (alignment) {
              case WebComponentSide.TOP: {
                return { windowLeft: box.left, windowTop: box.top };
              }
              case WebComponentSide.BOTTOM: {
                return {
                  windowLeft: box.left,
                  windowBottom: window.innerHeight - box.bottom,
                };
              }
            }
          }
          break;
        case WebComponentSide.RIGHT: {
          switch (alignment) {
            case WebComponentSide.TOP: {
              return {
                windowRight: window.innerWidth - box.left,
                windowTop: box.top,
              };
            }
            case WebComponentSide.BOTTOM: {
              return {
                windowRight: window.innerWidth - box.left,
                windowBottom: window.innerHeight - box.bottom,
              };
            }
          }
        }
      }
      break;
    }
    case WebComponentSide.TOP: {
      switch (windowSide) {
        case WebComponentSide.TOP: {
          switch (alignment) {
            case WebComponentSide.LEFT: {
              return { windowLeft: box.left, windowTop: box.top };
            }
            case WebComponentSide.RIGHT: {
              return {
                windowRight: window.innerWidth - box.right,
                windowTop: box.top,
              };
            }
          }
          break;
        }
        case WebComponentSide.BOTTOM: {
          switch (alignment) {
            case WebComponentSide.LEFT: {
              return {
                windowLeft: box.left,
                windowBottom: window.innerHeight - box.top,
              };
            }
            case WebComponentSide.RIGHT: {
              return {
                windowRight: window.innerWidth - box.right,
                windowBottom: window.innerHeight - box.top,
              };
            }
          }
        }
      }
      break;
    }
    case WebComponentSide.RIGHT: {
      switch (windowSide) {
        case WebComponentSide.RIGHT: {
          switch (alignment) {
            case WebComponentSide.TOP: {
              return {
                windowRight: window.innerWidth - box.right,
                windowTop: box.top,
              };
            }
            case WebComponentSide.BOTTOM: {
              return {
                windowRight: window.innerWidth - box.right,
                windowBottom: window.innerHeight - box.bottom,
              };
            }
          }
          break;
        }
        case WebComponentSide.LEFT: {
          switch (alignment) {
            case WebComponentSide.TOP: {
              return { windowLeft: box.right, windowTop: box.top };
            }
            case WebComponentSide.BOTTOM: {
              return {
                windowLeft: box.right,
                windowBottom: window.innerHeight - box.bottom,
              };
            }
          }
        }
      }
      break;
    }
    case WebComponentSide.BOTTOM: {
      switch (windowSide) {
        case WebComponentSide.BOTTOM: {
          switch (alignment) {
            case WebComponentSide.LEFT: {
              return {
                windowLeft: box.left,
                windowBottom: window.innerHeight - box.bottom,
              };
            }
            case WebComponentSide.RIGHT: {
              return {
                windowRight: window.innerWidth - box.right,
                windowBottom: window.innerHeight - box.bottom,
              };
            }
          }
          break;
        }
        case WebComponentSide.TOP: {
          switch (alignment) {
            case WebComponentSide.LEFT: {
              return { windowLeft: box.left, windowTop: box.bottom };
            }
            case WebComponentSide.RIGHT: {
              return {
                windowRight: window.innerWidth - box.right,
                windowTop: box.bottom,
              };
            }
          }
        }
      }
      break;
    }
  }
  return undefined;
};

/** Available snaps for windows*/
export const Snaps = {
  BACK: 0,
  FULL: 1,
  TOP: 2,
  BOTTOM: 3,
  LEFT: 4,
  RIGHT: 5,
  TOPLEFT: 6,
  TOPRIGHT: 7,
  BOTTOMLEFT: 8,
  BOTTOMRIGHT: 9,
} as const;
export type Snaps = (typeof Snaps)[keyof typeof Snaps];

/**Defines size type*/
type WindowSizeType = number | string;
type WindowPosType = number | "center" | string;

/**Defines base options for creating window*/
export type WindowBaseOptions = {
  layer?: number;
  sizeable?: string | boolean;
  showContent?: boolean;
  title?: boolean;
  titleText?: string;
  closeable?: boolean;
  moveable?: boolean;
  position?: "fixed" | "";
  snap?: Snaps;
  hide?: boolean;
  autoHide?: boolean;
  autoClose?: boolean;
  modal?: boolean;
  tabs?: boolean;
  dropTarget?: boolean;
  content?: ContentBase;
  width?: WindowSizeType;
  height?: WindowSizeType;
  minWidth?: WindowSizeType;
  minHeight?: WindowSizeType;
  maxWidth?: WindowSizeType;
  maxHeight?: WindowSizeType;
  left?: WindowPosType;
  top?: WindowPosType;
  right?: WindowPosType;
  bottom?: WindowPosType;
  windowLeft?: number;
  windowTop?: number;
  windowRight?: number;
  windowBottom?: number;
} & BaseOptions;

//##################################################
//#   __          ___           _                  #
//#   \ \        / (_)         | |                 #
//#    \ \  /\  / / _ _ __   __| | _____      __   #
//#     \ \/  \/ / | | '_ \ / _` |/ _ \ \ /\ / /   #
//#      \  /\  /  | | | | | (_| | (_) \ V  V /    #
//#       \/  \/   |_|_| |_|\__,_|\___/ \_/\_/     #
//##################################################

export class UIWindow
  extends WebComponent<WindowBaseOptions>
  implements WindowBase
{
  protected _windowEvents: EventHandler<WindowEvents, this> = new EventHandler<
    WindowEvents,
    this
  >(this);
  readonly windowEvents = this._windowEvents.consumer;

  /**Returns the name used to define the element */
  static elementName() {
    return "window";
  }

  /**Wether the windows is closeable*/
  private __closeable = true;
  /**Wether the windows is moveable*/
  private __moveable? = true;
  /**Wether the windows is hidden*/
  private __hidden = false;
  /**Wether the window will auto hide*/
  private __autoHide = false;
  /**Wether the window is modal*/
  private __modal = false;
  /**Wether the window will auto close*/
  private __autoClose = false;
  /**Wether the window has content shown*/
  private __contentShown = true;
  /**How manu featues are using the full screen background*/
  private __backgroundUsers = 0;
  /**The parent of the window, the window will send certain events to the parent*/
  private __parent?: WindowManager;
  /**Which layer the window is part of*/
  private __layer = 0;
  /**Initializing position variables*/
  private __top: number | false = false;
  private __bottom: number | false = false;
  private __left: number | false = false;
  private __right: number | false = false;
  /**Initializing center variables*/
  private __xCenter = true;
  private __yCenter = true;
  /**Internal buffer of minimum size*/
  private __minWidthBuff = 200;
  /**Internal buffer of minimum height*/
  private __minHeightBuff = 200;
  /**Container for content, made for css reasons*/
  private __contentContainer = this.appendChild(document.createElement("div"));
  /**Temp content stand in*/
  private __content: Content = document.createElement("div") as any;
  /**Container for window title*/
  private __title = document.createElement("div");
  /**Container for content symbol*/
  private __symbol: SVGSVGElement = this.__title.appendChild(
    svg(0, 0, "0 0 0 0")
  );
  /**Container for window title text*/
  private __text = this.__title.appendChild(document.createElement("div"));
  /**Closer button*/
  private __closer = this.__title.appendChild(close());
  /**Stores position and size of window before snapping*/
  private __snapped?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };

  /**Temp variables */
  private ____windowLeft?: number;
  private ____left?: string | number;
  private ____windowRight?: number;
  private ____right?: string | number;
  private ____windowTop?: number;
  private ____top?: string | number;
  private ____windowBottom?: number;
  private ____bottom?: string | number;

  /**Stores flag for window title text mode*/
  private __textMode?: number;

  /**Stores listener for content removal*/
  private __removedListener: ESubscriber<
    "removed",
    ContentBase,
    ContentEvents["removed"]
  > = (e) => {
    this.__removeContent(e.target as Content);
    return true;
  };
  /**Stores listener for content name change*/
  private __nameListener: ESubscriber<
    "name",
    ContentBase,
    ContentEvents["name"]
  > = (e) => {
    this.titleText = e.data.name;
  };
  /**Stores listener for content symbol change*/
  private __symbolListener: ESubscriber<
    "symbol",
    ContentBase,
    ContentEvents["symbol"]
  > = (e) => {
    if (typeof e.data.symFunc !== "function") {
      this.symbol = undefined;
      return false;
    }
    this.symbol = e.data.symFunc();
  };
  /**Stores listener for content selection*/
  private __selectListener: ESubscriber<
    "focused",
    ContentBase,
    ContentEvents["focused"]
  > = (ev) => {
    this.focus();
    this.__nameListener(new E("name", ev.target, { name: ev.target.name }));
    this.__symbolListener(
      new E("symbol", ev.target, { symFunc: ev.target.symbol })
    );
  };
  /**Stores listeners for minimum size*/
  private __sizeListener: ESubscriber<
    "minSize",
    ContentBase,
    ContentEvents["minSize"]
  > = (e) => {
    this.__minWidthBuff = (e.data as any).width;
    this.__minHeightBuff = (e.data as any).height;
    this.__updateSize();
  };
  /**Pointer event for auto hiding when clicking background*/
  private __autoHideListener?: (e: PointerEvent) => any;
  /**Container for dimmed background*/
  private __background?: HTMLDivElement;
  /**Pointer event for auto closing when clicking background*/
  private __autoCloseListener?: (e: PointerEvent) => any;
  /**Defines element to capture tabbing in window*/
  private __focusCaptureIn?: HTMLDivElement;
  /**Defines element to capture tabbing in window*/
  private __focusCaptureOut?: HTMLDivElement;
  /**Container for window sizer*/
  private __sizer?: HTMLDivElement;
  private __sizerChildren: {
    top?: HTMLDivElement;
    bottom?: HTMLDivElement;
    left?: HTMLDivElement;
    right?: HTMLDivElement;
    topLeft?: HTMLDivElement;
    topRight?: HTMLDivElement;
    bottomLeft?: HTMLDivElement;
    bottomRight?: HTMLDivElement;
  } = {};

  /**Stores the width of the window internally*/
  private __width?: number | boolean;
  /**Stores the height of the window internally*/
  private __height?: number | boolean;

  /**Stores if max width is active*/
  private __maxWidth?: boolean;
  /**Stores if max height is active*/
  private __maxHeight?: boolean;
  /**Stores if min width is active*/
  private __minWidth?: boolean;
  /**Stores if min height is active*/
  private __minHeight?: boolean;

  constructor() {
    super();
    this.__contentContainer.classList.add("contentContainer");
    /** Makes windows selectable */
    this.tabIndex = -1;
    this.__contentContainer.appendChild(this.__content);
    this.onkeydown = (ev) => {
      ev.stopPropagation();
      if (ev.key == "Escape") {
        ev.stopPropagation();
        this.close();
        return;
      }
      if (this.__content instanceof Content) {
        //@ts-expect-error
        this.__content.__keyboard(ev);
      }
    };

    this.__title.classList.add("title");
    this.onpointerdown = (e) => {
      e.stopPropagation();
      this.select();
    };
    this.__title.ondblclick = () => {
      if (this.__snapped) {
        this.snap(Snaps.BACK);
      } else {
        this.snap(Snaps.FULL);
      }
    };
    attachContextMenu(this.__title, [
      { text: "Popout", func: () => this.popOut() },
      { text: "Close", func: () => this.close() },
      1,
      {
        text: "Snap",
        subMenu: [
          {
            text: "Fullscreen",
            func: () => {
              this.snap(Snaps.FULL);
            },
          },
          {
            text: "Restore",
            func: () => {
              this.snap(Snaps.BACK);
            },
          },
          {
            text: "Left",
            func: () => {
              this.snap(Snaps.LEFT);
            },
          },
          {
            text: "Right",
            func: () => {
              this.snap(Snaps.RIGHT);
            },
          },
          {
            text: "Top",
            func: () => {
              this.snap(Snaps.TOP);
            },
          },
          {
            text: "Bottom",
            func: () => {
              this.snap(Snaps.BOTTOM);
            },
          },
          {
            text: "Top Left",
            func: () => {
              this.snap(Snaps.TOPLEFT);
            },
          },
          {
            text: "Top Right",
            func: () => {
              this.snap(Snaps.TOPRIGHT);
            },
          },
          {
            text: "Bottom Left",
            func: () => {
              this.snap(Snaps.BOTTOMLEFT);
            },
          },
          {
            text: "Bottom Right",
            func: () => {
              this.snap(Snaps.BOTTOMRIGHT);
            },
          },
        ],
      },
    ]);

    this.__text.classList.add("text");
    this.__closer.classList.add("closer");
    this.__closer.onpointerdown = (e) => {
      e.stopPropagation();
    };
    this.__closer.ondblclick = (e) => {
      e.stopPropagation();
    };
    this.__closer.onclick = (e) => {
      e.stopPropagation();
      this.close();
    };
  }

  /**Options toggeler */
  options(options: WindowBaseOptions): this {
    if (options.content instanceof Content) this.content = options.content;
    if (typeof options.layer === "number")
      this.__layer = Math.round(options.layer);
    if (typeof options.sizeable !== "undefined")
      this.sizeable = options.sizeable;
    else this.sizeable = true;

    if (typeof options.title === "boolean")
      this.title = options.title ? "t" : "";
    else this.title = "t";
    if (typeof options.titleText === "string")
      this.titleText = options.titleText;
    if (typeof options.closeable === "boolean")
      this.closeable = options.closeable;
    if (typeof options.moveable === "boolean") this.moveable = options.moveable;
    else this.moveable = true;
    if (typeof options.position === "string") this.position = options.position;
    if (typeof options.snap === "number") this.snap(options.snap);
    if (typeof options.hide === "boolean") this.hide = options.hide;
    if (typeof options.autoHide === "boolean") this.autoHide = options.autoHide;
    if (typeof options.autoClose === "boolean")
      this.autoClose = options.autoClose;
    if (typeof options.modal === "boolean") this.modal = options.modal;

    if (typeof options.showContent === "boolean") {
      this.showContent = options.showContent;
    } else {
      if (typeof options.height !== "undefined") this.height = options.height;
      else this.height = 0;
      if (typeof options.minHeight !== "undefined")
        this.minHeight = options.minHeight;
      if (typeof options.maxHeight !== "undefined")
        this.maxHeight = options.maxHeight;
    }
    if (typeof options.width !== "undefined") this.width = options.width;
    else this.width = 0;

    if (typeof options.minWidth !== "undefined")
      this.minWidth = options.minWidth;

    if (typeof options.maxWidth !== "undefined")
      this.maxWidth = options.maxWidth;

    if (this.isConnected) {
      if (typeof options.windowLeft !== "undefined")
        this.windowLeft = options.windowLeft;
      else if (typeof options.left !== "undefined") this.left = options.left;
      if (typeof options.windowRight !== "undefined")
        this.windowRight = options.windowRight;
      else if (typeof options.right !== "undefined") this.right = options.right;
      if (typeof options.windowTop !== "undefined")
        this.windowTop = options.windowTop;
      else if (typeof options.top !== "undefined") this.top = options.top;
      if (typeof options.windowBottom !== "undefined")
        this.windowBottom = options.windowBottom;
      else if (typeof options.bottom !== "undefined")
        this.bottom = options.bottom;
    } else {
      if (typeof options.windowLeft !== "undefined")
        this.____windowLeft = options.windowLeft;
      else if (typeof options.left !== "undefined")
        this.____left = options.left;
      if (typeof options.windowRight !== "undefined")
        this.____windowRight = options.windowRight;
      else if (typeof options.right !== "undefined")
        this.____right = options.right;
      if (typeof options.windowTop !== "undefined")
        this.____windowTop = options.windowTop;
      else if (typeof options.top !== "undefined") this.____top = options.top;
      if (typeof options.windowBottom !== "undefined")
        this.____windowBottom = options.windowBottom;
      else if (typeof options.bottom !== "undefined")
        this.____bottom = options.bottom;
    }
    return this;
  }

  connectedCallback() {
    if (typeof this.____windowLeft === "number")
      this.windowLeft = this.____windowLeft;
    else if (typeof this.____left !== "undefined") this.left = this.____left;
    if (typeof this.____windowRight === "number")
      this.windowRight = this.____windowRight;
    else if (typeof this.____right !== "undefined") this.right = this.____right;
    if (typeof this.____windowTop === "number")
      this.windowTop = this.____windowTop;
    else if (typeof this.____top !== "undefined") this.top = this.____top;
    if (typeof this.____windowBottom === "number")
      this.windowBottom = this.____windowBottom;
    else if (typeof this.____bottom !== "undefined")
      this.bottom = this.____bottom;
  }

  /**This sets the layer of the window*/
  set layer(layer: number) {
    this.__parent?.changeLayer(this, layer);
  }
  /**This gets the layer of the window*/
  get layer(): number {
    return this.__layer;
  }

  get windowManager(): WindowManager | undefined {
    return this.__parent;
  }

  //###################################################################
  //Title Bar
  /**This set wether the window has a title bar or not */
  set title(title: string) {
    if (title) {
      this.insertBefore(this.__title, this.firstChild);
      this.classList.remove("titleLess");
    } else {
      if (this.__title.isConnected) this.removeChild(this.__title);
      this.classList.add("titleLess");
    }
  }

  /**This set the text of the title bar, use a number for special functionality
   * modes are as follows, 1 = The selected content in the window*/
  set titleText(text: string | number) {
    if (typeof text == "string") {
      delete this.__textMode;
      this.__text.innerHTML = text;
    } else if (typeof text == "number") this.__textMode = text;
  }

  /**The symbol for the content*/
  set symbol(sym: SVGSVGElement | undefined) {
    if (sym instanceof SVGSVGElement) {
      this.__title.replaceChild(sym, this.__symbol);
      this.__symbol = sym;
    } else {
      sym = svg(0, 0, "0 0 0 0");
      this.__title.replaceChild(sym, this.__symbol);
      this.__symbol = sym;
    }
  }
  /**Returns the symbol for the content*/
  get symbol(): SVGSVGElement {
    return this.__symbol;
  }

  /**This sets wether the window is closable */
  set closeable(close: boolean) {
    if (close) {
      this.__closer.classList.remove("h");
    } else {
      this.__closer.classList.add("h");
    }
    this.__closeable = Boolean(close);
  }

  /**This gets wether the window is closable*/
  get closeable(): boolean {
    return this.__closeable;
  }

  /**This closes the window */
  async close() {
    if (this.__content instanceof Content) {
      this.__closer.classList.add("waiting");
      let res = await this.__content.close();
      if (res) {
        this.__closer.classList.remove("waiting");
        return { window: this, ...res };
      }
      return undefined;
    } else {
      this.remove();
      return undefined;
    }
  }

  /**This removes the window from the window manager*/
  remove() {
    return this.__parent?.removeWindow(this);
  }

  /**Gets the container of the content */
  get topContainer() {
    return this;
  }

  /**This changes the content of the window */
  set content(cont: Content) {
    if (cont.isClosed) {
      console.warn("Content is closed");
      return;
    }
    cont.remove();
    if (this.__content instanceof Content) {
      this.__content.contentEvents.off("removed", this.__removedListener);
      this.__content.contentEvents.off("name", this.__nameListener);
      this.__content.contentEvents.off("symbol", this.__symbolListener);
      this.__content.contentEvents.off("focused", this.__selectListener);
      this.__content.contentEvents.off("minSize", this.__sizeListener);
    }
    cont.container = this;
    this.__contentContainer.replaceChild(cont, this.__content);
    this.__content = cont;
    cont.contentEvents.on("removed", this.__removedListener);
    cont.contentEvents.on("name", this.__nameListener);
    this.__nameListener(new E("name", cont, { name: cont.name }));
    cont.contentEvents.on("symbol", this.__symbolListener);
    this.__symbolListener(new E("symbol", cont, { symFunc: cont.symbol }));
    cont.contentEvents.on("focused", this.__selectListener);
    cont.contentEvents.on("minSize", this.__sizeListener);
    this.__sizeListener(new E("minSize", cont, cont.minSize));
  }

  /**This returns the content of the*/
  get content(): Content {
    return this.__content;
  }

  /**This method removes a content from the window */
  private __removeContent(content: Content) {
    content.contentEvents.off("name", this.__nameListener);
    content.contentEvents.off("symbol", this.__symbolListener);
    content.contentEvents.off("focused", this.__selectListener);
    content.contentEvents.off("minSize", this.__sizeListener);
    this.remove();
  }

  /**Selects the window*/
  select() {
    if (activeWindow != this) {
      if (this.__content instanceof Content && this.__contentShown) {
        if (this.__content != selectedContent) this.__content.select();
      } else {
        this.focus();
        super.focus();
      }
    }
  }

  /**Focuses the window*/
  focus() {
    if (activeWindow != this) this.__parent?.focusWindow(this);
  }

  /**This sets how the content is displayed
   * @param  cont false = content not shown, true content shown*/
  set showContent(cont: boolean) {
    if (cont) {
      this.__content.classList.remove("h");
      this.classList.remove("contentLess");
    } else {
      this.__content.classList.add("h");
      this.classList.add("contentLess");
      this.style.height = "min-content";
    }
    this.__contentShown = Boolean(cont);
  }
  /**This returns if the content is displayed
   * false = content not shown, true content shown*/
  get showContent(): boolean {
    return this.__contentShown;
  }

  /**Sets if the window is hidden*/
  set hide(hide: boolean) {
    if (hide) {
      this.classList.add("h");
    } else {
      this.classList.remove("h");
      this.focus();
    }
    this.__hidden = Boolean(hide);
  }
  /**Gets if the window is hidden */
  get hide(): boolean {
    return this.__hidden;
  }

  /**Sets if the window automatically hides when clicked outside*/
  set autoHide(hide: boolean) {
    if (hide && !this.__autoHide) {
      this.__backgroundUser(true);
      this.__autoHideListener = () => {
        this.hide = true;
      };
      this.__background!.addEventListener(
        "pointerdown",
        this.__autoHideListener
      );
      this.captureFocus = true;
    } else if (!hide && this.__autoHide) {
      this.__background!.removeEventListener(
        "pointerdown",
        this.__autoHideListener!
      );
      this.__backgroundUser(false);
      if (!this.__modal && !this.__autoClose) this.captureFocus = false;
    }
    this.__autoHide = Boolean(hide);
  }
  /**Gets if the window automatically hides when clicked outside*/
  get autoHide(): boolean {
    return this.__autoHide;
  }

  /**This sets if the window is modal */
  set modal(modal: boolean) {
    if (modal && !this.__modal) {
      this.__backgroundUser(true);
      this.__background!.classList.add("modal");
      this.captureFocus = true;
    } else if (!modal && this.__modal) {
      this.__backgroundUser(false);
      this.__background!.classList.remove("modal");
      if (!this.__autoClose && !this.__autoHide) {
        this.captureFocus = false;
      }
    }
    this.__modal = Boolean(modal);
  }

  /**This gets if the window is modal */
  get modal(): boolean {
    return this.__modal;
  }

  /**This sets up an autocloser for the window, when pressing outside the window*/
  set autoClose(ac: boolean) {
    if (ac && !this.__autoClose) {
      this.__backgroundUser(true);
      this.__autoCloseListener = () => {
        this.close();
      };
      this.__background!.addEventListener(
        "pointerdown",
        this.__autoCloseListener
      );
      this.captureFocus = true;
    } else if (!ac && this.__autoClose) {
      this.__background!.removeEventListener(
        "pointerdown",
        this.__autoCloseListener!
      );
      this.__backgroundUser(false);
      if (!this.modal && !this.autoHide) this.captureFocus = false;
    }
    this.__autoClose = Boolean(ac);
  }
  /**Gets if an autocloser for the window, when pressing outside the window*/
  get autoClose(): boolean {
    return this.__autoClose;
  }

  /**This toggles if the window captures focus*/
  set captureFocus(cf: boolean) {
    if (cf && !this.__focusCaptureIn) {
      this.__focusCaptureIn = this.insertBefore(
        document.createElement("div"),
        this.firstChild
      );
      this.__focusCaptureIn.tabIndex = 0;
      this.__focusCaptureOut = this.appendChild(document.createElement("div"));
      this.__focusCaptureOut.tabIndex = 0;
      this.__focusCaptureOut.onfocus = () => {
        let sel = this.querySelectorAll("[tabindex]");
        if (sel.length >= 2) (sel[1] as HTMLElement).focus();
      };
      this.__focusCaptureIn.onfocus = () => {
        let sel = this.querySelectorAll("[tabindex]");
        if (sel.length == 0) this.focus();
        else (sel[sel.length - 2] as HTMLElement).focus();
      };
    } else if (!cf && this.__focusCaptureIn) {
      this.removeChild(this.__focusCaptureIn);
      this.removeChild(this.__focusCaptureOut!);
    }
  }
  get captureFocus(): boolean {
    return Boolean(this.__focusCaptureIn);
  }

  /**This keeps track of the need for a background element (used to capture clicks)
   * @param set true increases the amount of users, false decreases
   * when there are no more users the element is removed*/
  protected __backgroundUser(set: boolean) {
    if (set) {
      this.__backgroundUsers++;
      if (this.__backgroundUsers == 1) {
        this.__background = document.createElement("div");
        this.__background.classList.add("background");
        this.__background.onpointerdown = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
        this.__background.ontouchstart = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
        this.appendChild(this.__background);
      }
    } else {
      this.__backgroundUsers--;
      if (this.__backgroundUsers == 0) this.__background!.remove();
    }
  }

  /**This method snaps the window to a predefined position*/
  snap(snap: Snaps) {
    if (this.__sizer && this.__moveable) {
      if (snap != Snaps.BACK && !this.__snapped) {
        this.__snapped = {
          top: this.top,
          left: this.left,
          width: this.width,
          height: this.height,
        };
      }
      switch (snap) {
        case Snaps.FULL:
        case Snaps.TOP:
        case Snaps.LEFT:
        case Snaps.RIGHT:
        case Snaps.TOPLEFT:
        case Snaps.TOPRIGHT: {
          this.top = 0;
          break;
        }
        case Snaps.BOTTOM:
        case Snaps.BOTTOMLEFT:
        case Snaps.BOTTOMRIGHT: {
          this.top = "50%";
          break;
        }
        case Snaps.BACK: {
          if (!this.__snapped) return;

          this.top = this.__snapped.top;
          break;
        }
      }
      switch (snap) {
        case Snaps.FULL:
        case Snaps.TOP:
        case Snaps.BOTTOM:
        case Snaps.LEFT:
        case Snaps.TOPLEFT:
        case Snaps.BOTTOMLEFT: {
          this.left = 0;
          break;
        }
        case Snaps.RIGHT:
        case Snaps.TOPRIGHT:
        case Snaps.BOTTOMRIGHT: {
          this.left = "50%";
          break;
        }
        case Snaps.BACK: {
          this.left = this.__snapped!.left;
          break;
        }
      }
      switch (snap) {
        case Snaps.FULL:
        case Snaps.TOP:
        case Snaps.BOTTOM: {
          this.width = "100%";
          break;
        }
        case Snaps.LEFT:
        case Snaps.RIGHT:
        case Snaps.TOPLEFT:
        case Snaps.TOPRIGHT:
        case Snaps.BOTTOMLEFT:
        case Snaps.BOTTOMRIGHT: {
          this.width = "50%";
          break;
        }
        case Snaps.BACK: {
          this.width = this.__snapped!.width;
          break;
        }
      }
      switch (snap) {
        case Snaps.FULL:
        case Snaps.LEFT:
        case Snaps.RIGHT: {
          this.height = "100%";
          break;
        }
        case Snaps.TOP:
        case Snaps.BOTTOM:
        case Snaps.TOPLEFT:
        case Snaps.TOPRIGHT:
        case Snaps.BOTTOMLEFT:
        case Snaps.BOTTOMRIGHT: {
          this.height = "50%";
          break;
        }
        case Snaps.BACK: {
          this.height = this.__snapped!.height;
          delete this.__snapped;
          break;
        }
      }
    }
  }

  //###################################################################
  //Sizing
  /**This toggles if the window is sizeable pass a string of the sided which should be resizeable
   * @param  size t = top, b = bottom, r = right, l = left, eg 'br' = bottom right
   * if v is included, the resize bars will be visible*/
  set sizeable(size: string | boolean) {
    if (this.__sizer) {
      this.removeChild(this.__sizer);
      delete this.__sizer;
    }
    this.classList.remove("top", "bottom", "left", "right");
    if (size === true) size = "tbrl";
    else if (size === false) return;
    this.__sizer = document.createElement("div");
    this.appendChild(this.__sizer).classList.add("sizer");
    this.__sizer.onpointerup = (e) => {
      (e.target! as HTMLElement).releasePointerCapture(e.pointerId);
      (e.target! as HTMLElement).onpointermove = null;
      if (
        this.__minWidth ||
        this.__minHeight ||
        this.__maxWidth ||
        this.__maxHeight
      ) {
        if (this.__minWidth || this.__maxWidth) {
          this.__width = false;
        }
        if (this.__minHeight || this.__maxHeight) {
          this.__height = false;
        }
      }
      this._windowEvents.emit("resized", {});
    };
    //Sides
    if (size.includes("t")) {
      this.__sizer.classList.add("top");
      this.classList.add("top");
      this.__sizer
        .appendChild((this.__sizerChildren.top = document.createElement("div")))
        .classList.add("top");
      this.__sizerChildren.top.onpointerdown = (e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        let box = { height: this.height, width: this.width };
        if (!this.__xCenter) {
          this.bottom = this.bottom;
        }
        (e.currentTarget as HTMLElement).onpointermove = (ev) => {
          this.height =
            box.height +
            (this.__xCenter
              ? (e.clientY - ev.clientY) * 2
              : e.clientY - ev.clientY);
        };
      };
      if (size.includes("l")) {
        this.__sizer.appendChild(
          (this.__sizerChildren.topLeft = document.createElement("div"))
        ).className = "topLeft";
        this.__sizerChildren.topLeft.onpointerdown = (e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          let box = { height: this.height, width: this.width };
          if (!this.__xCenter) {
            this.bottom = this.bottom;
          }
          if (!this.__yCenter) {
            this.right = this.right;
          }
          (e.currentTarget as HTMLElement).onpointermove = (ev) => {
            this.height =
              box.height +
              (this.__xCenter
                ? (e.clientY - ev.clientY) * 2
                : e.clientY - ev.clientY);
            this.width =
              box.width +
              (this.__xCenter
                ? (e.clientX - ev.clientX) * 2
                : e.clientX - ev.clientX);
          };
        };
      }
      if (size.includes("r")) {
        this.__sizer.appendChild(
          (this.__sizerChildren.topRight = document.createElement("div"))
        ).className = "topRight";
        this.__sizerChildren.topRight.onpointerdown = (e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          let box = { height: this.height, width: this.width };
          if (!this.__xCenter) {
            this.bottom = this.bottom;
          }
          if (!this.__yCenter) {
            this.left = this.left;
          }
          (e.currentTarget as HTMLElement).onpointermove = (ev) => {
            this.height =
              box.height +
              (this.__xCenter
                ? (e.clientY - ev.clientY) * 2
                : e.clientY - ev.clientY);
            this.width =
              box.width +
              (this.__xCenter
                ? (ev.clientX - e.clientX) * 2
                : ev.clientX - e.clientX);
          };
        };
      }
    }
    if (size.includes("b")) {
      this.__sizer.classList.add("bottom");
      this.classList.add("bottom");
      this.__sizer.appendChild(
        (this.__sizerChildren.bottom = document.createElement("div"))
      ).className = "bottom";
      this.__sizerChildren.bottom.onpointerdown = (e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        let box = { height: this.height, width: this.width };
        if (!this.__xCenter) {
          this.top = this.top;
        }
        (e.currentTarget as HTMLElement).onpointermove = (ev) => {
          this.height =
            box.height +
            (this.__xCenter
              ? (ev.clientY - e.clientY) * 2
              : ev.clientY - e.clientY) -
            2;
        };
      };
      if (size.includes("l")) {
        this.__sizer.appendChild(
          (this.__sizerChildren.bottomLeft = document.createElement("div"))
        ).className = "bottomLeft";
        this.__sizerChildren.bottomLeft.onpointerdown = (e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          let box = { height: this.height, width: this.width };
          if (!this.__xCenter) {
            this.top = this.top;
          }
          if (!this.__yCenter) {
            this.right = this.right;
          }
          (e.currentTarget as HTMLElement).onpointermove = (ev) => {
            this.height =
              box.height +
              (this.__xCenter
                ? (ev.clientY - e.clientY) * 2
                : ev.clientY - e.clientY);
            this.width =
              box.width +
              (this.__xCenter
                ? (e.clientX - ev.clientX) * 2
                : e.clientX - ev.clientX);
          };
        };
      }
      if (size.includes("r")) {
        this.__sizer.appendChild(
          (this.__sizerChildren.bottomRight = document.createElement("div"))
        ).className = "bottomRight";
        this.__sizerChildren.bottomRight.onpointerdown = (e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          let box = { height: this.height, width: this.width };
          if (!this.__xCenter) {
            this.top = this.top;
          }
          if (!this.__yCenter) {
            this.left = this.left;
          }
          (e.currentTarget as HTMLElement).onpointermove = (ev) => {
            this.height =
              box.height +
              (this.__xCenter
                ? (ev.clientY - e.clientY) * 2
                : ev.clientY - e.clientY) -
              2;
            this.width =
              box.width +
              (this.__xCenter
                ? (ev.clientX - e.clientX) * 2
                : ev.clientX - e.clientX) -
              2;
          };
        };
      }
    }
    if (size.includes("r")) {
      this.__sizer.classList.add("right");
      this.classList.add("right");
      this.__sizer.appendChild(
        (this.__sizerChildren.right = document.createElement("div"))
      ).className = "right";
      this.__sizerChildren.right.onpointerdown = (e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        let box = { height: this.height, width: this.width };
        if (!this.__yCenter) {
          this.left = this.left;
        }
        (e.currentTarget as HTMLElement).onpointermove = (ev) => {
          this.width =
            box.width +
            (this.__xCenter
              ? (ev.clientX - e.clientX) * 2
              : ev.clientX - e.clientX) -
            2;
        };
      };
    }
    if (size.includes("l")) {
      this.__sizer.classList.add("left");
      this.classList.add("left");
      this.__sizer.appendChild(
        (this.__sizerChildren.left = document.createElement("div"))
      ).className = "left";
      this.__sizerChildren.left.onpointerdown = (e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        let box = { height: this.height, width: this.width };
        if (!this.__yCenter) {
          this.right = this.right;
        }
        (e.currentTarget as HTMLElement).onpointermove = (ev) => {
          this.width =
            box.width +
            (this.__xCenter
              ? (e.clientX - ev.clientX) * 2
              : e.clientX - ev.clientX);
        };
      };
    }

    if (size.includes("v")) {
      this.classList.add("visible");
      if (this.__sizerChildren.top)
        this.__sizerChildren.top.appendChild(drag_handle_horz());
      if (this.__sizerChildren.bottom)
        this.__sizerChildren.bottom.appendChild(drag_handle_horz());
      if (this.__sizerChildren.left)
        this.__sizerChildren.left.appendChild(drag_handle_vert());
      if (this.__sizerChildren.right)
        this.__sizerChildren.right.appendChild(drag_handle_vert());
    } else this.classList.remove("visible");
  }

  /**Updates the size to fit limits */
  private __updateSize() {
    if (this.__width) {
      this.width = this.width;
    }
    if (this.__height) {
      this.height = this.height;
    }
  }

  /**This sets the x coordinate of the window (left) in rem*/
  set width(width: number | string) {
    switch (typeof width) {
      case "number":
        if (this.__width === false)
          this.__contentContainer.style.width = "100%";
        if (width < this.__minWidthBuff) width = this.__minWidthBuff;
        this.__width = width;
        this.style.width = width + "px";
        break;
      case "string":
        this.__width = false;
        if (width == "content") {
          this.style.width = "min-content";
          this.__contentContainer.style.width = "min-content";
        } else if (width.includes("%"))
          this.style.width = parseFloat(width) + "%";
        break;
    }
  }
  get width(): number {
    return this.__width === false
      ? this.getBoundingClientRect().width
      : (this.__width as number);
  }

  /**This sets the y coordinate of the window (top) */
  set height(height: number | string) {
    switch (typeof height) {
      case "number":
        if (this.__height === false)
          this.__contentContainer.style.height = "100%";
        if (height < this.__minHeightBuff + titleHeight)
          height = this.__minHeightBuff + titleHeight;
        this.__height = height;
        this.style.height = height + "px";
        break;
      case "string":
        this.__height = false;
        if (height == "content") {
          this.style.height = "min-content";
          this.__contentContainer.style.height = "min-content";
        } else if (height.includes("%"))
          this.style.height = parseFloat(height) + "%";
        break;
    }
  }
  get height(): number {
    return this.__height === false
      ? this.getBoundingClientRect().height
      : (this.__height as number);
  }

  /**This sets the x coordinate of the window (left) in rem*/
  set maxWidth(width: number | string) {
    this.style.maxWidth = "";
    this.__maxWidth = true;
    switch (typeof width) {
      case "number": {
        this.style.maxWidth = width + "px";
        break;
      }
      case "string": {
        if (width.includes("%")) this.style.maxWidth = parseFloat(width) + "%";
        break;
      }
      default: {
        delete this.__maxWidth;
      }
    }
  }

  /**This sets the y coordinate of the window (top)*/
  set maxHeight(height: number | string) {
    this.style.maxHeight = "";
    this.__maxHeight = true;
    switch (typeof height) {
      case "number": {
        this.style.maxHeight = height + "px";
        break;
      }
      case "string": {
        if (height.includes("%"))
          this.style.maxHeight = parseFloat(height) + "%";
        break;
      }
      default: {
        delete this.__maxHeight;
      }
    }
  }

  /**This sets the x coordinate of the window (left) in rem*/
  set minWidth(width: number | string) {
    this.style.minWidth = "";
    this.__minWidth = true;
    switch (typeof width) {
      case "number": {
        this.style.minWidth = width + "px";
        break;
      }
      case "string": {
        if (width.includes("%")) this.style.minWidth = parseFloat(width) + "%";
        break;
      }
      default: {
        delete this.__minWidth;
      }
    }
  }

  /**This sets the y coordinate of the window (top) */
  set minHeight(height: number | string) {
    this.style.minHeight = "";
    this.__minHeight = true;
    switch (typeof height) {
      case "number": {
        this.style.minHeight = height + "px";
        break;
      }
      case "string": {
        if (height.includes("%"))
          this.style.minHeight = parseFloat(height) + "%";
        break;
      }
      default: {
        delete this.__minHeight;
      }
    }
  }

  //###################################################################
  //Movement
  /**This sets what position type the window uses
   * pass 'fixed' for fixed position, and anything else for absoloute*/
  set position(pos: string) {
    if (pos == "fixed") {
      this.style.position = "fixed";
    } else {
      this.style.position = "absoloute";
    }
  }

  /**This toggles if the window is moveable
   * @param move truthy is moveable, falsy is none moveable*/
  set moveable(move: boolean) {
    if (move) {
      this.__moveable = true;
      let title = this.__title;
      title.setAttribute("moveable", "1");
      title.onpointerdown = (e) => {
        title.setAttribute("moveable", "2");
        title.setPointerCapture(e.pointerId);
        let moveBuff = {
          winLeft: this.left,
          winTop: this.top,
          winRight: this.right,
          winBottom: this.bottom,
        };
        let box = this.__parent!.getBoundingClientRect();
        let halfX = box.left + box.width / 2;
        let halfY = box.top + box.height / 2;
        title.onpointermove = (ev) => {
          if (ev.clientX > halfX)
            this.right = moveBuff.winRight + e.clientX - ev.clientX;
          else this.left = moveBuff.winLeft + ev.clientX - e.clientX;
          if (ev.clientY > halfY)
            this.bottom = moveBuff.winBottom + e.clientY - ev.clientY;
          else this.top = moveBuff.winTop + ev.clientY - e.clientY;
        };
      };
      title.onpointerup = (e) => {
        title.releasePointerCapture(e.pointerId);
        title.setAttribute("moveable", "1");
        title.onpointermove = null;
        this._windowEvents.emit("moved", {});
      };
    } else {
      delete this.__moveable;
      this.__title.removeAttribute("moveable");
      this.__title.onpointermove = null;
      this.__title.onpointerdown = null;
      this.__title.onpointerup = null;
    }
  }
  /**This returns wether the window is moveable by the user*/
  get moveable(): boolean {
    return this.__moveable || false;
  }

  /**Checks if the window is within the browsers limits, and moves back within the limits*/
  private __checkLimits() {
    if (this.__left) this.left = this.left;
    if (this.__top) this.top = this.top;
  }

  /**This sets the x coordinate of the window (left)*/
  set left(left: number | string) {
    switch (typeof left) {
      case "number":
        this.__xCenter = false;
        //This is the limit for the left side of the window
        if (left < -(this.width - leftWindowLimit - this.__parent!.__savedLeft))
          left = -(this.width - leftWindowLimit - this.__parent!.__savedLeft);

        let innerW =
          this.__parent!.__savedWidth -
          this.__parent!.__savedRight -
          rightWindowLimit;
        //This is the limit for the right side of the window
        if (left > innerW) left = innerW;
        this.__left = left;
        this.style.left = left + "px";
        break;
      case "string":
        if (left == "center") {
          this.__left = false;
          this.__xCenter = true;
          this.style.left = "";
        } else if (left.includes("%")) {
          this.__left = false;
          this.style.left = parseFloat(left) + "%";
        }
        break;
      default: {
        return;
      }
    }
    this.style.right = "";
    this.__right = false;
  }
  /**This gets the amount of px offset from the left of the container*/
  get left(): number {
    return this.__left === false
      ? this.getBoundingClientRect().left - this.__parent!.__savedLeft
      : this.__left;
  }
  /**Sets left of window from Window coordinates (accounts for window manager)*/
  set windowLeft(left: number) {
    this.left = left - (this.__parent!.__savedLeft || 0);
  }

  /**This sets the top coordinate of the window (top)*/
  set top(top: number | string) {
    switch (typeof top) {
      case "number":
        this.__yCenter = false;
        //This is the limit for the top of the window
        if (top < 0) {
          top = 0;
        }
        let innerH =
          this.__parent!.__savedHeight -
          this.__parent!.__savedTop -
          topWindowLimit;
        //This is the limit for the right side of the window
        if (top > innerH) {
          top = innerH;
        }
        this.__top = top;
        this.style.top = top + "px";
        break;
      case "string":
        if (top == "center") {
          this.__top = false;
          this.__yCenter = true;
          this.style.top = "";
        } else if (top.includes("%")) {
          this.__top = false;
          this.style.top = parseFloat(top) + "%";
        }
        break;
      default: {
        return;
      }
    }
    this.style.bottom = "";
    this.__bottom = false;
  }
  /**This gets the amount of px offset from the top of the container*/
  get top(): number {
    return this.__top === false
      ? this.getBoundingClientRect().top - this.__parent!.__savedTop
      : this.__top;
  }
  /**Sets top of window from Window coordinates (accounts for window manager)*/
  set windowTop(top: number) {
    this.top = top - (this.__parent!.__savedTop || 0);
  }

  /**This sets the x coordinate of the window (right)*/
  set right(right: number | string) {
    if (typeof right == "number") {
      this.__xCenter = false;
      this.__left = false;
      if (
        right < -(this.width - rightWindowLimit - this.__parent!.__savedRight)
      ) {
        right = -(this.width - rightWindowLimit - this.__parent!.__savedRight);
      }
      let innerW =
        this.__parent!.__savedWidth -
        this.__parent!.__savedLeft -
        leftWindowLimit;
      if (right > innerW) {
        right = innerW;
      }
      this.__right = right;
      this.style.right = right + "px";
      this.style.left = "";
    }
  }
  /**This gets the amount of px offset from the right of the container */
  get right(): number {
    if (this.__right === false) {
      let box = this.getBoundingClientRect();
      return (
        this.__parent!.__savedWidth + this.__parent!.__savedRight - box.right
      );
    } else {
      return this.__right;
    }
  }
  /**Sets right of window from Window coordinates (accounts for window manager)*/
  set windowRight(right: number) {
    this.right = right - (this.__parent!.__savedRight || 0);
  }

  /**This sets the top coordinate of the window (bottom) */
  set bottom(bottom: number | string) {
    if (typeof bottom == "number") {
      //This is the limit for the top of the window
      this.__yCenter = false;
      this.__top = false;
      if (
        bottom <
        -(this.height - bottomWindowLimit - this.__parent!.__savedBottom)
      )
        bottom = -(
          this.height -
          bottomWindowLimit -
          this.__parent!.__savedBottom
        );

      let innerH =
        this.__parent!.__savedHeight +
        this.__parent!.__savedBottom -
        this.height;
      if (bottom > innerH) bottom = innerH;
      this.__bottom = bottom;
      this.style.bottom = bottom + "px";
      this.style.top = "";
    }
  }
  /**This gets the amount of px offset from the bottom of the container */
  get bottom(): number {
    if (this.__bottom === false) {
      let box = this.getBoundingClientRect();
      return (
        this.__parent!.__savedHeight + this.__parent!.__savedTop - box.bottom
      );
    } else return this.__bottom;
  }
  /**Sets bottom of window from Window coordinates (accounts for window manager)*/
  set windowBottom(bottom: number) {
    this.bottom = bottom - (this.__parent!.__savedBottom || 0);
  }

  //###################################################################
  //Popout
  popOut() {
    let window = this.ownerDocument.defaultView!;
    new ExternalWindow({
      width: this.width,
      height: this.height,
      top: window.screenY + window.outerHeight - window.innerHeight + this.top,
      left: window.screenX + this.left,
      root: this.content,
    });
  }
}
defineElement(UIWindow);

//#############################################################################################
//#   __          ___           _                 __  __                                      #
//#   \ \        / (_)         | |               |  \/  |                                     #
//#    \ \  /\  / / _ _ __   __| | _____      __ | \  / | __ _ _ __   __ _  __ _  ___ _ __    #
//#     \ \/  \/ / | | '_ \ / _` |/ _ \ \ /\ / / | |\/| |/ _` | '_ \ / _` |/ _` |/ _ \ '__|   #
//#      \  /\  /  | | | | | (_| | (_) \ V  V /  | |  | | (_| | | | | (_| | (_| |  __/ |      #
//#       \/  \/   |_|_| |_|\__,_|\___/ \_/\_/   |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|      #
//#                                                                         __/ |             #
//#                                                                        |___/              #
//#############################################################################################

/**Resize observer for window manager*/
let sizeObserver = new ResizeObserver((e) => {
  for (let i = 0, m = e.length; i < m; i++) {
    let t = e[i].target as WindowManager;
    t.checkLimits();
    let box = t.getBoundingClientRect();
    let owner = t.ownerDocument.defaultView;
    t.__savedTop = box.top;
    t.__savedLeft = box.left;
    t.__savedBottom = box.bottom - owner!.innerHeight;
    t.__savedRight = box.right - owner!.innerWidth;
    t.__savedWidth = box.width;
    t.__savedHeight = box.height;
    t.__savedBottomLimit = t.__savedHeight - remToPx(bottomWindowLimit);
  }
});

/*Windows share the z-index 10000*/
//Context for windows is setup outside document to prevent interaction
export class WindowManager extends WebComponent {
  /**Returns the name used to define the element */
  static elementName() {
    return "window-manager";
  }

  /**This stores the windows in the window manager*/
  private __windows: UIWindow[] = [];
  /**This stores the window in focus for this manager*/
  private __focusedWindow: UIWindow | null = null;
  /**This stores the layer containers*/
  private __layers:
    | { container: HTMLDivElement; windows: UIWindow[] }[]
    | undefined[] = [];
  /**Listener for ui scale changes*/
  private __scaleListener: () => void = () => {
    this.updateLimits();
    this.updateSizes();
  };
  /**Listener for ui touch mode*/
  private __touchListener: () => void = () => {
    this.updateSizes();
  };
  /**Stores the size of the window manger*/
  __savedBottomLimit?: number;
  __savedTopLimit?: number;
  __savedLeftLimit?: number;
  __savedRightLimit?: number;

  __savedTop: number = 0;
  __savedLeft: number = 0;
  __savedBottom: number = 0;
  __savedRight: number = 0;
  __savedWidth: number = 0;
  __savedHeight: number = 0;

  constructor() {
    super();
    sizeObserver.observe(this);
  }

  connectedCallback() {
    scale.addListener(this.__scaleListener);
    touch.addListener(this.__touchListener);
  }
  disconnectedCallback() {
    scale.removeListener(this.__scaleListener);
    touch.removeListener(this.__touchListener);
  }

  /**Updates sizes of all windows in manager*/
  checkLimits() {
    for (let i = 0; i < this.__windows.length; i++)
      //@ts-expect-error
      this.__windows[i].__checkLimits();
  }

  /**Updates sizes of all windows in manager*/
  updateSizes() {
    for (let i = 0; i < this.__windows.length; i++)
      //@ts-expect-error
      this.__windows[i].__updateSize();
  }

  /**Updates the buffered limits of window manager */
  updateLimits() {
    this.__savedBottomLimit =
      this.__savedTop + this.__savedHeight - remToPx(bottomWindowLimit);
    this.__savedTopLimit = remToPx(topWindowLimit);
    this.__savedLeftLimit = remToPx(leftWindowLimit);
    this.__savedRightLimit = remToPx(rightWindowLimit);
  }

  /**This creates a window layer */
  createLayer(layer: number) {
    if (!this.__layers[layer])
      this.appendChild(
        (this.__layers[layer] = {
          container: document.createElement("div"),
          windows: [],
        }).container
      ).style.zIndex = String(layer);
  }

  /**This appends the window to the windowmanager
   * @param  wind window to append
   * @param  dontSelect set true to prevent automatic window selection*/
  appendWindow(wind: UIWindow, dontSelect?: boolean) {
    if (wind.windowManager instanceof WindowManager)
      wind.windowManager.removeWindow(wind);
    //@ts-expect-error
    let layerNum = wind.__layer;
    if (!this.__layers[layerNum]) this.createLayer(layerNum);
    let layer = this.__layers[layerNum]!;
    //@ts-expect-error
    wind.__parent = this;
    layer.container.appendChild(wind).style.zIndex = String(
      layer.windows.length
    );
    layer.windows.push(wind);
    this.__windows.push(wind);
    if (!dontSelect) wind.select();
    return wind;
  }
  /** Removes window from manager*/
  removeWindow(wind: UIWindow, nonPermanent?: boolean) {
    let layer = this.__layers[wind.layer]!;
    let index = layer.windows.indexOf(wind);
    if (index != -1) {
      layer.windows.splice(index, 1);
      layer.container.removeChild(wind);
      if (layer.windows.length == 0) {
        this.removeChild(layer.container);
        this.__layers[wind.layer] = undefined;
      }
    }
    if (!nonPermanent) {
      index = this.__windows.indexOf(wind);
      if (index != -1) this.__windows.splice(index, 1);
    }
    return wind;
  }

  /** Changes the layer of a window*/
  changeLayer(wind: UIWindow, layer: number) {
    layer = Math.round(layer);
    this.removeWindow(wind, true);
    if (!this.__layers[layer]) this.createLayer(layer);
    let newLayer = this.__layers[layer]!;
    newLayer.container.appendChild(wind);
    newLayer.windows.push(wind);
    //@ts-expect-error
    wind.__layer = layer;
  }

  /**This returns a copy of the list of all windows*/
  windows(): UIWindow[] {
    return [...this.__windows];
  }

  /**This closes all windows in the manager
   *returns nothing on success*/
  async closeAllWindows() {
    let results: {
      content: ContentBase;
      reason: string;
      window: UIWindow;
    }[] = [];
    let failed = false;
    while (this.__windows.length > 0) {
      let res = await this.__windows[0].close();
      if (res) {
        results.push(res);
        failed = true;
        break;
      }
    }
    if (failed)
      return {
        manager: this,
        windows: results,
      };
    return undefined;
  }

  /**This selects the window*/
  focusWindow(wind: UIWindow) {
    if (wind == this.__focusedWindow) return;
    let layer = this.__layers[wind.layer]!;
    let index = layer.windows.indexOf(wind);
    if (index != -1) {
      layer.windows.push(...layer.windows.splice(index, 1));
      for (let i = 0, m = layer.windows.length; i < m; i++)
        layer.windows[i].style.zIndex = String(i);
      this.__focusedWindow = wind;
      activeWindow = wind;
      activeWindowManager = this;
    }
  }
}
defineElement(WindowManager);

/**Returns the window manager of the main document*/
export let mainWindowManager = new WindowManager();

/**Contains the active window manager, meaning the window manager last interacted with*/
export let activeWindowManager: WindowManager = mainWindowManager;

/**Returns the active window, meaning the window last interacted with*/
export let activeWindow: UIWindow | null = null;

/**Finds the window manager of the owner document for the element*/
export let getWindowManager = (elem: HTMLElement): WindowManager => {
  return elem.ownerDocument.windowManager;
};

/**The windowmanager related to the component*/
export function getWindowManagerFromElement(
  elem: Element | Content
): WindowManager {
  return elem.ownerDocument.windowManager;
}

//Appends the main window manager to the main document
declare global {
  interface Document {
    windowManager: WindowManager;
  }
}
document.documentElement.appendChild(mainWindowManager);
document.windowManager = mainWindowManager;
Object.defineProperty(HTMLElement.prototype, "windowManager", {
  get() {
    return this.ownerDocument.windowManager;
  },
});

//#######################################################################################
//    ______      _                        _  __          ___           _               #
//   |  ____|    | |                      | | \ \        / (_)         | |              #
//   | |__  __  _| |_ ___ _ __ _ __   __ _| |  \ \  /\  / / _ _ __   __| | _____      __#
//   |  __| \ \/ / __/ _ \ '__| '_ \ / _` | |   \ \/  \/ / | | '_ \ / _` |/ _ \ \ /\ / /#
//   | |____ >  <| ||  __/ |  | | | | (_| | |    \  /\  /  | | | | | (_| | (_) \ V  V / #
//   |______/_/\_\\__\___|_|  |_| |_|\__,_|_|     \/  \/   |_|_| |_|\__,_|\___/ \_/\_/  #
//#######################################################################################

/**Stores all external windows*/
let externalWindows: ExternalWindow[] = [];

//This adds a listner to close all external windows when page is closed or refreshed
window.addEventListener("beforeunload", () => {
  for (let i = 0; i < externalWindows.length; i++) externalWindows[i].close();
});

/**Defines options for external window*/
type ExternalWindowOptions = {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  /**root to append to new external window, if nothing is passed, it creates it's own */
  root?: ContextContainerBase | ContentBase;
};

export class ExternalWindow {
  private __window: Window;
  /**Listners for ui events*/
  private __scaleListener: () => void = () => {
    applyScale(this.__window.document);
  };
  private __touchListener: () => void = () => {
    applyTouch(this.__window.document);
  };
  private __animationListener: () => void = () => {
    applyAnimation(this.__window.document);
  };
  private __themeListener: () => void = () => {
    applyTheme(this.__window.document);
  };

  root: ContentContainerBase;

  /**Automatic closing when last conent is removed from root*/
  private __removedListener: ESubscriber<
    "lastClosed",
    ContentContainerBase,
    ContentContainerEvents["lastClosed"]
  > = () => {
    this.close();
    return false;
  };
  /**External windows window manager */
  private __windowManager: WindowManager = new WindowManager();

  constructor(options: ExternalWindowOptions) {
    if (typeof options.width === "undefined") options.width = 200;
    if (typeof options.height === "undefined") options.height = 200;
    if (typeof options.left === "undefined") options.left = 20;
    if (typeof options.top === "undefined") options.top = 20;
    let windowOpen = window.open(
      "",
      "",
      "status=no,width=" +
        options.width +
        ",height=" +
        options.height +
        ",left=" +
        options.left +
        ",top=" +
        options.top
    );
    if (!windowOpen) throw new Error("Popup blocked by browser");
    this.__window = windowOpen;

    /**Copies all head nodes to the new window */
    let headNodes = document.head.childNodes;
    for (let i = 0, m = headNodes.length; i < m; i++) {
      if (headNodes[i] instanceof HTMLLinkElement) {
        let link = headNodes[i].cloneNode(true) as HTMLLinkElement;
        let href = link.href;
        link.href = href;
        this.__window.document.head.appendChild(link);
      }
      if (
        headNodes[i] instanceof HTMLMetaElement ||
        headNodes[i] instanceof HTMLTitleElement ||
        headNodes[i] instanceof HTMLStyleElement
      )
        this.__window.document.head.appendChild(headNodes[i].cloneNode(true));
    }

    //Copy styles on root node
    for (let i = 0, m = document.documentElement.style.length; i < m; i++) {
      let prop = document.documentElement.style[i];
      this.__window.document.documentElement.style.setProperty(
        prop,
        document.documentElement.style.getPropertyValue(prop)
      );
    }

    //Listeneres for ui events
    scale.addListener(this.__scaleListener);
    touch.addListener(this.__touchListener);
    animations.addListener(this.__animationListener);
    theme.addListener(this.__themeListener);

    applyGlobalCopyPaste(this.__window.document);

    //Listener for window closing
    this.__window.onbeforeunload = () => {
      this.close(true);
    };

    this.root = new ContentContainer();
    this.__window.document.body.appendChild(this.root);
    /**Context Container is added
     * @type {import('./context').ContextContainer}*/
    if (options.root instanceof Content) {
      this.root.content = options.root;
    }

    /**Automatic closing when last conent is removed from root*/
    this.root.contentContainerEvents.on("lastClosed", this.__removedListener);

    /**Window Manager is created*/
    this.__window.document.windowManager = this.__windowManager;
    this.__window.document.documentElement.appendChild(this.__windowManager);

    //Context menu preventer
    this.__window.document.documentElement.oncontextmenu = (e) => {
      e.preventDefault();
    };

    this.__window.document.documentElement.classList.add("external");
    externalWindows.push(this);
  }

  /**Method for closing external window
   * @param dontClose set true to prevent calling window.close*/
  close(dontClose?: boolean) {
    let root = this.root;
    /**Cleanup of listeners */
    root.contentContainerEvents.off("lastClosed", this.__removedListener);
    scale.removeListener(this.__scaleListener);
    touch.removeListener(this.__touchListener);
    animations.removeListener(this.__animationListener);
    theme.removeListener(this.__themeListener);

    let content = root.content;
    if (content instanceof Content) {
      let rootWindow = new UIWindow().options({
        width: this.__window.innerWidth,
        height: this.__window.innerHeight + titleHeight,
        content,
      });
      mainWindowManager.appendWindow(rootWindow);
    }
    let windows = this.__windowManager.windows();
    for (let i = 0; i < windows.length; i++) {
      mainWindowManager.appendWindow(windows[i]);
    }
    if (!dontClose) {
      this.__window.close();
    }
  }
}
