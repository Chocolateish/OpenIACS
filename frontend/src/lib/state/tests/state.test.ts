// import { Err, Ok, Some, type Result } from "@libResult";
// import { describe, expect, it } from "vitest";
// import { state, stateOk } from "./state";
// import type { StateError } from "./types";

// describe("Setting testState value", function () {
//   it("From owner context", async function () {
//     let testState = state(Ok(2));
//     expect((await testState).unwrap).equal(2);
//     testState.set(Ok(4));
//     expect((await testState).unwrap).equal(4);
//   });
//   it("From user context with no setter function", async function () {
//     let testState = state(Ok(2));
//     expect((await testState).unwrap).equal(2);
//     testState.write(4);
//     expect((await testState).unwrap).equal(2);
//   });
//   it("From user context with standard setter function", async function () {
//     let testState = state(Ok(2), true);
//     expect((await testState).unwrap).equal(2);
//     testState.write(4);
//     expect((await testState).unwrap).equal(4);
//   });
//   it("From user context with custom function", async function () {
//     let testState = state(Ok(2), (val) => Some(Ok(val * 2)));
//     expect((await testState).unwrap).equal(2);
//     testState.write(4);
//     expect((await testState).unwrap).equal(8);
//   });
// });

// describe("Getting testState value", async function () {
//   it("Using get", async function () {
//     let testState = state(Ok(2));
//     expect(testState.get().unwrap).equal(2);
//   });
// });

// describe("Writing testState value", async function () {
//   it("Writing to testState with error value", async function () {
//     let testState = state(Err({ code: "Yo", reason: "Yo" }), true);
//     expect(() => {
//       testState.get().unwrap;
//     }).toThrow();
//     testState.write(2);
//     expect(testState.get().unwrap).equal(2);
//   });
// });

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
