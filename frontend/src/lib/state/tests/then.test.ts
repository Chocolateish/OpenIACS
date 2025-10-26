import { Err, Ok, ResultErr, ResultOk } from "@libResult";
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
  "Awaiting states",
  {
    timeout: 50,
  },
  function () {
    let { testsOks, testsErrs } = gen_states();
    for (const key in testsOks) {
      it(key, async function () {
        let awaited = await testsOks[key as keyof typeof testsOks];
        expect(awaited).instanceOf(ResultOk);
        expect(awaited).toEqual(Ok(1));
      });
    }
    for (const key in testsErrs) {
      it(key, async function () {
        let awaited = await testsErrs[key as keyof typeof testsErrs];
        expect(awaited).instanceOf(ResultErr);
        expect(awaited).toEqual(Err(gen_error()));
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
    let { testsOks, testsErrs } = gen_states();
    for (const key in testsOks) {
      it(key, async function () {
        let state = testsOks[key as keyof typeof testsOks];
        await new Promise((a) => {
          state.then((val) => {
            expect(val).instanceOf(ResultOk);
            expect(val).toEqual(Ok(1));
            a(null);
          });
        });
      });
    }
    for (const key in testsErrs) {
      it(key, async function () {
        let state = testsErrs[key as keyof typeof testsErrs];
        await new Promise((a) => {
          state.then((val) => {
            expect(val).instanceOf(ResultErr);
            expect(val).toEqual(Err(gen_error()));
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
    let { testsOks, testsErrs } = gen_states();
    for (const key in testsOks) {
      it(key, async function () {
        let state = testsOks[key as keyof typeof testsOks];
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
    for (const key in testsErrs) {
      it(key, async function () {
        let state = testsErrs[key as keyof typeof testsErrs];
        expect(
          await new Promise((a) => {
            state
              .then((val) => {
                expect(val).instanceOf(ResultErr);
                expect(val).toEqual(Err(gen_error()));
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
    let { testsOks, testsErrs } = gen_states();
    for (const key in testsOks) {
      it(key, async function () {
        let state = testsOks[key as keyof typeof testsOks];
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
    for (const key in testsErrs) {
      it(key, async function () {
        let state = testsErrs[key as keyof typeof testsErrs];
        expect(
          await new Promise((a) => {
            state
              .then((val) => {
                expect(val).instanceOf(ResultErr);
                expect(val).toEqual(Err(gen_error()));
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
