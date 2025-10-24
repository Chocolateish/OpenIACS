import { EventHandler, type EventConsumer } from "../event";

interface DocumentHandlerEvents {
  /**Fired when document is added*/
  added: Document;
  /**Fired when document is removed*/
  removed: Document;
}

export default class DocumentHandler {
  /**Stores all managed documents */
  private _documents: Document[];
  /**Stores the main docuement of the manager */
  public readonly main: Document;
  /**Event handler */
  private _events: EventHandler<DocumentHandlerEvents, this>;
  /**Manager events */
  public readonly events: EventConsumer<DocumentHandlerEvents, this>;

  constructor(mainDocument: Document) {
    this.main = mainDocument;
    this._documents = [mainDocument];
    this.events = this._events = new EventHandler(this);
    this._events.target = this;
  }

  /**Itterates a function over all existing documents */
  forDocuments(func: (document: Document) => void) {
    for (let i = 0; i < this._documents.length; i++) func(this._documents[i]);
  }

  get documents() {
    return [...this._documents];
  }

  /**Registers a document with the theme engine, which will be updated with
   * @param document document to register
   * @param styles copies all style from main document if set true */
  registerDocument(document: Document, styles?: boolean) {
    if (this._documents.includes(document))
      return console.warn("Document registered twice");
    this._documents.push(document);
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
    this._events.emit("added", document);
  }

  /**Registers a document with the theme engine, which will be updated with */
  deregisterDocument(document: Document) {
    let index = this._documents.indexOf(document);
    if (index == -1) return console.warn("Document not registered");
    if (this._documents[index] === this.main)
      return console.warn("Main document cannot be removed");
    this._documents.splice(index, 1);
    this._events.emit("removed", document);
  }
}
