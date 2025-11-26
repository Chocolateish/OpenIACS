import type { Result, ResultOk } from "@libResult";
import type {
  STATE,
  STATE_INFER_RESULT,
  STATE_REA,
  STATE_ROA,
  STATE_SUB,
} from "../types";

export type STATE_COLLECTED_TRANS_VAL<IN extends STATE<any>[]> = {
  [I in keyof IN]: STATE_INFER_RESULT<IN[I]>;
};

export type STATE_COLLECTED_TRANS_VAL_UNK<IN extends STATE<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROA<infer RT>
    ? ResultOk<RT>
    : IN[I] extends STATE_REA<infer RT>
    ? Result<RT, string>
    : unknown;
};

export type STATE_COLLECTED_SUBS<IN extends STATE<any>[]> = {
  [I in keyof IN]: STATE_SUB<STATE_INFER_RESULT<IN[I]>>;
};

export type STATE_COLLECTED_STATES<IN extends STATE<any>[]> = {
  [I in keyof IN]: IN[I] extends STATE_ROA<infer RT>
    ? STATE_ROA<RT>
    : IN[I] extends STATE_REA<infer RT>
    ? STATE_REA<RT>
    : never;
};
