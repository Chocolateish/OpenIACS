import { describe, expect, it } from "vitest";
import { documentHandler as docs } from "./document";

describe("Document", async () => {
  it("Initial Values", () => {
    expect(docs.main).to.equal(document);
    expect(docs.documents.length).to.equal(1);
    expect(docs.documents[0]).to.equal(document);
  });
  it("Attach event listener then register document", async () => {
    await new Promise<void>((a) => {
      let newDoc: Document = document.implementation.createHTMLDocument("test");
      docs.events.on("added", (doc) => {
        expect(doc.data).toEqual(newDoc);
        a();
      });
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
});
