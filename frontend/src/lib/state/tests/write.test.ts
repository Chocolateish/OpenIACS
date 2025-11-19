// import { Err, Ok, type Result } from "@libResult";
// import { describe, expect, it } from "vitest";
// import type { STATE_SET_REA, STATE_SET_RES, StateOwnerOk } from "../types";
// import {
//   state_test_gen_delayed as delayed,
//   state_test_gen_delayed_ok as delayed_ok,
//   state_test_gen_delayed_with_delay as delayed_with_delay,
//   state_test_gen_delayed_with_delay_ok as delayed_with_delay_ok,
//   state_test_gen_error as errGen,
//   state_test_gen_lazy as lazy,
//   state_test_gen_lazy_ok as lazy_ok,
//   state_test_gen_normals as normals,
//   state_test_gen_normals_ok as normals_ok,
//   state_test_gen_proxies_write as proxwrite,
//   state_test_gen_proxies_write_ok as proxwrite_ok,
//   type StateTestsWrite,
// } from "./shared";

// let gen_sync_states = (
//   setter?:
//     | STATE_SET_RES<number, StateOwnerOk<Result<number, string>>, any>
//     | true
// ): StateTestsWrite[] => {
//   return [
//     ...normals(setter),
//     ...normals_ok(setter),
//     ...lazy(setter),
//     ...lazy_ok(setter),
//     ...proxwrite(setter),
//     ...proxwrite_ok(setter),
//   ];
// };
// let gen_states = (
//   setter?:
//     | STATE_SET_REA<number, StateOwnerOk<Result<number, string>>, any>
//     | true
// ): StateTestsWrite[] => {
//   return [
//     ...delayed(setter),
//     ...delayed_with_delay(setter),
//     ...delayed_ok(setter),
//     ...delayed_with_delay_ok(setter),
//   ];
// };

// describe(
//   "Writing to states with sync writers",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_sync_states(true);
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.writeSync(10)).toEqual(Ok(undefined));
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(10));
//         expect(await state.write(15)).toEqual(Ok(undefined));
//         awaited = await state;
//         expect(awaited).toEqual(Ok(15));
//       });
//     }
//   }
// );

// describe(
//   "Writing to states with async writers",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_states(true);
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(await state.write(15)).toEqual(Ok(undefined));
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(15));
//       });
//     }
//   }
// );

// describe(
//   "Normal sync states with setter set to simple function",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_sync_states((val, state) => Ok(state.setOk(val)));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.writeSync(10)).toEqual(Ok(undefined));
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(10));
//         expect(await state.write(10)).toEqual(Ok(undefined));
//         awaited = await state;
//         expect(awaited).toEqual(Ok(10));
//       });
//     }
//   }
// );

// describe(
//   "Normal async states with setter set to simple function",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_sync_states((val, state) => Ok(state.setOk(val)));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.write(10)).toEqual(Ok(undefined));
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(10));
//       });
//     }
//   }
// );

// describe(
//   "Normal states with setter set to transforming function",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_states(async (val, state) => Ok(state.setOk(val * 2)));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.write(10)).equal(true);
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(20));
//       });
//     }
//   }
// );

// describe(
//   "Normal states with setter set to function returning error",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_states(async (_val, state) => Ok(state.setErr(errGen())));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.write(10)).equal(true);
//         let awaited = await state;
//         expect(awaited).toEqual(Err(errGen()));
//       });
//     }
//   }
// );
