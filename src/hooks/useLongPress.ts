import { useCallback, useRef } from 'react';

type Options = {
  onLongPress: () => void;
  onTap?: () => void;
  delayMs?: number;
  moveTolerancePx?: number;
};

type Handlers = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
};

export function useLongPress({
  onLongPress,
  onTap,
  delayMs = 500,
  moveTolerancePx = 8,
}: Options): Handlers {
  const timer = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const triggered = useRef(false);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      triggered.current = false;
      startPos.current = { x: e.clientX, y: e.clientY };
      clear();
      timer.current = window.setTimeout(() => {
        triggered.current = true;
        onLongPress();
      }, delayMs);
    },
    [clear, delayMs, onLongPress],
  );

  const onPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      const wasLongPress = triggered.current;
      clear();
      startPos.current = null;
      if (!wasLongPress && onTap) {
        onTap();
      }
    },
    [clear, onTap],
  );

  const onPointerLeave = useCallback(() => {
    clear();
    startPos.current = null;
  }, [clear]);

  const onPointerCancel = useCallback(() => {
    clear();
    startPos.current = null;
  }, [clear]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startPos.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (Math.hypot(dx, dy) > moveTolerancePx) {
        clear();
      }
    },
    [clear, moveTolerancePx],
  );

  // Suppress the native context menu so long-press on touch doesn't double-fire.
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (triggered.current) e.preventDefault();
  }, []);

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onPointerMove,
    onContextMenu,
  };
}
