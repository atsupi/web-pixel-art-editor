// src/App.tsx
import React, { useState, useRef } from 'react';
import {
  DEFAULT_PALETTE,
  type EncodingFormat,
  type PixelArtData,
  encodePixels,
  decodePixels,
} from './utils/encoder';

export function App() {
  const [pixels, setPixels] = useState<number[]>(() => Array(1024).fill(0));
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [selectedColor, setSelectedColor] = useState<number>(8); // 初期選択: 赤
  const [name, setName] = useState<string>('untitled_sprite');
  const [comment, setComment] = useState<string>('');
  const [encoding, setEncoding] = useState<EncodingFormat>('hex');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paintPixel = (index: number) => {
    setPixels((prev) => {
      if (prev[index] === selectedColor) return prev;
      const next = [...prev];
      next[index] = selectedColor;
      return next;
    });
  };

  const handlePaletteColorChange = (index: number, newHex: string) => {
    setPalette((prev) => {
      const next = [...prev];
      next[index] = newHex.toUpperCase();
      return next;
    });
  };

  const handleExportJson = () => {
    const payload: PixelArtData = {
      name: name.trim() || 'untitled',
      comment,
      width: 32,
      height: 32,
      palette,
      encoding,
      data: encodePixels(pixels, encoding),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as PixelArtData;
        if (parsed.width !== 32 || parsed.height !== 32 || !Array.isArray(parsed.palette)) {
          throw new Error('Invalid format');
        }
        const decodedPixels = decodePixels(parsed.data, parsed.encoding);
        setName(parsed.name || '');
        setComment(parsed.comment || '');
        setPalette(parsed.palette);
        setEncoding(parsed.encoding);
        setPixels(decodedPixels);
      } catch (err) {
        alert('JSONファイルの読み込みに失敗しました。フォーマットを確認してください。');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 同じファイルを再選択可能にする
  };

  return (
    <div
      style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '20px auto', padding: '0 16px' }}
      onMouseUp={() => setIsDrawing(false)}
    >
      <h1>32x32 Pixel Art Editor</h1>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* 32x32 キャンバス */}
        <div
          role="grid"
          aria-label="Pixel Canvas"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(32, 14px)',
            gridTemplateRows: 'repeat(32, 14px)',
            border: '2px solid #333',
            userSelect: 'none',
            cursor: 'crosshair',
          }}
        >
          {pixels.map((colorIdx, idx) => (
            <div
              key={idx}
              data-testid={`pixel-${idx}`}
              onMouseDown={() => {
                setIsDrawing(true);
                paintPixel(idx);
              }}
              onMouseEnter={() => {
                if (isDrawing) paintPixel(idx);
              }}
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: palette[colorIdx],
                boxSizing: 'border-box',
                border: '0.5px solid rgba(128,128,128,0.15)',
              }}
            />
          ))}
        </div>

        {/* コントロールパネル */}
        <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 16色パレット */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              16-Color Palette (Index: {selectedColor})
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
              {palette.map((hex, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    type="button"
                    aria-label={`Select color ${idx}`}
                    onClick={() => setSelectedColor(idx)}
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: hex,
                      border: selectedColor === idx ? '3px solid #000' : '1px solid #ccc',
                      outline: selectedColor === idx ? '2px solid #fff' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => handlePaletteColorChange(idx, e.target.value)}
                    style={{ width: '28px', height: '14px', padding: 0, border: 'none', marginTop: '2px' }}
                    title={`Edit color ${idx}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* メタデータ入力 */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Comment</label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>

          {/* エンコード形式選択 */}
          <div>
            <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Pixel Encoding</span>
            <label style={{ marginRight: '16px' }}>
              <input
                type="radio"
                name="encoding"
                value="hex"
                checked={encoding === 'hex'}
                onChange={() => setEncoding('hex')}
              />
              Hex (1024 chars)
            </label>
            <label>
              <input
                type="radio"
                name="encoding"
                value="base64"
                checked={encoding === 'base64'}
                onChange={() => setEncoding('base64')}
              />
              Base64 (684 chars)
            </label>
          </div>

          {/* アクションボタン */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleExportJson} style={{ padding: '8px 16px', fontWeight: 'bold' }}>
              Export JSON
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px' }}>
              Import JSON
            </button>
            <button
              type="button"
              onClick={() => setPixels(Array(1024).fill(0))}
              style={{ padding: '8px 16px', marginLeft: 'auto' }}
            >
              Clear
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;