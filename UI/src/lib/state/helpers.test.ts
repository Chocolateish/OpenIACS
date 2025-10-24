import { Ok } from "@libResult";
import { describe, expect, it } from "vitest";
import { StateNumberHelper, StateStringHelper } from "./helpers";
import { state } from "./state";

describe("State Number Min Max", async () => {
  it("Checking limiter min max", async () => {
    let stateInst = state<number>(Ok(5), true, new StateNumberHelper(0, 10));
    expect((await stateInst).unwrap).to.equal(5);
    expect(stateInst.limit(11).unwrap).to.equal(10);
    expect(stateInst.limit(-11).unwrap).to.equal(0);
    stateInst.write(11);
    expect((await stateInst).unwrap).to.equal(10);
    stateInst.write(-11);
    expect((await stateInst).unwrap).to.equal(0);
  });
  it("Checking checker min max", async () => {
    let stateInst = state<number>(Ok(5), true, new StateNumberHelper(0, 10));
    expect((await stateInst).unwrap).to.equal(5);
    expect(stateInst.check(11).unwrap).to.equal(
      "11 is bigger than the limit of 10"
    );
    expect(stateInst.check(-11).unwrap).to.equal(
      "-11 is smaller than the limit of 10"
    );
  });
  it("Checking related min max", async () => {
    let stateInst = state(Ok(5), true, new StateNumberHelper(0, 10));
    let related = stateInst.related().unwrap;
    expect(related.min).to.equal(0);
    expect(related.max).to.equal(10);
  });
});
describe("State Number Unit", async () => {
  it("Checking related unit", async () => {
    let stateInst = state(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, "test")
    );
    let related = stateInst.related().unwrap;
    expect(related.unit).to.equal("test");
  });
});
describe("State Number decimals", async () => {
  it("Checking related decimals", async () => {
    let stateInst = state(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, 2)
    );
    let related = stateInst.related().unwrap;
    expect(related.decimals).to.equal(2);
  });
  it("Checking limiter decimals step", async () => {
    let stateInst = state<number>(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, 1, 0.13)
    );
    expect((await stateInst).unwrap).to.equal(5);
    expect(stateInst.limit(11).unwrap).to.equal(11.1);
    expect(stateInst.limit(-11).unwrap).to.equal(-11.1);
    stateInst.write(11);
    expect((await stateInst).unwrap).to.equal(11.1);
    stateInst.write(-11);
    expect((await stateInst).unwrap).to.equal(-11.1);
  });
  it("Checking limiter decimals step start", async () => {
    let stateInst = state<number>(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, 3, 0.003, 0.07)
    );
    expect((await stateInst).unwrap).to.equal(5);
    expect(stateInst.limit(11).unwrap).to.equal(10.999);
    expect(stateInst.limit(-11).unwrap).to.equal(-11);
    stateInst.write(11);
    expect((await stateInst).unwrap).to.equal(10.999);
    stateInst.write(-11);
    expect((await stateInst).unwrap).to.equal(-11);
  });
});
describe("State Number step start", async () => {
  it("Checking limiter step", async () => {
    let stateInst = state<number>(
      Ok(5),
      true,
      new StateNumberHelper(undefined, undefined, undefined, undefined, 0.13)
    );
    expect((await stateInst).unwrap).to.equal(5);
    expect(stateInst.limit(11).unwrap).to.equal(11.05);
    expect(stateInst.limit(-11).unwrap).to.equal(-11.05);
    stateInst.write(11);
    expect((await stateInst).unwrap).to.equal(11.05);
    stateInst.write(-11);
    expect((await stateInst).unwrap).to.equal(-11.05);
  });
  it("Checking limiter step start", async () => {
    let stateInst = state<number>(
      Ok(5),
      true,
      new StateNumberHelper(
        undefined,
        undefined,
        undefined,
        undefined,
        0.13,
        0.02
      )
    );
    expect((await stateInst).unwrap).to.equal(5);
    expect(stateInst.limit(11).unwrap).to.equal(10.94);
    expect(stateInst.limit(-11).unwrap).to.equal(-11.03);
    stateInst.write(11);
    expect((await stateInst).unwrap).to.equal(10.94);
    stateInst.write(-11);
    expect((await stateInst).unwrap).to.equal(-11.03);
  });
});

describe("State String Max Len", async () => {
  it("Checking limiter max len", async () => {
    let stateInst = state<string>(Ok("5"), true, new StateStringHelper(10));
    expect((await stateInst).unwrap).to.equal("5");
    expect(stateInst.limit("12345678901").unwrap).to.equal("1234567890");
    stateInst.write("12345678901");
    expect((await stateInst).unwrap).to.equal("1234567890");
  });
  it("Checking checker max len", async () => {
    let stateInst = state<string>(Ok("5"), true, new StateStringHelper(10));
    expect((await stateInst).unwrap).to.equal("5");
    expect(stateInst.check("12345678901").unwrap).to.equal(
      "the text is longer than the limit of 10 characters"
    );
  });
  it("Checking related max len", async () => {
    let stateInst = state(Ok("5"), true, new StateStringHelper(10));
    let related = stateInst.related().unwrap;
    expect(related.maxLength).to.equal(10);
  });
});

describe("State String Max Byte Len", async () => {
  it("Checking limiter max byte len", async () => {
    let stateInst = state<string>(
      Ok("5"),
      true,
      new StateStringHelper(undefined, 10)
    );
    expect((await stateInst).unwrap).to.equal("5");
    expect(stateInst.limit("1æøåæ01").unwrap).to.equal("1æøåæ0");
    stateInst.write("1æøåæ01");
    expect((await stateInst).unwrap).to.equal("1æøåæ0");
  });
  it("Checking checker max byte len", async () => {
    let stateInst = state<string>(
      Ok("5"),
      true,
      new StateStringHelper(undefined, 10)
    );
    expect((await stateInst).unwrap).to.equal("5");
    expect(stateInst.check("1æøåæ01").unwrap).to.equal(
      "the text is longer than the limit of 10 bytes"
    );
  });
  it("Checking related max byte len", async () => {
    let stateInst = state(Ok("5"), true, new StateStringHelper(undefined, 10));
    let related = stateInst.related().unwrap;
    expect(related.maxLengthBytes).to.equal(10);
  });
});
