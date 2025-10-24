import { defineElement, type BaseOptions } from "@libBase";
import { grey } from "@libColors";
import { WebComponent } from "@libCommon";
import { EventHandler, type ESubscriber } from "@libEvent";
import { addThemeVariable } from "@libTheme";
import type {
  ContentBase,
  ContentContainerBase,
  ContentContainerEvents,
  ContextBase,
  WindowBase,
} from "./common";
import { remToPx, type ContentEvents } from "./common";
import "./content.scss";

addThemeVariable("contentBackGround", ["UI"], grey["50"], grey["900"]);
addThemeVariable("contentTextColor", ["UI"], grey["900"], grey["300"]);
addThemeVariable(
  "scrollBarColor",
  ["UI", "Scrollbar"],
  grey["400"],
  grey["800"]
);
addThemeVariable(
  "scrollBarHover",
  ["UI", "Scrollbar"],
  grey["600"],
  grey["600"]
);

/**The storage type for content minimum size*/
export type ContentMinSize = {
  width: number;
  height: number;
};

/**Defines base options for creating content*/
export type ContentBaseOptions = {
  /** container container element for the content */
  container?: ContextBase | WindowBase | ContentContainer;
  /** parent content for the content */
  parent?: ContentBase;
} & BaseOptions;

/**Contains the last selected content*/
export let selectedContent: ContentBase | undefined = undefined;

/**Content class*/
export class Content<
  Options extends ContentBaseOptions = ContentBaseOptions
> extends WebComponent<Options> {
  protected _contentEvents: EventHandler<ContentEvents, this> =
    new EventHandler<ContentEvents, this>(this);
  readonly contentEvents = this._contentEvents.consumer;

  /**Returns the name used to define the element */
  static elementName() {
    return "content";
  }

  /**Stores a list of child contents*/
  private ___children: Content[] = [];
  /**Stores the parent of the content if any*/
  private ___parent?: Content;
  /**Stores the container of the content, some events are passed to the container*/
  private ___container?: ContextBase | WindowBase | ContentContainerBase;
  /**Stores the container of the content, some events are passed to the container*/
  private ___closeable: boolean = true;
  /**Stores wether the content has been closed*/
  private ___closed: boolean = false;
  /**Stores if the content is in the process of closing*/
  private ___closing: boolean = false;
  private ___name: string = "";
  private ___symFunc?: () => SVGSVGElement;

  /** Builds content*/
  constructor() {
    super();
    //Adds a listener to handle when content is selected
    this.addEventListener("focusin", (e) => {
      e.stopPropagation();
      this.select(true);
    });
    //Key listener
    this.onkeydown = (ev) => {
      ev.stopPropagation();
      if (ev.key == "Escape") {
        this.close();
        return;
      }
      this.__keyboard(ev);
    };
    //Key listener
    this.onkeyup = (ev) => {
      ev.stopPropagation();
      this.__keyboardUp(ev);
    };
    this.classList.add("content");
    this.tabIndex = 0;
  }

  /**Options toggeler*/
  options(options: Options): this {
    super.options(options);
    if (typeof options.parent !== "undefined") this.parent = options.parent;
    if (typeof options.container !== "undefined")
      this.container = options.container;
    return this;
  }

  /** Keyboard event processed for content*/
  protected __keyboard(_event: KeyboardEvent) {}

  /** Keyboard event processed for content*/
  protected __keyboardUp(_event: KeyboardEvent) {}

  /**Set the container of the content, which will recieve some events from the content*/
  set container(
    cont: ContextBase | WindowBase | ContentContainerBase | undefined
  ) {
    if (cont instanceof HTMLElement) this.___container = cont;
    else this.___container = undefined;
  }

  /**Gets the container of the content*/
  get container(): ContextBase | WindowBase | ContentContainerBase | undefined {
    return this.___container;
  }

  /**Gets the container of the content*/
  get topContainer(): any {
    if (this.___container) {
      return this.___container.topContainer;
    } else {
      return this;
    }
  }

  /**Returns the layer of the window the content is part of or 0 if content is not part of a window*/
  get layer(): number {
    let top = this.topContainer;
    //@ts-expect-error
    if (top instanceof import("./windows").UIWindow) {
      return top.layer;
    } else {
      return 0;
    }
  }

  /**This sets the parent content of the content*/
  set parent(content: ContentBase) {
    if (this.___parent != null && this.___parent != content) {
      this.___parent.__removeChild(this);
    }
    if (content instanceof Content) {
      this.___parent = content;
      this.___parent.__addChild(this);
    } else {
      delete this.___parent;
    }
  }

  /**Returns the parent content of the content*/
  get parent(): Content | undefined {
    return this.___parent;
  }

  /**Returns all the children of the content
   * @param recursive set true to include childrens chilren recursively */
  contentChildren(recursive?: boolean): Content[] {
    if (recursive) {
      let res = [...this.___children];
      for (let i = 0, n = this.___children.length; i < n; i++)
        res.push(...this.___children[i].contentChildren(true));
      return res;
    } else return [...this.___children];
  }

  /**This adds a child to this content*/
  private __addChild(content: Content) {
    let index = this.___children.indexOf(content);
    if (index == -1) {
      this.___children.push(content);
    }
  }

  /**Removes a child content from the content*/
  private __removeChild(content: Content) {
    let index = this.___children.indexOf(content);
    if (index != -1) {
      this.___children.splice(index, 1);
    }
  }

  /**This focuses this content within its container*/
  focus() {
    this._contentEvents.emit("focused", {});
  }

  /**This selects the content in its parent, if the content is already selected, it will
   * @param dontFocus if true, selection does not focus*/
  select(dontFocus?: boolean) {
    if (this != selectedContent) {
      selectedContent = this;
      if (!dontFocus) {
        super.focus();
      }
      this.focus();
      if (this.___children.length > 0) {
        let container = this.___container;
        let children = this.___children;
        let containers = [];
        let contents = [];
        for (let i = 0, m = children.length; i < m; i++) {
          let container2 = children[i].___container;
          if (container2 != null && container2 != container) {
            let index = containers.indexOf(container2);
            if (index == -1) {
              containers.push(container2);
              contents.push(children[i]);
            }
          }
        }
        for (let i = 0, m = contents.length; i < m; i++) {
          contents[i].focus();
        }
      }
    }
  }

  /**This removes the content from its parent*/
  remove(): Content | undefined {
    if (this.___container) {
      super.remove();
      this._contentEvents.emit("removed", {});
      this.___container = undefined;
      return this;
    }
    return undefined;
  }

  /**The long name of the content*/
  get longName(): string {
    return this.name;
  }

  /**The symbol for the content
   * @param symFunc function returning an svg*/
  set symbol(symFunc: () => SVGSVGElement) {
    this.___symFunc = symFunc;
    this._contentEvents.emit("symbol", { symFunc });
  }
  /**Returns the symbol for the content */
  get symbol(): (() => SVGSVGElement) | undefined {
    return this.___symFunc;
  }

  /**This sets the name of the content
   * @param name as short as possible, use longName for more details*/
  set name(name: string) {
    this.___name = String(name);
    this._contentEvents.emit("name", { name: this.___name });
  }

  /**Returns the short name of the content*/
  get name(): string {
    return this.___name || "";
  }

  /**This sets the minimum size of the content*/
  set minSize(min: ContentMinSize) {
    if (
      typeof min === "object" &&
      typeof min.width === "number" &&
      typeof min.height === "number"
    ) {
      /**Stores the minimum size of the content
       * @type {{width:number,height:number}}
       * @private */
      //@ts-expect-error
      this.___minSize = { width: min.width, height: min.height };
      //@ts-expect-error
      this.dispatchE(ContentEventTypes.MINSIZE, new E(this.___minSize));
    } else {
      console.warn("Invalid object passed as size");
    }
  }

  /**Returns the minimum size of the content*/
  get minSize(): ContentMinSize {
    //@ts-expect-error
    return this.___minSize || { width: remToPx(12), height: remToPx(12) };
  }

  /**Sets if the content is closeable*/
  set closeable(c: boolean) {
    this.___closeable = Boolean(c);
    this._contentEvents.emit("closeable", { closeable: this.___closeable });
  }

  /**Gets wether the content is closeable*/
  get closeable(): boolean {
    return this.___closeable;
  }

  /**This closes the content and cleans up any references
   * @param data data to pass to closing listeners
   * @returns promise for when closing is finished*/
  async close(
    data?: any
  ): Promise<{ content: ContentBase; reason: string } | undefined> {
    if (this.___closing) {
      return undefined;
    }
    this.___closing = true;
    this._contentEvents.emit("closing", { closing: false });
    let children = this.contentChildren();
    for (let i = 0, n = children.length; i < n; i++) {
      try {
        await children[i].close();
      } catch (e) {
        console.warn("Failed while closing child content", e);
      }
    }
    try {
      var reason = await this.onClose(data);
    } catch (e) {
      console.warn("Failed while closing content", e);
    }
    if (reason) {
      this.___closing = false;
      this._contentEvents.emit("closing", { closing: true });
      return { content: this as any, reason: reason };
    }
    //@ts-expect-error
    if (this.___closePromises) {
      //@ts-expect-error
      for (let i = 0; i < this.___closePromises.length; i++) {
        //@ts-expect-error
        this.___closePromises[i](data);
      }
    }
    this.remove();
    this.___closed = true;
    return undefined;
  }

  /**On close event for handling when the content should be closed, overwrite if content should do anything on closing
   * @param data data passed in close method
   * @returns  if closing content is not accepted, return anything truthy*/
  async onClose(_data: any): Promise<any> {}

  /**Returns a promise for when the content is closed
   * promise returns closing data for content */
  get whenClosed(): Promise<{}> {
    //@ts-expect-error
    if (!this.___closePromises) {
      /**Stores the promises to resolve when window closes
       * @type {[()]}
       * @private */
      //@ts-expect-error
      this.___closePromises = [];
    }
    return new Promise((resolver) => {
      //@ts-expect-error
      this.___closePromises.push(resolver);
    });
  }

  /**Returns true if the content has been closed */
  get isClosed(): boolean {
    return this.___closed;
  }
}
defineElement(Content);

/**Defines base options for creating content*/
type ContentContainerBaseOptions = {
  content?: ContentBase;
} & BaseOptions;

/**Content class */
export class ContentContainer
  extends WebComponent<ContentContainerBaseOptions>
  implements ContentContainerBase
{
  _contentContainerEvents: EventHandler<ContentContainerEvents, this> =
    new EventHandler<ContentContainerEvents, this>(this);
  readonly contentContainerEvents = this._contentContainerEvents.consumer;

  /**Stores the remove listener for the content*/
  private __removedListener?: ESubscriber<"removed", any, any>;
  private __content?: ContentBase | HTMLDivElement;
  private ___container?: ContextBase | WindowBase | ContentContainerBase;

  /**Returns the name used to define the element */
  static elementName() {
    return "content-container";
  }

  constructor() {
    super();
    this.classList.add("contentContainer");
    this.tabIndex = -1;
    this.__content = this.appendChild(document.createElement("div"));
  }

  /**Options toggeler*/
  options(options: ContentContainerBaseOptions): this {
    super.options(options);
    if (options.content instanceof Content) this.content = options.content;
    return this;
  }

  /**Gets the container of the content*/
  get topContainer(): any {
    if (this.___container) {
      return this.___container.topContainer;
    } else {
      return this;
    }
  }

  /**This changes the content of the window*/
  set content(cont: ContentBase) {
    if (cont.isClosed) {
      console.warn("Content is closed");
      return;
    }
    cont.remove();
    if (this.__content instanceof Content && this.__removedListener)
      this.__content.contentEvents.off("removed", this.__removedListener);

    cont.container = this;
    //@ts-expect-error
    this.replaceChild(cont, this.__content);
    this.__content = cont;
    this.__removedListener = cont.contentEvents.on("removed", (e) => {
      this.__removeContent(e.target as any);
    });
  }

  /**This returns the content of the*/
  get content(): ContentBase | HTMLDivElement | undefined {
    return this.__content;
  }

  /**This method removes a content from the window*/
  private __removeContent(content: Content) {
    //@ts-expect-error
    content.removeEListener(ContentEventTypes.REMOVED, this.__removedListener);
    this.appendChild((this.__content = document.createElement("div")));
  }
}
defineElement(ContentContainer);
