import { sleep } from "@libCommon";
import { Err, Ok, ResultOk, type Result } from "@libResult";
import { expect, it } from "vitest";
import type {
  STATE_REA,
  STATE_REA_WA,
  STATE_REA_WS,
  STATE_RES,
  STATE_RES_WA,
  STATE_RES_WS,
  STATE_ROA,
  STATE_ROA_WA,
  STATE_ROA_WS,
  STATE_ROS,
  STATE_ROS_WA,
  STATE_ROS_WS,
  STATE_SUB,
} from "./types";

function errGen() {
  return "Test Error";
}

type STATE_TYPE<O, SY, W, WS, ST, R> = {
  o: O;
  s: SY;
  w: W;
  ws: WS;
  state: ST;
  set: (val: R) => void;
};
type RERR = Result<number, string>;
type ROK = ResultOk<number>;

export type TEST_STATE_ALL = (
  setter?: (w: number) => void
) =>
  | STATE_TYPE<true, true, false, false, STATE_ROS<number>, ROK>
  | STATE_TYPE<true, true, true, true, STATE_ROS_WS<number>, ROK>
  | STATE_TYPE<true, true, true, false, STATE_ROS_WA<number>, ROK>
  | STATE_TYPE<true, false, false, false, STATE_ROA<number>, ROK>
  | STATE_TYPE<true, false, true, true, STATE_ROA_WS<number>, ROK>
  | STATE_TYPE<true, false, true, false, STATE_ROA_WA<number>, ROK>
  | STATE_TYPE<false, true, false, false, STATE_RES<number>, RERR>
  | STATE_TYPE<false, true, true, true, STATE_RES_WS<number>, RERR>
  | STATE_TYPE<false, true, true, false, STATE_RES_WA<number>, RERR>
  | STATE_TYPE<false, false, false, false, STATE_REA<number>, RERR>
  | STATE_TYPE<false, false, true, true, STATE_REA_WS<number>, RERR>
  | STATE_TYPE<false, false, true, false, STATE_REA_WA<number>, RERR>;

export type TEST_STATE_OK = () =>
  | STATE_TYPE<true, true, false, false, STATE_ROS<number>, ROK>
  | STATE_TYPE<true, true, true, true, STATE_ROS_WS<number>, ROK>
  | STATE_TYPE<true, true, true, false, STATE_ROS_WA<number>, ROK>
  | STATE_TYPE<true, false, false, false, STATE_ROA<number>, ROK>
  | STATE_TYPE<true, false, true, true, STATE_ROA_WS<number>, ROK>
  | STATE_TYPE<true, false, true, false, STATE_ROA_WA<number>, ROK>;

export type TEST_STATE_SYNC = () =>
  | STATE_TYPE<true, true, false, false, STATE_ROS<number>, ROK>
  | STATE_TYPE<true, true, true, true, STATE_ROS_WS<number>, ROK>
  | STATE_TYPE<true, true, true, false, STATE_ROS_WA<number>, ROK>
  | STATE_TYPE<false, true, false, false, STATE_RES<number>, RERR>
  | STATE_TYPE<false, true, true, true, STATE_RES_WS<number>, RERR>
  | STATE_TYPE<false, true, true, false, STATE_RES_WA<number>, RERR>;

export type TEST_STATE_OK_SYNC = () =>
  | STATE_TYPE<true, true, false, false, STATE_ROS<number>, ROK>
  | STATE_TYPE<true, true, true, true, STATE_ROS_WS<number>, ROK>
  | STATE_TYPE<true, true, true, false, STATE_ROS_WA<number>, ROK>;

export type TEST_STATE_WRITE = () =>
  | STATE_TYPE<true, true, true, true, STATE_ROS_WS<number>, ROK>
  | STATE_TYPE<true, true, true, false, STATE_ROS_WA<number>, ROK>
  | STATE_TYPE<true, false, true, true, STATE_ROA_WS<number>, ROK>
  | STATE_TYPE<true, false, true, false, STATE_ROA_WA<number>, ROK>
  | STATE_TYPE<false, true, true, true, STATE_RES_WS<number>, RERR>
  | STATE_TYPE<false, true, true, false, STATE_RES_WA<number>, RERR>
  | STATE_TYPE<false, false, true, true, STATE_REA_WS<number>, RERR>
  | STATE_TYPE<false, false, true, false, STATE_REA_WA<number>, RERR>;

export type TEST_STATE_WRITESYNC = () =>
  | STATE_TYPE<true, true, true, true, STATE_ROS_WS<number>, ROK>
  | STATE_TYPE<true, false, true, true, STATE_ROA_WS<number>, ROK>
  | STATE_TYPE<false, true, true, true, STATE_RES_WS<number>, RERR>
  | STATE_TYPE<false, false, true, true, STATE_REA_WS<number>, RERR>;

//       _____ _    _ ____   _____  _____ _____  _____ ____  ______
//      / ____| |  | |  _ \ / ____|/ ____|  __ \|_   _|  _ \|  ____|
//     | (___ | |  | | |_) | (___ | |    | |__) | | | | |_) | |__
//      \___ \| |  | |  _ < \___ \| |    |  _  /  | | |  _ <|  __|
//      ____) | |__| | |_) |____) | |____| | \ \ _| |_| |_) | |____
//     |_____/ \____/|____/|_____/ \_____|_|  \_\_____|____/|______|
/**Tests different cases of subscribing and unsubscribing to a state
 * @param wait Time to wait after subscribing first time for async states
 */
export async function test_state_sub(
  stateMaker: TEST_STATE_ALL,
  wait: number
): Promise<void> {
  const made = stateMaker();
  const { state, set } = made;
  const warnBackup = console.error;
  console.error = () => {
    count += 100000000;
  };
  let count = 0;
  const sub1 = state.sub(() => {
    count++;
  }, true);
  expect(state.in_use()).equal(state);
  expect(state.has(sub1 as STATE_SUB<Result<number, string>>)).equal(state);
  expect(state.amount()).equal(1);
  await sleep(wait ?? 1);
  expect(count).equal(1);
  const sub2 = state.sub(() => {
    count += 10;
  });
  expect(state.in_use()).equal(state);
  expect(state.has(sub2 as STATE_SUB<Result<number, string>>)).equal(state);
  expect(state.amount()).equal(2);
  expect(count).equal(1);
  set(Ok(8));
  await sleep(1);
  expect(count).equal(12);
  const sub3 = state.sub(() => {
    count += 100;
    throw new Error("Gaurded against crash");
  });
  expect(state.in_use()).equal(state);
  expect(state.has(sub3 as STATE_SUB<Result<number, string>>)).equal(state);
  expect(state.amount()).equal(3);
  set(Ok(12));
  await sleep(1);
  expect(count).equal(100000123);
  state.unsub(sub1);
  state.unsub(sub2);
  expect(state.in_use()).equal(state);
  expect(state.has(sub3 as STATE_SUB<Result<number, string>>)).equal(state);
  expect(state.amount()).equal(1);
  set(Ok(13));
  await sleep(1);
  expect(count).equal(200000223);
  state.unsub(sub3);
  expect(state.in_use()).equal(undefined);
  expect(state.amount()).equal(0);
  const [sub4, val] = await new Promise<
    [STATE_SUB<any>, Result<number, string>]
  >((a) => {
    const sub4 = state.sub((val) => {
      count += 1000;
      a([sub4, val]);
    });
    set(Ok(15));
  });
  await sleep(1);
  expect(val).toEqual(Ok(15));
  expect(count).equal(200001223);
  state.unsub(sub4);
  if (!made.o) {
    const [sub5, val2] = await new Promise<
      [STATE_SUB<any>, Result<number, string>]
    >((a) => {
      const sub5 = state.sub((val) => {
        count += 10000;
        a([sub5, val]);
      });
      made.set(Err(errGen()));
    });
    await sleep(1);
    expect(val2).toEqual(Err(errGen()));
    expect(count).equal(200011223);
    state.unsub(sub5);
  }

  console.error = warnBackup;
}

//      _______ _    _ ______ _   _
//     |__   __| |  | |  ____| \ | |
//        | |  | |__| | |__  |  \| |
//        | |  |  __  |  __| | . ` |
//        | |  | |  | | |____| |\  |
//        |_|  |_|  |_|______|_| \_|
/**Tests different cases of using then on a state
 * Expects initial value to be number 1
 * @param wait Time to wait for async states values
 */
export async function test_state_then(
  stateMaker: TEST_STATE_ALL,
  wait: number
): Promise<void> {
  it("awaiting then setting trice", async function () {
    const { state, set } = stateMaker();
    let awaited = await Promise.race([state, sleep(wait)]);
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(1));
    set(Ok(5));
    awaited = await Promise.race([state, sleep(wait)]);
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(5));
    set(Ok(9999999999));
    awaited = await Promise.race([state, sleep(wait)]);
    expect(awaited).instanceOf(ResultOk);
    expect(awaited).toEqual(Ok(9999999999));
  });
  it("using then", async function () {
    const { state } = stateMaker();
    await Promise.race([
      new Promise((a) => {
        state.then((val) => {
          expect(val).instanceOf(ResultOk);
          expect(val).toEqual(Ok(1));
          a(null);
        });
      }),
      sleep(wait),
    ]);
  });
  it("using then", async function () {
    const { state } = stateMaker();
    expect(
      await new Promise((a) => {
        state
          .then((val) => {
            expect(val).instanceOf(ResultOk);
            expect(val).toEqual(Ok(1));
            return 8;
          })
          .then((val) => {
            expect(val).equal(8);
            a(12);
          });
      })
    ).equal(12);
  });
  it("using then", async function () {
    const { state } = stateMaker();
    expect(
      await new Promise((a) => {
        state
          .then((val) => {
            expect(val).instanceOf(ResultOk);
            expect(val).toEqual(Ok(1));
            throw new Error("8");
          })
          .then(
            () => {},
            (val) => {
              expect(val).toEqual(new Error("8"));
              a(12);
            }
          );
      })
    ).equal(12);
  });
  it("setting then awaiting", async function () {
    const { state, set } = stateMaker();
    set(Ok(7));
    const awaited = await state;
    expect(awaited).toEqual(Ok(7));
  });
  it("setting error then awaiting", async function () {
    const made = stateMaker();
    if (made.o) return;
    made.set(Err(errGen()));
    const awaited = await made.state;
    expect(awaited).toEqual(Err(errGen()));
  });
}

//       _____ ______ _______
//      / ____|  ____|__   __|
//     | |  __| |__     | |
//     | | |_ |  __|    | |
//     | |__| | |____   | |
//      \_____|______|  |_|
/**Tests different cases of using get on a state
 * Expects initial value to be number 1
 */
export async function test_state_get(
  stateMaker: TEST_STATE_SYNC
): Promise<void> {
  const made = stateMaker();
  expect(made.state.get()).toEqual(Ok(1));
  made.set(Ok(55));
  expect(made.state.get()).toEqual(Ok(55));
  if (!made.o) {
    made.set(Err(errGen()));
    expect(made.state.get()).toEqual(Err(errGen()));
  }
}

//       _____ ______ _______    ____  _  __
//      / ____|  ____|__   __|  / __ \| |/ /
//     | |  __| |__     | |    | |  | | ' /
//     | | |_ |  __|    | |    | |  | |  <
//     | |__| | |____   | |    | |__| | . \
//      \_____|______|  |_|     \____/|_|\_\
/**Tests different cases of using getOk on a state
 * Expects initial value to be number 1
 */
export async function test_state_get_ok(
  stateMaker: TEST_STATE_OK_SYNC
): Promise<void> {
  const { state } = stateMaker();
  expect(state.ok()).toEqual(1);
}

//     __          _______  _____ _______ ______
//     \ \        / /  __ \|_   _|__   __|  ____|
//      \ \  /\  / /| |__) | | |    | |  | |__
//       \ \/  \/ / |  _  /  | |    | |  |  __|
//        \  /\  /  | | \ \ _| |_   | |  | |____
//         \/  \/   |_|  \_\_____|  |_|  |______|
/**Tests different cases of using write on a state
 * Expects initial value to be number 1
 */
export async function test_state_write(
  stateMaker: TEST_STATE_WRITE
): Promise<void> {
  const { state } = stateMaker();
  expect(await state.write(15)).toEqual(Ok(undefined));
  const awaited = await state;
  expect(awaited).toEqual(Ok(15));
}

//     __          _______  _____ _______ ______    _______     ___   _  _____
//     \ \        / /  __ \|_   _|__   __|  ____|  / ____\ \   / / \ | |/ ____|
//      \ \  /\  / /| |__) | | |    | |  | |__    | (___  \ \_/ /|  \| | |
//       \ \/  \/ / |  _  /  | |    | |  |  __|    \___ \  \   / | . ` | |
//        \  /\  /  | | \ \ _| |_   | |  | |____   ____) |  | |  | |\  | |____
//         \/  \/   |_|  \_\_____|  |_|  |______| |_____/   |_|  |_| \_|\_____|
/**Tests different cases of using writeSync on a state
 * Expects initial value to be number 1
 */
export async function test_state_writeSync(
  stateMaker: TEST_STATE_WRITESYNC
): Promise<void> {
  const { state } = stateMaker();
  expect(state.write_sync(10)).toEqual(Ok(undefined));
  const awaited = await state;
  expect(awaited).toEqual(Ok(10));
}

// describe(
//   "Normal async states with setter set to simple function",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_sync_states((val, state) => Ok(state.setOk(val)));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.write(10)).toEqual(Ok(undefined));
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(10));
//       });
//     }
//   }
// );

// describe(
//   "Normal states with setter set to transforming function",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_states(async (val, state) => Ok(state.setOk(val * 2)));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.write(10)).equal(true);
//         let awaited = await state;
//         expect(awaited).toEqual(Ok(20));
//       });
//     }
//   }
// );

// describe(
//   "Normal states with setter set to function returning error",
//   {
//     timeout: 50,
//   },
//   function () {
//     let tests = gen_states(async (_val, state) => Ok(state.setErr(errGen())));
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       it(test[0], async function () {
//         let state = test[1];
//         expect(state.write(10)).equal(true);
//         let awaited = await state;
//         expect(awaited).toEqual(Err(errGen()));
//       });
//     }
//   }
// );
