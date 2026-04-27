import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Habit, Milestone } from '@/types';
import { CATEGORY_COLORS } from '@/lib/categories';
import { useLongPress } from '@/hooks/useLongPress';
import { cn } from '@/lib/utils';

type Props = {
  habit: Habit;
  checked: boolean;
  dimmed?: boolean;
  notExpected?: boolean;
  // Optional display label override — used by the schedule's rotating Lift
  // split. Falls back to habit.name when absent.
  displayName?: string;
  milestone?: Milestone;
  onToggle: () => void;
  onLongPress: () => void;
};

const CHECKED_BG = 'rgba(59, 130, 246, 0.18)'; // electric blue flash

function vibrate(ms: number) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // ignore
    }
  }
}

export function HabitRow({
  habit,
  checked,
  dimmed,
  notExpected,
  displayName,
  milestone,
  onToggle,
  onLongPress,
}: Props) {
  const [flash, setFlash] = useState(false);

  const handleToggle = () => {
    const willCheck = !checked;
    if (willCheck) {
      setFlash(true);
      vibrate(10);
      window.setTimeout(() => setFlash(false), 320);
    }
    onToggle();
  };

  const press = useLongPress({ onLongPress, onTap: handleToggle });

  const accent = CATEGORY_COLORS[habit.category];
  const subline = milestone ? `${habit.frequency} · ${milestone.name}` : habit.frequency;

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className={cn(
        'glass relative flex select-none items-center overflow-hidden rounded-xl pr-2',
        dimmed && 'opacity-50',
      )}
      style={{ touchAction: 'manipulation' }}
      {...press}
    >
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: accent }}
      />

      <AnimatePresence>
        {flash && (
          <motion.span
            key="flash"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: CHECKED_BG }}
          />
        )}
      </AnimatePresence>

      <div className="relative flex min-w-0 flex-1 items-center gap-3 pl-4 pr-2 py-3">
        <div className="min-w-0 flex-1">
          <motion.div
            layout="position"
            className={cn(
              'truncate text-[15px] font-medium leading-snug transition-colors',
              checked && 'text-muted-foreground',
            )}
          >
            <span className="relative inline-block">
              {displayName ?? habit.name}
              <motion.span
                aria-hidden
                initial={false}
                animate={{ scaleX: checked ? 1 : 0 }}
                style={{ originX: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-current"
              />
            </span>
          </motion.div>
          <div className="mt-0.5 truncate font-numeric text-[11px] uppercase tracking-wide text-muted-foreground">
            {notExpected ? 'not expected today' : subline}
          </div>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center">
          <Checkbox checked={checked} accent={accent} />
        </div>
      </div>
    </motion.div>
  );
}

function Checkbox({ checked, accent }: { checked: boolean; accent: string }) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: checked ? 1 : 0.96,
        backgroundColor: checked ? accent : 'rgba(255,255,255,0)',
        borderColor: checked ? accent : 'rgba(148, 163, 184, 0.45)',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className="grid h-6 w-6 place-items-center rounded-md border-2"
    >
      <motion.span
        initial={false}
        animate={{ scale: checked ? 1 : 0.4, opacity: checked ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 600, damping: 22 }}
        className="text-white"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </motion.span>
    </motion.div>
  );
}
