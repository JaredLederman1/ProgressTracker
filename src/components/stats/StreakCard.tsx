import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import type { DayEntry, Habit } from '@/types';
import { CATEGORY_COLORS } from '@/lib/categories';
import {
  completionRate,
  currentStreak,
  longestStreak,
  recentOccurrences,
} from '@/lib/streaks';

type Props = {
  habit: Habit;
  entries: Record<string, DayEntry>;
  today: Date;
};

export function StreakCard({ habit, entries, today }: Props) {
  const [open, setOpen] = useState(false);
  const accent = CATEGORY_COLORS[habit.category];

  const cur = currentStreak(habit, entries, today);
  const longest = longestStreak(habit, entries, today);
  const rate = completionRate(habit, entries, today, 30);
  const ratePct = Math.round(rate * 100);

  return (
    <motion.div
      layout
      className="glass relative overflow-hidden rounded-xl"
    >
      <span
        aria-hidden
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: accent }}
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium leading-snug">{habit.name}</div>
          <div className="mt-0.5 flex items-baseline gap-3 font-numeric text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>{habit.frequency}</span>
            <span>longest {longest}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-numeric text-2xl font-semibold leading-none">{cur}</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            day streak
          </span>
        </div>
      </button>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>30-occurrence rate</span>
          <span className="font-numeric">{ratePct}%</span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${ratePct}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="overflow-hidden"
          >
            <Dots habit={habit} entries={entries} today={today} accent={accent} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Dots({
  habit,
  entries,
  today,
  accent,
}: {
  habit: Habit;
  entries: Record<string, DayEntry>;
  today: Date;
  accent: string;
}) {
  const occ = recentOccurrences(habit, entries, today, 30).reverse();
  return (
    <div className="border-t border-border/50 px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Last 30 occurrences</span>
        <span className="font-numeric">
          {occ[0] ? format(occ[0].date, 'MMM d') : ''}
          {occ.length > 1 ? ' – ' : ''}
          {occ.length > 1 ? format(occ[occ.length - 1].date, 'MMM d') : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {occ.map((o, i) => (
          <span
            key={i}
            title={`${format(o.date, 'MMM d')} · ${o.completed ? 'done' : 'missed'}`}
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: o.completed ? accent : 'transparent',
              border: o.completed ? 'none' : '1px solid hsl(215 35% 28%)',
            }}
          />
        ))}
        {occ.length === 0 && (
          <span className="font-numeric text-[11px] text-muted-foreground">no data yet</span>
        )}
      </div>
    </div>
  );
}
