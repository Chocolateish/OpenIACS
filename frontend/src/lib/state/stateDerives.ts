import { Ok } from "@libResult";
import {
  state_derived_from_state_array,
  state_derived_from_states,
} from "./stateDerived";
import type { StateRead } from "./types";

export function state_derives_sum_from(...states: StateRead<number, any>[]) {
  return state_derived_from_state_array((values) => {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }, states);
}

export function state_derives_sum_from_ok(
  ...states: [StateRead<number, any>, ...StateRead<number, any>[]]
) {
  return state_derived_from_states((values) => {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }, ...states);
}
