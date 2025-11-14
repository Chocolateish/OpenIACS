import { Ok } from "@libResult";
import {
  state_derived_from_state_array,
  state_derived_from_states,
  state_derived_ok_from_states,
} from "./stateDerived";
import type { State, StateReadOk } from "./types";

export function state_derives_sum_from(...states: State<number, any>[]) {
  return state_derived_from_state_array((values) => {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }, states);
}

export function state_derives_sum_from_ok<
  INPUT extends [State<number, any>, ...State<number, any>[]]
>(...states: INPUT) {
  return state_derived_from_states((values) => {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }, ...states);
}

export function state_derives_sum_ok_from_ok<
  INPUT extends [StateReadOk<number, any>, ...StateReadOk<number, any>[]]
>(...states: INPUT) {
  return state_derived_ok_from_states((values) => {
    let sum = 0;
    for (let val of values) sum += val.value;
    return Ok(sum);
  }, ...states);
}
