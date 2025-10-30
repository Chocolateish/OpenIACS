import { documentHandler } from "@libCommon";
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

/**Reference to document handler*/
let defaultMenu: Lines | undefined;

documentHandler.events.on("added", (e) => {
  applyToDoc(e.data);
});
documentHandler.forDocuments((doc) => {
  applyToDoc(doc);
});

function applyToDoc(doc: Document) {
  let container = new Container();
  doc["@contextmenu"] = container;
  doc.documentElement.appendChild(container);
  if (defaultMenu) contextMenuAttach(doc.documentElement, defaultMenu);
}

/**Attaches a context menu to the given element*/
export function contextMenuAttach(element: Element, lines?: Lines) {
  if (element["@contextmenu"]) {
    console.warn("Context menu already attached to node", element);
  } else {
    if (lines) {
      var listener = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        contextMenuSummon(
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
export function contextMenuDettach(element: Element) {
  if (element["@contextmenu"]) {
    element.removeEventListener("contextmenu", element["@contextmenu"]);
    delete element["@contextmenu"];
  } else console.warn("No context menu registered with node", element);
}

/**Summons a context menu at a given location
 * @param lines the context menu to summon
 * @param element the element the context menu is referenced to, if undefined the context menu will appear in the main document
 * @param x x position for context menu, if undefined, will use element middle, if element undefined, will put context menu in the top left corner of the screen
 * @param y y position for context menu, if undefined, will use element middle, if element undefined, will put context menu in the top left corner of the screen
 * @param dontCover when set true */
export function contextMenuSummon(
  lines: Lines,
  element?: Element,
  x?: number,
  y?: number,
  dontCover?: boolean
) {
  let container = element
    ? element.ownerDocument["@contextmenu"]
    : documentHandler.main["@contextmenu"];
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
  } else console.warn("No context menu container available");
}

/**Sets the default context menu for the page, the one used if no other context menu has been attached to the element
 * If set to a boolean the operating system context menu is disabled and nothing will appear
 * If set undefined the operating systems context menu will be used*/
export function contextMenuDefault(lines?: Lines | boolean) {
  if (defaultMenu)
    documentHandler.forDocuments((doc) => {
      contextMenuDettach(doc.body);
    });
  if (lines === false || lines === true) defaultMenu = undefined;
  else if (lines) defaultMenu = lines;
  documentHandler.forDocuments((doc) => {
    contextMenuAttach(doc.body, defaultMenu);
  });
}
