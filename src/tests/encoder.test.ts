import { describe, it, expect } from 'vitest';
import { encodePixels, decodePixels } from '../utils/encoder';

describe('encoder', () => {
  it('hex encode/decode roundtrip', () => {
    const pixels = Array(1024).fill(0);
    pixels[0] = 1;
    pixels[10] = 15;
    pixels[999] = 7;

    const encoded = encodePixels(pixels, 'hex');
    expect(encoded).toHaveLength(1024);

    const decoded = decodePixels(encoded, 'hex');
    expect(decoded).toEqual(pixels);
  });

  it('base64 encode/decode roundtrip', () => {
    const pixels = Array(1024).fill(0);
    pixels[0] = 2;
    pixels[1] = 9;
    pixels[512] = 15;

    const encoded = encodePixels(pixels, 'base64');
    const decoded = decodePixels(encoded, 'base64');
    expect(decoded).toEqual(pixels);
  });

  it('throws on invalid length', () => {
    expect(() => encodePixels(Array(10).fill(0), 'hex')).toThrow();
    expect(() => decodePixels('abc', 'hex')).toThrow();
  });
});
