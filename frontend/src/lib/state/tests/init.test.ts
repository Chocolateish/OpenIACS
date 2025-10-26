import { Err, Ok } from "@libResult";
import { describe, expect, expectTypeOf, it } from "vitest";
import { state, state_delayed, state_lazy } from "../index";
import { State, StateOk } from "../state";
import { StateDelayed, StateDelayedOk } from "../stateDelayed";
import { StateLazy, StateLazyOk } from "../stateLazy";

describe("Initialize normal state", function () {
  it("by state.from", async function () {
    let init = state.from(1);
    expect(init).instanceOf(State);
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.ok", async function () {
    let init = state.ok(1);
    expect(init).instanceOf(StateOk);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, number, {}>>();
  });
  it("by state.err", async function () {
    let init = state.err<number>({ code: "CL", reason: "Conn Lost" });
    expect(init).instanceOf(State);
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.from_result with ok", async function () {
    let init = state.from_result<number>(Ok(1));
    expect(init).instanceOf(State);
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.from_result with err", async function () {
    let init = state.from_result<number>(
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expect(init).instanceOf(State);
    expectTypeOf(init).toEqualTypeOf<State<number, number, {}>>();
  });
  it("by state.from_result_ok", async function () {
    let init = state.from_result_ok<number>(Ok(1));
    expect(init).instanceOf(StateOk);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, number, {}>>();
  });
});

describe("Initialize lazy state", function () {
  it("by state_lazy.from", async function () {
    let init = state_lazy.from(() => 1);
    expect(init).instanceOf(StateLazy);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.ok", async function () {
    let init = state_lazy.ok(() => 1);
    expect(init).instanceOf(StateLazyOk);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, number, {}>>();
  });
  it("by state_lazy.err", async function () {
    let init = state_lazy.err<number>(() => {
      return { code: "CL", reason: "Conn Lost" };
    });
    expect(init).instanceOf(StateLazy);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.from_result with ok", async function () {
    let init = state_lazy.from_result<number>(() => Ok(1));
    expect(init).instanceOf(StateLazy);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.from_result with err", async function () {
    let init = state_lazy.from_result<number>(() =>
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expect(init).instanceOf(StateLazy);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, number, {}>>();
  });
  it("by state_lazy.from_result_ok", async function () {
    let init = state_lazy.from_result_ok<number>(() => Ok(1));
    expect(init).instanceOf(StateLazyOk);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, number, {}>>();
  });
});

describe("Initialize delayed state", function () {
  it("by state_delayed.from", async function () {
    let init = state_delayed.from((async () => 1)());
    expect(init).instanceOf(StateDelayed);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.ok", async function () {
    let init = state_delayed.ok((async () => 1)());
    expect(init).instanceOf(StateDelayedOk);
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, number, {}>>();
  });
  it("by state_delayed.err", async function () {
    let init = state_delayed.err<number>(
      (async () => {
        return { code: "CL", reason: "Conn Lost" };
      })()
    );
    expect(init).instanceOf(StateDelayed);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.from_result with ok", async function () {
    let init = state_delayed.from_result<number>((async () => Ok(1))());
    expect(init).instanceOf(StateDelayed);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.from_result with err", async function () {
    let init = state_delayed.from_result<number>(
      (async () => Err({ code: "CL", reason: "Conn Lost" }))()
    );
    expect(init).instanceOf(StateDelayed);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, number, {}>>();
  });
  it("by state_delayed.from_result_ok", async function () {
    let init = state_delayed.from_result_ok<number>((async () => Ok(1))());
    expect(init).instanceOf(StateDelayedOk);
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, number, {}>>();
  });
});
