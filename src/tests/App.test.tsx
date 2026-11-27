// src/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { DEFAULT_PALETTE } from '../utils/encoder';

describe('Pixel Art Editor UI', () => {
  it('renders a 32x32 grid (1024 pixels)', () => {
    render(<App />);
    expect(screen.getByTestId('pixel-0')).toBeInTheDocument();
    expect(screen.getByTestId('pixel-1023')).toBeInTheDocument();
  });

  it('paints a pixel with the selected palette color', () => {
    render(<App />);
    const colorBtn = screen.getByRole('button', { name: 'Select color 11' });
    fireEvent.click(colorBtn);

    const targetPixel = screen.getByTestId('pixel-10');
    fireEvent.mouseDown(targetPixel);
    fireEvent.mouseUp(window);

    expect(targetPixel).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[11] });
  });

  it('treats a multi-pixel drag stroke as a single Undo/Redo step', () => {
    render(<App />);
    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    const redoBtn = screen.getByRole('button', { name: 'Redo' });

    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();

    // 3ピクセルを1ストロークでドラッグ描画 (pixel-0 -> pixel-1 -> pixel-2)
    const p0 = screen.getByTestId('pixel-0');
    const p1 = screen.getByTestId('pixel-1');
    const p2 = screen.getByTestId('pixel-2');

    fireEvent.mouseDown(p0);
    fireEvent.mouseEnter(p1);
    fireEvent.mouseEnter(p2);
    fireEvent.mouseUp(window);

    // 3マスとも選択色(Index 8: #FF004D)になっていること
    expect(p0).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
    expect(p1).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
    expect(p2).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
    expect(undoBtn).toBeEnabled();

    // 1回の Undo で3マスすべて初期色(Index 0: #000000)に戻ること
    fireEvent.click(undoBtn);
    expect(p0).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[0] });
    expect(p1).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[0] });
    expect(p2).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[0] });
    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeEnabled();

    // 1回の Redo で3マスすべて復元されること
    fireEvent.click(redoBtn);
    expect(p0).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
    expect(p1).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
    expect(p2).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
  });

  it('allows undoing Clear action', () => {
    render(<App />);
    const p5 = screen.getByTestId('pixel-5');

    fireEvent.mouseDown(p5);
    fireEvent.mouseUp(window);
    expect(p5).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });

    // Clear 実行
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(p5).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[0] });

    // Undo で Clear 前の描画が復元されること
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(p5).toHaveStyle({ backgroundColor: DEFAULT_PALETTE[8] });
  });
});
