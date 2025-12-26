import { Hash } from "./common";

/** Calculates SHA-1 hash of string and returns hex
 * @param msg */
export function sha1(msg: string) {
  const w = new Array<number>(80);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  let a: number;
  let b: number;
  let c: number;
  let d: number;
  let e: number;
  msg = utf8_encode(msg);
  const msg_len = msg.length;
  const word_array = [];
  for (let i = 0; i < msg_len - 3; i += 4) {
    const j =
      (msg.charCodeAt(i) << 24) |
      (msg.charCodeAt(i + 1) << 16) |
      (msg.charCodeAt(i + 2) << 8) |
      msg.charCodeAt(i + 3);
    word_array.push(j);
  }
  switch (msg_len % 4) {
    case 0:
      word_array.push(0x080000000);
      break;
    case 1:
      word_array.push((msg.charCodeAt(msg_len - 1) << 24) | 0x0800000);
      break;
    case 2:
      word_array.push(
        (msg.charCodeAt(msg_len - 2) << 24) |
          (msg.charCodeAt(msg_len - 1) << 16) |
          0x08000
      );
      break;
    case 3:
      word_array.push(
        (msg.charCodeAt(msg_len - 3) << 24) |
          (msg.charCodeAt(msg_len - 2) << 16) |
          (msg.charCodeAt(msg_len - 1) << 8) |
          0x80
      );
      break;
  }
  while (word_array.length % 16 != 14) {
    word_array.push(0);
  }
  word_array.push(msg_len >>> 29);
  word_array.push((msg_len << 3) & 0x0ffffffff);
  for (let blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    for (let i = 0; i < 16; i++) {
      w[i] = word_array[blockstart + i];
    }
    for (let i = 16; i <= 79; i++) {
      w[i] = rotate_left(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }
    a = h0;
    b = h1;
    c = h2;
    d = h3;
    e = h4;
    for (let i = 0; i <= 19; i++) {
      const temp =
        (rotate_left(a, 5) + ((b & c) | (~b & d)) + e + w[i] + 0x5a827999) &
        0x0ffffffff;
      e = d;
      d = c;
      c = rotate_left(b, 30);
      b = a;
      a = temp;
    }
    for (let i = 20; i <= 39; i++) {
      const temp =
        (rotate_left(a, 5) + (b ^ c ^ d) + e + w[i] + 0x6ed9eba1) & 0x0ffffffff;
      e = d;
      d = c;
      c = rotate_left(b, 30);
      b = a;
      a = temp;
    }
    for (let i = 40; i <= 59; i++) {
      const temp =
        (rotate_left(a, 5) +
          ((b & c) | (b & d) | (c & d)) +
          e +
          w[i] +
          0x8f1bbcdc) &
        0x0ffffffff;
      e = d;
      d = c;
      c = rotate_left(b, 30);
      b = a;
      a = temp;
    }
    for (let i = 60; i <= 79; i++) {
      const temp =
        (rotate_left(a, 5) + (b ^ c ^ d) + e + w[i] + 0xca62c1d6) & 0x0ffffffff;
      e = d;
      d = c;
      c = rotate_left(b, 30);
      b = a;
      a = temp;
    }
    h0 = (h0 + a) & 0x0ffffffff;
    h1 = (h1 + b) & 0x0ffffffff;
    h2 = (h2 + c) & 0x0ffffffff;
    h3 = (h3 + d) & 0x0ffffffff;
    h4 = (h4 + e) & 0x0ffffffff;
  }
  const hashes = [h0, h1, h2, h3, h4];
  const numbers = new Uint8Array(20);
  for (let i = 0; i < hashes.length; i++) {
    numbers[i * 4] = (hashes[i] >>> 24) & 255;
    numbers[i * 4 + 1] = (hashes[i] >>> 16) & 255;
    numbers[i * 4 + 2] = (hashes[i] >>> 8) & 255;
    numbers[i * 4 + 3] = (hashes[i] >>> 0) & 255;
  }
  return new Hash(numbers);
}

function rotate_left(n: number, s: number) {
  const t4 = (n << s) | (n >>> (32 - s));
  return t4;
}

function utf8_encode(string: string) {
  string = string.replace(/\r\n/g, "\n");
  let utftext = "";
  for (let n = 0; n < string.length; n++) {
    const c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}
