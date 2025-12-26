import { ok, ResultOk, type Result } from "@libResult";
import type { State, StateRES, StateROA, StateROS } from "../types";
import { STATE_COLLECTED_REA, type StateCollectedREA } from "./rea";
import { STATE_COLLECTED_RES, type StateCollectedRES } from "./res";
import { STATE_COLLECTED_ROA, type StateCollectedROA } from "./roa";
import { STATE_COLLECTED_ROS, type StateCollectedROS } from "./ros";

class NumberSumREA<S extends State<number>[]> extends STATE_COLLECTED_REA.class<
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
  S extends [StateROA<number>, ...StateROA<number>[]]
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
  S extends StateRES<number>[]
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
  S extends [StateROS<number>, ...StateROS<number>[]]
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
    rea<S extends State<number>[]>(...states: S) {
      return new NumberSumREA(...states) as StateCollectedREA<number, S>;
    },
    roa<S extends [StateROA<number>, ...StateROA<number>[]]>(...states: S) {
      return new NumberSumROA(...states) as StateCollectedROA<number, S>;
    },
    res<S extends StateRES<number>[]>(...states: S) {
      return new NumberSumRES(...states) as StateCollectedRES<number, S>;
    },
    ros<S extends [StateROS<number>, ...StateROS<number>[]]>(...states: S) {
      return new NumberSumROS(...states) as StateCollectedROS<number, S>;
    },
  },
};
