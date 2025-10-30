import { Err, Ok, ResultErr, ResultOk } from "@libResult";
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
