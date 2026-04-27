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
import type { MediaType } from '@/types';

const TYPES: MediaType[] = ['Book', 'Movie', 'YouTube', 'Podcast', 'Article'];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: { title: string; type: MediaType }) => void;
  defaultType?: MediaType;
};

export function AddMediaModal({ open, onOpenChange, onAdd, defaultType = 'Book' }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaType>(defaultType);

  useEffect(() => {
    if (open) {
      setTitle('');
      setType(defaultType);
    }
  }, [open, defaultType]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add media</DialogTitle>
          <DialogDescription>Log something you finished or want to remember.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="media-title">Title</Label>
            <Input
              id="media-title"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="media-type">Type</Label>
            <Select id="media-type" value={type} onChange={(e) => setType(e.target.value as MediaType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={!title.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
