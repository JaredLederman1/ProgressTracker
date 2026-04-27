import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import type { Milestone } from '@/types';
import { Button } from '@/components/ui/button';
import { useTracker } from '@/hooks/useTracker';
import { MilestoneCard } from './MilestoneCard';
import { EditMilestoneDialog } from './EditMilestoneDialog';

type Props = {
  tracker: ReturnType<typeof useTracker>;
};

export function MilestonesView({ tracker }: Props) {
  const { state, addMilestone, updateMilestone, deleteMilestone, incrementMilestone } = tracker;
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Milestones
        </h2>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Milestone
        </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence initial={false}>
          {state.milestones.map((m) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              onIncrement={() => incrementMilestone(m.id, 1)}
              onEdit={() => setEditing(m)}
              onDelete={() => deleteMilestone(m.id)}
            />
          ))}
        </AnimatePresence>
        {state.milestones.length === 0 && (
          <p className="rounded-lg border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
            No milestones yet. Add one to start counting.
          </p>
        )}
      </div>

      <EditMilestoneDialog
        milestone={null}
        open={creating}
        onOpenChange={setCreating}
        onSave={(values) => addMilestone(values)}
      />
      <EditMilestoneDialog
        milestone={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={(values) => editing && updateMilestone(editing.id, values)}
        onDelete={() => editing && deleteMilestone(editing.id)}
      />
    </div>
  );
}
