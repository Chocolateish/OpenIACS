import { Hash } from "./common";

/** Calculates SHA-1 hash of string and returns hex
 * @param msg */
export function sha1(msg: string) {
  let W = new Array<number>(80);
  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;
  let A: number;
  let B: number;
  let C: number;
  let D: number;
  let E: number;
  msg = Utf8Encode(msg);
  let msg_len = msg.length;
  let word_array = new Array();
  for (let i = 0; i < msg_len - 3; i += 4) {
    let j =
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
      W[i] = word_array[blockstart + i];
    }
    for (let i = 16; i <= 79; i++) {
      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
    }
    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;
    for (let i = 0; i <= 19; i++) {
      let temp =
        (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5a827999) &
        0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    for (let i = 20; i <= 39; i++) {
      let temp =
        (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ed9eba1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    for (let i = 40; i <= 59; i++) {
      let temp =
        (rotate_left(A, 5) +
          ((B & C) | (B & D) | (C & D)) +
          E +
          W[i] +
          0x8f1bbcdc) &
        0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    for (let i = 60; i <= 79; i++) {
      let temp =
        (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xca62c1d6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }
  let d = Array(H0, H1, H2, H3, H4);
  let numbers = new Uint8Array(20);
  for (let i = 0; i < d.length; i++) {
    numbers[i * 4] = (d[i] >>> 24) & 255;
    numbers[i * 4 + 1] = (d[i] >>> 16) & 255;
    numbers[i * 4 + 2] = (d[i] >>> 8) & 255;
    numbers[i * 4 + 3] = (d[i] >>> 0) & 255;
  }
  return new Hash(numbers);
}

function rotate_left(n: number, s: number) {
  var t4 = (n << s) | (n >>> (32 - s));
  return t4;
}

function Utf8Encode(string: string) {
  string = string.replace(/\r\n/g, "\n");
  var utftext = "";
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
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
