import { useMemo, useRef, useState } from 'react';
import { Download, Plus, Upload } from 'lucide-react';
import type { Category, Habit, Milestone } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '@/lib/categories';
import { todayKey } from '@/lib/dates';
import { useLongPress } from '@/hooks/useLongPress';
import { useTracker } from '@/hooks/useTracker';
import { EditHabitDialog } from '@/components/today/EditHabitDialog';
import { EditMilestoneDialog } from '@/components/milestones/EditMilestoneDialog';
import { MilestoneCard } from '@/components/milestones/MilestoneCard';
import { ResetConfirmDialog } from './ResetConfirmDialog';

type Props = {
  tracker: ReturnType<typeof useTracker>;
};

export function SettingsView({ tracker }: Props) {
  const {
    state,
    addHabit,
    updateHabit,
    deleteHabit,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    exportState,
    importState,
    resetState,
  } = tracker;

  const [creatingHabit, setCreatingHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);

  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const habitsByCategory = useMemo(() => {
    const map = new Map<Category, Habit[]>();
    for (const c of ALL_CATEGORIES) map.set(c, []);
    for (const h of state.habits) map.get(h.category)!.push(h);
    return map;
  }, [state.habits]);

  const handleExport = () => {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported tracker data');
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      importState(text);
      // Read back parsed counts for the toast — importState already validated.
      const parsed = JSON.parse(text);
      const n = Array.isArray(parsed.habits) ? parsed.habits.length : 0;
      const m = parsed.entries ? Object.keys(parsed.entries).length : 0;
      toast.success(`Imported. ${n} habits, ${m} entries.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    }
  };

  const handleReset = () => {
    resetState();
    toast.success('Reset to defaults');
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-4">
      <Section title="Habits" actions={
        <Button size="sm" onClick={() => setCreatingHabit(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Habit
        </Button>
      }>
        <div className="grid gap-4">
          {ALL_CATEGORIES.map((cat) => {
            const habits = habitsByCategory.get(cat) ?? [];
            if (habits.length === 0) return null;
            return (
              <div key={cat}>
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {cat}
                </div>
                <ul className="grid gap-1.5">
                  {habits.map((h) => (
                    <HabitListRow
                      key={h.id}
                      habit={h}
                      onTap={() => setEditingHabit(h)}
                      onLongPress={() => setPendingDelete(h)}
                      onToggleActive={(active) => updateHabit(h.id, { active })}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        title="Milestones"
        actions={
          <Button size="sm" onClick={() => setCreatingMilestone(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        }
      >
        <div className="grid gap-1.5">
          {state.milestones.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">
              No milestones yet.
            </p>
          ) : (
            state.milestones.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                dense
                onIncrement={() => undefined}
                onEdit={() => setEditingMilestone(m)}
                onDelete={() => deleteMilestone(m.id)}
              />
            ))
          )}
        </div>
      </Section>

      <Section title="Data">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button variant="destructive" size="sm" onClick={() => setResetOpen(true)}>
            Reset
          </Button>
        </div>
      </Section>

      <Section title="About">
        <p className="font-numeric text-xs text-muted-foreground">Tracker · v0.1 · localStorage</p>
      </Section>

      <EditHabitDialog
        habit={null}
        milestones={state.milestones}
        open={creatingHabit}
        onOpenChange={setCreatingHabit}
        onSave={(values) => addHabit({ ...values, active: true })}
      />
      <EditHabitDialog
        habit={editingHabit}
        milestones={state.milestones}
        open={!!editingHabit}
        onOpenChange={(o) => !o && setEditingHabit(null)}
        onSave={(values) => editingHabit && updateHabit(editingHabit.id, values)}
        onDelete={() => editingHabit && deleteHabit(editingHabit.id)}
      />

      <EditMilestoneDialog
        milestone={null}
        open={creatingMilestone}
        onOpenChange={setCreatingMilestone}
        onSave={(values) => addMilestone(values)}
      />
      <EditMilestoneDialog
        milestone={editingMilestone}
        open={!!editingMilestone}
        onOpenChange={(o) => !o && setEditingMilestone(null)}
        onSave={(values) => editingMilestone && updateMilestone(editingMilestone.id, values)}
        onDelete={() => editingMilestone && deleteMilestone(editingMilestone.id)}
      />

      <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete habit?</DialogTitle>
            <DialogDescription>
              {pendingDelete ? `"${pendingDelete.name}" will be removed permanently.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (pendingDelete) deleteHabit(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResetConfirmDialog open={resetOpen} onOpenChange={setResetOpen} onConfirm={handleReset} />
    </div>
  );
}

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function HabitListRow({
  habit,
  onTap,
  onLongPress,
  onToggleActive,
}: {
  habit: Habit;
  onTap: () => void;
  onLongPress: () => void;
  onToggleActive: (active: boolean) => void;
}) {
  const accent = CATEGORY_COLORS[habit.category];
  const press = useLongPress({ onLongPress, onTap });
  return (
    <li
      className={`relative flex select-none items-center gap-3 rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 ${
        habit.active ? '' : 'opacity-60'
      }`}
      style={{ touchAction: 'manipulation' }}
      {...press}
    >
      <span
        aria-hidden
        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
        style={{ backgroundColor: accent }}
      />
      <div className="ml-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{habit.name}</span>
          {!habit.active && (
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
              Archived
            </span>
          )}
        </div>
        <div className="font-numeric text-[11px] uppercase tracking-wide text-muted-foreground">
          {habit.frequency} · {habit.timeOfDay}
        </div>
      </div>
      <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={habit.active}
          onCheckedChange={onToggleActive}
          aria-label={habit.active ? 'Deactivate habit' : 'Activate habit'}
        />
      </div>
    </li>
  );
}
