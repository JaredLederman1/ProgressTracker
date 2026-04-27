import { useMemo } from 'react';
import type { AppState, Category } from '@/types';
import { ALL_CATEGORIES } from '@/lib/categories';
import { HeatmapView } from './HeatmapView';
import { StreakCard } from './StreakCard';

type Props = {
  state: AppState;
};

export function StatsView({ state }: Props) {
  const today = useMemo(() => new Date(), []);
  const activeHabits = useMemo(() => state.habits.filter((h) => h.active), [state.habits]);

  const byCategory = useMemo(() => {
    const map = new Map<Category, typeof activeHabits>();
    for (const c of ALL_CATEGORIES) map.set(c, []);
    for (const h of activeHabits) {
      map.get(h.category)!.push(h);
    }
    return map;
  }, [activeHabits]);

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-4">
      <section className="mb-8">
        <HeatmapView state={state} today={today} />
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Per habit
        </h2>
        <div className="grid gap-4">
          {ALL_CATEGORIES.map((cat) => {
            const habits = byCategory.get(cat) ?? [];
            if (habits.length === 0) return null;
            return (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {cat}
                </div>
                <div className="grid gap-2">
                  {habits.map((h) => (
                    <StreakCard key={h.id} habit={h} entries={state.entries} today={today} />
                  ))}
                </div>
              </div>
            );
          })}
          {activeHabits.length === 0 && (
            <p className="text-sm text-muted-foreground">No active habits yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
