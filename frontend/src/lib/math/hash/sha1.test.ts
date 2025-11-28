import { describe, expect, it } from "vitest";
import { sha1 } from "./sha1";

describe("SHA1", function () {
  it("abc", function () {
    expect(sha1("abc").hex_small).toStrictEqual(
      "a9993e364706816aba3e25717850c26c9cd0d89d"
    );
  });
  it("", function () {
    expect(sha1("").hex_small).toStrictEqual(
      "da39a3ee5e6b4b0d3255bfef95601890afd80709"
    );
  });
  it("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", function () {
    expect(
      sha1("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq").hex_small
    ).toStrictEqual("84983e441c3bd26ebaae4aa1f95129e5e54670f1");
  });
  it("abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu", function () {
    expect(
      sha1(
        "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu"
      ).hex_small
    ).toStrictEqual("a49b2446a02c645bf419f995b67091253a04a259");
  });
  it("1 million a", function () {
    let text = "".padEnd(1000000, "a");
    expect(sha1(text).hex_small).toStrictEqual(
      "34aa973cd4c4daa4f61eeb2bdbad27316534016f"
    );
  });

  it("Return array of numbers", function () {
    expect(
      sha1("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")
        .number_array
    ).toEqual([
      132, 152, 62, 68, 28, 59, 210, 110, 186, 174, 74, 161, 249, 81, 41, 229,
      229, 70, 112, 241,
    ]);
  });
  it("Return uint8 array", function () {
    expect(
      sha1("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")
        .uint8_array
    ).toEqual(
      new Uint8Array([
        132, 152, 62, 68, 28, 59, 210, 110, 186, 174, 74, 161, 249, 81, 41, 229,
        229, 70, 112, 241,
      ])
    );
  });
  it("Return small letter hexadecimal", function () {
    expect(
      sha1("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq").hex_small
    ).toStrictEqual("84983e441c3bd26ebaae4aa1f95129e5e54670f1");
  });
  it("Return big letter hexadecimal", function () {
    expect(
      sha1("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq").hex_big
    ).toStrictEqual("84983E441C3BD26EBAAE4AA1F95129E5E54670F1");
  });
});
