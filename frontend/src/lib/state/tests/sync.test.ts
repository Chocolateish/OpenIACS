import { Ok } from "@libResult";
import state, { type STATE_ROS } from "@libState";
import { describe, expect, expectTypeOf, it } from "vitest";

//       _____ _______    _______ ______
//      / ____|__   __|/\|__   __|  ____|
//     | (___    | |  /  \  | |  | |__
//      \___ \   | | / /\ \ | |  |  __|
//      ____) |  | |/ ____ \| |  | |____
//     |_____/   |_/_/    \_\_|  |______|
describe("Initialize sync states", function () {
  describe("ROS", function () {
    it("ok", async function () {
      let init = state.s.ros.ok(1);
      expect(init).instanceOf(state.s.ros.class);
      expectTypeOf(init).toEqualTypeOf<STATE_ROS<number>>();
    });
    it("result ok", async function () {
      let init = state.s.ros.result(Ok(1));
      expect(init).instanceOf(state.s.ros.class);
      expectTypeOf(init).toEqualTypeOf<STATE_ROS<number>>();
    });
  });
});
