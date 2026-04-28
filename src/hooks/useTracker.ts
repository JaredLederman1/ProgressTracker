import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AdHocTask,
  AppState,
  Habit,
  MediaEntry,
  Milestone,
} from '@/types';
import {
  defaultState,
  exportJSON,
  importJSON,
  loadState,
  saveState,
} from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const LOCAL_UPDATED_AT_KEY = 'tracker.v1.updatedAt';

type HabitInput = Omit<Habit, 'id' | 'createdAt' | 'active'> & { active?: boolean };
type AdHocTaskInput = Omit<AdHocTask, 'id' | 'createdAt' | 'completed'> & {
  completed?: boolean;
};
type MilestoneInput = Omit<Milestone, 'id' | 'createdAt' | 'count'> & {
  count?: number;
};
type MediaInput = Omit<MediaEntry, 'id' | 'createdAt'>;

const SAVE_DEBOUNCE_MS = 200;

function nowIso() {
  return new Date().toISOString();
}

export function useTracker(userId: string | null) {
  const [state, setState] = useState<AppState>(() => loadState());
  const saveTimer = useRef<number | null>(null);
  // Snapshot of the most recent state we've successfully pushed (or pulled
  // from remote). Used to skip no-op pushes — e.g. when remote-pull replaces
  // local state, the resulting state-change effect would otherwise push the
  // same data right back.
  const lastSyncedSnapshot = useRef<string | null>(null);
  // True once we've reconciled local vs remote on sign-in. Until then we
  // skip pushes to avoid clobbering remote with stale local data.
  const [synced, setSynced] = useState(false);

  // Pull on sign-in: compare remote updated_at to local updatedAt; newer wins.
  useEffect(() => {
    if (!userId) {
      setSynced(false);
      lastSyncedSnapshot.current = null;
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('app_state')
        .select('state, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error('Supabase pull failed', error);
        setSynced(true); // allow pushes even on failure so edits aren't lost
        return;
      }

      const localUpdatedAt = localStorage.getItem(LOCAL_UPDATED_AT_KEY) ?? '';
      const remoteUpdatedAt = data?.updated_at ?? '';

      if (data && remoteUpdatedAt > localUpdatedAt) {
        const remoteState = data.state as AppState;
        setState(remoteState);
        localStorage.setItem(LOCAL_UPDATED_AT_KEY, remoteUpdatedAt);
        lastSyncedSnapshot.current = JSON.stringify(remoteState);
      }
      setSynced(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      saveState(state);
      const snapshot = JSON.stringify(state);
      if (userId && synced && snapshot !== lastSyncedSnapshot.current) {
        const updatedAt = nowIso();
        localStorage.setItem(LOCAL_UPDATED_AT_KEY, updatedAt);
        supabase
          .from('app_state')
          .upsert({ user_id: userId, state, updated_at: updatedAt })
          .then(({ error }) => {
            if (error) console.error('Supabase push failed', error);
            else lastSyncedSnapshot.current = snapshot;
          });
      }
      saveTimer.current = null;
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [state, userId, synced]);

  // Flush pending save before unload so a quick close doesn't lose the last edit.
  useEffect(() => {
    const flush = () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
        saveState(state);
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [state]);

  // ----- Habits -----
  const addHabit = useCallback((input: HabitInput): Habit => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      active: input.active ?? true,
      ...input,
    };
    setState((s) => ({ ...s, habits: [...s.habits, habit] }));
    return habit;
  }, []);

  const updateHabit = useCallback((id: string, patch: Partial<Habit>) => {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch, id: h.id } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
  }, []);

  // ----- Milestones -----
  const addMilestone = useCallback((input: MilestoneInput): Milestone => {
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      count: input.count ?? 0,
      name: input.name,
      target: input.target,
    };
    setState((s) => ({ ...s, milestones: [...s.milestones, milestone] }));
    return milestone;
  }, []);

  const updateMilestone = useCallback((id: string, patch: Partial<Milestone>) => {
    setState((s) => ({
      ...s,
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, ...patch, id: m.id } : m,
      ),
    }));
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setState((s) => ({ ...s, milestones: s.milestones.filter((m) => m.id !== id) }));
  }, []);

  const incrementMilestone = useCallback((id: string, by = 1) => {
    setState((s) => ({
      ...s,
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, count: m.count + by } : m,
      ),
    }));
  }, []);

  // ----- Day entries / habit toggling -----
  const toggleHabit = useCallback((habitId: string, dateKey: string) => {
    setState((s) => {
      const existing = s.entries[dateKey] ?? { date: dateKey, completedHabits: [] };
      const isChecked = existing.completedHabits.includes(habitId);
      const completedHabits = isChecked
        ? existing.completedHabits.filter((id) => id !== habitId)
        : [...existing.completedHabits, habitId];

      const nextEntries = {
        ...s.entries,
        [dateKey]: { date: dateKey, completedHabits },
      };

      // Keep the linked milestone in sync with actual completions:
      // check → +1, uncheck → -1 (clamped at 0).
      let nextMilestones = s.milestones;
      const habit = s.habits.find((h) => h.id === habitId);
      if (habit?.milestoneId) {
        const mId = habit.milestoneId;
        const delta = isChecked ? -1 : 1;
        nextMilestones = s.milestones.map((m) =>
          m.id === mId ? { ...m, count: Math.max(0, m.count + delta) } : m,
        );
      }

      return { ...s, entries: nextEntries, milestones: nextMilestones };
    });
  }, []);

  // ----- Ad-hoc tasks -----
  const addAdHocTask = useCallback((input: AdHocTaskInput): AdHocTask => {
    const task: AdHocTask = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      completed: input.completed ?? false,
      name: input.name,
      forDate: input.forDate,
      milestoneId: input.milestoneId,
    };
    setState((s) => ({ ...s, adHocTasks: [...s.adHocTasks, task] }));
    return task;
  }, []);

  const updateAdHocTask = useCallback((id: string, patch: Partial<AdHocTask>) => {
    setState((s) => ({
      ...s,
      adHocTasks: s.adHocTasks.map((t) =>
        t.id === id ? { ...t, ...patch, id: t.id } : t,
      ),
    }));
  }, []);

  const deleteAdHocTask = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      adHocTasks: s.adHocTasks.filter((t) => t.id !== id),
    }));
  }, []);

  const toggleAdHocTask = useCallback((id: string) => {
    setState((s) => {
      const task = s.adHocTasks.find((t) => t.id === id);
      if (!task) return s;
      const nextCompleted = !task.completed;
      const nextTasks = s.adHocTasks.map((t) =>
        t.id === id ? { ...t, completed: nextCompleted } : t,
      );

      let nextMilestones = s.milestones;
      if (task.milestoneId) {
        const mId = task.milestoneId;
        const delta = nextCompleted ? 1 : -1;
        nextMilestones = s.milestones.map((m) =>
          m.id === mId ? { ...m, count: Math.max(0, m.count + delta) } : m,
        );
      }

      return { ...s, adHocTasks: nextTasks, milestones: nextMilestones };
    });
  }, []);

  // ----- Media -----
  const addMedia = useCallback((input: MediaInput): MediaEntry => {
    const entry: MediaEntry = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      ...input,
    };
    setState((s) => ({ ...s, media: [...s.media, entry] }));
    return entry;
  }, []);

  const deleteMedia = useCallback((id: string) => {
    setState((s) => ({ ...s, media: s.media.filter((m) => m.id !== id) }));
  }, []);

  // ----- Bulk -----
  const exportState = useCallback(() => exportJSON(state), [state]);

  const importState = useCallback((json: string) => {
    const next = importJSON(json);
    setState(next);
  }, []);

  const resetState = useCallback(() => {
    setState(defaultState());
  }, []);

  return {
    state,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    addAdHocTask,
    updateAdHocTask,
    deleteAdHocTask,
    toggleAdHocTask,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    incrementMilestone,
    addMedia,
    deleteMedia,
    exportState,
    importState,
    resetState,
  };
}
