import { Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import { state, state_delayed, state_lazy } from "../index";

let gen_error = () => {
  return { code: "CL", reason: "Conn Lost" };
};
let gen_states = () => {
  return {
    testsOks: {
      "state.from": state.from(1),
      "state.ok": state.ok(1),
      "state_lazy.from": state_lazy.from(() => 1),
      "state_lazy.ok": state_lazy.ok(() => 1),
      "state_delayed.from": state_delayed.from((async () => 1)()),
      "state_delayed.ok": state_delayed.ok((async () => 1)()),
    },
    testsErrs: {
      "state.err": state.err<number>(gen_error()),
      "state_lazy.err": state_lazy.err<number>(() => gen_error()),
      "state_delayed.err": state_delayed.err<number>(
        (async () => gen_error())()
      ),
    },
  };
};

describe(
  "Set state value right after initialization to ok",
  {
    timeout: 50,
  },
  function () {
    let { testsOks, testsErrs } = gen_states();
    let states = { ...testsOks, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        state.set(Ok(5));
        let awaited = await state;
        expect(awaited).toEqual(Ok(5));
      });
    }
  }
);

describe(
  "Awaiting state then getting then setting value",
  {
    timeout: 50,
  },
  function () {
    let { testsOks, testsErrs } = gen_states();
    let states = { ...testsOks, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        let awaited = await state;
        state.set(Ok(5));
        awaited = await state;
        expect(awaited).toEqual(Ok(5));
      });
    }
  }
);
