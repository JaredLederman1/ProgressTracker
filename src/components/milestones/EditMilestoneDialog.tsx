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
import type { Milestone } from '@/types';

export type MilestoneFormValues = {
  name: string;
  target: number;
};

type Props = {
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: MilestoneFormValues) => void;
  onDelete?: () => void;
};

export function EditMilestoneDialog({ milestone, open, onOpenChange, onSave, onDelete }: Props) {
  const isCreate = milestone === null;
  const [name, setName] = useState('');
  const [target, setTarget] = useState('100');

  useEffect(() => {
    if (!open) return;
    if (milestone) {
      setName(milestone.name);
      setTarget(String(milestone.target));
    } else {
      setName('');
      setTarget('100');
    }
  }, [milestone, open]);

  const targetNum = Math.max(1, Math.floor(Number(target) || 0));
  const valid = name.trim().length > 0 && targetNum > 0;

  const handleSave = () => {
    if (!valid) return;
    onSave({ name: name.trim(), target: targetNum });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? 'New milestone' : 'Edit milestone'}</DialogTitle>
          <DialogDescription>
            {isCreate ? 'Set a target you want to chip away at.' : 'Update or remove this milestone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="milestone-name">Name</Label>
            <Input
              id="milestone-name"
              value={name}
              placeholder="e.g. 100 boxing sessions"
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="milestone-target">Target</Label>
            <Input
              id="milestone-target"
              type="number"
              inputMode="numeric"
              min={1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-2 flex-row justify-between gap-2 sm:justify-between">
          {!isCreate && onDelete ? (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!valid}>
              {isCreate ? 'Create' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
