import { Err, Ok, ResultOk, type Result } from "@libResult";
import { describe, expect, expectTypeOf, it } from "vitest";
import * as all from "../index";
import { StateInternal, type State, type StateOk } from "../state";
import {
  StateDelayedInternal,
  type StateDelayed,
  type StateDelayedOk,
} from "../stateDelayed";
import {
  StateDerivedInternal,
  type StateDerived,
  type StateDerivedOk,
} from "../stateDerived";
import {
  StateLazyInternal,
  type StateLazy,
  type StateLazyOk,
} from "../stateLazy";
import {
  StateProxyInternal,
  type StateProxy,
  type StateProxyFromOK,
  type StateProxyOk,
  type StateProxyOkFromOk,
} from "../stateProxy";
import {
  StateProxyWriteInternal,
  type StateProxyWrite,
  type StateProxyWriteFromOK,
  type StateProxyWriteOk,
  type StateProxyWriteOkFromOk,
} from "../stateProxyWrite";

//       _____ _______    _______ ______
//      / ____|__   __|/\|__   __|  ____|
//     | (___    | |  /  \  | |  | |__
//      \___ \   | | / /\ \ | |  |  __|
//      ____) |  | |/ ____ \| |  | |____
//     |_____/   |_/_/    \_\_|  |______|
describe("Initialize normal state", function () {
  it("by state_from", async function () {
    let init = all.state_from(1);
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state_ok", async function () {
    let init = all.state_ok(1);
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, {}>>();
  });
  it("by state_err", async function () {
    let init = all.state_err<number>({ code: "CL", reason: "Conn Lost" });
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state_from_result with ok", async function () {
    let init = all.state_from_result<number>(Ok(1));
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state_from_result with err", async function () {
    let init = all.state_from_result<number>(
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<State<number, {}>>();
  });
  it("by state_from_result_ok", async function () {
    let init = all.state_from_result_ok<number>(Ok(1));
    expect(init).instanceOf(StateInternal);
    expectTypeOf(init).toEqualTypeOf<StateOk<number, {}>>();
  });
});

//      _                ________     __
//     | |        /\    |___  /\ \   / /
//     | |       /  \      / /  \ \_/ /
//     | |      / /\ \    / /    \   /
//     | |____ / ____ \  / /__    | |
//     |______/_/    \_\/_____|   |_|
describe("Initialize lazy state", function () {
  it("by state_lazy_from", async function () {
    let init = all.state_lazy_from(() => 1);
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy_ok", async function () {
    let init = all.state_lazy_ok(() => 1);
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, {}>>();
  });
  it("by state_lazy_err", async function () {
    let init = all.state_lazy_err<number>(() => {
      return { code: "CL", reason: "Conn Lost" };
    });
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy_from_result with ok", async function () {
    let init = all.state_lazy_from_result<number>(() => Ok(1));
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy_from_result with err", async function () {
    let init = all.state_lazy_from_result<number>(() =>
      Err({ code: "CL", reason: "Conn Lost" })
    );
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazy<number, {}>>();
  });
  it("by state_lazy_from_result_ok", async function () {
    let init = all.state_lazy_from_result_ok<number>(() => Ok(1));
    expect(init).instanceOf(StateLazyInternal);
    expectTypeOf(init).toEqualTypeOf<StateLazyOk<number, {}>>();
  });
});

//      _____  ______ _           __     ________ _____
//     |  __ \|  ____| |        /\\ \   / /  ____|  __ \
//     | |  | | |__  | |       /  \\ \_/ /| |__  | |  | |
//     | |  | |  __| | |      / /\ \\   / |  __| | |  | |
//     | |__| | |____| |____ / ____ \| |  | |____| |__| |
//     |_____/|______|______/_/    \_\_|  |______|_____/
describe("Initialize delayed state", function () {
  it("by state_delayed_from", async function () {
    let init = all.state_delayed_from((async () => 1)());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed_ok", async function () {
    let init = all.state_delayed_ok((async () => 1)());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, {}>>();
  });
  it("by state_delayed_err", async function () {
    let init = all.state_delayed_err<number>(
      (async () => {
        return { code: "CL", reason: "Conn Lost" };
      })()
    );
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed_from_result with ok", async function () {
    let init = all.state_delayed_from_result<number>((async () => Ok(1))());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed_from_result with err", async function () {
    let init = all.state_delayed_from_result<number>(
      (async () => Err({ code: "CL", reason: "Conn Lost" }))()
    );
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayed<number, {}>>();
  });
  it("by state_delayed_from_result_ok", async function () {
    let init = all.state_delayed_from_result_ok<number>((async () => Ok(1))());
    expect(init).instanceOf(StateDelayedInternal);
    expectTypeOf(init).toEqualTypeOf<StateDelayedOk<number, {}>>();
  });
});

//      _____  _____   ______   ____     __
//     |  __ \|  __ \ / __ \ \ / /\ \   / /
//     | |__) | |__) | |  | \ V /  \ \_/ /
//     |  ___/|  _  /| |  | |> <    \   /
//     | |    | | \ \| |__| / . \    | |
//     |_|    |_|  \_\\____/_/ \_\   |_|
describe("Initialize proxy state", function () {
  it("by state_proxy_from", async function () {
    let init = all.state_proxy_from(all.state_ok(1));
    expect(init).instanceOf(StateProxyInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxy<number, true>>();
  });
  it("by state_proxy_from_ok", async function () {
    let init = all.state_proxy_from_ok(all.state_ok(1));
    expect(init).instanceOf(StateProxyInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyFromOK<number, true>>();
  });
  it("by state_proxy_ok", async function () {
    let init = all.state_proxy_ok(all.state_ok(1));
    expect(init).instanceOf(StateProxyInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyOk<number, true>>();
  });
  it("by state_proxy_ok_from_ok", async function () {
    let init = all.state_proxy_ok_from_ok(all.state_ok(1));
    expect(init).instanceOf(StateProxyInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyOkFromOk<number, true>>();
  });
});

//      _____  _____   ______   ____     __ __          _______  _____ _______ ______
//     |  __ \|  __ \ / __ \ \ / /\ \   / / \ \        / /  __ \|_   _|__   __|  ____|
//     | |__) | |__) | |  | \ V /  \ \_/ /   \ \  /\  / /| |__) | | |    | |  | |__
//     |  ___/|  _  /| |  | |> <    \   /     \ \/  \/ / |  _  /  | |    | |  |  __|
//     | |    | | \ \| |__| / . \    | |       \  /\  /  | | \ \ _| |_   | |  | |____
//     |_|    |_|  \_\\____/_/ \_\   |_|        \/  \/   |_|  \_\_____|  |_|  |______|
describe("Initialize proxy write state", function () {
  it("by state_proxy_write_from", async function () {
    let init = all.state_proxy_write_from(all.state_ok(1));
    expect(init).instanceOf(StateProxyWriteInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyWrite<number, true>>();
  });
  it("by state_proxy_write_from_ok", async function () {
    let init = all.state_proxy_write_from_ok(all.state_ok(1));
    expect(init).instanceOf(StateProxyWriteInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyWriteFromOK<number, true>>();
  });
  it("by state_proxy_write_ok", async function () {
    let init = all.state_proxy_write_ok(all.state_ok(1));
    expect(init).instanceOf(StateProxyWriteInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyWriteOk<number, true>>();
  });
  it("by state_proxy_write_ok_from_ok", async function () {
    let init = all.state_proxy_write_ok_from_ok(all.state_ok(1));
    expect(init).instanceOf(StateProxyWriteInternal);
    expectTypeOf(init).toEqualTypeOf<StateProxyWriteOkFromOk<number, true>>();
  });
});

//      _____  ______ _____  _______      ________ _____
//     |  __ \|  ____|  __ \|_   _\ \    / /  ____|  __ \
//     | |  | | |__  | |__) | | |  \ \  / /| |__  | |  | |
//     | |  | |  __| |  _  /  | |   \ \/ / |  __| | |  | |
//     | |__| | |____| | \ \ _| |_   \  /  | |____| |__| |
//     |_____/|______|_|  \_\_____|   \/   |______|_____/

describe("Initialize derived state", function () {
  it("by state_derived_from_states", async function () {
    let init = all.state_derived_from_states(
      (values) => {
        expectTypeOf(values[0]).toEqualTypeOf<ResultOk<number>>();
        expectTypeOf(values[1]).toEqualTypeOf<Result<number, all.StateError>>();
        expectTypeOf(values[2]).toEqualTypeOf<ResultOk<number>>();
        return Ok(values[0].value + values[1].unwrapOr(1) + values[2].value);
      },
      all.state_ok(1).readable,
      all.state_from(1).readable,
      all.state_ok(1).readable
    );
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerived<
        number,
        [
          all.StateReadOk<number, true, {}>,
          all.StateRead<number, true, {}>,
          all.StateReadOk<number, true, {}>
        ],
        any
      >
    >();
  });
  it("by state_derived_from_states", async function () {
    let init = all.state_derived_ok_from_states(
      (values) => {
        expectTypeOf(values[0]).toEqualTypeOf<ResultOk<number>>();
        expectTypeOf(values[1]).toEqualTypeOf<Result<number, all.StateError>>();
        expectTypeOf(values[2]).toEqualTypeOf<ResultOk<number>>();
        return Ok(values[0].value + values[1].unwrapOr(1) + values[2].value);
      },
      all.state_ok(1),
      all.state_from(1),
      all.state_ok(1)
    );
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerivedOk<
        number,
        [StateOk<number, {}>, State<number, {}>, StateOk<number, {}>],
        any
      >
    >();
  });
  it("by state_derived_from_state", async function () {
    let init = all.state_derived_from_state_array(
      (values) => {
        expectTypeOf(values[0]).toEqualTypeOf<ResultOk<number>>();
        expectTypeOf(values[1]).toEqualTypeOf<ResultOk<number>>();
        expectTypeOf(values[2]).toEqualTypeOf<ResultOk<number>>();
        return Ok(values[0].value + values[1].value + values[2].value);
      },
      [all.state_ok(1), all.state_ok(1), all.state_ok(1)]
    );
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerived<number, all.StateOk<number, {}>[], any>
    >();
  });
  it("by state_derived_from_states", async function () {
    let init = all.state_derived_ok_from_state_array(
      (values) => {
        expectTypeOf(values[0]).toEqualTypeOf<ResultOk<number>>();
        expectTypeOf(values[1]).toEqualTypeOf<ResultOk<number>>();
        expectTypeOf(values[2]).toEqualTypeOf<ResultOk<number>>();
        return Ok(values[0].value + values[1].value + values[2].value);
      },
      [all.state_ok(1), all.state_ok(1), all.state_ok(1)]
    );
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerivedOk<number, StateOk<number>[], any>
    >();
  });
});

//      _____  ______ _____  _______      ________  _____
//     |  __ \|  ____|  __ \|_   _\ \    / /  ____|/ ____|
//     | |  | | |__  | |__) | | |  \ \  / /| |__  | (___
//     | |  | |  __| |  _  /  | |   \ \/ / |  __|  \___ \
//     | |__| | |____| | \ \ _| |_   \  /  | |____ ____) |
//     |_____/|______|_|  \_\_____|   \/   |______|_____/

describe("Initialize derived state", function () {
  it("by state_derives_sum_from", async function () {
    let init = all.state_derives_sum_from(all.state_ok(1), all.state_from(1));
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerived<number, all.StateRead<number>[], any>
    >();
  });
  it("by state_derives_sum_from_ok", async function () {
    let init = all.state_derives_sum_from_ok(
      all.state_ok(1),
      all.state_from(1)
    );
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerived<number, [all.StateOk<number>, all.State<number>], any>
    >();
  });
  it("by state_derives_sum_from_ok", async function () {
    let init = all.state_derives_sum_ok_from_ok(
      all.state_ok(1),
      all.state_ok(1)
    );
    expect(init).instanceOf(StateDerivedInternal);
    expectTypeOf(init).toEqualTypeOf<
      StateDerivedOk<number, [all.StateOk<number>, all.StateOk<number>], any>
    >();
  });
});
