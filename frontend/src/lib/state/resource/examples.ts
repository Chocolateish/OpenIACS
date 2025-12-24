import { sleep } from "@libCommon";
import { Ok, type Result, type ResultOk } from "@libResult";
import { default as st, type STATE_SUB } from "@libState";

const wait = 50;

let valBuff: ResultOk<number> = Ok(1);
const state = st.r.rea.from<number>(
  async (state) => {
    state.update_single(valBuff);
  },
  () => {},
  () => {}
);
const set = (v: ResultOk<number>) => {
  valBuff = v;
  state.update_resource(v);
};

const warnBackup = console.error;
let count = 0;
console.error = () => {
  count += 100000000;
};
const sub1 = state.sub(() => {
  count++;
}, true);
console.warn(state.in_use(), state);
console.warn(state.has(sub1 as STATE_SUB<Result<number, string>>), state);
console.warn(state.amount(), state);
await sleep(wait ?? 1);
console.warn(count, 1);
const sub2 = state.sub(() => {
  count += 10;
});
console.warn(state.in_use(), state);
console.warn(state.has(sub2 as STATE_SUB<Result<number, string>>), state);
console.warn(state.amount(), 2);
console.warn(count, 1);
set(Ok(8));
await sleep(wait ?? 1);
console.warn(count, 12);
const sub3 = state.sub(() => {
  count += 100;
  throw new Error("Gaurded against crash");
});
console.warn(state.in_use(), state);
console.warn(state.has(sub3 as STATE_SUB<Result<number, string>>), state);
console.warn(state.amount(), 3);
set(Ok(12));
await sleep(wait ?? 1);
console.warn(count, 100000123);
state.unsub(sub1);
state.unsub(sub2);
console.warn(state.in_use(), state);
console.warn(state.has(sub3 as STATE_SUB<Result<number, string>>), state);
console.warn(state.amount(), 1);
set(Ok(13));
await sleep(wait ?? 1);
console.warn(count, 200000223);
state.unsub(sub3);
console.warn(state.in_use(), undefined);
console.warn(state.amount(), 0);
const [sub4, val] = await new Promise<[STATE_SUB<any>, Result<number, string>]>(
  (a) => {
    const sub4 = state.sub((val) => {
      count += 1000;
      a([sub4, val]);
    });
    set(Ok(15));
  }
);
await sleep(wait ?? 1);
console.warn(val, Ok(15));
console.warn(count, 200001223);
state.unsub(sub4);
console.error = warnBackup;
