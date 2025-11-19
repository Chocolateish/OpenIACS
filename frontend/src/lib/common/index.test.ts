import { arrayDiff, objectEqualsDeep, objectKeyDiff } from "@libCommon";
import { describe, expect, it } from "vitest";

describe("Any Equals", async () => {
  it("Object Equals Deep", async () => {
    let test1 = {
      a: 1,
      b: 2,
      c: 3,
    };
    let test2 = {
      a: 1,
      b: 2,
      e: 4,
    };
    let test3 = {
      a: 1,
      b: 2,
      c: 3,
    };
    expect(objectEqualsDeep(test1, test2)).toEqual(false);
    expect(objectEqualsDeep(test1, test3)).toEqual(true);
  });
});

describe("Diffing", async () => {
  it("Array Diff", async () => {
    let diff = arrayDiff([1, 2, 3, 4], [3, 4, 5, 6]);
    expect(diff).toEqual({ added: [5, 6], removed: [1, 2] });
  });
  it("Object Key Diff", async () => {
    let diff = objectKeyDiff({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, e: 4 });
    expect(diff).toEqual({ added: ["e"], removed: ["c"] });
  });
});
