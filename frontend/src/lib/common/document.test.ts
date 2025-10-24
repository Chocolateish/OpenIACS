import { describe, it } from "node:test";
import { expect } from "vitest";
import DocumentHandler from "./document";

let docs = new DocumentHandler(document);

describe("Document", async () => {
  it("Initial Values", () => {
    expect(docs.main).to.equal(document);
    expect(docs.documents.length).to.equal(1);
    expect(docs.documents[0]).to.equal(document);
  });
  it("Attach event listener then register document", async () => {
    await new Promise<void>((a) => {
      let newDoc: Document;
      docs.events.on("added", (doc) => {
        expect(doc.data === newDoc).to.equal(true);
        a();
      });
      newDoc = document.implementation.createHTMLDocument("test");
      docs.registerDocument(newDoc);
    });
  });
  it("Attach event listener then deregister document", async () => {
    await new Promise<void>((a) => {
      let newDoc: Document;
      docs.events.on("removed", (doc) => {
        expect(doc.data === newDoc).to.equal(true);
        a();
      });
      newDoc = document.implementation.createHTMLDocument("test");
      docs.registerDocument(newDoc);
      docs.deregisterDocument(newDoc);
    });
  });
  it("Itterate all existing documents", async () => {
    await new Promise<void>((a) => {
      let newDoc = document.implementation.createHTMLDocument("test");
      docs.registerDocument(newDoc);
      let prog = 0;
      docs.forDocuments(() => {
        prog++;
        if (prog === 3) {
          a();
        }
      });
    });
  });
  describe("Multiple instances", async () => {
    let frame = document.body.appendChild(document.createElement("iframe"));
    if (frame.contentDocument) {
      var docs = new DocumentHandler(frame.contentDocument);
    }
    it("Initial Values", () => {
      expect(docs.main).to.equal(frame.contentDocument);
      expect(docs.documents.length).to.equal(1);
      expect(docs.documents[0]).to.equal(frame.contentDocument);
    });
    it("Attach event listener then register document", async () => {
      await new Promise<void>((a) => {
        let newDoc: Document;
        docs.events.on("added", (doc) => {
          expect(doc.data === newDoc).to.equal(true);
          a();
        });
        newDoc = document.implementation.createHTMLDocument("test");
        docs.registerDocument(newDoc);
      });
    });
    it("Attach event listener then deregister document", async () => {
      await new Promise<void>((a) => {
        let newDoc: Document;
        docs.events.on("removed", (doc) => {
          expect(doc.data === newDoc).to.equal(true);
          a();
        });
        newDoc = document.implementation.createHTMLDocument("test");
        docs.registerDocument(newDoc);
        docs.deregisterDocument(newDoc);
      });
    });
    it("Itterate all existing documents", async () => {
      await new Promise<void>((a) => {
        let newDoc = document.implementation.createHTMLDocument("test");
        docs.registerDocument(newDoc);
        let prog = 0;
        docs.forDocuments(() => {
          prog++;
          if (prog === 3) {
            a();
          }
        });
      });
    });
    it("Multiple instances", async () => {
      await new Promise<void>((a) => {
        let newDoc = document.implementation.createHTMLDocument("test");
        docs.registerDocument(newDoc);
        let prog = 0;
        docs.forDocuments(() => {
          prog++;
          if (prog === 3) {
            a();
          }
        });
      });
    });
  });
});
