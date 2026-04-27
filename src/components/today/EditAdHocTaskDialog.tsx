import { useEffect, useState } from 'react';
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

type Props = {
  task: AdHocTask | null;
  milestones: Milestone[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<AdHocTask>) => void;
  onDelete: () => void;
};

export function EditAdHocTaskDialog({ task, milestones, open, onOpenChange, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [milestoneId, setMilestoneId] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setMilestoneId(task.milestoneId ?? '');
    }
  }, [task]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), milestoneId: milestoneId || undefined });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update or remove this ad-hoc task.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="task-milestone">Milestone</Label>
            <Select
              id="task-milestone"
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
        </div>

        <DialogFooter className="mt-2 flex-row justify-between gap-2 sm:justify-between">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
