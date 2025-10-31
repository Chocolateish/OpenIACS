import { Ok, ResultOk } from "@libResult";
import { describe, expect, it } from "vitest";
import {
  state_test_gen_normals as normals,
  state_test_gen_proxies as proxies,
  type StateTestsRead,
} from "./shared";

let gen_states = (): StateTestsRead[] => {
  return [...normals(), ...proxies()];
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
        expect(awaited).instanceOf(ResultOk);
        expect(awaited).toEqual(Ok(1));
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
            expect(val).instanceOf(ResultOk);
            expect(val).toEqual(Ok(1));
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
                expect(val).instanceOf(ResultOk);
                expect(val).toEqual(Ok(1));
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
                expect(val).instanceOf(ResultOk);
                expect(val).toEqual(Ok(1));
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
