const LLMV_EOF = 0xFF;
const LLMV_START = 1;
const LLMV_END = 2;
const LLMV_FIELD = 3;

export interface CRegion {
  kind: string,
  addr: number,
  size: number,
  fields: CField[],
}

export interface CField {
  addr: number,
  size: number,
  name: string,
}

export class Parser {
  cur: number;
  buf: Uint8Array;

  constructor(buf: Uint8Array) {
    this.cur = 0;
    this.buf = buf;
  }

  parse(): CRegion[] {
    const cRegions: CRegion[] = [];
  parse:
    while (this.assertInBounds()) {
      switch (this.peekByte()) {
        case LLMV_EOF:
          break parse;
        case LLMV_START: {
          this.consumeByte(LLMV_START);
          const cRegion: CRegion = {
            kind: this.consumeString(),
            addr: this.consume64(),
            size: this.consume64(),
            fields: [],
          };

        fields:
          while (this.assertInBounds()) {
            switch (this.peekByte()) {
              case LLMV_FIELD: {
                this.consumeByte(LLMV_FIELD);
                const field: CField = {
                  addr: this.consume64(),
                  size: this.consume64(),
                  name: this.consumeString(),
                };
                cRegion.fields.push(field);
              } break;
              case LLMV_END:
                this.consumeByte(LLMV_END);
                break fields;
              default:
                throw new Error(`Unexpected LLMV flag ${this.peekByte()} in region`);
            }
          }

          cRegions.push(cRegion);
        } break;
        default:
          throw new Error(`Unexpected LLMV flag ${this.peekByte()}`);
      }
    }
    return cRegions;
  }

  peekByte(): number {
    return this.buf[this.cur];
  }

  consumeByte(b: number) {
    if (b !== undefined && this.peekByte() !== b) {
      throw new Error(`expected ${b} but got ${this.peekByte()}`);
    }
    this.cur += 1;
  }

  consumeString(): string {
    let s = "";
    while (this.buf[this.cur] !== 0) {
      s += String.fromCharCode(this.buf[this.cur]);
      this.cur += 1;
    }
    this.cur += 1; // advance past null terminator
    return s;
  }

  consume64(): number {
    this.checkRemaining(8);

    const result =
      (this.buf[this.cur + 7] << 56) |
      (this.buf[this.cur + 6] << 48) |
      (this.buf[this.cur + 5] << 40) |
      (this.buf[this.cur + 4] << 32) |
      (this.buf[this.cur + 3] << 24) |
      (this.buf[this.cur + 2] << 16) |
      (this.buf[this.cur + 1] << 8) |
      (this.buf[this.cur + 0] << 0);
    this.cur += 8;

    return result;
  }

  checkRemaining(n: number) {
    if (this.buf.length - this.cur < n) {
      throw new Error(`fewer than ${n} bytes remaining in buffer`);
    }
  }

  assertInBounds(): true {
    if (this.cur >= this.buf.length) {
      throw new Error("ran out of buffer");
    }
    return true;
  }
}