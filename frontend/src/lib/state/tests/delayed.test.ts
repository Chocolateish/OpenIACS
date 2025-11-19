// import { Ok } from "@libResult";
// import { describe, expect, it } from "vitest";
// import { state_delayed_from } from "../delayed";
// import { state_test_gen_error as errGen } from "./shared";

// describe("Special Cases For State Delayed", async () => {
//   it("Await with no init then setting with setOk", async () => {
//     let count = 0;
//     await new Promise<void>((res) => {
//       let d = state_delayed_from();
//       d.then((v) => {
//         res();
//         count++;
//         return v;
//       });
//       d.setOk(5);
//     });
//     expect(count).toBe(1);
//   });
//   it("Await with no init then setting with set", async () => {
//     let count = 0;
//     await new Promise<void>((res) => {
//       let d = state_delayed_from();
//       d.then((v) => {
//         res();
//         count++;
//         return v;
//       });
//       d.set(Ok(5));
//     });
//     expect(count).toBe(1);
//   });
//   it("Await with no init then setting with setErr", async () => {
//     let count = 0;
//     await new Promise<void>((res) => {
//       let d = state_delayed_from();
//       d.then((v) => {
//         res();
//         count++;
//         return v;
//       });
//       d.setErr(errGen());
//     });
//     expect(count).toBe(1);
//   });
// });
