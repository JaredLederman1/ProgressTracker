import type { AppState, Category, Frequency, Habit, TimeOfDay } from '@/types';
import { buildSeedHabits, buildSeedMedia } from './seed';

export const STORAGE_KEY = 'tracker.v1';

export function defaultState(): AppState {
  return {
    version: 1,
    habits: buildSeedHabits(),
    adHocTasks: [],
    milestones: [],
    media: buildSeedMedia(),
    entries: {},
  };
}

function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AppState>;
  return (
    v.version === 1 &&
    Array.isArray(v.habits) &&
    Array.isArray(v.adHocTasks) &&
    Array.isArray(v.milestones) &&
    Array.isArray(v.media) &&
    !!v.entries &&
    typeof v.entries === 'object'
  );
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!isValidState(parsed)) return defaultState();

    // One-time backfill: users who installed before media seeding existed
    // have an empty media array. Populate it on next load so they get the
    // Notion library without losing streaks/entries via Reset. Remove this
    // block when bumping to v2 (any v2 migration will run before this).
    if (parsed.version === 1 && parsed.media.length === 0) {
      parsed.media = buildSeedMedia();
    }

    // One-time cleanup: drop the Tinted SPF / Tongue scraper habits that
    // were removed from the seed. Existing users have them in their saved
    // state; strip them so they don't render anywhere. Orphaned IDs in
    // entries[date].completedHabits are harmless (the heatmap and streak
    // calcs ignore IDs that don't resolve to a habit). Remove at v2.
    const REMOVED_HABIT_NAMES = new Set(['Tinted SPF', 'Tongue scraper']);
    if (parsed.version === 1 && parsed.habits.some((h) => REMOVED_HABIT_NAMES.has(h.name))) {
      parsed.habits = parsed.habits.filter((h) => !REMOVED_HABIT_NAMES.has(h.name));
    }

    // Backfill new checkable schedule habits added after the initial seed,
    // and update Boxing skill work to Tue/Thu only. Remove at v2.
    if (parsed.version === 1) {
      const existing = new Set(parsed.habits.map((h) => h.name));
      const created = new Date().toISOString();
      const additions: Array<{
        name: string;
        category: Category;
        frequency: Frequency;
        timeOfDay: TimeOfDay;
      }> = [
        { name: 'Standard breakfast', category: 'Body', frequency: 'Daily', timeOfDay: 'Morning' },
        { name: 'Protein shake', category: 'Body', frequency: 'Daily', timeOfDay: 'Midday' },
        { name: 'Standard dinner', category: 'Body', frequency: 'Daily', timeOfDay: 'Evening' },
        { name: 'Phone out of bedroom', category: 'Sleep', frequency: 'Daily', timeOfDay: 'Evening' },
        { name: 'Supplements', category: 'Body', frequency: 'Daily', timeOfDay: 'Evening' },
      ];
      const toAdd: Habit[] = additions
        .filter((a) => !existing.has(a.name))
        .map((a) => ({
          id: crypto.randomUUID(),
          name: a.name,
          category: a.category,
          frequency: a.frequency,
          timeOfDay: a.timeOfDay,
          active: true,
          createdAt: created,
        }));
      if (toAdd.length > 0) {
        parsed.habits = [...parsed.habits, ...toAdd];
      }

      parsed.habits = parsed.habits.map((h) =>
        h.name === 'Boxing skill work' && h.frequency !== 'Tue/Thu'
          ? { ...h, frequency: 'Tue/Thu' as Frequency }
          : h,
      );
    }

    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist state', err);
  }
}

export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importJSON(json: string): AppState {
  const parsed = JSON.parse(json);
  if (!isValidState(parsed)) {
    throw new Error('Invalid state: missing or unsupported version field');
  }
  return parsed;
}
