import type { ESubscriber } from "@event";
import type { ThemeEngine } from "@theme";
import type DocumentHandler from "../common/document";
import { Container } from "./container";
import { type Lines, Menu } from "./menu";

declare global {
  interface Document {
    "@contextmenu": Container | undefined;
  }
  interface Element {
    "@contextmenu": EventListenerOrEventListenerObject | undefined;
  }
}

export class Engine {
  /**Reference to document handler*/
  readonly handler: DocumentHandler;
  readonly themeEngine: ThemeEngine;
  private _listener: ESubscriber<"added", DocumentHandler, Document>;
  private defaultMenu: Lines | undefined;

  constructor(documentHandler: DocumentHandler, themeEngine: ThemeEngine) {
    this.handler = documentHandler;
    this.themeEngine = themeEngine;
    this._listener = this.handler.events.on("added", (e) => {
      this.applyToDoc(e.data);
    });
    documentHandler.forDocuments((doc) => {
      this.applyToDoc(doc);
    });
  }

  /**Run to clean up references to and from this engine*/
  destructor() {
    this.handler.events.off("added", this._listener);
  }

  applyToDoc(doc: Document) {
    let container = new Container(this);
    doc["@contextmenu"] = container;
    doc.documentElement.appendChild(container);
    if (this.defaultMenu) {
      this.attachContexMenu(doc.documentElement, this.defaultMenu);
    }
  }

  /**Attaches a context menu to the given element*/
  attachContexMenu(element: Element, lines?: Lines) {
    if (element["@contextmenu"]) {
      console.warn("Context menu already attached to node", element);
    } else {
      if (lines) {
        var listener = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          this.summonContexMenu(
            lines,
            element,
            (e as MouseEvent).clientX,
            (e as MouseEvent).clientY
          );
        };
        element.addEventListener("contextmenu", listener);
      } else {
        var listener = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
        };
        element.addEventListener("contextmenu", listener);
      }
      element["@contextmenu"] = listener;
    }
  }

  /**Dettaches the context menu from the given element */
  dettachContexMenu(element: Element) {
    if (element["@contextmenu"]) {
      element.removeEventListener("contextmenu", element["@contextmenu"]);
      delete element["@contextmenu"];
    } else {
      console.warn("No context menu registered with node", element);
    }
  }

  /**Summons a context menu at a given location
   * @param lines the context menu to summon
   * @param element the element the context menu is referenced to, if undefined the context menu will appear in the main document
   * @param x x position for context menu, if undefined, will use element middle, if element undefined, will put context menu in the top left corner of the screen
   * @param y y position for context menu, if undefined, will use element middle, if element undefined, will put context menu in the top left corner of the screen
   * @param dontCover when set true */
  async summonContexMenu(
    lines: Lines,
    element?: Element,
    x?: number,
    y?: number,
    dontCover?: boolean
  ) {
    let container = element
      ? element.ownerDocument["@contextmenu"]
      : this.handler.main["@contextmenu"];
    if (container) {
      if (typeof x !== "number" || typeof y !== "number") {
        if (element) {
          let box = element.getBoundingClientRect();
          x = box.left + box.width / 2;
          y = box.top + box.height / 2;
        } else {
          x = 0;
          y = 0;
        }
      }
      container
        .attachMenu(new Menu(lines))
        .setPosition(x, y, dontCover ? element : undefined);
    } else {
      console.warn("No context menu container available");
    }
  }

  /**Sets the default context menu for the page, the one used if no other context menu has been attached to the element
   * If set to a boolean the operating system context menu is disabled and nothing will appear
   * If set undefined the operating systems context menu will be used*/
  defaultContextMenu(lines?: Lines | boolean) {
    if (this.defaultMenu) {
      this.handler.forDocuments((doc) => {
        this.dettachContexMenu(doc.body);
      });
    }
    if (lines === false || lines === true) {
      this.defaultMenu = undefined;
    } else if (lines) {
      this.defaultMenu = lines;
    }
    this.handler.forDocuments((doc) => {
      this.attachContexMenu(doc.body, this.defaultMenu);
    });
  }
}
