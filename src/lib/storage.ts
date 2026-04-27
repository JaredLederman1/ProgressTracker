import type { AppState } from '@/types';
import { buildSeedHabits } from './seed';

export const STORAGE_KEY = 'tracker.v1';

export function defaultState(): AppState {
  return {
    version: 1,
    habits: buildSeedHabits(),
    adHocTasks: [],
    milestones: [],
    media: [],
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
