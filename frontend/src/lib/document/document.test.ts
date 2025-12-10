import { describe, expect, it } from "vitest";
import { DOCUMENT_HANDLER as docs } from "./document";

describe("Document", async () => {
  it("Initial Values", () => {
    expect(docs.main).to.equal(document);
    expect(docs.documents.length).to.equal(1);
    expect(docs.documents[0]).to.equal(document);
  });
  it("Attach event listener then register document", async () => {
    await new Promise<void>((a) => {
      const newDoc: Document =
        document.implementation.createHTMLDocument("test");
      docs.events.on("added", (doc) => {
        expect(doc.data).toEqual(newDoc);
        a();
      });
      docs.register_document(newDoc);
    });
  });
  it("Attach event listener then deregister document", async () => {
    await new Promise<void>((a) => {
      const newDoc = document.implementation.createHTMLDocument("test");
      docs.events.on("removed", (doc) => {
        expect(doc.data === newDoc).to.equal(true);
        a();
      });
      docs.register_document(newDoc);
      docs.deregister_document(newDoc);
    });
  });
  it("Itterate all existing documents", async () => {
    await new Promise<void>((a) => {
      const newDoc = document.implementation.createHTMLDocument("test");
      docs.register_document(newDoc);
      let prog = 0;
      docs.for_documents(() => {
        prog++;
        if (prog === 3) {
          a();
        }
      });
    });
  });
});
