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
import type { Category, Frequency, Habit, Milestone, TimeOfDay } from '@/types';
import { ALL_CATEGORIES } from '@/lib/categories';

const FREQUENCIES: Frequency[] = ['Daily', 'Weekday', '6x/week', 'Weekly', 'Monthly'];
const TIMES: TimeOfDay[] = ['Morning', 'Midday', 'Evening', 'Anytime'];

type Props = {
  habit: Habit | null;
  milestones: Milestone[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<Habit>) => void;
  onDelete: () => void;
};

export function EditHabitDialog({ habit, milestones, open, onOpenChange, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Body');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('Anytime');
  const [milestoneId, setMilestoneId] = useState<string>('');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
      setFrequency(habit.frequency);
      setTimeOfDay(habit.timeOfDay);
      setMilestoneId(habit.milestoneId ?? '');
    }
  }, [habit]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      frequency,
      timeOfDay,
      milestoneId: milestoneId || undefined,
    });
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
          <DialogTitle>Edit habit</DialogTitle>
          <DialogDescription>Tweak the details, save, or delete.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="habit-category">Category</Label>
              <Select
                id="habit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="habit-frequency">Frequency</Label>
              <Select
                id="habit-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="habit-time">Time of day</Label>
              <Select
                id="habit-time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="habit-milestone">Milestone</Label>
              <Select
                id="habit-milestone"
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
