// src/hooks/usePixelHistory.ts
import { useState, useCallback } from 'react';

export interface HistoryState {
  past: number[][];
  present: number[];
  future: number[][];
}

export interface UsePixelHistoryOptions {
  maxHistory?: number;
}

/**
 * 2つのピクセル配列が完全に同一か判定する
 */
export function arePixelsEqual(a: number[], b: number[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * 32x32 ピクセル盤面の Undo / Redo 履歴を管理するカスタムフック
 */
export function usePixelHistory(
  initialPixels: number[],
  options: UsePixelHistoryOptions = {}
) {
  const { maxHistory = 50 } = options;

  const [history, setHistory] = useState<HistoryState>(() => ({
    past: [],
    present: [...initialPixels],
    future: [],
  }));

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  /**
   * 新しい盤面を履歴に確定（コミット）する
   * 現在の盤面と変化がない場合は履歴を積まない
   */
  const commit = useCallback(
    (nextPixels: number[]) => {
      setHistory((prev) => {
        if (arePixelsEqual(prev.present, nextPixels)) {
          return prev;
        }

        const nextPast = [...prev.past, prev.present];
        if (nextPast.length > maxHistory) {
          nextPast.splice(0, nextPast.length - maxHistory);
        }

        return {
          past: nextPast,
          present: [...nextPixels],
          future: [],
        };
      });
    },
    [maxHistory]
  );

  /**
   * 1つ前の状態に戻す (Undo)
   */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const nextPast = prev.past.slice(0, -1);

      return {
        past: nextPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  /**
   * 取り消した操作をやり直す (Redo)
   */
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const [next, ...nextFuture] = prev.future;

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: nextFuture,
      };
    });
  }, []);

  /**
   * 履歴スタックを初期化して新しい盤面をセットする
   */
  const reset = useCallback((newInitialPixels: number[]) => {
    setHistory({
      past: [],
      present: [...newInitialPixels],
      future: [],
    });
  }, []);

  return {
    pixels: history.present,
    canUndo,
    canRedo,
    commit,
    undo,
    redo,
    reset,
    historyCounts: {
      past: history.past.length,
      future: history.future.length,
    },
  };
}
