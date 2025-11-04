import { Err, Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import type { StateSetter } from "../types";
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
  state_test_gen_proxies_write as proxwrite,
  state_test_gen_proxies_write_ok as proxwrite_ok,
  type StateTestsWrite,
} from "./shared";

let gen_states = (setter?: StateSetter<number> | true): StateTestsWrite[] => {
  return [
    ...normals(setter),
    ...lazy(setter),
    ...delayed(setter),
    ...delayed_with_delay(setter),
    ...proxwrite(setter),
    ...normals_ok(setter),
    ...lazy_ok(setter),
    ...delayed_ok(setter),
    ...delayed_with_delay_ok(setter),
    ...proxwrite_ok(setter),
  ];
};

describe(
  "Normal states with setter set to true",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states(true);
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
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
    let tests = gen_states((val) => Ok(Ok(val)));
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
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
    let tests = gen_states((val) => Ok(Ok(val * 2)));
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
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
    let tests = gen_states(() => Ok(Err(errGen())));
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        expect(state.write(10)).equal(true);
        let awaited = await state;
        expect(awaited).toEqual(Err(errGen()));
      });
    }
  }
);
