// src/utils/encoder.ts
export type EncodingFormat = 'hex' | 'base64';

export interface PixelArtData {
  name: string;
  comment: string;
  width: 32;
  height: 32;
  palette: string[]; // 16色のHEXカラーコード
  encoding: EncodingFormat;
  data: string;
}

// デフォルトの16色パレット（PICO-8風）
export const DEFAULT_PALETTE: string[] = [
  '#000000', '#1D2B53', '#7E2553', '#008751',
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436',
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
];

/**
 * 1024要素のインデックス配列(0-15)を指定フォーマットの文字列にエンコード
 */
export function encodePixels(pixels: number[], format: EncodingFormat): string {
  if (pixels.length !== 1024) {
    throw new Error('Pixels array must have exactly 1024 elements (32x32).');
  }

  if (format === 'hex') {
    return pixels.map((p) => (p & 0x0f).toString(16)).join('');
  }

  // Base64: 2ピクセル(4bit x 2)を1バイトにパック (計512バイト)
  const bytes = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    const high = pixels[i * 2] & 0x0f;
    const low = pixels[i * 2 + 1] & 0x0f;
    bytes[i] = (high << 4) | low;
  }

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * エンコードされた文字列から1024要素のインデックス配列(0-15)にデコード
 */
export function decodePixels(data: string, format: EncodingFormat): number[] {
  if (format === 'hex') {
    if (data.length !== 1024) {
      throw new Error('Invalid hex data length.');
    }
    return data.split('').map((char) => parseInt(char, 16));
  }

  // Base64デコード
  const binary = atob(data);
  if (binary.length !== 512) {
    throw new Error('Invalid base64 binary length.');
  }

  const pixels: number[] = [];
  for (let i = 0; i < 512; i++) {
    const byte = binary.charCodeAt(i);
    pixels.push((byte >> 4) & 0x0f);
    pixels.push(byte & 0x0f);
  }
  return pixels;
}
