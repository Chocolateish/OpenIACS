import { EventHandler } from "../event";

interface DocumentHandlerEvents {
  /**Fired when document is added*/
  added: Document;
  /**Fired when document is removed*/
  removed: Document;
}

export class DocumentHandler {
  /**Stores all managed documents */
  #documents: Document[];
  /**Stores the main docuement of the manager */
  readonly main: Document;
  /**Event handler */
  #events: EventHandler<DocumentHandlerEvents, this> = new EventHandler(this);
  /**Manager events */
  readonly events = this.#events.consumer;

  constructor(mainDocument: Document) {
    this.main = mainDocument;
    this.#documents = [mainDocument];
  }

  /**Itterates a function over all existing documents */
  forDocuments(func: (document: Document) => void) {
    for (let i = 0; i < this.#documents.length; i++) func(this.#documents[i]);
  }

  get documents() {
    return [...this.#documents];
  }

  /**Registers a document with the theme engine, which will be updated with
   * @param document document to register
   * @param styles copies all style from main document if set true */
  registerDocument(document: Document, styles?: boolean) {
    if (this.#documents.includes(document))
      return console.warn("Document registered twice");
    this.#documents.push(document);
    if (styles) {
      let headElements = this.main.head.children;
      for (let i = 0; i < headElements.length; i++) {
        switch (headElements[i].nodeName) {
          case "LINK":
            break;
          case "STYLE":
            document.head.appendChild(headElements[i].cloneNode(true));
            break;
        }
      }
    }
    this.#events.emit("added", document);
  }

  /**Registers a document with the theme engine, which will be updated with */
  deregisterDocument(document: Document) {
    let index = this.#documents.indexOf(document);
    if (index == -1) return console.warn("Document not registered");
    if (this.#documents[index] === this.main)
      return console.warn("Main document cannot be removed");
    this.#documents.splice(index, 1);
    this.#events.emit("removed", document);
  }
}
