import { Err, Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import {
  state_test_gen_delayed as delayed,
  state_test_gen_delayed_ok as delayed_ok,
  state_test_gen_delayed_with_delay as delayed_with_delay,
  state_test_gen_delayed_with_delay_ok as delayed_with_delay_ok,
  state_test_gen_error as errGen,
  state_test_gen_lazy as lazy,
  state_test_gen_lazy_ok as lazy_ok,
  state_test_gen_normals as normals,
  state_test_gen_normals_ok as normals_ok,
  type StateTestsRead,
} from "./shared";

let gen_states = (): StateTestsRead[] => {
  return [
    ...normals(),
    ...lazy(),
    ...delayed(),
    ...delayed_with_delay(),
    ...normals_ok(),
    ...lazy_ok(),
    ...delayed_ok(),
    ...delayed_with_delay_ok(),
  ];
};

let gen_states_ok = (): StateTestsRead[] => {
  return [
    ...normals_ok(),
    ...lazy_ok(),
    ...delayed_ok(),
    ...delayed_with_delay_ok(),
  ];
};

describe(
  "Set state value right after initialization to ok",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        test[2].set(Ok(5));
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
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        let awaited = await state;
        test[2].set(Ok(5));
        awaited = await state;
        expect(awaited).toEqual(Ok(5));
      });
    }
  }
);

describe(
  "SetErr state value right after initialization to err",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        test[2].setErr(errGen());
        let awaited = await state;
        expect(awaited).toEqual(Err(errGen()));
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
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        let awaited = await state;
        test[2].setErr(errGen());
        awaited = await state;
        expect(awaited).toEqual(Err(errGen()));
      });
    }
  }
);

describe(
  "SetOk state value right after initialization to value",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states_ok();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        test[2].setOk(6);
        let awaited = await state;
        expect(awaited).toEqual(Ok(6));
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
    let tests = gen_states_ok();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        let awaited = await state;
        test[2].setOk(6);
        awaited = await state;
        expect(awaited).toEqual(Ok(6));
      });
    }
  }
);
