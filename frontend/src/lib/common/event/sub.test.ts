import { describe, expect, it } from "vitest";
import { createEventHandlerSub } from "./sub";

describe("Init", function () {
  it("Create Simple Event Handler", function () {
    let handler = createEventHandlerSub(undefined);
    expect(handler).toBeDefined();
  });
  it("Create Simple Event Handler With Types", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    handler.consumer.on("test", (e) => {
      e.type;
      e.target;
      e.data;
      e.sub;
    });
  });
});

describe("Adding and removing listeners", function () {
  it("Checking if listener is added to handler with single type", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
  });
  it("Checking if listener is added to handler with multiple types", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
    expect(handler.producer.inUse("test2")).equal(false);
    handler.consumer.on("test2", () => {});
    expect(handler.producer.inUse("test2")).equal(true);
    expect(handler.producer.inUse("test3")).equal(false);
    handler.consumer.on("test3", () => {});
    expect(handler.producer.inUse("test3")).equal(true);
  });
  it("Checking if listener is added to handler with single type and specific listener", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    let lis = handler.consumer.on("test", () => {});
    expect(handler.producer.has("test", lis)).equal(true);
  });
  it("Checking if listener is removed from handler with single type", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    let lis = handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
    handler.consumer.off("test", lis);
    expect(handler.producer.inUse("test")).equal(false);
  });
  it("Checking if listener is removed from handler with multiple types", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    let lis1 = handler.consumer.on("test", () => {});
    let lis2 = handler.consumer.on("test2", () => {});
    let lis3 = handler.consumer.on("test3", () => {});
    expect(
      handler.producer.inUse("test") &&
        handler.producer.inUse("test2") &&
        handler.producer.inUse("test3")
    ).equal(true);
    handler.consumer.off("test", lis1);
    handler.consumer.off("test2", lis2);
    handler.consumer.off("test3", lis3);
    expect(
      handler.producer.inUse("test") ||
        handler.producer.inUse("test2") ||
        handler.producer.inUse("test3")
    ).equal(false);
  });
  it("Clearing listeners from handler", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    handler.consumer.on("test", () => {});
    handler.consumer.on("test2", () => {});
    handler.consumer.on("test3", () => {});
    expect(
      handler.producer.inUse("test") &&
        handler.producer.inUse("test2") &&
        handler.producer.inUse("test3")
    ).equal(true);
    handler.producer.clear("test");
    handler.producer.clear("test2");
    handler.producer.clear("test3");
    expect(
      handler.producer.inUse("test") ||
        handler.producer.inUse("test2") ||
        handler.producer.inUse("test3")
    ).equal(false);
  });
});

describe("Dispatching event", function () {
  it("Checking if values are correct when dispatching event", async function () {
    return new Promise<void>((done) => {
      let handler = createEventHandlerSub<{ test: number }, undefined>(
        undefined
      );
      handler.consumer.on("test", (e) => {
        expect(e.type).equal("test");
        expect(e.target).equal(undefined);
        expect(e.data).equal(10);
        done();
      });
      handler.producer.emit("test", 10);
    });
  });

  it("Checking if values are correct when dispatching event with once option set true", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    let cool = 0;
    handler.consumer.once("test", (e) => {
      cool++;
      expect(e.type).equal("test");
      expect(e.target).equal(undefined);
      expect(e.data).equal(10);
    });
    handler.producer.emit("test", 10);
    expect(handler.producer.inUse("test")).equal(false);
    handler.producer.emit("test", 10);
    expect(cool).equal(1);
  });
});

describe("Adding and removing sub listeners", function () {
  it("Checking if listener is added to handler with single type", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
    handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(true);
  });
  it("Checking if listener is added to handler with multiple types", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
    handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(true);
    expect(handler.producer.inUse("test2", ["a", "b", "c"])).equal(false);
    handler.consumer.on("test2", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test2", ["a", "b", "c"])).equal(true);
    expect(handler.producer.inUse("test3", ["a", "b", "c"])).equal(false);
    handler.consumer.on("test3", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test3", ["a", "b", "c"])).equal(true);
  });
  it("Checking if listener is added to handler with single type and specific listener", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
    let lis = handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.has("test", lis, ["a", "b", "c"])).equal(true);
  });
  it("Checking if listener is removed from handler with single type", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    let lis = handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(true);
    handler.consumer.off("test", lis, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
  });
  it("Checking if listener is removed from handler with multiple types", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    let lis1 = handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    let lis2 = handler.consumer.on("test2", () => {}, ["a", "b", "c"]);
    let lis3 = handler.consumer.on("test3", () => {}, ["a", "b", "c"]);
    expect(
      handler.producer.inUse("test", ["a", "b", "c"]) &&
        handler.producer.inUse("test2", ["a", "b", "c"]) &&
        handler.producer.inUse("test3", ["a", "b", "c"])
    ).equal(true);
    handler.consumer.off("test", lis1, ["a", "b", "c"]);
    handler.consumer.off("test2", lis2, ["a", "b", "c"]);
    handler.consumer.off("test3", lis3, ["a", "b", "c"]);
    expect(
      handler.producer.inUse("test", ["a", "b", "c"]) ||
        handler.producer.inUse("test2", ["a", "b", "c"]) ||
        handler.producer.inUse("test3", ["a", "b", "c"])
    ).equal(false);
  });
  it("Clearing listeners from handler", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    handler.consumer.on("test2", () => {}, ["a", "b", "c"]);
    handler.consumer.on("test3", () => {}, ["a", "b", "c"]);
    expect(
      handler.producer.inUse("test", ["a", "b", "c"]) &&
        handler.producer.inUse("test2", ["a", "b", "c"]) &&
        handler.producer.inUse("test3", ["a", "b", "c"])
    ).equal(true);
    handler.producer.clear("test", ["a", "b", "c"]);
    handler.producer.clear("test2", ["a", "b", "c"]);
    handler.producer.clear("test3", ["a", "b", "c"]);
    expect(
      handler.producer.inUse("test", ["a", "b", "c"]) ||
        handler.producer.inUse("test2", ["a", "b", "c"]) ||
        handler.producer.inUse("test3", ["a", "b", "c"])
    ).equal(false);
  });
  it("Clearing all listeners from handler in once", function () {
    let handler = createEventHandlerSub<
      { test: number; test2: number; test3: number },
      undefined
    >(undefined);
    handler.consumer.on("test", () => {}, ["a", "b", "a"]);
    handler.consumer.on("test", () => {}, ["a", "b", "b"]);
    handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(
      handler.producer.inUse("test", ["a", "b", "a"]) &&
        handler.producer.inUse("test", ["a", "b", "b"]) &&
        handler.producer.inUse("test", ["a", "b", "c"])
    ).equal(true);
    handler.producer.clear("test", undefined, true);
    expect(
      handler.producer.inUse("test", ["a", "b", "a"]) ||
        handler.producer.inUse("test", ["a", "b", "b"]) ||
        handler.producer.inUse("test", ["a", "b", "c"])
    ).equal(false);
  });
});

describe("Dispatching sub event", function () {
  it("Checking if values are correct when dispatching event", async function () {
    return new Promise<void>((done) => {
      let handler = createEventHandlerSub<{ test: number }, undefined>(
        undefined
      );
      handler.consumer.on(
        "test",
        (e) => {
          expect(e.type).equal("test");
          expect(e.target).equal(undefined);
          expect(e.data).equal(10);
          done();
        },
        ["a", "b", "c"]
      );
      handler.producer.emit("test", 10, ["a", "b", "c"]);
    });
  });

  it("Checking if values are correct when dispatching event with once option set true", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    let cool = 0;
    handler.consumer.once(
      "test",
      (e) => {
        cool++;
        expect(e.type).equal("test");
        expect(e.target).equal(undefined);
        expect(e.data).equal(10);
      },
      ["a", "b", "c"]
    );
    handler.producer.emit("test", 10, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
    handler.producer.emit("test", 10, ["a", "b", "c"]);
    expect(cool).equal(1);
  });

  it("Checking amount of listners", function () {
    let handler = createEventHandlerSub<{ test: number }, undefined>(undefined);
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => {}, ["test"]);
    handler.consumer.on("test", () => {}, ["test"]);
    expect(handler.producer.amount("test")).equal(3);
    expect(handler.producer.amount("test", ["test"])).equal(2);
  });
});

describe("Target override", function () {
  it("Target override event", async function () {
    return new Promise<void>((done) => {
      let target = {
        test1: 5,
        test2: "string",
      };
      let handler = createEventHandlerSub<{ test: number }, typeof target>(
        target
      );
      handler.consumer.on("test", (e) => {
        expect(e.type).equal("test");
        expect(e.target).equal(target);
        expect(e.data).equal(10);
        expect(e.target.test1).equal(5);
        expect(e.target.test2).equal("string");
        done();
      });
      handler.producer.emit("test", 10);
    });
  });
});
