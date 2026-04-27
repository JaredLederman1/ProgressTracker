import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreVertical, Plus } from 'lucide-react';
import type { Milestone } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  milestone: Milestone;
  onIncrement: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dense?: boolean;
};

export function MilestoneCard({ milestone, onIncrement, onEdit, onDelete, dense }: Props) {
  const [floaterId, setFloaterId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const counter = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    // Capture phase so this fires before any inner click handlers.
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menuOpen]);

  const complete = milestone.count >= milestone.target;
  const pct = Math.min(100, (milestone.count / Math.max(1, milestone.target)) * 100);

  const handleIncrement = () => {
    counter.current += 1;
    setFloaterId(counter.current);
    onIncrement();
    window.setTimeout(() => setFloaterId(null), 700);
  };

  if (dense) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{milestone.name}</div>
          <div className="font-numeric text-[11px] text-muted-foreground">
            {milestone.count} / {milestone.target}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={cn(
        'glass relative overflow-hidden rounded-2xl px-4 py-4',
        complete && 'ring-1 ring-primary/60 shadow-[0_0_24px_-4px_hsl(var(--primary)/0.45)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold leading-tight">{milestone.name}</div>
          {complete && (
            <span className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              Complete
            </span>
          )}
        </div>
        <div className="relative flex shrink-0 items-baseline gap-1.5">
          <motion.span
            key={milestone.count}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="font-numeric text-2xl font-semibold leading-none"
          >
            {milestone.count}
          </motion.span>
          <span className="font-numeric text-sm text-muted-foreground">/ {milestone.target}</span>
          <AnimatePresence>
            {floaterId !== null && (
              <motion.span
                key={floaterId}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -22, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="pointer-events-none absolute -top-1 right-0 font-numeric text-xs font-semibold text-primary"
              >
                +1
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button size="sm" variant="secondary" onClick={handleIncrement} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Log session
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="More options"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="glass absolute right-0 top-9 z-20 min-w-[120px] overflow-hidden rounded-lg p-1 text-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="block w-full rounded-md px-3 py-1.5 text-left hover:bg-secondary"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="block w-full rounded-md px-3 py-1.5 text-left text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
