import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AdHocTask, Habit, TimeOfDay } from '@/types';
import { todayKey } from '@/lib/dates';
import { isExpectedOn } from '@/lib/frequency';
import {
  DAILY_SCHEDULE,
  SCHEDULED_HABIT_NAMES,
  findHabitByName,
  type ScheduleBlock,
  type ScheduleItem,
} from '@/lib/schedule';
import { useTracker } from '@/hooks/useTracker';
import { useNow } from '@/hooks/useNow';
import { Switch } from '@/components/ui/switch';
import { HabitRow } from './HabitRow';
import { AdHocTaskRow } from './AdHocTaskRow';
import { EditHabitDialog } from './EditHabitDialog';
import { EditAdHocTaskDialog } from './EditAdHocTaskDialog';
import { PlanTomorrowCTA } from './PlanTomorrowCTA';
import { PlanTomorrowModal } from './PlanTomorrowModal';

const PLAN_HOUR_GATE = 20; // 8 PM local
const TIME_GROUP_ORDER: TimeOfDay[] = ['Morning', 'Midday', 'Evening', 'Anytime'];

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

  const milestonesById = useMemo(
    () => new Map(state.milestones.map((m) => [m.id, m])),
    [state.milestones],
  );

  const todayTasks = useMemo(
    () => state.adHocTasks.filter((t) => t.forDate === today),
    [state.adHocTasks, today],
  );

  // Habits NOT in the daily schedule template — these go in the OTHER block.
  // When showAll is on, scheduled habits that aren't expected today also
  // collect here (dimmed) per the spec: "regardless of which schedule block
  // they'd otherwise belong to."
  const otherHabits = useMemo(() => {
    const out: { habit: Habit; expected: boolean }[] = [];
    for (const h of state.habits) {
      if (!h.active) continue;
      const isInSchedule = SCHEDULED_HABIT_NAMES.has(h.name);
      const expected = isExpectedOn(h, todayDate);
      if (isInSchedule) {
        if (!expected && showAll) out.push({ habit: h, expected: false });
      } else {
        if (expected) out.push({ habit: h, expected: true });
        else if (showAll) out.push({ habit: h, expected: false });
      }
    }
    return out;
  }, [state.habits, todayDate, showAll]);

  const otherByTime = useMemo(() => groupByTime(otherHabits), [otherHabits]);

  const hasUncheckedAdHoc = todayTasks.some((t) => !t.completed);
  const showCTA = now.getHours() >= PLAN_HOUR_GATE || hasUncheckedAdHoc;

  const renderHabitRow = (habit: Habit, opts?: { dimmed?: boolean; notExpected?: boolean }) => (
    <HabitRow
      key={habit.id}
      habit={habit}
      checked={completedToday.includes(habit.id)}
      dimmed={opts?.dimmed}
      notExpected={opts?.notExpected}
      milestone={habit.milestoneId ? milestonesById.get(habit.milestoneId) : undefined}
      onToggle={() => toggleHabit(habit.id, today)}
      onLongPress={() => setEditingHabit(habit)}
    />
  );

  return (
    <>
      <div className="mx-auto max-w-md px-4 pb-32 pt-4">
        <Hero />

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

        {DAILY_SCHEDULE.map((block) => (
          <ScheduleBlockSection
            key={block.id}
            block={block}
            renderHabit={(item) => {
              const habit = findHabitByName(state.habits, item.habitName);
              if (!habit || !habit.active) {
                return <NotConfiguredRow key={item.id} name={item.habitName} />;
              }
              if (!isExpectedOn(habit, todayDate)) {
                return null; // Hidden by default; surfaces in OTHER when showAll is on.
              }
              return renderHabitRow(habit);
            }}
          />
        ))}

        {otherHabits.length > 0 && (
          <section className="mt-6">
            <BlockHeader>Other</BlockHeader>
            <div className="grid gap-4">
              {TIME_GROUP_ORDER.map((time) => {
                const list = otherByTime[time];
                if (list.length === 0) return null;
                return (
                  <div key={time}>
                    {time !== 'Anytime' && <SubLabel>{time}</SubLabel>}
                    <motion.ul layout className="grid gap-2">
                      <AnimatePresence initial={false}>
                        {list.map(({ habit, expected }) =>
                          renderHabitRow(habit, {
                            dimmed: !expected,
                            notExpected: !expected,
                          }),
                        )}
                      </AnimatePresence>
                    </motion.ul>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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

function Hero() {
  return (
    <div className="mb-5">
      <p className="font-numeric text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Target sleep: 11pm – 7am
      </p>
    </div>
  );
}

function ScheduleBlockSection({
  block,
  renderHabit,
}: {
  block: ScheduleBlock;
  renderHabit: (item: Extract<ScheduleItem, { kind: 'habit' }>) => React.ReactNode;
}) {
  // Walk the items in declared order, rendering each (or nothing if a habit
  // is hidden). If everything in the block resolves to nothing, hide the
  // block header too — rare in practice (only happens if every habit in a
  // block is non-expected and the block has no reminders).
  const rendered: React.ReactNode[] = [];
  for (const item of block.items) {
    if (item.kind === 'reminder') {
      rendered.push(<ReminderRow key={item.id} text={item.text} />);
    } else {
      const node = renderHabit(item);
      if (node) rendered.push(node);
    }
  }
  if (rendered.length === 0) return null;

  return (
    <section className="mt-6 first:mt-0">
      <BlockHeader>{block.label}</BlockHeader>
      <motion.ul layout className="grid gap-2">
        <AnimatePresence initial={false}>{rendered}</AnimatePresence>
      </motion.ul>
    </section>
  );
}

function BlockHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-white/5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h2>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
      {children}
    </h3>
  );
}

function ReminderRow({ text }: { text: string }) {
  return (
    <li
      className="flex items-start gap-2 px-1 py-1.5 pl-3 text-[14px] leading-relaxed text-muted-foreground/80 opacity-60"
      aria-hidden="false"
    >
      <span className="select-none text-muted-foreground" aria-hidden>
        ·
      </span>
      <span>{text}</span>
    </li>
  );
}

function NotConfiguredRow({ name }: { name: string }) {
  return (
    <li className="flex items-start gap-2 px-1 py-1.5 pl-3 text-[14px] leading-relaxed text-muted-foreground/70">
      <span className="select-none text-muted-foreground" aria-hidden>
        ·
      </span>
      <span className="line-through">
        {name} <span className="not-italic">(not configured)</span>
      </span>
    </li>
  );
}

function groupByTime(
  items: { habit: Habit; expected: boolean }[],
): Record<TimeOfDay, { habit: Habit; expected: boolean }[]> {
  const groups: Record<TimeOfDay, { habit: Habit; expected: boolean }[]> = {
    Morning: [],
    Midday: [],
    Evening: [],
    Anytime: [],
  };
  for (const item of items) {
    groups[item.habit.timeOfDay].push(item);
  }
  return groups;
}
