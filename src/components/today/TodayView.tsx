import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AdHocTask, Habit } from '@/types';
import { todayKey } from '@/lib/dates';
import { isExpectedOn } from '@/lib/frequency';
import {
  DAILY_SCHEDULE,
  findHabitByName,
  type ScheduleBlock,
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

  const hasUncheckedAdHoc = todayTasks.some((t) => !t.completed);
  const showCTA = now.getHours() >= PLAN_HOUR_GATE || hasUncheckedAdHoc;

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
              // Deleted or archived scheduled habits drop out of Today
              // entirely — no placeholder, no crossed-out row.
              if (!habit || !habit.active) return null;
              const expected = isExpectedOn(habit, todayDate);
              if (!expected && !showAll) return null;
              const displayName = item.displayLabel ? item.displayLabel(todayDate) : undefined;
              return (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  checked={completedToday.includes(habit.id)}
                  dimmed={!expected}
                  notExpected={!expected}
                  displayName={displayName}
                  milestone={habit.milestoneId ? milestonesById.get(habit.milestoneId) : undefined}
                  onToggle={() => toggleHabit(habit.id, today)}
                  onLongPress={() => setEditingHabit(habit)}
                />
              );
            }}
          />
        ))}

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
  renderHabit: (item: Extract<ScheduleBlock['items'][number], { kind: 'habit' }>) => React.ReactNode;
}) {
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

function ReminderRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 px-1 py-1.5 pl-3 text-[14px] leading-relaxed text-muted-foreground/80 opacity-60">
      <span className="select-none text-muted-foreground" aria-hidden>
        ·
      </span>
      <span>{text}</span>
    </li>
  );
}

