import { ok, ResultOk, type Result } from "@libResult";
import type { STATE, STATE_RES, STATE_ROA, STATE_ROS } from "../types";
import { STATE_COLLECTED_REA, type StateCollectedREA } from "./rea";
import { STATE_COLLECTED_RES, type StateCollectedRES } from "./res";
import { STATE_COLLECTED_ROA, type StateCollectedROA } from "./roa";
import { STATE_COLLECTED_ROS, type StateCollectedROS } from "./ros";

class NumberSumREA<S extends STATE<number>[]> extends STATE_COLLECTED_REA.class<
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
class NumberSumROA<
  S extends [STATE_ROA<number>, ...STATE_ROA<number>[]]
> extends STATE_COLLECTED_ROA.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

//##################################################################################################################################################
class NumberSumRES<
  S extends STATE_RES<number>[]
> extends STATE_COLLECTED_RES.class<number, S, number> {
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
class NumberSumROS<
  S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]
> extends STATE_COLLECTED_ROS.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

export const STATE_COLLECTS_NUMBER = {
  sum: {
    rea<S extends STATE<number>[]>(...states: S) {
      return new NumberSumREA(...states) as StateCollectedREA<number, S>;
    },
    roa<S extends [STATE_ROA<number>, ...STATE_ROA<number>[]]>(...states: S) {
      return new NumberSumROA(...states) as StateCollectedROA<number, S>;
    },
    res<S extends STATE_RES<number>[]>(...states: S) {
      return new NumberSumRES(...states) as StateCollectedRES<number, S>;
    },
    ros<S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]>(...states: S) {
      return new NumberSumROS(...states) as StateCollectedROS<number, S>;
    },
  },
};
