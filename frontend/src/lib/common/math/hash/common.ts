const hexChars = "0123456789ABCDEF";

/**
 * Storage class for MD5 result */
export class Hash {
  private result: Uint8Array;
  private hexbuffer?: string;

  constructor(hash: Uint8Array) {
    this.result = hash;
  }

  //Returns the MD5 hash as an array of numbers
  get numberArray() {
    return [...this.result];
  }

  //Returns the MD5 hash as an array of numbers
  get uint8Array() {
    return new Uint8Array(this.result);
  }

  //Returns the MD5 hash as hex string with big letters
  get hexBig() {
    if (!this.hexbuffer) {
      this.calculateHex();
    }
    return this.hexbuffer;
  }
  //Returns the MD5 hash as hex string with small letters
  get hexSmall() {
    if (!this.hexbuffer) {
      this.calculateHex();
    }
    return this.hexbuffer?.toLowerCase();
  }
  //Calculates the hexadecimal string of the hash
  private calculateHex() {
    this.hexbuffer = "";
    for (let i = 0; i < this.result.length; i++) {
      this.hexbuffer +=
        hexChars.charAt((this.result[i] >>> 4) & 15) +
        hexChars.charAt(15 & this.result[i]);
    }
  }
}
