import { documentHandler } from "@libDocument";
import type { Option } from "@libResult";
import { Container } from "./container";
import { ContextMenu } from "./menu";

declare global {
  interface Document {
    "@contextmenu": Container | undefined;
  }
  interface Element {
    "@contextmenu": EventListenerOrEventListenerObject | undefined;
  }
}

/**Reference to document handler*/
let defaultMenu: (ContextMenu | (() => Option<ContextMenu>)) | undefined;

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
export function contextMenuAttach(
  element: Element,
  lines: ContextMenu | (() => Option<ContextMenu>)
) {
  if (element["@contextmenu"]) {
    console.error("Context menu already attached to node", element);
    return;
  }
  var listener = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    let lineses =
      typeof lines === "function" ? lines().unwrapOr(undefined) : lines;
    if (!lineses) return;
    contextMenuSummon(
      lineses,
      element,
      (e as MouseEvent).clientX,
      (e as MouseEvent).clientY
    );
  };
  element.addEventListener("contextmenu", listener, { capture: true });
  element["@contextmenu"] = listener;
}

/**Dettaches the context menu from the given element */
export function contextMenuDettach(element: Element) {
  if (element["@contextmenu"]) {
    element.removeEventListener("contextmenu", element["@contextmenu"]);
    delete element["@contextmenu"];
  } else console.error("No context menu registered with node", element);
}

/**Summons a context menu at a given location
 * @param menu the context menu to summon
 * @param element the element the context menu is referenced to, if undefined the context menu will appear in the main document
 * @param x x position for context menu, if undefined, will use element middle, if element undefined, will put context menu in the top left corner of the screen
 * @param y y position for context menu, if undefined, will use element middle, if element undefined, will put context menu in the top left corner of the screen
 * @param dontCover when set true */
export function contextMenuSummon(
  menu: ContextMenu,
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
      .attachMenu(menu)
      .setPosition(x, y, dontCover ? element : undefined);
  } else console.error("No context menu container available");
}

/**Sets the default context menu for the page, the one used if no other context menu has been attached to the element
 * If set to a boolean the operating system context menu is disabled and nothing will appear
 * If set undefined the operating systems context menu will be used*/
export function contextMenuDefault(
  lines: (ContextMenu | (() => Option<ContextMenu>)) | false
) {
  if (defaultMenu)
    documentHandler.forDocuments((doc) => {
      contextMenuDettach(doc.body);
    });
  if (lines) {
    defaultMenu = lines;
    documentHandler.forDocuments((doc) => {
      contextMenuAttach(doc.body, lines);
    });
  }
}
