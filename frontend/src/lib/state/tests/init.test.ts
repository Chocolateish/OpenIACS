import { Err, Ok } from "@libResult";
import { describe, expect, expectTypeOf, it } from "vitest";
import * as all from "../index";
import { StateInternal, type State, type StateOk } from "../state";
import {
  StateDelayedInternal,
  type StateDelayed,
  type StateDelayedOk,
} from "../stateDelayed";
import {
  StateLazyInternal,
  type StateLazy,
  type StateLazyOk,
} from "../stateLazy";

describe("Initialize normal state", function () {
  it("by state.from", async function () {
    let init = all.state_from(1);
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state.ok", async function () {
    let init = all.state_ok(1);
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, {}>>();
  });
  it("by state.err", async function () {
    let init = all.state_err<number>({ code: "CL", reason: "Conn Lost" });
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state.from_result with ok", async function () {
    let init = all.state_from_result<number>(Ok(1));
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state.from_result with err", async function () {
    let init = all.state_from_result<number>(
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state.from_result_ok", async function () {
    let init = all.state_from_result_ok<number>(Ok(1));
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, {}>>();
  });
});

describe("Initialize lazy state", function () {
  it("by state_lazy.from", async function () {
    let init = all.state_lazy_from(() => 1);
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy.ok", async function () {
    let init = all.state_lazy_ok(() => 1);
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, {}>>();
  });
  it("by state_lazy.err", async function () {
    let init = all.state_lazy_err<number>(() => {
      return { code: "CL", reason: "Conn Lost" };
    });
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy.from_result with ok", async function () {
    let init = all.state_lazy_from_result<number>(() => Ok(1));
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy.from_result with err", async function () {
    let init = all.state_lazy_from_result<number>(() =>
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy.from_result_ok", async function () {
    let init = all.state_lazy_from_result_ok<number>(() => Ok(1));
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, {}>>();
  });
});

describe("Initialize delayed state", function () {
  it("by state_delayed.from", async function () {
    let init = all.state_delayed_from((async () => 1)());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed.ok", async function () {
    let init = all.state_delayed_ok((async () => 1)());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, {}>>();
  });
  it("by state_delayed.err", async function () {
    let init = all.state_delayed_err<number>(
      (async () => {
        return { code: "CL", reason: "Conn Lost" };
      })()
    );
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed.from_result with ok", async function () {
    let init = all.state_delayed_from_result<number>((async () => Ok(1))());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed.from_result with err", async function () {
    let init = all.state_delayed_from_result<number>(
      (async () => Err({ code: "CL", reason: "Conn Lost" }))()
    );
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed.from_result_ok", async function () {
    let init = all.state_delayed_from_result_ok<number>((async () => Ok(1))());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, {}>>();
  });
});
