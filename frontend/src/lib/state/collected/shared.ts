import type { Result, ResultOk } from "@libResult";
import type {
  STATE,
  STATE_INFER_RESULT,
  STATE_REA,
  STATE_ROA,
  STATE_SUB,
} from "../types";

export type StateCollectedTransVal<IN extends STATE<any>[]> = {
  [I in keyof IN]: STATE_INFER_RESULT<IN[I]>;
};

export type StateCollectedTransValUnk<IN extends STATE<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROA<infer RT>
    ? ResultOk<RT>
    : IN[I] extends STATE_REA<infer RT>
    ? Result<RT, string>
    : unknown;
};

export type StateCollectedSubs<IN extends STATE<any>[]> = {
  [I in keyof IN]: STATE_SUB<STATE_INFER_RESULT<IN[I]>>;
};

export type StateCollectedStates<IN extends STATE<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROA<infer RT>
    ? STATE_ROA<RT>
    : IN[I] extends STATE_REA<infer RT>
    ? STATE_REA<RT>
    : never;
};
