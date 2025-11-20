import { describe, expect, it } from "vitest";
import { objectEqualsDeep } from "./equals";

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
    let test4 = {
      a: 2,
      b: 3,
      c: 4,
    };
    let test5 = {
      a: "2",
      b: "3",
      c: "4",
    };
    expect(objectEqualsDeep(test1, test2)).toEqual(false);
    expect(objectEqualsDeep(test1, test3)).toEqual(true);
    expect(objectEqualsDeep(test1, test4)).toEqual(false);
    expect(objectEqualsDeep(test1, test5)).toEqual(false);
  });
});
