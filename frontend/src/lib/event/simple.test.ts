import { describe, expect, it } from "vitest";
import { E, EventHandler } from "./simple";

describe("Init", { timeout: 50 }, function () {
  it("Create Simple Event Handler", function () {
    let handler = new EventHandler(undefined);
    expect(handler).toBeDefined();
  });
  it("Create Simple Event Handler With Types", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    handler.consumer.on("test", (e) => {
      e.type;
      e.target;
      e.data;
    });
  });
});

describe("Adding and removing listeners", { timeout: 50 }, function () {
  it("Checking if listener is added to handler with single type", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
  });
  it("Checking if listener is added to handler with multiple types", function () {
    let handler = new EventHandler<
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
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    expect(handler.producer.inUse("test")).equal(false);
    let lis = handler.consumer.on("test", () => {});
    expect(handler.producer.has("test", lis)).equal(true);
  });
  it("Checking if listener is removed from handler with single type", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    let lis = handler.consumer.on("test", () => {});
    expect(handler.producer.inUse("test")).equal(true);
    handler.consumer.off("test", lis);
    expect(handler.producer.inUse("test")).equal(false);
  });
  it("Checking if listener is removed from handler with multiple types", function () {
    let handler = new EventHandler<
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
    let handler = new EventHandler<
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
  it("Checking if listener removing itself during emit fails", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    let lis = handler.consumer.on("test", () => {
      handler.consumer.off("test", lis);
    });
    expect(handler.amount("test")).equal(1);
    handler.consumer.off("test", lis);
    expect(handler.amount("test")).equal(0);
  });
});

describe("Dispatching event", { timeout: 50 }, function () {
  it("Checking if values are correct when dispatching event", async function () {
    return new Promise<void>((done) => {
      let handler = new EventHandler<{ test: number }, undefined>(undefined);
      handler.consumer.on("test", (e) => {
        expect(e.type).equal("test");
        expect(e.target).equal(undefined);
        expect(e.data).equal(10);
        done();
      });
      handler.producer.emit("test", 10);
    });
  });

  it("Checking amount of listners", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    handler.on("test", () => {});
    handler.on("test", () => {});
    handler.on("test", () => {});
    expect(handler.producer.amount("test")).equal(3);
  });

  it("Checking listener removing itself on event", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    handler.on("test", () => {});
    handler.on("test", () => true);
    handler.emit("test", 10);
    expect(handler.amount("test")).equal(1);
  });

  it("Checking listener removing itself keeps correct listeners", function () {
    let handler = new EventHandler<{ test: number }, undefined>(undefined);
    let counter = 0;
    handler.on("test", () => {
      counter += 10;
    });
    handler.on("test", () => {
      counter += 100;
      return true;
    });
    handler.on("test", () => {
      counter += 1000;
    });
    handler.emit("test", 10);
    expect(counter).equal(1110);
    handler.emit("test", 10);
    expect(counter).equal(2120);
  });
});

describe("Target override", { timeout: 50 }, function () {
  it("Target override event", function () {
    return new Promise<void>((done) => {
      let target = {
        test1: 8,
        test2: "string2",
      };
      let target2 = {
        test1: 5,
        test2: "string",
      };
      let handler = new EventHandler<{ test: number }, typeof target>(target);
      handler.target = target2;
      handler.consumer.on("test", (e) => {
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
    let handler = new EventHandler<{ test: number }, {}>(target);
    let proxyHandler = new EventHandler<{ test: number }, {}>(target);
    let proxFunc = handler.proxyOn(proxyHandler.proxyFunc());
    let e = await new Promise<E<"test", {}, number>>((done) => {
      proxyHandler.on("test", (e) => {
        done(e);
      });
      handler.emit("test", 10);
    });
    expect(e.type).equal("test");
    expect(e.target).equal(target);
    expect(e.data).equal(10);
    handler.proxyOff(proxFunc);
    let f = await Promise.race([
      new Promise<E<"test", {}, number>>((done) => {
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
