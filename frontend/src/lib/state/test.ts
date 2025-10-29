import { Ok } from "@libResult";
import { state, state_proxy } from "@libState";

let stest = state.from(10);
stest.readable;
stest.setErr({ reason: "Test Error", code: "TEST" });

let test = state_proxy.from(state.from(5), (val) => {
  if (val.ok) return Ok(String(val.value));
  return val;
});
let yoyo = test.readable;

let test2 = state_proxy.ok(stest);
