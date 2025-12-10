import { Ok, type Result } from "@libResult";
import st, { type STATE_REA, type STATE_RESOURCE_FUNC_REA } from "@libState";
import { assertType, describe, it } from "vitest";
import { test_state_sub, test_state_then, type TEST_STATE_ALL } from "./shared";

describe("Resource states", function () {
  //##################################################################################################################################################
  //      _____  ______
  //     |  __ \|  ____|   /\
  //     | |__) | |__     /  \
  //     |  _  /|  __|   / /\ \
  //     | | \ \| |____ / ____ \
  //     |_|  \_\______/_/    \_\
  describe("REA", { timeout: 100 }, function () {
    it("ok", async function () {
      const init = st.r.rea.from<number>(
        () => {},
        () => {},
        () => {}
      );
      assertType<STATE_REA<number>>(init);
      assertType<STATE_RESOURCE_FUNC_REA<number>>(init);
    });
    const maker: TEST_STATE_ALL = () => {
      let val: Result<number, string> = Ok(1);
      const state = st.r.rea.from<number>(
        (state) => state.update_resource(val),
        () => {},
        () => {}
      );
      const set = (v: Result<number, string>) => {
        val = v;
      };
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 10);
    });
    describe("Then", async function () {
      await test_state_then(maker, 50);
    });
  });
  //##################################################################################################################################################
  //      _____  ______            __          __
  //     |  __ \|  ____|   /\      \ \        / /\
  //     | |__) | |__     /  \      \ \  /\  / /  \
  //     |  _  /|  __|   / /\ \      \ \/  \/ / /\ \
  //     | | \ \| |____ / ____ \      \  /\  / ____ \
  //     |_|  \_\______/_/    \_\      \/  \/_/    \_\
  // describe("REA", { timeout: 100 }, function () {
  //   it("ok", async function () {
  //     let init = st.c.rea.from((val) => val[0], st.d.rea.ok(sleep(1, 1)));
  //     expect(init).instanceOf(st.c.rea.class);
  //   });
  //   let makerSingle: TEST_STATE_ALL = () => {
  //     let stat1 = st.d.rea.ok(sleep(1, 1));
  //     let state = st.c.rea.from((values) => values[0], stat1);
  //     let set = (val: Result<number, string>) => {
  //       stat1.set(val.map((v) => v));
  //     };
  //     return { o: false, s: false, w: false, ws: false, state, set };
  //   };
  //   it("Subscribing And Unsubscribing", async function () {
  //     await test_state_sub(makerSingle, 0);
  //   });
  //   describe("Single Then", async function () {
  //     await test_state_then(makerSingle, 0);
  //   });
  //   let makerMultiple: TEST_STATE_ALL = () => {
  //     let stat1 = st.d.rea.ok(sleep(1, 0.25));
  //     let stat2 = st.d.rea.ok(sleep(1, 0.25));
  //     let stat3 = st.d.rea.ok(sleep(1, 0.25));
  //     let stat4 = st.d.rea.ok(sleep(1, 0.25));
  //     let state = st.c.rea.from(
  //       (values) => {
  //         let sum = 0;
  //         for (let val of values) {
  //           if (val.err) return val;
  //           sum += val.value;
  //         }
  //         return Ok(sum);
  //       },
  //       stat1,
  //       stat2,
  //       stat3,
  //       stat4
  //     );
  //     let set = (val: Result<number, string>) => {
  //       stat1.set(val.map((v) => v / 4));
  //       stat2.set(val.map((v) => v / 4));
  //       stat3.set(val.map((v) => v / 4));
  //       stat4.set(val.map((v) => v / 4));
  //     };
  //     return { o: false, s: false, w: false, ws: false, state, set };
  //   };
  //   it("Multiple Subscribing And Unsubscribing", async function () {
  //     await test_state_sub(makerMultiple, 0);
  //   });
  //   describe("Multiple Then", async function () {
  //     await test_state_then(makerMultiple, 0);
  //   });
  // });
});

// import { Err, Ok } from "@libResult";
// import { describe, expect, it } from "vitest";
// import { state_resource } from "../resource";

// const generatePromises = (amount: number) => {
//   let promises: Promise<any>[] = [];
//   let fulfillments: ((value: any) => void)[] = [];
//   for (let i = 0; i < amount; i++) {
//     promises.push(
//       new Promise<any>((a) => {
//         fulfillments.push(a);
//       })
//     );
//   }
//   return {
//     promise: new Promise(async (a) => {
//       a(await Promise.all(promises));
//     }),
//     calls: fulfillments,
//   };
// };

// describe("Getting state value", { timeout: 50 }, async () => {
//   it("Async once fulfillment", async () => {
//     let { promise, calls } = generatePromises(2);
//     let state = state_resource<number>(
//       async () => {
//         calls[0](0);
//         return Ok(0);
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     state.then((val) => {
//       if (val.ok) {
//         calls[1](0);
//       }
//     });
//     await promise;
//   });
//   it("Async once rejection", async () => {
//     let { promise, calls } = generatePromises(2);
//     let state = state_resource<number>(
//       async () => {
//         calls[0](0);
//         return Err({ code: "CL", reason: "Conn Lost" });
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     state.then((val) => {
//       if (val.err) {
//         calls[1](0);
//       }
//     });
//     await promise;
//   });
//   it("Using then with chaining return", async () => {
//     let state = state_resource<number>(
//       async () => {
//         return Ok(2);
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     expect(
//       await state
//         .then((val) => {
//           expect(val.unwrap).equal(2);
//           return 8;
//         })
//         .then((val) => {
//           expect(val).equal(8);
//           return 12;
//         })
//     ).eq(12);
//   });
//   it("Using then with chaining throw", async () => {
//     let state = state_resource<number>(
//       async () => {
//         return Ok(2);
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     expect(
//       await state
//         .then((val) => {
//           expect(val.unwrap).equal(2);
//           throw 8;
//         })
//         .then(
//           () => {},
//           (val) => {
//             expect(val).equal(8);
//             return 12;
//           }
//         )
//     ).eq(12);
//   });
//   it("Using then with async chaining return", async () => {
//     let state = state_resource<number>(
//       async () => {
//         return Ok(2);
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     expect(
//       await state
//         .then(async (val) => {
//           await new Promise((a) => {
//             setTimeout(a, 10);
//           });
//           expect(val.unwrap).equal(2);
//           return 8;
//         })
//         .then((val) => {
//           expect(val).equal(8);
//           return 12;
//         })
//     ).eq(12);
//   });
//   it("Using then with async chaining throw", async () => {
//     let state = state_resource<number>(
//       async () => {
//         return Ok(2);
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     expect(
//       await state
//         .then(async (val) => {
//           await new Promise((a) => {
//             setTimeout(a, 10);
//           });
//           expect(val.unwrap).equal(2);
//           throw 8;
//         })
//         .then(
//           () => {},
//           (val) => {
//             expect(val).equal(8);
//             return 12;
//           }
//         )
//     ).eq(12);
//   });
//   it("Awaiting async value", async () => {
//     let state = state_resource<number>(
//       async () => {
//         return Ok(2);
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     expect((await state).unwrap).equal(2);
//   });
// });

// describe("Async Setting value", { timeout: 50 }, function () {
//   it("From user context with no setter function", async () => {
//     await new Promise((done) => {
//       let state = state_resource<number>(
//         async () => {
//           return Ok(2);
//         },
//         () => {
//           throw new Error("This should not be called");
//         },
//         () => {
//           throw new Error("This should not be called");
//         },
//         50,
//         50,
//         50,
//         50,
//         async (_val) => {
//           done(0);
//           return Ok(undefined);
//         }
//       );
//       state.write(4);
//     });
//   });
// });

// describe("Async subscribe", { timeout: 50 }, function () {
//   it("Async subscribe", async () => {
//     let { promise, calls } = generatePromises(3);
//     let state = state_resource<number>(
//       async () => {
//         throw new Error("This should not be called");
//       },
//       (state) => {
//         calls[0](0);
//         state.updateResource(Ok(2));
//       },
//       () => {
//         throw new Error("This should not be called");
//       },
//       50,
//       50,
//       50
//     );
//     state.subscribe(() => {
//       calls[1](0);
//     }, true);
//     state.subscribe(() => {
//       calls[2](0);
//     }, true);
//     await promise;
//   });
//   it("Async unsubscribe", async () => {
//     let { promise, calls } = generatePromises(3);
//     let state = state_resource<number>(
//       async () => {
//         throw new Error("This should not be called");
//       },
//       (state) => {
//         calls[0](0);
//         state.updateResource(Ok(2));
//       },
//       () => {
//         calls[2](0);
//       },
//       50,
//       50,
//       50
//     );
//     let func = state.subscribe(() => {
//       calls[1](0);
//     }, true);
//     await new Promise((a) => {
//       setTimeout(a, 100);
//     });
//     state.unsubscribe(func);
//     await promise;
//   });
// });
