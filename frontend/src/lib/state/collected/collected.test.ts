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
} from "../tests_shared";

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
      const init = st.c.ros.from((val) => val[0], st.s.ros.ok(1));
      expect(init).instanceOf(st.c.ros.class);
    });
    const makerSingle: TEST_STATE_OK_SYNC = () => {
      const stat1 = st.s.ros.ok(1);
      const state = st.c.ros.from((val) => val[0], stat1);
      const set = (val: ResultOk<number>) => {
        stat1.set_ok(val.value);
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
    const makerMultiple: TEST_STATE_OK_SYNC = () => {
      const stat1 = st.s.ros.ok(0.25);
      const stat2 = st.s.ros.ok(0.25);
      const stat3 = st.s.ros.ok(0.25);
      const stat4 = st.s.ros.ok(0.25);
      const state = st.c.ros.from(
        (val) => Ok(val[0].value + val[1].value + val[2].value + val[3].value),
        stat1,
        stat2,
        stat3,
        stat4
      );
      const set = (val: ResultOk<number>) => {
        stat1.set_ok(val.value / 4);
        stat2.set_ok(val.value / 4);
        stat3.set_ok(val.value / 4);
        stat4.set_ok(val.value / 4);
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
      const init = st.c.res.from((val) => val[0], st.s.res.ok(1));
      expect(init).instanceOf(st.c.res.class);
    });
    const makerSingle: TEST_STATE_SYNC = () => {
      const stat1 = st.s.res.ok(1);
      const state = st.c.res.from((val) => val[0], stat1);
      const set = (val: Result<number, string>) => {
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
    const makerMultiple: TEST_STATE_SYNC = () => {
      const stat1 = st.s.res.ok(0.25);
      const stat2 = st.s.res.ok(0.25);
      const stat3 = st.s.res.ok(0.25);
      const stat4 = st.s.res.ok(0.25);
      const state = st.c.res.from(
        (values) => {
          let sum = 0;
          for (const val of values) {
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
      const set = (val: Result<number, string>) => {
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
      const init = st.c.roa.from(
        (val) => val[0],
        st.d.roa.ok(() => sleep(1, 1))
      );
      expect(init).instanceOf(st.c.roa.class);
    });
    const makerSingle: TEST_STATE_OK = () => {
      const stat1 = st.d.roa.ok(() => sleep(1, 1));
      const state = st.c.roa.from((val) => val[0], stat1);
      const set = (val: ResultOk<number>) => {
        stat1.set_ok(val.value);
      };
      return { o: true, s: false, w: false, ws: false, state, set };
    };
    it("Single Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerSingle, 50);
    });
    describe("Single Then", async function () {
      await test_state_then(makerSingle, 50);
    });
    const makerMultiple: TEST_STATE_OK = () => {
      const stat1 = st.d.roa.ok(() => sleep(1, 0.25));
      const stat2 = st.d.roa.ok(() => sleep(1, 0.25));
      const stat3 = st.d.roa.ok(() => sleep(1, 0.25));
      const stat4 = st.d.roa.ok(() => sleep(1, 0.25));
      const state = st.c.roa.from(
        (val) => Ok(val[0].value + val[1].value + val[2].value + val[3].value),
        stat1,
        stat2,
        stat3,
        stat4
      );
      const set = (val: ResultOk<number>) => {
        stat1.set_ok(val.value / 4);
        stat2.set_ok(val.value / 4);
        stat3.set_ok(val.value / 4);
        stat4.set_ok(val.value / 4);
      };
      return { o: true, s: false, w: false, ws: false, state, set };
    };
    it("Multiple Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerMultiple, 50);
    });
    describe("Multiple Then", async function () {
      await test_state_then(makerMultiple, 50);
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
      const init = st.c.rea.from(
        (val) => val[0],
        st.d.rea.ok(() => sleep(1, 1))
      );
      expect(init).instanceOf(st.c.rea.class);
    });
    const makerSingle: TEST_STATE_ALL = () => {
      const stat1 = st.d.rea.ok(() => sleep(1, 1));
      const state = st.c.rea.from((values) => values[0], stat1);
      const set = (val: Result<number, string>) => {
        stat1.set(val.map((v) => v));
      };
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Single Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerSingle, 50);
    });
    describe("Single Then", async function () {
      await test_state_then(makerSingle, 50);
    });
    const makerMultiple: TEST_STATE_ALL = () => {
      const stat1 = st.d.rea.ok(() => sleep(1, 0.25));
      const stat2 = st.d.rea.ok(() => sleep(1, 0.25));
      const stat3 = st.d.rea.ok(() => sleep(1, 0.25));
      const stat4 = st.d.rea.ok(() => sleep(1, 0.25));
      const state = st.c.rea.from(
        (values) => {
          let sum = 0;
          for (const val of values) {
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
      const set = (val: Result<number, string>) => {
        stat1.set(val.map((v) => v / 4));
        stat2.set(val.map((v) => v / 4));
        stat3.set(val.map((v) => v / 4));
        stat4.set(val.map((v) => v / 4));
      };
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Multiple Subscribing And Unsubscribing", async function () {
      await test_state_sub(makerMultiple, 50);
    });
    describe("Multiple Then", async function () {
      await test_state_then(makerMultiple, 50);
    });
  });
});
