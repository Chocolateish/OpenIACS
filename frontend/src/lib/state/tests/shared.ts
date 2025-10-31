import { Err, Ok, type Result } from "@libResult";
import {
  state_err,
  state_from,
  state_from_result,
  state_from_result_ok,
  state_ok,
} from "../state";
import type { StateBase } from "../stateBase";
import {
  state_delayed_err,
  state_delayed_from,
  state_delayed_from_result,
  state_delayed_from_result_ok,
  state_delayed_ok,
} from "../stateDelayed";
import {
  state_lazy_err,
  state_lazy_from,
  state_lazy_from_result,
  state_lazy_from_result_ok,
  state_lazy_ok,
} from "../stateLazy";
import {
  state_proxy_from,
  state_proxy_from_ok,
  state_proxy_ok,
  state_proxy_ok_from_ok,
} from "../stateProxy";
import {
  state_proxy_write_from,
  state_proxy_write_from_ok,
  state_proxy_write_ok,
  state_proxy_write_ok_from_ok,
} from "../stateProxyWrite";
import type { StateError, StateOwner, StateRead } from "../types";

export function state_test_gen_error() {
  return { code: "TEST", reason: "Test Error" };
}

export type StateTestsRead = [
  string,
  StateRead<number, any>,
  (val: Result<number, StateError>) => void,
  StateBase<any, any, any>
];

export function norm(
  text: string,
  state: StateBase<any, any, any> & StateOwner<any>
): StateTestsRead {
  return [
    text,
    state.readable,
    (val: Result<number, StateError>) => state.owner.set(val),
    state,
  ];
}
export function state_test_gen_normals(): StateTestsRead[] {
  return [
    //State
    norm("state_from", state_from(1)),
    norm("state_ok", state_ok(1)),
    norm("state_err", state_err<number>(state_test_gen_error())),
    norm(
      "state_from_result",
      state_from_result<number>(Err(state_test_gen_error()))
    ),
    norm("state_from_result_ok", state_from_result_ok<number>(Ok(1))),
    //State Lazy
    norm(
      "state_lazy_from",
      state_lazy_from(() => 1)
    ),
    norm(
      "state_lazy_ok",
      state_lazy_ok(() => 1)
    ),
    norm(
      "state_lazy_err",
      state_lazy_err<number>(() => state_test_gen_error())
    ),
    norm(
      "state_lazy_from_result",
      state_lazy_from_result<number>(() => Err(state_test_gen_error()))
    ),
    norm(
      "state_lazy_from_result_ok",
      state_lazy_from_result_ok<number>(() => Ok(1))
    ),
    //State Delayed
    norm("state_delayed_from", state_delayed_from((async () => 1)())),
    norm("state_delayed_ok", state_delayed_ok((async () => 1)())),
    norm(
      "state_delayed_err",
      state_delayed_err<number>((async () => state_test_gen_error())())
    ),
    norm(
      "state_delayed_from_result",
      state_delayed_from_result<number>(
        (async () => Err(state_test_gen_error()))()
      )
    ),
    norm(
      "state_delayed_from_result_ok",
      state_delayed_from_result_ok<number>((async () => Ok(1))())
    ),
    //State Delayed With Delay
    norm(
      "state_delayed_from",
      state_delayed_from(
        (async () => {
          await new Promise((a) => setTimeout(a, 4));
          return 1;
        })()
      )
    ),
    norm(
      "state_delayed_ok",
      state_delayed_ok(
        (async () => {
          await new Promise((a) => setTimeout(a, 4));
          return 1;
        })()
      )
    ),
    norm(
      "state_delayed_err",
      state_delayed_err<number>(
        (async () => {
          await new Promise((a) => setTimeout(a, 4));
          return state_test_gen_error();
        })()
      )
    ),
    norm(
      "state_delayed_from_result",
      state_delayed_from_result<number>(
        (async () => {
          await new Promise((a) => setTimeout(a, 4));
          return Err(state_test_gen_error());
        })()
      )
    ),
    norm(
      "state_delayed_from_result_ok",
      state_delayed_from_result_ok<number>(
        (async () => {
          await new Promise((a) => setTimeout(a, 4));
          return Ok(1);
        })()
      )
    ),
  ];
}

export function state_test_gen_proxies(): StateTestsRead[] {
  let s1 = state_ok(1);
  let s2 = state_ok(1);
  let s3 = state_ok(1);
  let s4 = state_ok(1);
  let s5 = state_ok(1);
  let s6 = state_ok(1);
  let s7 = state_ok(1);
  let s8 = state_ok(1);
  let sp1 = state_proxy_ok(s1);
  let sp2 = state_proxy_ok_from_ok(s2);
  let sp3 = state_proxy_from(s3);
  let sp4 = state_proxy_from_ok(s4);
  let sp5 = state_proxy_write_ok(s5);
  let sp6 = state_proxy_write_ok_from_ok(s6);
  let sp7 = state_proxy_write_from(s7);
  let sp8 = state_proxy_write_from_ok(s8);
  let func = (s: StateOwner<number>) => {
    return (val: Result<number, StateError>) => {
      s.set(val);
    };
  };
  return [
    ["state_proxy_ok", sp1.readable, func(s1), sp1],
    ["state_proxy_ok_from_ok", sp2.readable, func(s2), sp2],
    ["state_proxy_from", sp3.readable, func(s3), sp3],
    ["state_proxy_from_ok", sp4.readable, func(s4), sp4],
    ["state_proxy_write_ok", sp5.readable, func(s5), sp5],
    ["state_proxy_write_ok_from_ok", sp6.readable, func(s6), sp6],
    ["state_proxy_write_from", sp7.readable, func(s7), sp7],
    ["state_proxy_write_from_ok", sp8.readable, func(s8), sp8],
  ];
}
