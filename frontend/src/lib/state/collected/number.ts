import { Ok, ResultOk, type Result } from "@libResult";
import type { STATE, STATE_RES, STATE_ROA, STATE_ROS } from "../types";
import { state_collected_rea, type STATE_COLLECTED_REA } from "./rea";
import { state_collected_res, type STATE_COLLECTED_RES } from "./res";
import { state_collected_roa, type STATE_COLLECTED_ROA } from "./roa";
import { state_collected_ros, type STATE_COLLECTED_ROS } from "./ros";

class NUMBER_SUM_REA<
  S extends STATE<number>[]
> extends state_collected_rea.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: Result<number, string>[]): Result<number, string> {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }
}

//##################################################################################################################################################
class NUMBER_SUM_ROA<
  S extends [STATE_ROA<number>, ...STATE_ROA<number>[]]
> extends state_collected_roa.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return Ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

//##################################################################################################################################################
class NUMBER_SUM_RES<
  S extends STATE_RES<number>[]
> extends state_collected_res.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: Result<number, string>[]): Result<number, string> {
    let sum = 0;
    for (let val of values) {
      if (val.err) return val;
      sum += val.value;
    }
    return Ok(sum);
  }
}

//##################################################################################################################################################
class NUMBER_SUM_ROS<
  S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]
> extends state_collected_ros.class<number, S, number> {
  constructor(...states: S) {
    super(false, ...states);
  }
  protected getter(values: ResultOk<number>[]): ResultOk<number> {
    return Ok(values.reduce((acc, val) => acc + val.value, 0));
  }
}

export const state_collects_number = {
  sum: {
    rea<S extends STATE<number>[]>(...states: S) {
      return new NUMBER_SUM_REA(...states) as STATE_COLLECTED_REA<number, S>;
    },
    roa<S extends [STATE_ROA<number>, ...STATE_ROA<number>[]]>(...states: S) {
      return new NUMBER_SUM_ROA(...states) as STATE_COLLECTED_ROA<number, S>;
    },
    res<S extends STATE_RES<number>[]>(...states: S) {
      return new NUMBER_SUM_RES(...states) as STATE_COLLECTED_RES<number, S>;
    },
    ros<S extends [STATE_ROS<number>, ...STATE_ROS<number>[]]>(...states: S) {
      return new NUMBER_SUM_ROS(...states) as STATE_COLLECTED_ROS<number, S>;
    },
  },
};
