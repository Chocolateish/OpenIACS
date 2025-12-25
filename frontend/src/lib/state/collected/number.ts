import { ok, ResultOk, type Result } from "@libResult";
import type { STATE, STATE_RES, STATE_ROA, STATE_ROS } from "../types";
import { state_collected_rea, type StateCollectedRea } from "./rea";
import { state_collected_res, type StateCollectedRes } from "./res";
import { state_collected_roa, type StateCollectedRoa } from "./roa";
import { state_collected_ros, type StateCollectedRos } from "./ros";

class NumberSumRea<S extends STATE<number>[]> extends state_collected_rea.class<
  number,
  S,
  number
> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: Result<number, string>[]): Result<number, string> {
    let sum = 0;
    for (const val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return ok(sum);
  }
}

//##################################################################################################################################################
class NumberSumRoa<
  S extends [STATE_ROA<number>, ...STATE_ROA<number>[]]
> extends state_collected_roa.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

//##################################################################################################################################################
class NumberSumRes<
  S extends STATE_RES<number>[]
> extends state_collected_res.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: Result<number, string>[]): Result<number, string> {
    let sum = 0;
    for (const val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return ok(sum);
  }
}

//##################################################################################################################################################
class NumberSumRos<
  S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]
> extends state_collected_ros.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

export const state_collects_number = {
  sum: {
    rea<S extends STATE<number>[]>(...states: S) {
      return new NumberSumRea(...states) as StateCollectedRea<number, S>;
    },
    roa<S extends [STATE_ROA<number>, ...STATE_ROA<number>[]]>(...states: S) {
      return new NumberSumRoa(...states) as StateCollectedRoa<number, S>;
    },
    res<S extends STATE_RES<number>[]>(...states: S) {
      return new NumberSumRes(...states) as StateCollectedRes<number, S>;
    },
    ros<S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]>(...states: S) {
      return new NumberSumRos(...states) as StateCollectedRos<number, S>;
    },
  },
};
