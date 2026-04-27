import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AdHocTask, Habit, TimeOfDay } from '@/types';
import { todayKey } from '@/lib/dates';
import { isExpectedOn } from '@/lib/frequency';
import { useTracker } from '@/hooks/useTracker';
import { useNow } from '@/hooks/useNow';
import { Switch } from '@/components/ui/switch';
import { HabitRow } from './HabitRow';
import { AdHocTaskRow } from './AdHocTaskRow';
import { EditHabitDialog } from './EditHabitDialog';
import { EditAdHocTaskDialog } from './EditAdHocTaskDialog';
import { PlanTomorrowCTA } from './PlanTomorrowCTA';
import { PlanTomorrowModal } from './PlanTomorrowModal';

const TIME_ORDER: TimeOfDay[] = ['Morning', 'Midday', 'Evening', 'Anytime'];
const PLAN_HOUR_GATE = 20; // 8 PM local

type Props = {
  tracker: ReturnType<typeof useTracker>;
};

export function TodayView({ tracker }: Props) {
  const {
    state,
    toggleHabit,
    toggleAdHocTask,
    updateHabit,
    deleteHabit,
    updateAdHocTask,
    deleteAdHocTask,
    addAdHocTask,
  } = tracker;

  const now = useNow();
  const today = todayKey();
  const todayDate = useMemo(() => new Date(), []);

  const [showAll, setShowAll] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingTask, setEditingTask] = useState<AdHocTask | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const completedToday = state.entries[today]?.completedHabits ?? [];

  const milestonesById = useMemo(() => {
    const map = new Map(state.milestones.map((m) => [m.id, m]));
    return map;
  }, [state.milestones]);

  const todayTasks = useMemo(
    () => state.adHocTasks.filter((t) => t.forDate === today),
    [state.adHocTasks, today],
  );

  const expectedHabits = useMemo(
    () => state.habits.filter((h) => h.active && isExpectedOn(h, todayDate)),
    [state.habits, todayDate],
  );

  const otherActiveHabits = useMemo(
    () => state.habits.filter((h) => h.active && !isExpectedOn(h, todayDate)),
    [state.habits, todayDate],
  );

  const groupedExpected = useMemo(
    () => groupByTime(expectedHabits),
    [expectedHabits],
  );
  const groupedOther = useMemo(() => groupByTime(otherActiveHabits), [otherActiveHabits]);

  const hasUncheckedAdHoc = todayTasks.some((t) => !t.completed);
  const showCTA = now.getHours() >= PLAN_HOUR_GATE || hasUncheckedAdHoc;

  return (
    <>
      <div className="mx-auto max-w-md px-4 pb-32 pt-4">
        {todayTasks.length > 0 && (
          <section className="mb-6">
            <SectionLabel>Today</SectionLabel>
            <motion.ul layout className="grid gap-2">
              <AnimatePresence initial={false}>
                {todayTasks.map((t) => (
                  <AdHocTaskRow
                    key={t.id}
                    task={t}
                    milestone={t.milestoneId ? milestonesById.get(t.milestoneId) : undefined}
                    onToggle={() => toggleAdHocTask(t.id)}
                    onLongPress={() => setEditingTask(t)}
                  />
                ))}
              </AnimatePresence>
            </motion.ul>
          </section>
        )}

        {TIME_ORDER.map((time) => {
          const expected = groupedExpected[time] ?? [];
          const other = showAll ? groupedOther[time] ?? [] : [];
          if (expected.length === 0 && other.length === 0) return null;
          return (
            <section key={time} className="mb-6">
              <SectionLabel>{time}</SectionLabel>
              <motion.ul layout className="grid gap-2">
                <AnimatePresence initial={false}>
                  {expected.map((h) => (
                    <HabitRow
                      key={h.id}
                      habit={h}
                      checked={completedToday.includes(h.id)}
                      milestone={h.milestoneId ? milestonesById.get(h.milestoneId) : undefined}
                      onToggle={() => toggleHabit(h.id, today)}
                      onLongPress={() => setEditingHabit(h)}
                    />
                  ))}
                  {other.map((h) => (
                    <HabitRow
                      key={h.id}
                      habit={h}
                      checked={completedToday.includes(h.id)}
                      dimmed
                      notExpected
                      milestone={h.milestoneId ? milestonesById.get(h.milestoneId) : undefined}
                      onToggle={() => toggleHabit(h.id, today)}
                      onLongPress={() => setEditingHabit(h)}
                    />
                  ))}
                </AnimatePresence>
              </motion.ul>
            </section>
          );
        })}

        <div className="glass mt-8 flex items-center justify-between rounded-xl px-4 py-3">
          <div>
            <div className="text-sm font-medium">Show all habits</div>
            <div className="font-numeric text-[11px] uppercase tracking-wide text-muted-foreground">
              Reveal habits not expected today
            </div>
          </div>
          <Switch checked={showAll} onCheckedChange={setShowAll} />
        </div>
      </div>

      <AnimatePresence>{showCTA && <PlanTomorrowCTA onClick={() => setPlanOpen(true)} />}</AnimatePresence>

      <PlanTomorrowModal
        open={planOpen}
        onOpenChange={setPlanOpen}
        adHocTasks={state.adHocTasks}
        milestones={state.milestones}
        onAdd={addAdHocTask}
        onUpdate={updateAdHocTask}
        onDelete={deleteAdHocTask}
      />

      <EditHabitDialog
        habit={editingHabit}
        milestones={state.milestones}
        open={!!editingHabit}
        onOpenChange={(o) => !o && setEditingHabit(null)}
        onSave={(patch) => editingHabit && updateHabit(editingHabit.id, patch)}
        onDelete={() => editingHabit && deleteHabit(editingHabit.id)}
      />

      <EditAdHocTaskDialog
        task={editingTask}
        milestones={state.milestones}
        open={!!editingTask}
        onOpenChange={(o) => !o && setEditingTask(null)}
        onSave={(patch) => editingTask && updateAdHocTask(editingTask.id, patch)}
        onDelete={() => editingTask && deleteAdHocTask(editingTask.id)}
      />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h2>
  );
}

function groupByTime(habits: Habit[]): Record<TimeOfDay, Habit[]> {
  const groups: Record<TimeOfDay, Habit[]> = {
    Morning: [],
    Midday: [],
    Evening: [],
    Anytime: [],
  };
  for (const h of habits) {
    groups[h.timeOfDay].push(h);
  }
  return groups;
}
