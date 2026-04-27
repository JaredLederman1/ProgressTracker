import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Book, Film, Mic, Plus, Youtube, type LucideIcon } from 'lucide-react';
import type { MediaEntry, MediaType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLongPress } from '@/hooks/useLongPress';
import { useTracker } from '@/hooks/useTracker';
import { cn } from '@/lib/utils';
import { AddMediaModal } from './AddMediaModal';

const TYPE_ICONS: Record<MediaType, LucideIcon> = {
  Book,
  Movie: Film,
  YouTube: Youtube,
  Podcast: Mic,
};

type Filter = 'All' | MediaType;
const FILTERS: Filter[] = ['All', 'Book', 'Movie', 'YouTube', 'Podcast'];

type Props = {
  tracker: ReturnType<typeof useTracker>;
};

export function MediaView({ tracker }: Props) {
  const { state, addMedia, deleteMedia } = tracker;
  const [filter, setFilter] = useState<Filter>('All');
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MediaEntry | null>(null);

  const sorted = useMemo(
    () => [...state.media].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state.media],
  );
  const filtered = useMemo(
    () => (filter === 'All' ? sorted : sorted.filter((m) => m.type === filter)),
    [sorted, filter],
  );
  const grouped = useMemo(() => {
    if (filter !== 'All') return null;
    const groups: { type: MediaType; entries: MediaEntry[] }[] = [];
    const order: MediaType[] = ['Book', 'Movie', 'YouTube', 'Podcast'];
    for (const t of order) {
      const entries = sorted.filter((m) => m.type === t);
      if (entries.length > 0) groups.push({ type: t, entries });
    }
    return groups;
  }, [sorted, filter]);

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <PillFilter value={filter} onChange={setFilter} />
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
          {filter === 'All' ? 'Nothing logged yet.' : `No ${filter.toLowerCase()}s yet.`}
        </p>
      ) : grouped ? (
        <div className="grid gap-6">
          {grouped.map((g) => (
            <div key={g.type}>
              <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {g.type}
              </h3>
              <ul className="grid gap-2">
                <AnimatePresence initial={false}>
                  {g.entries.map((m) => (
                    <MediaRow
                      key={m.id}
                      entry={m}
                      onLongPress={() => setPendingDelete(m)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="grid gap-2">
          <AnimatePresence initial={false}>
            {filtered.map((m) => (
              <MediaRow key={m.id} entry={m} onLongPress={() => setPendingDelete(m)} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <AddMediaModal open={adding} onOpenChange={setAdding} onAdd={addMedia} />

      <Dialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>
              {pendingDelete ? `"${pendingDelete.title}" will be removed.` : ''}
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
                if (pendingDelete) deleteMedia(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaRow({ entry, onLongPress }: { entry: MediaEntry; onLongPress: () => void }) {
  const Icon = TYPE_ICONS[entry.type];
  const press = useLongPress({ onLongPress });
  const ago = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      whileTap={{ scale: 0.98 }}
      className="glass flex select-none items-center gap-3 rounded-xl px-3 py-3"
      style={{ touchAction: 'manipulation' }}
      {...press}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/50 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{entry.title}</div>
        <div className="font-numeric text-[11px] uppercase tracking-wide text-muted-foreground">
          {entry.type} · {ago}
        </div>
      </div>
    </motion.li>
  );
}

function PillFilter({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map((f) => {
        const active = value === f;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            {f === 'All' ? 'All' : `${f}s`}
          </button>
        );
      })}
    </div>
  );
}
