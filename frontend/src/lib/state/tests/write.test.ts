import { Err, Ok, Some } from "@libResult";
import { describe, expect, it } from "vitest";
import { state, state_delayed, state_lazy } from "../index";
import type { StateHelper, StateSetter, StateSetterOk } from "../types";

let gen_error = () => {
  return { code: "CL", reason: "Conn Lost" };
};
let gen_states = (
  setter: StateSetter<number> | true,
  setterOk: StateSetterOk<number> | true,
  helper?: StateHelper<number>
) => {
  return {
    testsResults: {
      "state.from": state.from(1, setter, helper),
      "state_lazy.from": state_lazy.from(() => 1, setter, helper),
      "state_delayed.from": state_delayed.from(
        (async () => 1)(),
        setter,
        helper
      ),
      "state_delayed.from with sleep": state_delayed.from(
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
      "state.ok": state.ok(1, setterOk, helper),
      "state_lazy.ok": state_lazy.ok(() => 1, setterOk, helper),
      "state_delayed.ok": state_delayed.ok((async () => 1)(), setterOk, helper),
      "state_delayed.ok with sleep": state_delayed.ok(
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
      "state.err": state.err<number>(gen_error(), setter, helper),
      "state_lazy.err": state_lazy.err<number>(
        () => gen_error(),
        setter,
        helper
      ),
      "state_delayed.err with sleep": state_delayed.err<number>(
        (async () => {
          await new Promise((a) => {
            setTimeout(a, 10);
          });
          return gen_error();
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
      () => Some(Err(gen_error())),
      (val) => Some(Ok(val * 2))
    );
    let states = { ...testsResults, ...testsErrs };
    for (const key in states) {
      it(key, async function () {
        let state = states[key as keyof typeof states];
        expect(state.write(10)).equal(true);
        let awaited = await state;
        expect(awaited).toEqual(Err(gen_error()));
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
