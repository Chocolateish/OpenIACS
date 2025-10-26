import { Err, Ok, ResultErr, ResultOk } from "@libResult";
import { describe, expect, it } from "vitest";
import { state, state_delayed, state_lazy } from "../index";

describe("Subscribing normal state", function () {
  it("state with ok", async function () {
    let init = state.from(1);
    let awaited = await init;
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
  });
  it("state with err", async function () {
    let init = state.err({ code: "CL", reason: "Conn Lost" });
    let awaited = await init;
    expect(awaited).instanceOf(ResultErr);
    expect(awaited).toEqual(Err({ code: "CL", reason: "Conn Lost" }));
  });
  it("stateok", async function () {
    let init = state.ok(1);
    let awaited = await init;
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
  });
});

describe("Awaiting lazy state", function () {
  it("state with ok", async function () {
    let init = state_lazy.from(() => 1);
    let awaited = await init;
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
  });
  it("state with err", async function () {
    let init = state_lazy.err(() => {
      return { code: "CL", reason: "Conn Lost" };
    });
    let awaited = await init;
    expect(awaited).instanceOf(ResultErr);
    expect(awaited).toEqual(Err({ code: "CL", reason: "Conn Lost" }));
  });
  it("stateok", async function () {
    let init = state_lazy.ok(() => 1);
    let awaited = await init;
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
  });
});

describe("Awaiting delayed state", function () {
  it("state with ok", async function () {
    let init = state_delayed.from((async () => 1)());
    let awaited = await init;
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
  });
  it("state with err", async function () {
    let init = state_delayed.err(
      (async () => {
        return { code: "CL", reason: "Conn Lost" };
      })()
    );
    let awaited = await init;
    expect(awaited).instanceOf(ResultErr);
    expect(awaited).toEqual(Err({ code: "CL", reason: "Conn Lost" }));
  });
  it("stateok", async function () {
    let init = state_delayed.ok((async () => 1)());
    let awaited = await init;
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
  });
});
