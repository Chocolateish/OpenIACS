import { describe, expect, it } from "vitest";
import { ESub, EventHandlerSub } from "./sub";

describe("Init", { timeout: 50 }, function () {
  it("Create Simple Event Handler", function () {
    let handler = new EventHandlerSub(undefined);
    expect(handler).toBeDefined();
  });
  it("Create Simple Event Handler With Types", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    handler.consumer.on("test", (e) => {
      e.type;
      e.target;
      e.data;
      e.sub;
    });
  });
});

describe("Adding and removing listeners", { timeout: 50 }, function () {
  it("Checking if listener is added to handler with single type", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
  });
  it("Checking if listener is added to handler with multiple types", function () {
    let handler = new EventHandlerSub<
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
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    let lis = handler.consumer.on("test", () => {});
    expect(handler.producer.has("test", lis)).equal(true);
  });
  it("Checking if listener is removed from handler with single type", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    let lis = handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
    handler.consumer.off("test", lis);
    expect(handler.producer.inUse("test")).equal(false);
  });
  it("Checking if listener is removed from handler with multiple types", function () {
    let handler = new EventHandlerSub<
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
    let handler = new EventHandlerSub<
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

describe("Dispatching event", { timeout: 50 }, function () {
  it("Checking if values are correct when dispatching event", async function () {
    return new Promise<void>((done) => {
      let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
      handler.consumer.on("test", (e) => {
        expect(e.type).equal("test");
        expect(e.target).equal(undefined);
        expect(e.data).equal(10);
        done();
      });
      handler.producer.emit("test", 10);
    });
  });

  it("Checking listener removing itself on event", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => true);
    handler.producer.emit("test", 10);
    expect(handler.producer.amount("test")).equal(1);
  });
});

describe("Adding and removing sub listeners", { timeout: 50 }, function () {
  it("Checking if listener is added to handler with single type", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
    handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(true);
  });
  it("Checking if listener is added to handler with multiple types", function () {
    let handler = new EventHandlerSub<
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
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
    let lis = handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.has("test", lis, ["a", "b", "c"])).equal(true);
  });
  it("Checking if listener is removed from handler with single type", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    let lis = handler.consumer.on("test", () => {}, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(true);
    handler.consumer.off("test", lis, ["a", "b", "c"]);
    expect(handler.producer.inUse("test", ["a", "b", "c"])).equal(false);
  });
  it("Checking if listener is removed from handler with multiple types", function () {
    let handler = new EventHandlerSub<
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
    let handler = new EventHandlerSub<
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
    let handler = new EventHandlerSub<
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

describe("Dispatching sub event", { timeout: 50 }, function () {
  it("Checking if values are correct when dispatching event", async function () {
    return new Promise<void>((done) => {
      let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
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

  it("Checking amount of listners", function () {
    let handler = new EventHandlerSub<{ test: number }, undefined>(undefined);
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => {});
    handler.consumer.on("test", () => {}, ["test"]);
    handler.consumer.on("test", () => {}, ["test"]);
    expect(handler.producer.amount("test")).equal(3);
    expect(handler.producer.amount("test", ["test"])).equal(2);
  });
});

describe("Target override", { timeout: 50 }, function () {
  it("Target override event", async function () {
    return new Promise<void>((done) => {
      let target = {
        test1: 8,
        test2: "string2",
      };
      let target2 = {
        test1: 5,
        test2: "string",
      };
      let handler = new EventHandlerSub<{ test: number }, typeof target>(
        target
      );
      handler.target = target2;
      handler.on("test", (e) => {
        expect(e.type).equal("test");
        expect(e.target).equal(target2);
        expect(e.data).equal(10);
        expect(e.target.test1).equal(5);
        expect(e.target.test2).equal("string");
        done();
      });
      handler.emit("test", 10);
    });
  });
});

describe("Proxy Event Handler", { timeout: 50 }, function () {
  it("Attaching Proxy Event Handler Then emitting event", async function () {
    let target = {};
    let handler = new EventHandlerSub<{ test: number }, {}>(target);
    let proxyHandler = new EventHandlerSub<{ test: number }, {}>(target);
    let proxFunc = handler.proxyOn(proxyHandler.proxyFunc());
    expect("").equal("This test does not work ");
    let e = await new Promise<ESub<"test", {}, number>>((done) => {
      proxyHandler.on("test", (e) => {
        //This part here
        done(e);
      });
      handler.emit("test", 10);
    });
    expect(e.type).equal("test");
    expect(e.target).equal(target);
    expect(e.data).equal(10);
    handler.proxyOff(proxFunc);
    let f = await Promise.race([
      new Promise<ESub<"test", {}, number>>((done) => {
        proxyHandler.on("test", (e) => {
          done(e);
        });
        handler.emit("test", 10);
      }),
      await new Promise<999>((a) => setTimeout(a, 20, 999)),
    ]);
    expect(f).equal(999);
  });
  it("Attaching Proxy Event Handler Then emitting sub event", async function () {
    let target = {};
    let handler = new EventHandlerSub<{ test: number }, {}>(target);
    let proxyHandler = new EventHandlerSub<{ test: number }, {}>(target);
    let proxFunc = handler.proxyOn(proxyHandler.proxyFunc());
    let e = await new Promise<ESub<"test", {}, number>>((done) => {
      proxyHandler.on(
        "test",
        (e) => {
          done(e);
        },
        ["a", "b", "c"]
      );
      handler.emit("test", 10, ["a", "b", "c"]);
    });
    expect(e.type).equal("test");
    expect(e.target).equal(target);
    expect(e.data).equal(10);
    handler.proxyOff(proxFunc);
    let f = await Promise.race([
      new Promise<ESub<"test", {}, number>>((done) => {
        proxyHandler.on("test", (e) => {
          done(e);
        });
        handler.emit("test", 10);
      }),
      await new Promise<999>((a) => setTimeout(a, 20, 999)),
    ]);
    expect(f).equal(999);
  });
});
