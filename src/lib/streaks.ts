import { addDays, subDays } from 'date-fns';
import type { DayEntry, Habit } from '@/types';
import { formatKey } from './dates';
import { isExpectedOn } from './frequency';

const LOOKBACK_DAYS = 365;

function isCompleted(
  habit: Habit,
  date: Date,
  entries: Record<string, DayEntry>,
): boolean {
  const entry = entries[formatKey(date)];
  return !!entry && entry.completedHabits.includes(habit.id);
}

// Walks backward from `today` and counts consecutive expected days that the
// habit was completed. If today itself is expected and not yet completed, we
// start from yesterday so the in-progress day doesn't break the streak.
export function currentStreak(
  habit: Habit,
  entries: Record<string, DayEntry>,
  today: Date,
): number {
  let cursor = today;
  if (isExpectedOn(habit, cursor) && !isCompleted(habit, cursor, entries)) {
    cursor = subDays(cursor, 1);
  }

  let count = 0;
  for (let i = 0; i < LOOKBACK_DAYS; i++) {
    if (isExpectedOn(habit, cursor)) {
      if (isCompleted(habit, cursor, entries)) {
        count++;
      } else {
        break;
      }
    }
    cursor = subDays(cursor, 1);
  }
  return count;
}

export function longestStreak(
  habit: Habit,
  entries: Record<string, DayEntry>,
  today: Date,
): number {
  let max = 0;
  let run = 0;
  // Walk forward from oldest -> newest so consecutive runs are easy to track.
  const start = subDays(today, LOOKBACK_DAYS - 1);
  for (let i = 0; i < LOOKBACK_DAYS; i++) {
    const cursor = addDays(start, i);
    if (!isExpectedOn(habit, cursor)) continue;
    if (isCompleted(habit, cursor, entries)) {
      run++;
      if (run > max) max = run;
    } else {
      run = 0;
    }
  }
  return max;
}

// Looks back through history for the last `occurrences` expected dates and
// returns the fraction completed. If history is shorter than `occurrences`,
// the denominator shrinks to whatever is available — so a brand-new habit
// doesn't show 0% just because there's no data yet.
export function completionRate(
  habit: Habit,
  entries: Record<string, DayEntry>,
  today: Date,
  occurrences = 30,
): number {
  const expected: Date[] = [];
  let cursor = today;
  for (let i = 0; i < LOOKBACK_DAYS && expected.length < occurrences; i++) {
    if (isExpectedOn(habit, cursor)) expected.push(cursor);
    cursor = subDays(cursor, 1);
  }
  if (expected.length === 0) return 0;
  const done = expected.filter((d) => isCompleted(habit, d, entries)).length;
  return done / expected.length;
}

// Returns the recent expected dates (most recent first) and whether each was
// completed — used by the StreakCard expansion to render the last-30 dot row.
export function recentOccurrences(
  habit: Habit,
  entries: Record<string, DayEntry>,
  today: Date,
  occurrences = 30,
): { date: Date; completed: boolean }[] {
  const out: { date: Date; completed: boolean }[] = [];
  let cursor = today;
  for (let i = 0; i < LOOKBACK_DAYS && out.length < occurrences; i++) {
    if (isExpectedOn(habit, cursor)) {
      out.push({ date: cursor, completed: isCompleted(habit, cursor, entries) });
    }
    cursor = subDays(cursor, 1);
  }
  return out;
}

export function overallCurrentStreak(
  habits: Habit[],
  entries: Record<string, DayEntry>,
  today: Date,
): number {
  let max = 0;
  for (const h of habits) {
    if (!h.active) continue;
    if (!isExpectedOn(h, today)) continue;
    const s = currentStreak(h, entries, today);
    if (s > max) max = s;
  }
  return max;
}
