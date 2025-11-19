// import { Ok } from "@libResult";
// import { describe, expect, it } from "vitest";
// import {
//   state_derived_from_state_array,
//   state_derived_from_states,
// } from "../collected";
// import { state_ok } from "../sync";

// describe("Change function and states", async () => {
//   it("Changing getter function with no subscribers", async () => {
//     let state1 = state_ok(5);
//     let state2 = state_ok(6);
//     let derived = state_derived_from_states(
//       ([a, b]) => {
//         return Ok(a.unwrap * b.unwrap);
//       },
//       state1,
//       state2
//     );
//     expect((await derived).unwrap).equal(30);
//     state1.set(Ok(6));
//     expect((await derived).unwrap).equal(36);
//     derived.setGetter(([a, b]) => {
//       return Ok(a.unwrap + b.unwrap);
//     });
//     expect((await derived).unwrap).equal(12);
//   });
//   it("Changing getter function with subscribers", async () => {
//     let state1 = state_ok(5);
//     let state2 = state_ok(6);
//     let derived = state_derived_from_states(
//       ([a, b]) => {
//         return Ok(a.unwrap * b.unwrap);
//       },
//       state1,
//       state2
//     );
//     let callCount = 0;
//     derived.subscribe(() => {
//       callCount++;
//     }, true);
//     await Promise.resolve();
//     expect((await derived).unwrap).equal(30);
//     state1.set(Ok(6));
//     await Promise.resolve();
//     expect((await derived).unwrap).equal(36);
//     derived.setGetter(([a, b]) => {
//       return Ok(a.unwrap + b.unwrap);
//     });
//     expect((await derived).unwrap).equal(12);
//     expect(callCount).equal(3);
//   });
//   it("Changing states with no subscribers", async () => {
//     let state1 = state_ok(5);
//     let state2 = state_ok(6);
//     let derived = state_derived_from_states(
//       ([a, b]) => {
//         return Ok(a.unwrap * b.unwrap);
//       },
//       state1,
//       state2
//     );
//     expect((await derived).unwrap).equal(30);
//     state1.set(Ok(6));
//     expect((await derived).unwrap).equal(36);
//     let state3 = state_ok(7);
//     let state4 = state_ok(8);
//     derived.setStates(state3, state4);
//     expect((await derived).unwrap).equal(56);
//     state3.set(Ok(6));
//     expect((await derived).unwrap).equal(48);
//   });
//   it("Changing states with subscribers", async () => {
//     let state1 = state_ok(5);
//     let state2 = state_ok(6);
//     let derived = state_derived_from_states(
//       ([a, b]) => {
//         return Ok(a.unwrap * b.unwrap);
//       },
//       state1,
//       state2
//     );
//     let callCount = 0;
//     derived.subscribe(() => {
//       callCount++;
//     }, true);
//     await Promise.resolve();
//     expect((await derived).unwrap).equal(30);
//     state1.set(Ok(6));
//     await Promise.resolve();
//     expect((await derived).unwrap).equal(36);
//     let state3 = state_ok(7);
//     let state4 = state_ok(8);
//     derived.setStates(state3, state4);
//     await Promise.resolve();
//     expect((await derived).unwrap).equal(56);
//     state3.set(Ok(6));
//     await Promise.resolve();
//     expect((await derived).unwrap).equal(48);
//     expect(callCount).equal(3);
//   });
// });

// describe("Error Scenarios", async () => {
//   it("If an array is passed to the StateDerived, and the array is modified, the StateDerived shall not be affected", async () => {
//     let state1 = state_ok(1);
//     let state2 = state_ok(2);
//     let state3 = state_ok(3);
//     let state4 = state_ok(4);
//     let States = [state1, state2, state3];
//     let derived = state_derived_from_state_array(false, States);
//     expect((await derived).unwrap).equal(1);
//     States.unshift(state4);
//     expect((await derived).unwrap).equal(1);
//     States.shift();
//     expect((await derived).unwrap).equal(1);
//   });
// });
