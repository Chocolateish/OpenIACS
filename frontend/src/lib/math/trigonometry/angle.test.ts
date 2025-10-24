import { describe, expect, it } from "vitest";
import { degreesToRadians, radiansTodegrees } from "./angle";

describe("Degrees To Radians", function () {
  it("0 Degree", function () {
    expect(degreesToRadians(0)).toStrictEqual(0);
  });
  it("66 Degree", function () {
    expect(degreesToRadians(66)).toStrictEqual(1.1519173063162575);
  });
  it("666 Degree", function () {
    expect(degreesToRadians(666)).toStrictEqual(11.623892818282235);
  });
  it("6666 Degree", function () {
    expect(degreesToRadians(6666)).toStrictEqual(116.34364793794201);
  });
  it("-66 Degree", function () {
    expect(degreesToRadians(-66)).toStrictEqual(-1.1519173063162575);
  });
});

describe("Radians To Degrees", function () {
  it("0 Radians", function () {
    expect(radiansTodegrees(0)).toStrictEqual(0);
  });
  it("66 Radians", function () {
    expect(radiansTodegrees(66)).toStrictEqual(3781.5214478634334);
  });
  it("666 Radians", function () {
    expect(radiansTodegrees(666)).toStrictEqual(38158.98915571283);
  });
  it("6666 Radians", function () {
    expect(radiansTodegrees(6666)).toStrictEqual(381933.66623420676);
  });
  it("-66 Radians", function () {
    expect(radiansTodegrees(-66)).toStrictEqual(-3781.5214478634334);
  });
});
