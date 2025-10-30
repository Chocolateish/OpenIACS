import { Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import * as all from "../index";

let gen_error = () => {
  return { code: "CL", reason: "Conn Lost" };
};
let gen_states = () => {
  return {
    testsOks: {
      "state.from": all.state_from(1),
      "state.ok": all.state_ok(1),
      "state_lazy.from": all.state_lazy_from(() => 1),
      "state_lazy.ok": all.state_lazy_ok(() => 1),
      "state_delayed.from": all.state_delayed_from((async () => 1)()),
      "state_delayed.ok": all.state_delayed_ok((async () => 1)()),
    },
    testsErrs: {
      "state.err": all.state_err<number>(gen_error()),
      "state_lazy.err": all.state_lazy_err<number>(() => gen_error()),
      "state_delayed.err": all.state_delayed_err<number>(
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
