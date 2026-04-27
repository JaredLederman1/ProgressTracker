import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { AdHocTask, Milestone } from '@/types';
import { todayKey, tomorrowKey } from '@/lib/dates';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adHocTasks: AdHocTask[];
  milestones: Milestone[];
  onAdd: (input: { name: string; forDate: string; milestoneId?: string }) => void;
  onUpdate: (id: string, patch: Partial<AdHocTask>) => void;
  onDelete: (id: string) => void;
};

export function PlanTomorrowModal({
  open,
  onOpenChange,
  adHocTasks,
  milestones,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [name, setName] = useState('');
  const [milestoneId, setMilestoneId] = useState('');

  const today = todayKey();
  const tomorrow = tomorrowKey();

  const carryCandidates = useMemo(
    () => adHocTasks.filter((t) => t.forDate === today && !t.completed),
    [adHocTasks, today],
  );
  const tomorrowTasks = useMemo(
    () => adHocTasks.filter((t) => t.forDate === tomorrow),
    [adHocTasks, tomorrow],
  );

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, forDate: tomorrow, milestoneId: milestoneId || undefined });
    setName('');
    setMilestoneId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plan Tomorrow</DialogTitle>
          <DialogDescription>Triage today's leftovers and seed tomorrow.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-6 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {carryCandidates.length > 0 && (
              <motion.section
                key="carry"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="overflow-hidden"
              >
                <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Carry from today
                </h3>
                <ul className="grid gap-2">
                  <AnimatePresence initial={false}>
                    {carryCandidates.map((t) => (
                      <motion.li
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="glass flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onUpdate(t.id, { forDate: tomorrow })}
                          >
                            Keep
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onDelete(t.id)}>
                            Delete
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.section>
            )}
          </AnimatePresence>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Add for tomorrow
            </h3>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="plan-task-name">Task</Label>
                <Input
                  id="plan-task-name"
                  value={name}
                  placeholder="e.g. Pick up dry cleaning"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submit();
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="plan-task-milestone">Link to milestone</Label>
                  <Select
                    id="plan-task-milestone"
                    value={milestoneId}
                    onChange={(e) => setMilestoneId(e.target.value)}
                  >
                    <option value="">None</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={submit} disabled={!name.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {tomorrowTasks.length > 0 && (
              <ul className="mt-4 grid gap-2">
                <AnimatePresence initial={false}>
                  {tomorrowTasks.map((t) => (
                    <motion.li
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${t.name}`}
                        onClick={() => onDelete(t.id)}
                        className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
