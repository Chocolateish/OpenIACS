import { DOCUMENT_HANDLER } from "@libDocument";
import type { Option } from "@libResult";
import { Container } from "./container";
import "./engine.scss";
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
let default_menu: (ContextMenu | (() => Option<ContextMenu>)) | undefined;

DOCUMENT_HANDLER.events.on("added", (e) => {
  apply_to_doc(e.data);
});
DOCUMENT_HANDLER.for_documents((doc) => {
  apply_to_doc(doc);
});

function apply_to_doc(doc: Document) {
  const container = new Container();
  doc["@contextmenu"] = container;
  doc.documentElement.appendChild(container);
  if (default_menu) context_menu_attach(doc.documentElement, default_menu);
}

/**Attaches a context menu to the given element*/
export function context_menu_attach(
  element: Element,
  lines: ContextMenu | (() => Option<ContextMenu>)
) {
  if (element["@contextmenu"]) {
    console.error("Context menu already attached to node", element);
    return;
  }
  const listener = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const lineses =
      typeof lines === "function" ? lines().unwrap_or(undefined) : lines;
    if (!lineses) return;
    context_menu_summon(
      lineses,
      element,
      (e as MouseEvent).clientX,
      (e as MouseEvent).clientY
    );
  };
  element.addEventListener("contextmenu", listener);
  element["@contextmenu"] = listener;
}

/**Dettaches the context menu from the given element */
export function context_menu_dettach(element: Element) {
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
export function context_menu_summon(
  menu: ContextMenu,
  element?: Element,
  x?: number,
  y?: number,
  dontCover?: boolean
) {
  const container = element
    ? element.ownerDocument["@contextmenu"]
    : DOCUMENT_HANDLER.main["@contextmenu"];
  if (container) {
    if (typeof x !== "number" || typeof y !== "number") {
      if (element) {
        const box = element.getBoundingClientRect();
        x = box.left + box.width / 2;
        y = box.top + box.height / 2;
      } else {
        x = 0;
        y = 0;
      }
    }
    container
      .attach_menu(menu)
      .set_position(x, y, dontCover ? element : undefined);
  } else console.error("No context menu container available");
}

/**Sets the default context menu for the page, the one used if no other context menu has been attached to the element
 * If set to a boolean the operating system context menu is disabled and nothing will appear
 * If set undefined the operating systems context menu will be used*/
export function context_menu_default(
  lines: (ContextMenu | (() => Option<ContextMenu>)) | false
) {
  if (default_menu)
    DOCUMENT_HANDLER.for_documents((doc) => {
      context_menu_dettach(doc.documentElement);
    });
  if (lines) {
    default_menu = lines;
    DOCUMENT_HANDLER.for_documents((doc) => {
      context_menu_attach(doc.documentElement, lines);
    });
  }
}
