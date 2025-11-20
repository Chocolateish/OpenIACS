import { Ok, ResultOk, type Result } from "@libResult";
import st from "@libState";
import { describe, expect, it } from "vitest";
import {
  test_state_get,
  test_state_get_ok,
  test_state_sub,
  test_state_then,
  test_state_write,
  test_state_writeSync,
  type TEST_STATE_OK_SYNC,
  type TEST_STATE_SYNC,
  type TEST_STATE_WRITESYNC,
} from "./shared";

describe("Initialize lazy states", function () {
  describe("ROS", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.l.ros.ok(() => 1);
      expect(init).instanceOf(st.l.ros.class);
    });
    it("result ok", async function () {
      let init = st.l.ros.result(() => Ok(1));
      expect(init).instanceOf(st.l.ros.class);
    });
    it("cleanup successfull", async function () {
      let init = st.l.ros.result(() => Ok(1));
      let get = init.get;
      let set = init.set;
      await init;
      expect(init.get).not.eq(get, "get");
      expect(init.set).not.eq(set, "set");
    });
    let maker: TEST_STATE_OK_SYNC = () => {
      let state = st.l.ros.ok(() => 1);
      let set = (val: ResultOk<number>) => state.set(val);
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
      let init = st.l.res.ok(() => 1);
      expect(init).instanceOf(st.l.res.class);
    });
    it("err", async function () {
      let init = st.l.res.err(() => "1");
      expect(init).instanceOf(st.l.res.class);
    });
    it("result ok", async function () {
      let init = st.l.res.result(() => Ok(1));
      expect(init).instanceOf(st.l.res.class);
    });
    it("cleanup successfull", async function () {
      let init = st.l.res.result(() => Ok(1));
      let get = init.get;
      let set = init.set;
      await init;
      expect(init.get).not.eq(get, "get");
      expect(init.set).not.eq(set, "set");
    });
    let maker: TEST_STATE_SYNC = () => {
      let state = st.l.res.ok(() => 1);
      let set = (val: Result<number, string>) => state.set(val);
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
  //##################################################################################################################################################
  describe("ROS_WS", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.l.ros_ws.ok(() => 1);
      expect(init).instanceOf(st.l.ros_ws.class);
    });
    it("result ok", async function () {
      let init = st.l.ros_ws.result(() => Ok(1));
      expect(init).instanceOf(st.l.ros_ws.class);
    });
    it("cleanup successfull", async function () {
      let init = st.l.ros_ws.ok(() => 1);
      let set = init.set;
      let writeSync = init.writeSync;
      await init;
      expect(init.set).not.eq(set, "set");
      expect(init.writeSync).not.eq(writeSync, "writeSync");
    });
    let maker: TEST_STATE_OK_SYNC = () => {
      let state = st.l.ros_ws.ok(() => 1);
      let set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: true, w: true, ws: true, state, set };
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
    let makerWrite: TEST_STATE_WRITESYNC = () => {
      let state = st.l.ros_ws.ok(() => 1, true);
      let set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: true, w: true, ws: true, state, set };
    };
    it("Write", async function () {
      await test_state_write(makerWrite);
    });
    it("WriteSync", async function () {
      await test_state_writeSync(makerWrite);
    });
  });
  //##################################################################################################################################################
  describe("RES_WS", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.l.res_ws.ok(() => 1);
      expect(init).instanceOf(st.l.res_ws.class);
    });
    it("err", async function () {
      let init = st.l.res_ws.err(() => "1");
      expect(init).instanceOf(st.l.res_ws.class);
    });
    it("result ok", async function () {
      let init = st.l.res_ws.result(() => Ok(1));
      expect(init).instanceOf(st.l.res_ws.class);
    });
    it("cleanup successfull", async function () {
      let init = st.l.res_ws.ok(() => 1);
      let set = init.set;
      let writeSync = init.writeSync;
      await init;
      expect(init.set).not.eq(set, "set");
      expect(init.writeSync).not.eq(writeSync, "writeSync");
    });
    let maker: TEST_STATE_SYNC = () => {
      let state = st.l.res_ws.ok(() => 1);
      let set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: true, w: true, ws: true, state, set };
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
    let makerWrite: TEST_STATE_WRITESYNC = () => {
      let state = st.l.res_ws.ok(() => 1, true);
      let set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: true, w: true, ws: true, state, set };
    };
    it("Write", async function () {
      await test_state_write(makerWrite);
    });
    it("WriteSync", async function () {
      await test_state_writeSync(makerWrite);
    });
  });
});
