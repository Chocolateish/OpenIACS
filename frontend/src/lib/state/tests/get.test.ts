// import { describe, expect, it } from "vitest";
// import {
//   state_test_gen_lazy as lazy,
//   state_test_gen_lazy_ok as lazy_ok,
//   state_test_gen_normals as normals,
//   state_test_gen_normals_ok as normals_ok,
//   type StateTestsRead,
// } from "./shared";

// let gen_states = (): StateTestsRead[] => {
//   return [...normals(), ...lazy(), ...normals_ok(), ...lazy_ok()];
// };
// let gen_states_ok = (): StateTestsRead[] => {
//   return [...normals_ok(), ...lazy_ok()];
// };

// describe(
//   "Get State Values",
//   {
//     timeout: 500,
//   },
//   function () {
//     let tests = gen_states();
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         expect(test[1].get()).toEqual(test[4]);
//       });
//     }
//   }
// );

// describe(
//   "Get State Values With GetOk",
//   {
//     timeout: 500,
//   },
//   function () {
//     let tests = gen_states_ok();
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         expect(test[1].getOk()).toEqual(test[4].unwrap);
//       });
//     }
//   }
// );
