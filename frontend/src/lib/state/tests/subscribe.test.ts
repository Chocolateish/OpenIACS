import { state, state_delayed, state_lazy } from "@libState";
import { describe, expect, it } from "vitest";

let gen_error = () => {
  return { code: "CL", reason: "Conn Lost" };
};
let gen_states = () => {
  return {
    testsOks: {
      "state.ok": state.ok(1),
      "state_lazy.ok": state_lazy.ok(() => 1),
      "state_delayed.ok": state_delayed.ok((async () => 1)()),
    },
    tests: {
      "state.from": state.from(1),
      "state_lazy.from": state_lazy.from(() => 1),
      "state_delayed.from": state_delayed.from((async () => 1)()),
      "state.err": state.err<number>(gen_error()),
      "state_lazy.err": state_lazy.err<number>(() => gen_error()),
      "state_delayed.err": state_delayed.err<number>(
        (async () => gen_error())()
      ),
    },
  };
};

describe(
  "Subscribing with update set to true",
  {
    timeout: 50,
  },
  function () {
    let { testsOks, tests } = gen_states();
    for (const key in testsOks) {
      it(key, async function () {
        let state = testsOks[key as keyof typeof testsOks];
        await new Promise<void>((a) => {
          state.subscribe(() => {
            a();
          }, true);
        });
      });
    }
    for (const key in tests) {
      it(key, async function () {
        let state = tests[key as keyof typeof tests];
        await new Promise<void>((a) => {
          state.subscribe(() => {
            a();
          }, true);
        });
      });
    }
  }
);

describe(
  "Subscribing with update set to false, then setting value",
  {
    timeout: 50,
  },
  function () {
    let { testsOks, tests } = gen_states();
    for (const key in testsOks) {
      it(key, async function () {
        let state = testsOks[key as keyof typeof testsOks];
        await new Promise<void>((a) => {
          state.subscribe((val) => {
            expect(val.value).equal(5);
            a();
          });
          state.setOk(5);
        });
      });
    }
    for (const key in tests) {
      it(key, async function () {
        let state = tests[key as keyof typeof tests];
        await new Promise<void>((a) => {
          state.subscribe((val) => {
            expect(val.unwrap).equal(5);
            a();
          });
          state.setOk(5);
        });
      });
    }
  }
);

// describe("State subscriber", function () {
//   it("Add one subscribers with update set true", function () {
//     let testState = state(Ok(2));
//     testState.subscribe((value) => {
//       expect(value.unwrap).equal(2);
//     }, true);
//   });
//   it("Add two subscribers with update set true", async function () {
//     let testState = state(Ok(2));
//     let values = await Promise.all([
//       new Promise<Result<number, StateError>>((a) => {
//         testState.subscribe(a, true);
//       }),
//       new Promise<Result<number, StateError>>((a) => {
//         testState.subscribe(a, true);
//       }),
//     ]);
//     expect(values).deep.equal([Ok(2), Ok(2)]);
//   });
//   it("Insert two subscribers then remove first subscribers", function () {
//     let testState = state(Ok(2));
//     let func = testState.subscribe(() => {}, true);
//     let check = false;
//     testState.subscribe(() => {
//       check = true;
//     }, false);
//     expect(testState.inUse()).deep.equal(true);
//     testState.unsubscribe(func);
//     expect(testState.inUse()).deep.equal(true);
//     testState.set(Ok(4));
//     expect(check).equal(true);
//   });
//   it("Insert two subscribers then removeing both subscribers", function () {
//     let testState = state(Ok(2));
//     let func1 = testState.subscribe(() => {
//       expect(0).equal(1);
//     }, false);
//     let func2 = testState.subscribe(() => {
//       expect(0).equal(1);
//     }, false);
//     expect(testState.inUse()).deep.equal(true);
//     testState.unsubscribe(func1);
//     testState.unsubscribe(func2);
//     expect(testState.inUse()).deep.equal(false);
//     testState.set(Ok(4));
//   });
//   it("Setting value with one subscribers", function () {
//     let testState = state(Ok(2));
//     let check = false;
//     testState.subscribe(() => {
//       check = true;
//     }, false);
//     testState.set(Ok(10));
//     expect(check).equal(true);
//   });
//   it("Setting value with multiple subscribers", async function () {
//     let testState = state(Ok(2));
//     let sum = 0;
//     testState.subscribe((val) => {
//       sum += val.unwrap;
//     }, true);
//     testState.subscribe((val) => {
//       sum += val.unwrap;
//     }, true);
//     testState.subscribe((val) => {
//       sum += val.unwrap;
//     }, true);
//     testState.set(Ok(10));
//     expect(sum).equal(36);
//   });
//   it("Setting value with subscribers with exception", function () {
//     let testState = state(Ok(2));
//     testState.subscribe(() => {
//       throw false;
//     }, false);
//     testState.set(Ok(10));
//   });
// });
