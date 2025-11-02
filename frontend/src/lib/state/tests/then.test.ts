import { Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import {
  state_test_gen_delayed as delayed,
  state_test_gen_delayed_ok as delayed_ok,
  state_test_gen_delayed_with_delay as delayed_with_delay,
  state_test_gen_delayed_with_delay_ok as delayed_with_delay_ok,
  state_test_gen_lazy as lazy,
  state_test_gen_lazy_ok as lazy_ok,
  state_test_gen_normals as normals,
  state_test_gen_normals_ok as normals_ok,
  state_test_gen_proxies as proxies,
  state_test_gen_proxies_ok as proxies_ok,
  state_test_gen_proxies_write as proxwrite,
  state_test_gen_proxies_write_ok as proxwrite_ok,
  type StateTestsRead,
} from "./shared";

let gen_states = (): StateTestsRead[] => {
  return [
    ...normals(),
    ...lazy(),
    ...delayed(),
    ...delayed_with_delay(),
    ...proxies(),
    ...proxwrite(),
    ...normals_ok(),
    ...lazy_ok(),
    ...delayed_ok(),
    ...delayed_with_delay_ok(),
    ...proxies_ok(),
    ...proxwrite_ok(),
  ];
};

describe(
  "Awaiting states",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let awaited = await test[1];
        expect(awaited).instanceOf(test[5]);
        expect(awaited).toEqual(test[4]);
      });
    }
  }
);

describe(
  "Using then method",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        await new Promise((a) => {
          state.then((val) => {
            expect(val).instanceOf(test[5]);
            expect(val).toEqual(test[4]);
            a(null);
          });
        });
      });
    }
  }
);

describe(
  "Using then chaining",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        expect(
          await new Promise((a) => {
            state
              .then((val) => {
                expect(val).instanceOf(test[5]);
                expect(val).toEqual(test[4]);
                return 8;
              })
              .then((val) => {
                expect(val).equal(8);
                a(12);
              });
          })
        ).equal(12);
      });
    }
  }
);

describe(
  "Using then chaining with throw",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let state = test[1];
        expect(
          await new Promise((a) => {
            state
              .then((val) => {
                expect(val).instanceOf(test[5]);
                expect(val).toEqual(test[4]);
                throw 8;
              })
              .then(
                () => {},
                (val) => {
                  expect(val).equal(8);
                  a(12);
                }
              );
          })
        ).equal(12);
      });
    }
  }
);

describe(
  "Awaiting states twice",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let awaited = await test[1];
        expect(awaited).instanceOf(test[5]);
        expect(awaited).toEqual(test[4]);
        let awaited2 = await test[1];
        expect(awaited2).instanceOf(test[5]);
        expect(awaited2).toEqual(test[4]);
      });
    }
  }
);

describe(
  "Awaiting states trice",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let awaited = await test[1];
        expect(awaited).instanceOf(test[5]);
        expect(awaited).toEqual(test[4]);
        let awaited2 = await test[1];
        expect(awaited2).instanceOf(test[5]);
        expect(awaited2).toEqual(test[4]);
        let awaited3 = await test[1];
        expect(awaited3).instanceOf(test[5]);
        expect(awaited3).toEqual(test[4]);
      });
    }
  }
);

describe(
  "Setting then awaiting states",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        test[2].set(Ok(7));
        let awaited = await test[1];
        expect(awaited).toEqual(Ok(7));
      });
    }
  }
);

describe(
  "Awaiting states then setting",
  {
    timeout: 50,
  },
  function () {
    let tests = gen_states();
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      it(test[0], async function () {
        let awaited = await test[1];
        test[2].set(Ok(7));
        expect(awaited).instanceOf(test[5]);
        expect(awaited).toEqual(test[4]);
        let awaited2 = await test[1];
        expect(awaited2).toEqual(Ok(7));
      });
    }
  }
);
