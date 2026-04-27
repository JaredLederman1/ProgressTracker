import { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, format, getDay, startOfDay, subDays } from 'date-fns';
import type { AppState, Habit } from '@/types';
import { formatKey } from '@/lib/dates';
import { isExpectedOn } from '@/lib/frequency';

const ROWS = 7;
const COLS = 53;

type Cell = {
  date: Date;
  expected: number;
  completed: number;
  ratio: number; // 0..1
  empty: boolean; // true when no habits were expected that day
  future: boolean;
};

type Props = {
  state: AppState;
  today: Date;
};

export function HeatmapView({ state, today }: Props) {
  const todayStart = useMemo(() => startOfDay(today), [today]);
  const activeHabits = useMemo(() => state.habits.filter((h) => h.active), [state.habits]);

  const grid = useMemo(() => buildGrid(activeHabits, state.entries, todayStart), [
    activeHabits,
    state.entries,
    todayStart,
  ]);

  const monthLabels = useMemo(() => buildMonthLabels(grid), [grid]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Default to showing the rightmost column (this week).
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, []);

  const [selected, setSelected] = useState<{ col: number; row: number; cell: Cell } | null>(null);

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Last year
        </h2>
        <Legend />
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="relative inline-block min-w-full">
          <div
            className="relative ml-6 h-3"
            style={{ width: COLS * 14 }}
            aria-hidden
          >
            {monthLabels.map((m) => (
              <span
                key={`${m.col}-${m.label}`}
                className="absolute top-0 text-[10px] uppercase tracking-wide text-muted-foreground"
                style={{ left: m.col * 14 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[2px]">
            <DayLabels />
            <div
              className="grid gap-[2px]"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 12px)`,
                gridTemplateRows: `repeat(${ROWS}, 12px)`,
                gridAutoFlow: 'column',
              }}
            >
              {grid.flatMap((col, colIdx) =>
                col.map((cell, rowIdx) => (
                  <CellSquare
                    key={`${colIdx}-${rowIdx}`}
                    cell={cell}
                    onClick={() =>
                      cell.future
                        ? setSelected(null)
                        : setSelected({ col: colIdx, row: rowIdx, cell })
                    }
                    selected={
                      !!selected && selected.col === colIdx && selected.row === rowIdx
                    }
                  />
                )),
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="glass mt-3 inline-flex items-center gap-3 rounded-lg px-3 py-2 text-xs"
          role="dialog"
        >
          <span className="font-medium">{format(selected.cell.date, 'MMM d')}</span>
          <span className="font-numeric text-muted-foreground">
            {selected.cell.empty
              ? 'nothing scheduled'
              : `${selected.cell.completed}/${selected.cell.expected} completed`}
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="ml-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function CellSquare({
  cell,
  onClick,
  selected,
}: {
  cell: Cell;
  onClick: () => void;
  selected: boolean;
}) {
  if (cell.future) {
    return <span aria-hidden style={{ width: 12, height: 12 }} />;
  }
  const style = cellStyle(cell, selected);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${format(cell.date, 'MMM d')}: ${
        cell.empty ? 'nothing scheduled' : `${cell.completed} of ${cell.expected}`
      }`}
      className="block rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={style}
    />
  );
}

function cellStyle(cell: Cell, selected: boolean): React.CSSProperties {
  const ringColor = selected ? '0 0 0 1.5px hsl(var(--primary))' : 'none';
  if (cell.empty) {
    return {
      width: 12,
      height: 12,
      backgroundColor: 'hsl(215 30% 22% / 0.55)',
      boxShadow: ringColor,
    };
  }
  if (cell.ratio === 0) {
    return {
      width: 12,
      height: 12,
      backgroundColor: 'transparent',
      border: '1px solid hsl(215 35% 18%)',
      boxShadow: ringColor,
    };
  }

  // Bucket the ratio into the four prescribed intensity tiers.
  let bg: string;
  let glow = '';
  if (cell.ratio <= 0.33) bg = '#1E3A8A'; // low
  else if (cell.ratio <= 0.66) bg = '#1D4ED8'; // mid
  else if (cell.ratio < 1) bg = '#3B82F6'; // bright
  else {
    bg = '#3B82F6'; // perfect day
    glow = '0 0 6px rgba(96, 165, 250, 0.65)';
  }
  const shadow = [glow, ringColor].filter(Boolean).join(', ') || 'none';
  return {
    width: 12,
    height: 12,
    backgroundColor: bg,
    boxShadow: shadow,
  };
}

function DayLabels() {
  // Only render Mon, Wed, Fri labels — the GitHub convention.
  const labels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  return (
    <div className="mr-1 flex flex-col gap-[2px]" aria-hidden>
      {labels.map((l, i) => (
        <span
          key={i}
          style={{ height: 12 }}
          className="flex items-center text-[9px] uppercase tracking-wide text-muted-foreground"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function Legend() {
  const tiers = [
    { label: '0', bg: 'transparent', border: '1px solid hsl(215 35% 18%)' },
    { label: '1', bg: '#1E3A8A' },
    { label: '2', bg: '#1D4ED8' },
    { label: '3', bg: '#3B82F6' },
  ];
  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <span>less</span>
      {tiers.map((t, i) => (
        <span
          key={i}
          className="rounded-[2px]"
          style={{
            width: 10,
            height: 10,
            backgroundColor: t.bg,
            border: t.border ?? 'none',
          }}
        />
      ))}
      <span>more</span>
    </div>
  );
}

function buildGrid(
  habits: Habit[],
  entries: Record<string, import('@/types').DayEntry>,
  today: Date,
): Cell[][] {
  // Right edge = today. Walk back COLS*ROWS - dayOfWeek(today) days to the
  // top-left so the rightmost column ends on today.
  const todayDow = getDay(today); // 0 = Sun ... 6 = Sat
  // The grid's bottom-right cell should be today (Sat-relative).
  // To achieve that, place today at (col=COLS-1, row=todayDow).
  // Top-left cell date = today - ((COLS-1)*7 + todayDow) days.
  const startDate = subDays(today, (COLS - 1) * 7 + todayDow);

  const grid: Cell[][] = [];
  for (let c = 0; c < COLS; c++) {
    const col: Cell[] = [];
    for (let r = 0; r < ROWS; r++) {
      const date = addDays(startDate, c * 7 + r);
      const future = date.getTime() > today.getTime();
      let expected = 0;
      let completed = 0;
      if (!future) {
        for (const h of habits) {
          if (isExpectedOn(h, date)) expected++;
        }
        const entry = entries[formatKey(date)];
        if (entry) {
          for (const id of entry.completedHabits) {
            const h = habits.find((x) => x.id === id);
            if (h && isExpectedOn(h, date)) completed++;
          }
        }
      }
      col.push({
        date,
        expected,
        completed,
        ratio: expected > 0 ? Math.min(1, completed / expected) : 0,
        empty: !future && expected === 0,
        future,
      });
    }
    grid.push(col);
  }
  return grid;
}

function buildMonthLabels(grid: Cell[][]): { col: number; label: string }[] {
  const out: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let c = 0; c < grid.length; c++) {
    const top = grid[c][0];
    if (top.future) continue;
    const m = top.date.getMonth();
    if (m !== lastMonth && top.date.getDate() <= 7) {
      out.push({ col: c, label: format(top.date, 'MMM') });
      lastMonth = m;
    }
  }
  return out;
}
