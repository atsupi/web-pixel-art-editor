// src/test/usePixelHistory.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePixelHistory, arePixelsEqual } from '../hook/usePixelHistory';

// テスト用の1024要素配列ヘルパー
const createBoard = (fillValue = 0): number[] => Array(1024).fill(fillValue);

describe('usePixelHistory', () => {
  it('initializes with initial pixels and empty history', () => {
    const initial = createBoard(0);
    const { result } = renderHook(() => usePixelHistory(initial));

    expect(result.current.pixels).toEqual(initial);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('commits changes and supports undo / redo transitions', () => {
    const { result } = renderHook(() => usePixelHistory(createBoard(0)));

    const step1 = createBoard(0);
    step1[0] = 8; // 1ピクセル目を赤に変更

    const step2 = [...step1];
    step2[1] = 11; // 2ピクセル目を緑に変更

    act(() => {
      result.current.commit(step1);
    });
    expect(result.current.pixels[0]).toBe(8);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.commit(step2);
    });
    expect(result.current.pixels[1]).toBe(11);
    expect(result.current.historyCounts.past).toBe(2);

    // 1回目の Undo -> step1 に戻る
    act(() => {
      result.current.undo();
    });
    expect(result.current.pixels).toEqual(step1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    // 2回目の Undo -> 初期状態に戻る
    act(() => {
      result.current.undo();
    });
    expect(result.current.pixels).toEqual(createBoard(0));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    // Redo -> step1 に進む
    act(() => {
      result.current.redo();
    });
    expect(result.current.pixels).toEqual(step1);
  });

  it('clears future stack when a new change is committed after undo', () => {
    const { result } = renderHook(() => usePixelHistory(createBoard(0)));

    const step1 = createBoard(1);
    const step2 = createBoard(2);
    const branchStep = createBoard(3);

    act(() => result.current.commit(step1));
    act(() => result.current.commit(step2));
    act(() => result.current.undo());

    expect(result.current.canRedo).toBe(true);

    // Undo後に新しい操作をコミットすると Redo 履歴が消えること
    act(() => result.current.commit(branchStep));
    expect(result.current.pixels).toEqual(branchStep);
    expect(result.current.canRedo).toBe(false);
  });

  it('does not push history if committed pixels are identical to present', () => {
    const initial = createBoard(0);
    const { result } = renderHook(() => usePixelHistory(initial));

    act(() => {
      result.current.commit(createBoard(0));
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.historyCounts.past).toBe(0);
  });

  it('enforces maxHistory limit by dropping oldest entries', () => {
    const { result } = renderHook(() =>
      usePixelHistory(createBoard(0), { maxHistory: 3 })
    );

    // 4回コミット（上限3件なので最初の初期盤面が押し出される）
    for (let i = 1; i <= 4; i++) {
      act(() => {
        result.current.commit(createBoard(i));
      });
    }

    expect(result.current.historyCounts.past).toBe(3);

    // 3回 Undo すると、押し出された 0 ではなく 1 で止まる
    act(() => result.current.undo());
    act(() => result.current.undo());
    act(() => result.current.undo());

    expect(result.current.pixels[0]).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });

  it('resets history stack cleanly', () => {
    const { result } = renderHook(() => usePixelHistory(createBoard(0)));

    act(() => result.current.commit(createBoard(5)));
    expect(result.current.canUndo).toBe(true);

    const freshBoard = createBoard(9);
    act(() => result.current.reset(freshBoard));

    expect(result.current.pixels).toEqual(freshBoard);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});

describe('arePixelsEqual', () => {
  it('returns true for identical arrays and false when any pixel differs', () => {
    const a = createBoard(0);
    const b = createBoard(0);
    expect(arePixelsEqual(a, b)).toBe(true);

    b[512] = 15;
    expect(arePixelsEqual(a, b)).toBe(false);
  });
});
