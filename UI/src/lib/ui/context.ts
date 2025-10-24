import { type BaseOptions, defineElement } from "@libBase";
import { blue, grey, orange } from "@libColors";
import { svg, WebComponent } from "@libCommon";
import { E, type ESubscriber } from "@libEvent";
import { close } from "@libIcons";
import { addThemeVariable } from "@libTheme";
import {
  type ContentBase,
  type ContentEvents,
  type ContextBase,
  type ContextContainerBase,
  remToPx,
  scale,
  touch,
} from "./common";
import {
  Content,
  type ContentBaseOptions,
  ContentContainer,
  type ContentMinSize,
  selectedContent,
} from "./content";
import "./context.scss";
import { attachContextMenu, type ContextMenuLines } from "./contextMenu";
import content_tab from "./icons/content_tab.svg";
import split_internal_down from "./icons/split_internal_down.svg";
import split_internal_left from "./icons/split_internal_left.svg";
import split_internal_right from "./icons/split_internal_right.svg";
import split_internal_up from "./icons/split_internal_up.svg";
import { UIWindow } from "./windows";

addThemeVariable(
  "snapperContentHighlight",
  ["UI", "Tabs"],
  "#9E9E9E60",
  "#61616160"
);
addThemeVariable(
  "snapperTabsHighlight",
  ["UI", "Tabs"],
  "#9E9E9E90",
  "#61616190"
);
addThemeVariable("tabBackGround", ["UI", "Tabs"], grey["200"], grey["800"]);
addThemeVariable("tabColor", ["UI", "Tabs"], grey["400"], grey["600"]);
addThemeVariable("tabColorHover", ["UI", "Tabs"], grey["500"], grey["500"]);
addThemeVariable(
  "tabColorCloserHover",
  ["UI", "Tabs"],
  grey["600"],
  grey["600"]
);
addThemeVariable("tabColorSelect", ["UI", "Tabs"], grey["50"], grey["900"]);
addThemeVariable("tabCornerRadius", ["UI", "Tabs"], "0rem", "0rem");
addThemeVariable("tabTextColor", ["UI", "Tabs"], grey["900"], grey["300"]);
addThemeVariable("tabFocusColor", ["UI", "Tabs"], orange["900"], orange["600"]);
addThemeVariable("tabIconColor", ["UI", "Tabs"], grey["900"], grey["300"]);
addThemeVariable(
  "contextGroupBackGroundColor",
  ["UI", "Context Group"],
  grey["400"],
  grey["900"]
);
addThemeVariable(
  "contextGroupIconColor",
  ["UI", "Context Group"],
  grey["900"],
  grey["300"]
);
addThemeVariable(
  "contextGroupSizerColor",
  ["UI", "Context Group"],
  blue["300"],
  blue["600"]
);
addThemeVariable(
  "contextGroupDeviderColor",
  ["UI", "Context Group"],
  grey["500"],
  grey["600"]
);

//#####################################################################################################################################################################################
//#     _____            _            _      ##########################################################################################################################################
//#    / ____|          | |          | |     ##########################################################################################################################################
//#   | |     ___  _ __ | |_ _____  _| |_    ##########################################################################################################################################
//#   | |    / _ \| '_ \| __/ _ \ \/ / __|   ##########################################################################################################################################
//#   | |___| (_) | | | | ||  __/>  <| |_    ##########################################################################################################################################
//#    \_____\___/|_| |_|\__\___/_/\_\\__|   ##########################################################################################################################################
//#####################################################################################################################################################################################

//Listener for ui scale to recalculate window min sizes
let tabsHeight = remToPx(2);
touch.addListener((val) => {
  tabsHeight = remToPx(val ? 2.3 : 1.8);
});
scale.addListener((_val) => {
  tabsHeight = remToPx(touch.get ? 2.3 : 1.8);
});

type ContextDropper = {
  center: HTMLImageElement;
  count: number;
  dropTarget: null | HTMLImageElement;
  right: null | HTMLImageElement;
  left: null | HTMLImageElement;
  top: null | HTMLImageElement;
  bottom: null | HTMLImageElement;
} & HTMLElement;

let contextDropper = document.createElement(
  "lib-context-dropper"
) as ContextDropper;
{
  contextDropper.ondragover = (ev) => {
    ev.stopPropagation();
    if (draggingTab) {
      ev.preventDefault();
    }
  };
  contextDropper.dropTarget = null;
  contextDropper.center = new Image();
  contextDropper.center.src = content_tab;
  contextDropper.appendChild(contextDropper.center).classList.add("center");
  contextDropper.center.ondragenter = (ev) => {
    contextDropper.dropTarget = contextDropper.center;
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count++;
    }
  };
  contextDropper.right = new Image();
  contextDropper.right.src = split_internal_right;
  contextDropper.appendChild(contextDropper.right).classList.add("right");
  contextDropper.right.ondragenter = (ev) => {
    contextDropper.dropTarget = contextDropper.right;
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count++;
    }
  };
  contextDropper.left = new Image();
  contextDropper.left.src = split_internal_left;
  contextDropper.appendChild(contextDropper.left).classList.add("left");
  contextDropper.left.ondragenter = (ev) => {
    contextDropper.dropTarget = contextDropper.left;
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count++;
    }
  };
  contextDropper.top = new Image();
  contextDropper.top.src = split_internal_up;
  contextDropper.appendChild(contextDropper.top).classList.add("top");
  contextDropper.top.ondragenter = (ev) => {
    contextDropper.dropTarget = contextDropper.top;
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count++;
    }
  };
  contextDropper.bottom = new Image();
  contextDropper.bottom.src = split_internal_down;
  contextDropper.appendChild(contextDropper.bottom).classList.add("bottom");
  contextDropper.bottom.ondragenter = (ev) => {
    contextDropper.dropTarget = contextDropper.bottom;
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count++;
    }
  };
  contextDropper.count = 0;
  contextDropper.ondragenter = (ev) => {
    contextDropper.dropTarget = null;
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count++;
    }
  };
  contextDropper.ondragleave = (ev) => {
    ev.stopPropagation();
    if (draggingTab) {
      contextDropper.count--;
      if (contextDropper.count === 0) {
        contextDropper.remove();
      }
    }
  };
}

/**Defines options for context*/
type ContextOptions = {
  /**whether the context tabs are shown */
  tabs?: boolean | "auto";
  /**list of content to add to context */
  content?: ContentBase[];
  /**whether the context is a droptarget */
  dropTarget?: boolean;
  /**whether the context should auto close */
  autoClose?: boolean;
} & ContentBaseOptions;

export class Context extends Content<ContextOptions> implements ContentBase {
  /**Returns the name used to define the element */
  static elementName() {
    return "context";
  }

  /**List of all stored contents in order*/
  private __contents: ContentBase[] = [];
  /**The currently focused content in the context*/
  private __lastSelected?: ContentBase;
  private __focused?: ContentBase;
  /**Container for tabs*/
  private __tabs?: HTMLDivElement;
  /**List of tabs for content */
  private __tabsList: Tab[] = [];
  /**Wether the tabs are shown or not*/
  private __tabsShown = true;
  /**Mode for tab showing, 0 = manual, 1 = auto*/
  private __tabMode = 0;
  /**The currently focused content in the context*/
  private __focusedTab?: Tab;
  /**Whether content can be dropped in this context*/
  private __dropTarget = false;
  /**Whether context is closed when all content are removed*/
  private __autoClose = false;
  /**Stores listener for content name change*/
  private __nameListener: ESubscriber<
    "name",
    ContentBase,
    ContentEvents["name"]
  > = (e) => {
    this._contentEvents.emit("name", e.data);
  };
  /**Stores listener for content symbol change*/
  private __symbolListener: ESubscriber<
    "symbol",
    ContentBase,
    ContentEvents["symbol"]
  > = (e) => {
    this._contentEvents.emit("symbol", e.data);
  };
  /**Stores listener for content symbol change*/
  private __sizeListener: ESubscriber<
    "minSize",
    ContentBase,
    ContentEvents["minSize"]
  > = (e) => {
    this._contentEvents.emit("minSize", {
      ...e.data,
    });
    return false;
  };

  constructor() {
    super();
    this.ondragenter = (ev) => {
      ev.stopPropagation();
      if (draggingTab) {
        contextDropper.count = 0;
        if (this.__dropTarget) {
          contextDropper.classList.remove("groups", "center");
          //@ts-expect-error
          if (this.___container instanceof ContextContainer) {
            //@ts-expect-error
            if (this.__contents.includes(draggingTab.__content)) {
              if (this.__contents.length > 1) {
                this.appendChild(contextDropper);
                contextDropper.classList.add("groups");
              }
            } else {
              this.appendChild(contextDropper);
              contextDropper.classList.add("center");
              if (this.__contents.length > 0) {
                this.appendChild(contextDropper);
                contextDropper.classList.add("groups");
              }
            }
          } else {
            //@ts-expect-error
            if (!this.__contents.includes(draggingTab.__content)) {
              this.appendChild(contextDropper);
              contextDropper.classList.add("center");
            }
          }
        }
      }
    };

    this.ondrop = (ev) => {
      ev.stopPropagation();
      if (draggingTab) {
        switch (contextDropper.dropTarget) {
          case contextDropper.center: {
            //@ts-expect-error
            this.addContent(draggingTab.__content);
            //@ts-expect-error
            this.__focusContent(draggingTab.__content);
            break;
          }
          case contextDropper.left: {
            //@ts-expect-error
            this.___container.__split(
              this,
              ContextContainerSplitWay.LEFT,
              //@ts-expect-error
              draggingTab.__content
            );
            break;
          }
          case contextDropper.right: {
            //@ts-expect-error
            this.___container.__split(
              this,
              ContextContainerSplitWay.RIGHT,
              //@ts-expect-error
              draggingTab.__content
            );
            break;
          }
          case contextDropper.top: {
            //@ts-expect-error
            this.___container.__split(
              this,
              ContextContainerSplitWay.UP,
              //@ts-expect-error
              draggingTab.__content
            );
            break;
          }
          case contextDropper.bottom: {
            //@ts-expect-error
            this.___container.__split(
              this,
              ContextContainerSplitWay.DOWN,
              //@ts-expect-error
              draggingTab.__content
            );
            break;
          }
        }
      }
    };
    this.classList.add("contentContainer");
    let tabsContainer = this.appendChild(document.createElement("div"));
    tabsContainer
      .appendChild((this.__tabs = document.createElement("div")))
      .classList.add("tabs");
    this.__tabs.ondragenter = (ev) => {
      ev.stopPropagation();
    };
    this.__tabs.ondragleave = (ev) => {
      ev.stopPropagation();
    };
    this.__tabs.onwheel = (e) => {
      tabsContainer.scrollBy(e.deltaY, 0);
    };
  }

  /** Builds context*/
  options(options: ContextOptions): this {
    super.options(options);
    if (typeof options.tabs !== "undefined") this.tabs = options.tabs;
    else this.tabs = true;
    if (typeof options.dropTarget !== "undefined")
      this.dropTarget = options.dropTarget;
    if (typeof options.autoClose !== "undefined")
      this.autoClose = options.autoClose;
    else this.autoClose = true;
    if (options.content instanceof Array) {
      for (var i = 0, m = options.content.length; i < m; i++)
        this.addContent(options.content[i]);
      options.content[i - 1].select();
    }
    return this;
  }

  /**This selects the content in its parent, if the content is already selected, it will*/
  select() {
    if (this.__focused instanceof Content) {
      if (this.__focused != selectedContent) this.__focused.select();
    } else this._contentEvents.emit("focused", {});
  }

  get selected() {
    return this.__focused;
  }

  /**Content Handling
   * @param  content the content to add
   * @param  index the tab index to insert the content at*/
  addContent<T extends ContentBase>(content: T, index?: number): T {
    if (content.isClosed) {
      console.warn("Content is closed");
      return content;
    }
    index =
      typeof index != "undefined"
        ? Math.min(Math.max(index, 0), this.__contents.length)
        : this.__contents.length;
    //Prevents content from moving to the same position
    if (content.container === this) {
      let oldIndex = this.__contents.indexOf(content);
      let tab = this.__tabsList[oldIndex];
      this.__tabs!.insertBefore(tab, this.__tabsList[index]);
      this.__contents.splice(oldIndex, 1);
      this.__contents.splice(index, 0, content);
      this.__tabsList.splice(oldIndex, 1);
      this.__tabsList.splice(index, 0, tab);
    } else {
      content.remove();
      content.container = this;
      this.__contents.splice(index, 0, content);
      let tab = new Tab({ context: this, content: content });
      this.__tabs!.insertBefore(tab, this.__tabsList[index]);
      this.__tabsList.splice(index, 0, tab);
      if (this.__tabMode == 1 && this.__contents.length == 2) {
        this.__toggleTabs = true;
      }
      tab.__focusListener = content.contentEvents.on("focused", (e) => {
        this.__focusContent(e.target);
      });
      tab.__removedListener = content.contentEvents.on("removed", (e) => {
        this.__removeContent(e.target);
      });
      if (this.__focused === null) this.__focusContent(content);
    }
    return content;
  }

  /**Removes content from context and selects last selected content in context*/
  private __removeContent(content: ContentBase) {
    let index = this.__contents.indexOf(content);
    if (index != -1) {
      this.__contents.splice(index, 1);
      let tab = this.__tabsList.splice(index, 1)[0];
      //@ts-expect-error
      tab.__remove();
      if (tab.__focusListener)
        content.contentEvents.off("focused", tab.__focusListener);
      if (tab.__removedListener)
        content.contentEvents.off("removed", tab.__removedListener);
      this.__tabs!.removeChild(tab);
      if (this.__focused == content) {
        this.__unFocusContent(this.__focused);
        this.__focused = undefined;
        if (this.__contents.length > 0) {
          if (this.__lastSelected) {
            var selectee = this.__lastSelected;
          } else {
            if (this.__contents.length / 2 < index)
              var selectee = this.__contents[index - 1];
            else var selectee = this.__contents[index];
          }
          this.__focusContent(selectee);
          this.__lastSelected = undefined;
        }
      }
      if (this.__lastSelected == content) this.__lastSelected = undefined;
      if (this.__tabMode == 1 && this.__contents.length == 1)
        this.__toggleTabs = false;
      if (this.__contents.length === 0 && this.__autoClose) this.remove();
      return content;
    } else {
      console.warn("Content not in context");
      return content;
    }
  }

  /**This focuses the content in the context if there are multiple*/
  private __focusContent(content: ContentBase) {
    if (content != this.__focused) {
      let index = this.__contents.indexOf(content);
      if (index != -1) {
        if (this.__focused instanceof Content) {
          this.__unFocusContent(this.__focused);
          this.__lastSelected = this.__focused;
          this.replaceChild(content, this.__focused);
        } else {
          this.appendChild(content);
        }
        this.__focused = content;
        content.contentEvents.on("name", this.__nameListener);
        content.contentEvents.on("symbol", this.__symbolListener);
        content.contentEvents.on("minSize", this.__sizeListener);
        this._contentEvents.emit("minSize", this.__focused.minSize);
        if (this.__focusedTab) {
          this.__focusedTab.selected = false;
        }
        this.__focusedTab = this.__tabsList[index];
        this.__focusedTab.selected = true;
        this.__focusedTab.scrollIntoView();
      }
    }
    this._contentEvents.emit("focused", {});
  }

  /**This focuses the content in the context if there are multiple*/
  private __unFocusContent(_content: ContentBase) {
    this.__focused!.contentEvents.off("name", this.__nameListener);
    this.__focused!.contentEvents.off("symbol", this.__symbolListener);
    this.__focused!.contentEvents.off("minSize", this.__sizeListener);
  }

  /**Disabled for context*/
  set minSize(_min: ContentMinSize) {}

  /**Returns the minimum size of the content*/
  get minSize(): ContentMinSize {
    if (this.__focused instanceof Content) {
      let minSize = this.__focused.minSize;
      return { width: minSize.width, height: minSize.height + tabsHeight };
    } else return { width: remToPx(12), height: remToPx(12) };
  }

  /**Returns the short name of the content*/
  get name(): string {
    if (this.__focused instanceof Content) return this.__focused.name;
    return "";
  }

  /**Returns the symbol for the content */
  get symbol(): (() => SVGSVGElement) | undefined {
    if (this.__focused instanceof Content) return this.__focused.symbol;
    return undefined;
  }

  /**This returns a copy of all contents in the context*/
  get content(): ContentBase[] {
    return [...this.__contents];
  }

  /**On close event for handling when the content should be closed, overwrite if content should do anything on closing
   * @returns if closing content is not accepted, return anything truthy*/
  async onClose(): Promise<any> {
    let content = this.content;
    let failed: {
      content: ContentBase;
      reason: string;
    }[] = [];
    for (let i = 0, n = content.length; i < n; i++)
      try {
        let res = await content[i].close();
        if (res) failed.push(res);
      } catch (e) {
        console.warn("Failed while closing contents");
      }
    if (failed) return failed;
  }

  /**This turns on and off the tabs of the context*/
  set tabs(tabs: boolean | string) {
    if (tabs == "auto") {
      this.__tabMode = 1;
      this.__toggleTabs = this.__contents.length > 1;
    } else {
      this.__tabMode = 0;
      this.__toggleTabs = Boolean(tabs);
    }
  }
  /**Returns wether the tabs are shown or not*/
  get tabs(): boolean {
    return this.__tabsShown;
  }

  /**Internal property for toggeling tabs*/
  private set __toggleTabs(tabs: boolean) {
    if (tabs && !this.__tabsShown) {
      this.__tabs!.parentElement!.classList.remove("h");
      this.__tabsShown = true;
    } else if (!tabs && this.__tabsShown) {
      this.__tabs!.parentElement!.classList.add("h");
      this.__tabsShown = false;
    }
  }

  /**Toggles whether content can be dropped in this context*/
  set dropTarget(drop: boolean) {
    this.__dropTarget = Boolean(drop);
  }

  /**Toggles whether the context closes itself when becoming empty*/
  set autoClose(ac: boolean) {
    this.__autoClose = Boolean(ac);
  }

  /**Returns the amount of contents in the context*/
  get amountContent(): number {
    return this.__contents.length;
  }

  /**Returns the content in focus */
  get focused(): ContentBase | undefined {
    return this.__focused;
  }

  /**Pops content into new window */
  //@ts-expect-error
  private __popContent(content: ContentBase) {
    let index = this.__contents.indexOf(content);
    if (index != -1) {
      let box = this.getBoundingClientRect();
      content.remove();
      let wind = new UIWindow().options({
        width: box.width,
        height: box.height,
        content: new ContextContainer().options({
          contents: [content],
          autoClose: true,
        }),
      });
      this.ownerDocument.windowManager.appendWindow(wind);
    }
  }
}
defineElement(Context);

//#####################################################################################################################################################################################
//#     _____            _            _      _____            _        _                    ###########################################################################################
//#    / ____|          | |          | |    / ____|          | |      (_)                   ###########################################################################################
//#   | |     ___  _ __ | |_ _____  _| |_  | |     ___  _ __ | |_ __ _ _ _ __   ___ _ __    ###########################################################################################
//#   | |    / _ \| '_ \| __/ _ \ \/ / __| | |    / _ \| '_ \| __/ _` | | '_ \ / _ \ '__|   ###########################################################################################
//#   | |___| (_) | | | | ||  __/>  <| |_  | |___| (_) | | | | || (_| | | | | |  __/ |      ###########################################################################################
//#    \_____\___/|_| |_|\__\___/_/\_\\__|  \_____\___/|_| |_|\__\__,_|_|_| |_|\___|_|      ###########################################################################################
//#####################################################################################################################################################################################
/**Defines options for button component*/
export type ContextContainerOptions = {
  /**default context to use as primary context*/
  context?: Context;
  /**set true to not create default context*/
  dontFill?: boolean;
  /**whether the contextcontainer should auto close*/
  autoClose: boolean;
  /**contents to add to the container*/
  contents: ContentBase[];
} & ContentBaseOptions;

export const ContextContainerSplitWay = {
  UP: 0,
  DOWN: 1,
  RIGHT: 2,
  LEFT: 3,
} as const;
export type ContextContainerSplitWay =
  (typeof ContextContainerSplitWay)[keyof typeof ContextContainerSplitWay];
export const ContextContainerContentWay = {
  HORZ: 0,
  VERT: 1,
} as const;
export type ContextContainerContentWay =
  (typeof ContextContainerContentWay)[keyof typeof ContextContainerContentWay];

export class ContextContainer
  extends Content<ContextContainerOptions>
  implements ContextContainerBase
{
  /**Returns the name used to define the element */
  static elementName() {
    return "context-container";
  }

  /**The context or container in focus*/
  private __focusedContext?: ContextBase | ContextContainerBase;
  private __nameListener?: ESubscriber<
    "name",
    ContentBase,
    ContentEvents["name"]
  >;
  private __symbolListener?: ESubscriber<
    "symbol",
    ContentBase,
    ContentEvents["symbol"]
  >;
  /**Whether the container is horizontal or vertical */
  private __way: ContextContainerContentWay | null = null;
  /**List of all contexts in the container*/
  private __contexts: (ContextBase | ContextContainerBase)[] = [];
  /**List of listeners for removal*/
  private __removedListeners: ESubscriber<
    "removed",
    ContentBase,
    ContentEvents["removed"]
  >[] = [];
  /**List of listeners for focus*/
  private __focusListeners: ESubscriber<
    "focused",
    ContentBase,
    ContentEvents["focused"]
  >[] = [];
  /**List of listeners for minimum sizes*/
  private __sizeListeners: ESubscriber<
    "minSize",
    ContentBase,
    ContentEvents["minSize"]
  >[] = [];
  /**List of buffers for minimum sizes*/
  private __minSizeBuffer = { width: 0, height: 0 };
  /**List of all contexts in the container*/
  private __deviders: HTMLElement[] = [];
  /**Whether context is closed when all content are removed*/
  private __autoClose: boolean = false;

  /** Builds context*/
  options(options: ContextContainerOptions): this {
    super.options(options);
    if (typeof options.autoClose !== "undefined")
      this.autoClose = options.autoClose;
    if (!options.dontFill) {
      let contaxt = this.appendChild(
        options.context ||
          new Context().options({ dropTarget: true, autoClose: true })
      );
      this.__addContext(0, contaxt);
    }
    if (options.contents instanceof Array)
      for (let i = 0, n = options.contents.length - 1; i <= n; i++)
        this.addContent(options.contents[i]);
    return this;
  }

  set way(way: ContextContainerContentWay) {
    this.classList.remove("vert", "horz");
    this.classList.add(way ? "vert" : "horz");
    this.__way = way;
  }

  /**Returns the short name of the content*/
  get name(): string {
    if (
      this.__focusedContext instanceof Context ||
      this.__focusedContext instanceof ContextContainer
    ) {
      return this.__focusedContext.name;
    } else {
      return "";
    }
  }

  /**Returns the symbol for the content*/
  get symbol(): (() => SVGSVGElement) | undefined {
    if (
      this.__focusedContext instanceof Context ||
      this.__focusedContext instanceof ContextContainer
    ) {
      return this.__focusedContext.symbol;
    }
  }

  /**Toggles whether the context closes itself when becoming empty*/
  set autoClose(ac: boolean) {
    this.__autoClose = Boolean(ac);
  }

  /**This selects the content in its parent, if the content is already selected, it will*/
  select() {
    if (
      this.__focusedContext instanceof Context ||
      this.__focusedContext instanceof ContextContainer
    ) {
      if (this.__focusedContext != selectedContent)
        this.__focusedContext.select();
    } else this._contentEvents.emit("focused", {});
  }

  /**Creates a devider element*/
  private __createDevider(): HTMLElement {
    let devider = document.createElement("lib-context-container-devider");
    let deviderChild = devider.appendChild(document.createElement("div"));
    //Sizer function
    deviderChild.onpointerdown = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      let indax = this.__deviders.indexOf(devider);
      let contaxts = this.__contexts[indax];
      let contaxts2 = this.__contexts[indax + 1];
      let contextMin = contaxts.minSize;
      let context2Min = contaxts2.minSize;
      let box1 = contaxts.getBoundingClientRect();
      let box2 = contaxts2.getBoundingClientRect();
      let minPos = this.__way
        ? box1.top + contextMin.height + 0.5
        : box1.left + contextMin.width + 0.5;
      let maxPos = this.__way
        ? box2.bottom - context2Min.height - 0.5
        : box2.right - context2Min.width - 0.5;
      let basis = this.__way ? box2.bottom - box1.top : box2.right - box1.left;
      let perc = this.__way
        ? parseFloat(contaxts.style.height) + parseFloat(contaxts2.style.height)
        : parseFloat(contaxts.style.width) + parseFloat(contaxts2.style.width);
      deviderChild.setPointerCapture(ev.pointerId);
      deviderChild.onpointermove = this.__way
        ? (eve) => {
            let y = eve.clientY;
            if (y < minPos) {
              y = minPos;
            } else if (y > maxPos) {
              y = maxPos;
            }
            let newPerc = (perc * (y - box1.top)) / basis;
            contaxts.style.height = newPerc + "%";
            contaxts2.style.height = perc - newPerc + "%";
          }
        : (eve) => {
            let x = eve.clientX;
            if (x < minPos) {
              x = minPos;
            } else if (x > maxPos) {
              x = maxPos;
            }
            let newPerc = (perc * (x - box1.left)) / basis;
            contaxts.style.width = newPerc + "%";
            contaxts2.style.width = perc - newPerc + "%";
          };
      deviderChild.onpointerup = () => {
        deviderChild.releasePointerCapture(ev.pointerId);
        deviderChild.onpointermove = null;
      };
    };
    return devider;
  }

  /**Disabled for context container*/
  set minSize(_min: ContentMinSize) {}

  /**Returns the minimum size of the context container*/
  get minSize(): ContentMinSize {
    return this.__minSizeBuffer || { width: remToPx(12), height: remToPx(12) };
  }

  /**Calculates the minimum size of the context container*/
  private __minSize() {
    if (this.__way) {
      this.__minSizeBuffer = { width: 0, height: -1 };
    } else {
      this.__minSizeBuffer = { width: -1, height: 0 };
    }
    for (let i = 0; i < this.__contexts.length; i++) {
      let minSize = this.__contexts[i].minSize;
      if (this.__way) {
        if (minSize.width > this.__minSizeBuffer.width) {
          this.__minSizeBuffer.width = minSize.width;
        }
        this.__minSizeBuffer.height += minSize.height + 1;
      } else {
        if (minSize.height > this.__minSizeBuffer.height) {
          this.__minSizeBuffer.height = minSize.height;
        }
        this.__minSizeBuffer.width += minSize.width + 1;
      }
    }
  }

  /**Adds the given context to the internal context list at a given position*/
  private __addContextToList(
    index: number,
    contaxt: ContextBase | ContextContainerBase
  ) {
    contaxt.container = this as any;
    this.__contexts.splice(index, 0, contaxt);
    this.__removedListeners.splice(
      index,
      0,
      contaxt.contentEvents.on("removed", () => {
        this.__removeContext(this.__contexts.indexOf(contaxt));
      })
    );
    this.__focusListeners.splice(
      index,
      0,
      contaxt.contentEvents.on("focused", (ev) => {
        this.__focusContext(ev.target);
      })
    );
    this.__sizeListeners.splice(
      index,
      0,
      contaxt.contentEvents.on("minSize", () => {
        this.__minSize();
        this._contentEvents.emit("minSize", this.__minSizeBuffer);
      })
    );
    this.__minSize();
  }

  /**Adds the given context to the container at a given position*/
  private __addContext(
    index: number,
    overwrite: ContextBase | ContextContainerBase = new Context().options({
      dropTarget: true,
      autoClose: true,
    })
  ) {
    if (this.__contexts.length > 0) {
      let devider = this.__createDevider();
      if (index == this.__contexts.length) {
        this.appendChild(devider);
      } else {
        this.insertBefore(devider, this.__contexts[index]);
      }
      this.__deviders.splice(index, 0, devider);
    } else {
      this.__focusContext(overwrite);
    }
    if (index == this.__contexts.length) {
      this.appendChild(overwrite);
    } else {
      this.insertBefore(overwrite, this.__deviders[index]);
    }
    this.__addContextToList(index, overwrite);
    return overwrite;
  }

  /**This focuses the context in the container*/
  private __focusContext(contaxt: ContextBase | ContextContainerBase) {
    if (contaxt !== this.__focusedContext) {
      if (
        this.__focusedContext instanceof Context ||
        this.__focusedContext instanceof ContextContainer
      ) {
        this.__unFocusContext(this.__focusedContext);
      }
      this.__focusedContext = contaxt;
      this.__nameListener = contaxt.contentEvents.on("name", (e) => {
        this._contentEvents.emit("name", e.data);
        return false;
      });
      this.__symbolListener = contaxt.contentEvents.on("symbol", (e) => {
        this._contentEvents.emit("symbol", e.data);
        return false;
      });
    }
    this._contentEvents.emit("focused", {});
  }

  /**This focuses the context in the container*/
  private __unFocusContext(contaxt: ContextBase | ContextContainerBase) {
    if (this.__nameListener)
      contaxt.contentEvents.off("name", this.__nameListener);
    if (this.__symbolListener)
      contaxt.contentEvents.off("symbol", this.__symbolListener);
  }

  /**Removes the given context from the internal context list */
  private __removeContextFromList(index: number) {
    let child = this.__contexts[index];
    child.container = undefined;
    child.contentEvents.off("removed", this.__removedListeners[index]);
    this.__removedListeners.splice(index, 1);
    child.contentEvents.off("focused", this.__focusListeners[index]);
    this.__focusListeners.splice(index, 1);
    child.contentEvents.off("minSize", this.__sizeListeners[index]);
    this.__sizeListeners.splice(index, 1);
    this.__contexts.splice(index, 1);
    this.__minSize();
    child.style.width = "";
    child.style.height = "";
  }

  /**Removes the given context from the container */
  private __removeContext(index: number, dontCollapse?: boolean) {
    let child = this.__contexts[index];
    if (this.contains(child)) this.removeChild(child);

    if (this.__contexts.length > 1)
      if (index == this.__contexts.length - 1) {
        this.removeChild(this.__deviders[index - 1]);
        this.__deviders.splice(index - 1, 1);
      } else {
        this.removeChild(this.__deviders[index]);
        this.__deviders.splice(index, 1);
      }

    this.__removeContextFromList(index);
    if (this.__contexts.length === 1 && !dontCollapse)
      this.__collapse(this.__contexts[0]);
    if (this.__focusedContext === child) {
      this.__unFocusContext(this.__focusedContext);
      this.__focusedContext = undefined;
      if (this.__contexts.length > 0) {
        if (this.__contexts.length / 2 < index)
          var selectee = this.__contexts[index - 1];
        else var selectee = this.__contexts[index];
        this.__focusContext(selectee);
      }
    }
    if (this.__contexts.length === 0 && this.__autoClose) this.remove();

    return child;
  }

  /**Replaces a context in the container*/
  private __replaceContext(
    index: number,
    contaxt: ContextBase | ContextContainerBase
  ) {
    this.replaceChild(contaxt, this.__contexts[index]);
    this.__removeContextFromList(index);
    this.__addContextToList(index, contaxt);
  }

  /**Splits the context, if the split is the same way, the new context is added to the container
   * otherwhise a new container is created and nested*/
  private __split(
    contaxt: ContextBase | ContextContainerBase,
    way: ContextContainerSplitWay,
    cont?: ContentBase
  ): ContextBase | ContextContainerBase | undefined {
    let index = this.__contexts.indexOf(contaxt);
    if (index != -1) {
      let contway = [1, 1, 0, 0][way] as ContextContainerContentWay;
      if (this.__contexts.length === 1) this.way = contway;
      let newGroup: ContextBase | ContextContainerBase | undefined;
      if (contway === this.__way) {
        if (
          way == ContextContainerSplitWay.UP ||
          way == ContextContainerSplitWay.LEFT
        )
          newGroup = this.__addContext(index);
        else newGroup = this.__addContext(index + 1);
      } else {
        let containerGroup = new ContextContainer().options({
          container: this as any,
          dontFill: true,
          autoClose: false,
          contents: [],
        });
        this.__replaceContext(index, containerGroup as any);
        containerGroup.__addContext(0, contaxt);
        newGroup = containerGroup.__split(containerGroup.__contexts[0], way);
      }
      if (cont instanceof Content && newGroup) newGroup.addContent(cont);
      this.__calculateSizes();
      return newGroup;
    } else {
      console.warn("Context not in container");
      return undefined;
    }
  }

  /**This collapses the container into it's parent container*/
  private __collapse(contaxt: ContextBase | ContextContainerBase) {
    let container = this.container;
    let index = this.__contexts.indexOf(contaxt);
    if (index != -1) {
      if (container instanceof ContextContainer) {
        this.__removeContextFromList(index);
        if (contaxt instanceof Context) {
          container.__replaceContext(
            container.__indexOfContext(this as any),
            contaxt
          );
          //@ts-expect-error
          contaxt._contentEvents.emit("focused", {});
        } else if (contaxt instanceof ContextContainer) {
          let indax = container.__indexOfContext(this as any);
          if (contaxt.__way === container.__way) {
            //@ts-expect-error
            for (var i = 0, n = contaxt.__children.length; i < n; i++) {
              container.__addContext(
                indax + i,
                contaxt.__removeContext(0, true)
              );
            }
            container.__removeContext(indax + i, true);
          } else {
            container.__replaceContext(indax, contaxt);
          }
        } else {
          console.warn("None context passed");
        }
        container.__calculateSizes();
      } else if (
        container instanceof UIWindow ||
        container instanceof ContentContainer
      ) {
        this.__removeContextFromList(index);
        this.__unFocusContext(contaxt);
        container.content = contaxt;
        //@ts-expect-error
        contaxt._contentEvents.emit("focused", {});
      }
    } else {
      console.warn("Context not in container");
    }
  }

  /**Returns the index of a context*/
  //@ts-expect-error
  private __indexOfContext(context: ContextBase | ContextContainerBase) {
    return this.__contexts.indexOf(context);
  }

  /**This calculates the sizes of all the contexts in the container*/
  private __calculateSizes() {
    let sizes = [];
    let totalMinSize = 0;
    for (let i = 0; i < this.__contexts.length; i++) {
      let minSize = this.__contexts[i].minSize;
      if (this.__way) {
        totalMinSize += minSize.height;
        sizes[i] = minSize.height;
      } else {
        totalMinSize += minSize.width;
        sizes[i] = minSize.width;
      }
    }
    for (let i = 0; i < this.__contexts.length; i++) {
      if (this.__way) {
        this.__contexts[i].style.height = (sizes[i] / totalMinSize) * 100 + "%";
        this.__contexts[i].style.width = "";
      } else {
        this.__contexts[i].style.width = (sizes[i] / totalMinSize) * 100 + "%";
        this.__contexts[i].style.height = "";
      }
    }
  }

  /**Content Handling
   * @param  content the content to add
   * @param  index the tab index to insert the content at*/
  addContent<T extends ContentBase>(content: T, index?: number): T {
    return this.__focusedContext!.addContent(content, index);
  }
}
defineElement(ContextContainer);

//#####################################################################################################################################################################################
//#    _______    _            ########################################################################################################################################################
//#   |__   __|  | |           ########################################################################################################################################################
//#      | | __ _| |__  ___    ########################################################################################################################################################
//#      | |/ _` | '_ \/ __|   ########################################################################################################################################################
//#      | | (_| | |_) \__ \   ########################################################################################################################################################
//#      |_|\__,_|_.__/|___/   ########################################################################################################################################################
//#####################################################################################################################################################################################

type TabDropper = {
  right: HTMLDivElement;
  left: HTMLDivElement;
} & HTMLElement;

let tabDropper = document.createElement(
  "lib-context-tab-dropper"
) as TabDropper;
{
  tabDropper.right = tabDropper.appendChild(document.createElement("div"));
  tabDropper.left = tabDropper.appendChild(document.createElement("div"));
}

let draggingTab: null | Tab = null;

type TabOptions = {
  content: ContentBase;
  context: ContextBase;
} & BaseOptions;

/**Tab class for context*/
class Tab extends WebComponent<TabOptions> {
  /**Returns the name used to define the element */
  static elementName() {
    return "context-tab";
  }

  /**The context the tab is a part of*/
  private __context: ContextBase;
  /**The content the tab refers to*/
  private __content: ContentBase;
  /**Container for content symbol*/
  private __symbol: SVGSVGElement = svg(0, 0, "0 0 0 0");
  /**Container for content name*/
  private __name = this.appendChild(document.createElement("div"));
  /**Stores closing button*/
  private __close = this.appendChild(close());
  /**Stores listener for content closing*/
  private __closingListener: ESubscriber<
    "closing",
    ContentBase,
    ContentEvents["closing"]
  > = (e) => {
    if (e.data.closing) {
      this.__close.classList.remove("waiting");
      this.draggable = true;
    } else {
      this.__close.classList.add("waiting");
      this.draggable = false;
    }
    return false;
  };
  __focusListener?: ESubscriber<
    "focused",
    ContentBase,
    ContentEvents["focused"]
  >;
  __removedListener?: ESubscriber<
    "removed",
    ContentBase,
    ContentEvents["removed"]
  >;
  private __closeableListener: ESubscriber<
    "closeable",
    ContentBase,
    ContentEvents["closeable"]
  >;
  private __symbolListener: ESubscriber<
    "symbol",
    ContentBase,
    ContentEvents["symbol"]
  >;
  private __nameListener: ESubscriber<
    "name",
    ContentBase,
    ContentEvents["name"]
  >;

  constructor(options: TabOptions) {
    super();
    this.onpointerdown = (ev) => {
      ev.stopPropagation();
      if (ev.pointerType === "touch") {
        this.draggable = false;
      } else {
        this.draggable = true;
      }
      this.__content.select();
    };

    let flip = 0;
    this.ondragover = (ev) => {
      ev.stopPropagation();
      if (draggingTab) {
        ev.preventDefault();
        if (flip !== 1 && ev.clientX >= half!) {
          tabDropper.left.classList.add("hover");
          tabDropper.right.classList.remove("hover");
          flip = 1;
        }
        if (flip !== 2 && ev.clientX < half!) {
          tabDropper.right.classList.add("hover");
          tabDropper.left.classList.remove("hover");
          flip = 2;
        }
      }
    };

    this.ondragstart = () => {
      draggingTab = this;
    };

    this.ondragend = () => {
      draggingTab = null;
      tabDropper.remove();
      contextDropper.remove();
    };
    let count = 0;
    let half: number | null = null;

    this.ondragenter = (ev) => {
      ev.stopPropagation();
      if (draggingTab && draggingTab !== this) {
        if (count === 0) {
          this.appendChild(tabDropper);
          tabDropper.right.classList.remove("hover");
          tabDropper.left.classList.remove("hover");
          flip = 0;
          let box = this.getBoundingClientRect();
          half = box.left + box.width / 2;
        }
        count++;
      }
    };

    this.ondragleave = (ev) => {
      ev.stopPropagation();
      if (draggingTab && draggingTab !== this) {
        count--;
        if (count === 0) {
          try {
            this.removeChild(tabDropper);
          } catch (e) {}
        }
      }
    };

    this.ondrop = (ev) => {
      ev.stopPropagation();
      count = 0;
      if (draggingTab && draggingTab !== this) {
        //@ts-expect-error
        let index = this.__context.__tabsList.indexOf(this);
        if (ev.clientX >= half!) {
          this.__context.addContent(draggingTab.__content, index + 1);
        } else {
          this.__context.addContent(draggingTab.__content, index);
        }
      }
    };

    //@ts-expect-error
    attachContextMenu(this, () => {
      let res: ContextMenuLines = [
        {
          text: "Popout",
          func: () => {
            //@ts-expect-error
            this.__context.__popContent(this.__content);
          },
        },
        {
          text: "Close",
          func: () => {
            this.__content.close();
          },
        },
      ];
      if (
        //@ts-expect-error
        this.__context.___container instanceof ContextContainer &&
        this.__context.amountContent > 1
      ) {
        res.push(
          0,
          {
            text: "Split Up",
            func: () => {
              //@ts-expect-error
              this.__context.parentElement.__split(
                this.__context,
                ContextContainerSplitWay.UP,
                this.__content
              );
            },
          },
          {
            text: "Split Left",
            func: () => {
              //@ts-expect-error
              this.__context.parentElement.__split(
                this.__context,
                ContextContainerSplitWay.LEFT,
                this.__content
              );
            },
          },
          {
            text: "Split Down",
            func: () => {
              //@ts-expect-error
              this.__context.parentElement.__split(
                this.__context,
                ContextContainerSplitWay.DOWN,
                this.__content
              );
            },
          },
          {
            text: "Split Right",
            func: () => {
              //@ts-expect-error
              this.__context.parentElement.__split(
                this.__context,
                ContextContainerSplitWay.RIGHT,
                this.__content
              );
            },
          }
        );
      }
      return res as ContextMenuLines;
    });

    this.__name.classList.add("name");
    this.__close.classList.add("close");
    this.__close.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    this.__close.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.__content.close();
    };

    this.addEventListener("focusin", (e) => {
      e.stopPropagation();
    });
    this.ondblclick = () => {
      //@ts-expect-error
      this.__context.__popContent(this.__content);
    };
    this.onkeydown = this.__keyDown;

    this.__content = options.content;
    this.__context = options.context;
    this.__content.contentEvents.on("closing", this.__closingListener);

    /**Stores listener for content name change */
    this.__nameListener = this.__content.contentEvents.on("name", (e) => {
      this.__name.innerHTML = e.data.name;
      return false;
    });
    this.__nameListener(
      new E("name", this.__content, { name: this.__content.name })
    );

    /**Stores listener for content symbol change*/
    this.__symbolListener = this.__content.contentEvents.on("symbol", (e) => {
      if (typeof e.data.symFunc != "function") {
        return false;
      }
      let sym = e.data.symFunc() as SVGSVGElement | undefined;
      if (sym instanceof SVGSVGElement) {
        this.replaceChild(sym, this.__symbol);
        this.__symbol = sym;
      } else {
        sym = svg(0, 0, "0 0 0 0");
        this.replaceChild(sym, this.__symbol);
        this.__symbol = sym;
      }
      return false;
    });
    let symFunc = this.__content.symbol;
    if (symFunc)
      this.__symbolListener(new E("symbol", this.__content, { symFunc }));

    /**Stores listener for content closeable*/
    this.__closeableListener = this.__content.contentEvents.on(
      "closeable",
      (e) => {
        if (e.data.closeable) this.__close.classList.remove("h");
        else this.__close.classList.add("h");
        return false;
      }
    );
    this.__closeableListener(
      new E("closeable", this.__content, {
        closeable: this.__content.closeable,
      })
    );
  }

  /**Tells the tab to clean up its listeners*/
  private __remove() {
    this.__content.contentEvents.off("closing", this.__closingListener);
    this.__content.contentEvents.off("name", this.__nameListener);
    this.__content.contentEvents.off("symbol", this.__symbolListener);
    this.__content.contentEvents.off("closeable", this.__closeableListener);
  }

  /**This changes the symbol of the tab*/
  set selected(selected: boolean) {
    if (selected) this.setAttribute("selected", "true");
    else this.removeAttribute("selected");
  }
  /**Handler for keyboard events */
  private __keyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "Enter": {
        this.__content.select();
        break;
      }
      case "ArrowLeft": {
        if (this.previousSibling) (this.previousSibling as HTMLElement).focus();
        break;
      }
      case "ArrowRight": {
        if (this.nextSibling) (this.nextSibling as HTMLElement).focus();
        break;
      }
    }
  }
}
defineElement(Tab);
