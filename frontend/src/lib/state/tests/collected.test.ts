import { sleep } from "@libCommon";
import { Ok, ResultOk, type Result } from "@libResult";
import st from "@libState";
import { describe, expect, it } from "vitest";
import {
  test_state_get,
  test_state_get_ok,
  test_state_sub,
  test_state_then,
  type TEST_STATE_ALL,
  type TEST_STATE_OK,
  type TEST_STATE_OK_SYNC,
  type TEST_STATE_SYNC,
} from "./shared";

describe("Collected states", function () {
  //##################################################################################################################################################
  //      _____   ____   _____
  //     |  __ \ / __ \ / ____|
  //     | |__) | |  | | (___
  //     |  _  /| |  | |\___ \
  //     | | \ \| |__| |____) |
  //     |_|  \_\\____/|_____/
  describe("ROS", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.c.ros.from((val) => val[0], st.s.ros.ok(1));
      expect(init).instanceOf(st.c.ros.class);
    });
    let makerSingle: TEST_STATE_OK_SYNC = () => {
      let stat1 = st.s.ros.ok(1);
      let state = st.c.ros.from((val) => val[0], stat1);
      let set = (val: ResultOk<number>) => {
        stat1.setOk(val.value);
      };
      return { o: true, s: true, w: false, ws: false, state, set };
    };
    it("Single Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerSingle, 0);
    });
    describe("Single Then", async function () {
      await test_state_then(makerSingle, 0);
    });
    it("Single Get", async function () {
      await test_state_get(makerSingle);
    });
    it("Single GetOk", async function () {
      await test_state_get_ok(makerSingle);
    });
    let makerMultiple: TEST_STATE_OK_SYNC = () => {
      let stat1 = st.s.ros.ok(0.25);
      let stat2 = st.s.ros.ok(0.25);
      let stat3 = st.s.ros.ok(0.25);
      let stat4 = st.s.ros.ok(0.25);
      let state = st.c.ros.from(
        (val) => Ok(val[0].value + val[1].value + val[2].value + val[3].value),
        stat1,
        stat2,
        stat3,
        stat4
      );
      let set = (val: ResultOk<number>) => {
        stat1.setOk(val.value / 4);
        stat2.setOk(val.value / 4);
        stat3.setOk(val.value / 4);
        stat4.setOk(val.value / 4);
      };
      return { o: true, s: true, w: false, ws: false, state, set };
    };
    it("Multiple Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerMultiple, 0);
    });
    describe("Multiple Then", async function () {
      await test_state_then(makerMultiple, 0);
    });
    it("Multiple Get", async function () {
      await test_state_get(makerMultiple);
    });
    it("Multiple GetOk", async function () {
      await test_state_get_ok(makerMultiple);
    });
  });
  //##################################################################################################################################################
  //      _____  ______  _____
  //     |  __ \|  ____|/ ____|
  //     | |__) | |__  | (___
  //     |  _  /|  __|  \___ \
  //     | | \ \| |____ ____) |
  //     |_|  \_\______|_____/
  describe("RES", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.c.res.from((val) => val[0], st.s.res.ok(1));
      expect(init).instanceOf(st.c.res.class);
    });
    let makerSingle: TEST_STATE_SYNC = () => {
      let stat1 = st.s.res.ok(1);
      let state = st.c.res.from((val) => val[0], stat1);
      let set = (val: Result<number, string>) => {
        stat1.set(val.map((v) => v));
      };
      return { o: false, s: true, w: false, ws: false, state, set };
    };
    it("Single Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerSingle, 0);
    });
    describe("Single Then", async function () {
      await test_state_then(makerSingle, 0);
    });
    it("Single Get", async function () {
      await test_state_get(makerSingle);
    });
    let makerMultiple: TEST_STATE_SYNC = () => {
      let stat1 = st.s.res.ok(0.25);
      let stat2 = st.s.res.ok(0.25);
      let stat3 = st.s.res.ok(0.25);
      let stat4 = st.s.res.ok(0.25);
      let state = st.c.res.from(
        (values) => {
          let sum = 0;
          for (let val of values) {
            if (val.err) return val;
            sum += val.value;
          }
          return Ok(sum);
        },
        stat1,
        stat2,
        stat3,
        stat4
      );
      let set = (val: Result<number, string>) => {
        stat1.set(val.map((v) => v / 4));
        stat2.set(val.map((v) => v / 4));
        stat3.set(val.map((v) => v / 4));
        stat4.set(val.map((v) => v / 4));
      };
      return { o: false, s: true, w: false, ws: false, state, set };
    };
    it("Multiple Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerMultiple, 0);
    });
    describe("Multiple Then", async function () {
      await test_state_then(makerMultiple, 0);
    });
    it("Multiple Get", async function () {
      await test_state_get(makerMultiple);
    });
  });
  //##################################################################################################################################################
  //      _____   ____
  //     |  __ \ / __ \   /\
  //     | |__) | |  | | /  \
  //     |  _  /| |  | |/ /\ \
  //     | | \ \| |__| / ____ \
  //     |_|  \_\\____/_/    \_\
  describe("ROA", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.c.roa.from((val) => val[0], st.d.roa.ok(sleep(1, 1)));
      expect(init).instanceOf(st.c.roa.class);
    });
    let makerSingle: TEST_STATE_OK = () => {
      let stat1 = st.d.roa.ok(sleep(1, 1));
      let state = st.c.roa.from((val) => val[0], stat1);
      let set = (val: ResultOk<number>) => {
        stat1.setOk(val.value);
      };
      return { o: true, s: false, w: false, ws: false, state, set };
    };
    it("Single Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerSingle, 0);
    });
    describe("Single Then", async function () {
      await test_state_then(makerSingle, 0);
    });
    let makerMultiple: TEST_STATE_OK = () => {
      let stat1 = st.d.roa.ok(sleep(1, 0.25));
      let stat2 = st.d.roa.ok(sleep(1, 0.25));
      let stat3 = st.d.roa.ok(sleep(1, 0.25));
      let stat4 = st.d.roa.ok(sleep(1, 0.25));
      let state = st.c.roa.from(
        (val) => Ok(val[0].value + val[1].value + val[2].value + val[3].value),
        stat1,
        stat2,
        stat3,
        stat4
      );
      let set = (val: ResultOk<number>) => {
        stat1.setOk(val.value / 4);
        stat2.setOk(val.value / 4);
        stat3.setOk(val.value / 4);
        stat4.setOk(val.value / 4);
      };
      return { o: true, s: false, w: false, ws: false, state, set };
    };
    it("Multiple Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerMultiple, 0);
    });
    describe("Multiple Then", async function () {
      await test_state_then(makerMultiple, 0);
    });
  });
  //##################################################################################################################################################
  //      _____  ______
  //     |  __ \|  ____|   /\
  //     | |__) | |__     /  \
  //     |  _  /|  __|   / /\ \
  //     | | \ \| |____ / ____ \
  //     |_|  \_\______/_/    \_\
  describe("REA", { timeout: 100 }, function () {
    it("ok", async function () {
      let init = st.c.rea.from((val) => val[0], st.d.rea.ok(sleep(1, 1)));
      expect(init).instanceOf(st.c.rea.class);
    });
    let makerSingle: TEST_STATE_ALL = () => {
      let stat1 = st.d.rea.ok(sleep(1, 1));
      let state = st.c.rea.from((values) => values[0], stat1);
      let set = (val: Result<number, string>) => {
        stat1.set(val.map((v) => v));
      };
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Single Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerSingle, 0);
    });
    describe("Single Then", async function () {
      await test_state_then(makerSingle, 0);
    });
    let makerMultiple: TEST_STATE_ALL = () => {
      let stat1 = st.d.rea.ok(sleep(1, 0.25));
      let stat2 = st.d.rea.ok(sleep(1, 0.25));
      let stat3 = st.d.rea.ok(sleep(1, 0.25));
      let stat4 = st.d.rea.ok(sleep(1, 0.25));
      let state = st.c.rea.from(
        (values) => {
          let sum = 0;
          for (let val of values) {
            if (val.err) return val;
            sum += val.value;
          }
          return Ok(sum);
        },
        stat1,
        stat2,
        stat3,
        stat4
      );
      let set = (val: Result<number, string>) => {
        stat1.set(val.map((v) => v / 4));
        stat2.set(val.map((v) => v / 4));
        stat3.set(val.map((v) => v / 4));
        stat4.set(val.map((v) => v / 4));
      };
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Multiple Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerMultiple, 0);
    });
    describe("Multiple Then", async function () {
      await test_state_then(makerMultiple, 0);
    });
  });
});
