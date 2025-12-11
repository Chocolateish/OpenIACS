import { sleep } from "@libCommon";
import { Ok, ResultOk, type Result } from "@libResult";
import st, {
  type STATE_DELAYED_REA,
  type STATE_DELAYED_REA_WS,
  type STATE_DELAYED_ROA,
  type STATE_DELAYED_ROA_WS,
  type STATE_REA,
  type STATE_REA_WS,
  type STATE_ROA,
  type STATE_ROA_WS,
} from "@libState";
import { assertType, describe, expect, it } from "vitest";
import {
  test_state_sub,
  test_state_then,
  test_state_write,
  test_state_writeSync,
  type TEST_STATE_ALL,
  type TEST_STATE_WRITESYNC,
} from "./shared";

describe("Initialize delayed states", function () {
  //##################################################################################################################################################
  //      _____   ____
  //     |  __ \ / __ \   /\
  //     | |__) | |  | | /  \
  //     |  _  /| |  | |/ /\ \
  //     | | \ \| |__| / ____ \
  //     |_|  \_\\____/_/    \_\
  describe("ROA", { timeout: 100 }, function () {
    it("ok", async function () {
      const init = st.d.roa.ok(() => sleep(1, 1));
      assertType<STATE_ROA<number>>(init);
      assertType<STATE_DELAYED_ROA<number>>(init);
    });
    it("result ok", async function () {
      const init = st.d.roa.result(() => sleep(1, Ok(1)));
      assertType<STATE_ROA<number>>(init);
      assertType<STATE_DELAYED_ROA<number>>(init);
    });
    it("cleanup successfull", async function () {
      const init = st.d.roa.result(() => sleep(1, Ok(1)));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const then = init.then;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const set = init.set;
      await init;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.then).not.eq(then, "then");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.set).not.eq(set, "set");
    });
    //# Standard Tests
    const maker: TEST_STATE_ALL = () => {
      const state = st.d.roa.ok(() => sleep(1, 1));
      const set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: false, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 5);
    });
    describe("Then", async function () {
      await test_state_then(maker, 5);
    });
    const makerDelay: TEST_STATE_ALL = () => {
      const state = st.d.roa.ok(() => sleep(10, 1));
      const set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: false, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing With Actual Delay", async function () {
      await test_state_sub(makerDelay, 20);
    });
    describe("Then With Actual Delay", async function () {
      await test_state_then(makerDelay, 20);
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
      const init = st.d.rea.ok(() => sleep(1, 1));
      assertType<STATE_REA<number>>(init);
      assertType<STATE_DELAYED_REA<number>>(init);
    });
    it("err", async function () {
      const init = st.d.rea.err<number>(() => sleep(1, "1"));
      assertType<STATE_REA<number>>(init);
      assertType<STATE_DELAYED_REA<number>>(init);
    });
    it("result ok", async function () {
      const init = st.d.rea.result(() => sleep(1, Ok(1)));
      assertType<STATE_REA<number>>(init);
      assertType<STATE_DELAYED_REA<number>>(init);
    });
    it("cleanup successfull", async function () {
      const init = st.d.rea.ok(() => sleep(1, 1));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const then = init.then;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const set = init.set;
      await init;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.then).not.eq(then, "then");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.set).not.eq(set, "set");
    });
    //# Standard Tests
    const maker: TEST_STATE_ALL = () => {
      const state = st.d.rea.ok(() => sleep(1, 1));
      const set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 5);
    });
    describe("Then", async function () {
      await test_state_then(maker, 5);
    });
    const makerDelay: TEST_STATE_ALL = () => {
      const state = st.d.rea.ok(() => sleep(10, 1));
      const set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: false, w: false, ws: false, state, set };
    };
    it("Subscribing And Unsubscribing With Actual Delay", async function () {
      await test_state_sub(makerDelay, 20);
    });
    describe("Then With Actual Delay", async function () {
      await test_state_then(makerDelay, 20);
    });
  });
  //##################################################################################################################################################
  //      _____   ____           __          _______
  //     |  __ \ / __ \   /\     \ \        / / ____|
  //     | |__) | |  | | /  \     \ \  /\  / / (___
  //     |  _  /| |  | |/ /\ \     \ \/  \/ / \___ \
  //     | | \ \| |__| / ____ \     \  /\  /  ____) |
  //     |_|  \_\\____/_/    \_\     \/  \/  |_____/
  describe("ROA_WS", { timeout: 100 }, function () {
    it("ok", async function () {
      const init = st.d.roa_ws.ok(() => sleep(1, 1));
      assertType<STATE_ROA_WS<number>>(init);
      assertType<STATE_DELAYED_ROA_WS<number>>(init);
    });
    it("result ok", async function () {
      const init = st.d.roa_ws.result(() => sleep(1, Ok(1)));
      assertType<STATE_ROA_WS<number>>(init);
      assertType<STATE_DELAYED_ROA_WS<number>>(init);
    });
    it("cleanup successfull", async function () {
      const init = st.d.roa_ws.ok(() => sleep(1, 1));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const then = init.then;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const set = init.set;
      const writeSync = init.write_sync;
      await init;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.then).not.eq(then, "then");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.set).not.eq(set, "set");
      expect(init.write_sync).not.eq(writeSync, "writeSync");
    });
    //# Standard Tests
    const maker: TEST_STATE_ALL = () => {
      const state = st.d.roa_ws.ok(() => sleep(1, 1));
      const set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: false, w: true, ws: true, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 5);
    });
    describe("Then", async function () {
      await test_state_then(maker, 5);
    });
    const makerDelay: TEST_STATE_ALL = () => {
      const state = st.d.roa_ws.ok(() => sleep(10, 1));
      const set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: false, w: true, ws: true, state, set };
    };
    it("Subscribing And Unsubscribing With Actual Delay", async function () {
      await test_state_sub(makerDelay, 20);
    });
    describe("Then With Actual Delay", async function () {
      await test_state_then(makerDelay, 20);
    });
    const makerWrite: TEST_STATE_WRITESYNC = () => {
      const state = st.d.roa_ws.ok(() => sleep(10, 1), true);
      const set = (val: ResultOk<number>) => state.set(val);
      return { o: true, s: false, w: true, ws: true, state, set };
    };
    it("Write", async function () {
      await test_state_write(makerWrite);
    });
    it("WriteSync", async function () {
      await test_state_writeSync(makerWrite);
    });
  });
  //##################################################################################################################################################
  //      _____  ______           __          _______
  //     |  __ \|  ____|   /\     \ \        / / ____|
  //     | |__) | |__     /  \     \ \  /\  / / (___
  //     |  _  /|  __|   / /\ \     \ \/  \/ / \___ \
  //     | | \ \| |____ / ____ \     \  /\  /  ____) |
  //     |_|  \_\______/_/    \_\     \/  \/  |_____/
  describe("REA_WS", { timeout: 100 }, function () {
    it("ok", async function () {
      const init = st.d.rea_ws.ok(() => sleep(1, 1));
      assertType<STATE_REA_WS<number>>(init);
      assertType<STATE_DELAYED_REA_WS<number>>(init);
    });
    it("err", async function () {
      const init = st.d.rea_ws.err<number>(() => sleep(1, "1"));
      assertType<STATE_REA_WS<number>>(init);
      assertType<STATE_DELAYED_REA_WS<number>>(init);
    });
    it("result ok", async function () {
      const init = st.d.rea_ws.result(() => sleep(1, Ok(1)));
      assertType<STATE_REA_WS<number>>(init);
      assertType<STATE_DELAYED_REA_WS<number>>(init);
    });
    it("cleanup successfull", async function () {
      const init = st.d.roa_ws.ok(() => sleep(1, 1));
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const then = init.then;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const set = init.set;
      const writeSync = init.write_sync;
      await init;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.then).not.eq(then, "then");
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(init.set).not.eq(set, "set");
      expect(init.write_sync).not.eq(writeSync, "writeSync");
    });
    //# Standard Tests
    const maker: TEST_STATE_ALL = () => {
      const state = st.d.rea_ws.ok(() => sleep(1, 1));
      const set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: false, w: true, ws: true, state, set };
    };
    it("Subscribing And Unsubscribing", async function () {
      await test_state_sub(maker, 5);
    });
    describe("Then", async function () {
      await test_state_then(maker, 5);
    });
    const makerDelay: TEST_STATE_ALL = () => {
      const state = st.d.rea_ws.ok(() => sleep(10, 1));
      const set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: false, w: true, ws: true, state, set };
    };
    it("Subscribing And Unsubscribing With Actual Delay", async function () {
      await test_state_sub(makerDelay, 20);
    });
    describe("Then With Actual Delay", async function () {
      await test_state_then(makerDelay, 20);
    });
    const makerWrite: TEST_STATE_WRITESYNC = () => {
      const state = st.d.rea_ws.ok(() => sleep(10, 1), true);
      const set = (val: Result<number, string>) => state.set(val);
      return { o: false, s: false, w: true, ws: true, state, set };
    };
    it("Write", async function () {
      await test_state_write(makerWrite);
    });
    it("WriteSync", async function () {
      await test_state_writeSync(makerWrite);
    });
  });
});

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
