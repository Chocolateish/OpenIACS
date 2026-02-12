/**Returns the byte length of a string accounting for encoding*/
export const string_byte_length = (string: string) => {
  let s = string.length;
  if (s > 2048) return new TextEncoder().encode(string).length;
  else {
    for (let i = s - 1; i >= 0; i--) {
      const code = string.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) s++;
      else if (code > 0x7ff && code <= 0xffff) s += 2;
      if (code >= 0xdc00 && code <= 0xdfff) i--;
    }
    return s;
  }
};

/**Returns the byte length of a string accounting for encoding*/
export const string_byte_limit = (string: string, limit: number) => {
  const encoder = new TextEncoder().encode(string);
  string = new TextDecoder().decode(encoder.slice(0, limit));
  if (string.at(-1)?.charCodeAt(0) === 65533) return string.slice(0, -1);
  return string;
};
