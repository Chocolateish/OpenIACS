import { EventHandler } from "@libEvent";

interface DocumentHandlerEvents {
  /**Fired when document is added*/
  added: Document;
  /**Fired when document is removed*/
  removed: Document;
}

export let documentHandler = new (class DocumentHandler {
  /**Stores all managed documents */
  #documents: Set<Document> = new Set();
  /**Stores the main docuement of the manager */
  readonly main: Document;
  /**Event handler */
  #events: EventHandler<DocumentHandlerEvents, this> = new EventHandler(this);
  /**Manager events */
  readonly events = this.#events.consumer;

  constructor(mainDocument: Document) {
    this.main = mainDocument;
    this.#documents.add(mainDocument);
  }

  /**Itterates a function over all existing documents */
  for_documents(func: (document: Document) => void) {
    for (const doc of this.#documents) {
      func(doc);
    }
  }

  get documents() {
    return [...this.#documents];
  }

  /**Registers a document with the theme engine, which will be updated with
   * @param document document to register
   * @param styles copies all style from main document if set true */
  register_document(document: Document, styles?: boolean) {
    if (this.#documents.has(document))
      return console.error("Document already registered");
    this.#documents.add(document);
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
  deregister_document(document: Document) {
    if (!this.#documents.has(document))
      return console.error("Document not registered");
    if (document === this.main)
      return console.error("Main document cannot be removed");
    this.#documents.delete(document);
    this.#events.emit("removed", document);
  }
})(document);
