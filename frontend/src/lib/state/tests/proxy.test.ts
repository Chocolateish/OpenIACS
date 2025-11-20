import { ResultOk, type Result } from "@libResult";
import st from "@libState";
import { describe, expect, it } from "vitest";
import {
  test_state_get,
  test_state_get_ok,
  test_state_sub,
  test_state_then,
  type TEST_STATE_OK_SYNC,
  type TEST_STATE_SYNC,
} from "./shared";

describe("Proxy with sync states", function () {
  describe("ROS", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.p.ros.from(st.s.ros.ok(1));
      expect(init).instanceOf(st.p.ros.class);
    });
    let maker: TEST_STATE_OK_SYNC = () => {
      let stat = st.s.ros.ok(1);
      let state = st.p.ros.from(stat);
      let set = (val: ResultOk<number>) => stat.set(val);
      return { o: true, s: true, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 0);
    });
    describe("Then", async function () {
      await test_state_then(maker, 0);
    });
    it("Get", async function () {
      await test_state_get(maker);
    });
    it("GetOk", async function () {
      await test_state_get_ok(maker);
    });
  });
  //##################################################################################################################################################
  describe("RES", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.p.res.from(st.s.res.ok(1));
      expect(init).instanceOf(st.p.res.class);
    });
    let maker: TEST_STATE_SYNC = () => {
      let stat = st.s.res.ok(1);
      let state = st.p.res.from(stat);
      let set = (val: Result<number, string>) => stat.set(val);
      return { o: false, s: true, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 0);
    });
    describe("Then", async function () {
      await test_state_then(maker, 0);
    });
    it("Get", async function () {
      await test_state_get(maker);
    });
  });
});
