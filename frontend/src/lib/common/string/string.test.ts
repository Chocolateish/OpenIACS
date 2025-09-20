import { describe, expect, it } from "vitest";
import { stringByteLength, stringByteLimit } from "./string";

describe("Byte Length", function () {
  it("asdf is 4 bytes", function () {
    expect(stringByteLength("asdf")).toStrictEqual(4);
  });
  it("asdfæø is 8 bytes", function () {
    expect(stringByteLength("asdfæø")).toStrictEqual(8);
  });
  it("asdfæø💕💕 is 16 bytes", function () {
    expect(stringByteLength("asdfæø💕💕")).toStrictEqual(16);
  });
});

describe("Byte Limit", function () {
  it("asdf is 2 bytes", function () {
    expect(stringByteLimit("asdf", 2)).toStrictEqual("as");
  });
  it("asdfæø is 8 bytes", function () {
    expect(stringByteLimit("asdfæø", 5)).toStrictEqual("asdf");
  });
  it("asdfæø💕💕 is 16 bytes", function () {
    expect(stringByteLimit("asdfæø💕💕", 10)).toStrictEqual("asdfæø");
  });
});
