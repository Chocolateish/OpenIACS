import { Err, Ok } from "@libResult";
import { describe, expectTypeOf, it } from "vitest";
import { state, state_delayed, state_lazy } from "../index";
import type { State, StateOk } from "../state";
import type { StateDelayed, StateDelayedOk } from "../stateDelayed";
import type { StateLazy, StateLazyOk } from "../stateLazy";

describe("Initialize normal state", function () {
  it("by state.from", async function () {
    let init = state.from(1);
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.ok", async function () {
    let init = state.ok(1);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, number, {}>>();
  });
  it("by state.err", async function () {
    let init = state.err<number>({ code: "CL", reason: "Conn Lost" });
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.from_result with ok", async function () {
    let init = state.from_result<number>(Ok(1));
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.from_result with err", async function () {
    let init = state.from_result<number>(
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.from_result_ok", async function () {
    let init = state.from_result_ok<number>(Ok(1));
    expectTypeOf(init).toEqualTypeOf<StateOk<number, number, {}>>();
  });
});

describe("Initialize lazy state", function () {
  it("by state_lazy.from", async function () {
    let init = state_lazy.from(() => 1);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.ok", async function () {
    let init = state_lazy.ok(() => 1);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, number, {}>>();
  });
  it("by state_lazy.err", async function () {
    let init = state_lazy.err<number>(() => {
      return { code: "CL", reason: "Conn Lost" };
    });
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.from_result with ok", async function () {
    let init = state_lazy.from_result<number>(() => Ok(1));
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.from_result with err", async function () {
    let init = state_lazy.from_result<number>(() =>
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.from_result_ok", async function () {
    let init = state_lazy.from_result_ok<number>(() => Ok(1));
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, number, {}>>();
  });
});

describe("Initialize delayed state", function () {
  it("by state_delayed.from", async function () {
    let init = state_delayed.from((async () => 1)());
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.ok", async function () {
    let init = state_delayed.ok((async () => 1)());
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, number, {}>>();
  });
  it("by state_delayed.err", async function () {
    let init = state_delayed.err<number>(
      (async () => {
        return { code: "CL", reason: "Conn Lost" };
      })()
    );
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.from_result with ok", async function () {
    let init = state_delayed.from_result<number>((async () => Ok(1))());
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.from_result with err", async function () {
    let init = state_delayed.from_result<number>(
      (async () => Err({ code: "CL", reason: "Conn Lost" }))()
    );
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.from_result_ok", async function () {
    let init = state_delayed.from_result_ok<number>((async () => Ok(1))());
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, number, {}>>();
  });
});
