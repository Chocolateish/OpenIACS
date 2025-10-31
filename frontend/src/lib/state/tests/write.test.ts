import { Err, Ok, Some } from "@libResult";
import { describe, expect, it } from "vitest";
import * as all from "../index";
import type { StateHelper, StateSetter, StateSetterOk } from "../types";
import { state_test_gen_error } from "./shared";

let gen_states = (
  setter: StateSetter<number> | true,
  setterOk: StateSetterOk<number> | true,
  helper?: StateHelper<number>
) => {
  return {
    testsResults: {
      "state.from": all.state_from(1, setter, helper),
      "state_lazy.from": all.state_lazy_from(() => 1, setter, helper),
      "state_delayed.from": all.state_delayed_from(
        (async () => 1)(),
        setter,
        helper
      ),
      "state_delayed.from with sleep": all.state_delayed_from(
        (async () => {
          await new Promise((a) => {
            setTimeout(a, 10);
          });
          return 1;
        })(),
        setter,
        helper
      ),
    },
    testsOks: {
      "state.ok": all.state_ok(1, setterOk, helper),
      "state_lazy.ok": all.state_lazy_ok(() => 1, setterOk, helper),
      "state_delayed.ok": all.state_delayed_ok(
        (async () => 1)(),
        setterOk,
        helper
      ),
      "state_delayed.ok with sleep": all.state_delayed_ok(
        (async () => {
          await new Promise((a) => {
            setTimeout(a, 10);
          });
          return 1;
        })(),
        setterOk,
        helper
      ),
    },
    testsErrs: {
      "state.err": all.state_err<number>(
        state_test_gen_error(),
        setter,
        helper
      ),
      "state_lazy.err": all.state_lazy_err<number>(
        () => state_test_gen_error(),
        setter,
        helper
      ),
      "state_delayed.err with sleep": all.state_delayed_err<number>(
        (async () => {
          await new Promise((a) => {
            setTimeout(a, 10);
          });
          return state_test_gen_error();
        })(),
        setter,
        helper
      ),
    },
  };
};

describe(
  "Normal states with setter set to true",
  {
    timeout: 50,
  },
  function () {
    let { testsResults, testsOks, testsErrs } = gen_states(true, true);
    let states = { ...testsResults, ...testsOks, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        expect(state.write(10)).equal(true);
        let awaited = await state;
        expect(awaited).toEqual(Ok(10));
      });
    }
  }
);

describe(
  "Normal states with setter set to simple function",
  {
    timeout: 50,
  },
  function () {
    let { testsResults, testsOks, testsErrs } = gen_states(
      (val) => Some(Ok(val)),
      (val) => Some(Ok(val))
    );
    let states = { ...testsResults, ...testsOks, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        expect(state.write(10)).equal(true);
        let awaited = await state;
        expect(awaited).toEqual(Ok(10));
      });
    }
  }
);

describe(
  "Normal states with setter set to transforming function",
  {
    timeout: 50,
  },
  function () {
    let { testsResults, testsOks, testsErrs } = gen_states(
      (val) => Some(Ok(val * 2)),
      (val) => Some(Ok(val * 2))
    );
    let states = { ...testsResults, ...testsOks, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        expect(state.write(10)).equal(true);
        let awaited = await state;
        expect(awaited).toEqual(Ok(20));
      });
    }
  }
);

describe(
  "Normal states with setter set to function returning error",
  {
    timeout: 50,
  },
  function () {
    let { testsResults, testsErrs } = gen_states(
      () => Some(Err(state_test_gen_error())),
      (val) => Some(Ok(val * 2))
    );
    let states = { ...testsResults, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        expect(state.write(10)).equal(true);
        let awaited = await state;
        expect(awaited).toEqual(Err(state_test_gen_error()));
      });
    }
  }
);

// describe(
//   "Normal states with setter set to function returning none",
//   {
//     timeout: 50,
//   },
//   function () {
//     let { testsResults, testsOks, testsErrs } = gen_states(
//       () => None(),
//       () => None()
//     );
//     let states = { ...testsResults, ...testsOks };
//     for (const key in states) {
//       it(key, async function () {
//         let state = states[key as keyof typeof states];
//         expect(state.write(10);
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(1));
//       });
//     }
//     for (const key in testsErrs) {
//       it(key, async function () {
//         let state = testsErrs[key as keyof typeof testsErrs];
//         expect(state.write(10);
//         let awaited = await state;
//         expect(awaited).toEqual(Err(gen_error()));
//       });
//     }
//   }
// );
