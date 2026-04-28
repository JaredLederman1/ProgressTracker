// Editing this file changes the daily schedule. Habit lines must match Habit.name exactly.

import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Habit, TimeOfDay } from '@/types';

export type ReminderItem = { kind: 'reminder'; id: string; text: string };
export type HabitItem = {
  kind: 'habit';
  id: string;
  habitName: string;
  // Optional per-day display label override. Returns the string shown in the
  // row instead of habit.name. Used for the rotating Lift split.
  displayLabel?: (date: Date) => string;
};
export type ScheduleItem = ReminderItem | HabitItem;

export type ScheduleBlock = {
  id: 'morning' | 'midday' | 'afternoon' | 'evening' | 'wind-down';
  label: string;
  items: ScheduleItem[];
};

// 4-day rotating split. Anchor is the day labeled "Chest + Back" — every other
// day is computed relative to it via differenceInCalendarDays.
const LIFT_CYCLE = ['Chest + Back', 'Legs + Abs', 'Shoulders + Arms', 'Functional Lift'] as const;
const LIFT_ANCHOR = parseISO('2026-04-27'); // 2026-04-27 = day 0 (Chest + Back)

export function liftLabel(date: Date): string {
  const days = differenceInCalendarDays(date, LIFT_ANCHOR);
  const idx = ((days % LIFT_CYCLE.length) + LIFT_CYCLE.length) % LIFT_CYCLE.length;
  return `Lift: ${LIFT_CYCLE[idx]}`;
}

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'morning',
    label: 'Morning',
    items: [
      { kind: 'reminder', id: 'wake', text: 'Wake 7am' },
      { kind: 'habit', id: 'h-bright-light', habitName: 'Bright light exposure' },
      { kind: 'habit', id: 'h-tefillin', habitName: 'Tefillin' },
      { kind: 'habit', id: 'h-prehab', habitName: 'Functional/prehab session' },
      { kind: 'habit', id: 'h-lift', habitName: 'Lift', displayLabel: liftLabel },
      { kind: 'habit', id: 'h-cold-shower', habitName: 'Cold shower (60s)' },
      { kind: 'habit', id: 'h-breakfast', habitName: 'Standard breakfast' },
    ],
  },
  {
    id: 'midday',
    label: 'Midday',
    items: [
      { kind: 'habit', id: 'h-protein-shake', habitName: 'Protein shake' },
      { kind: 'reminder', id: 'caffeine-cutoff', text: 'Caffeine cutoff: noon' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    items: [
      { kind: 'habit', id: 'h-boxing-skill', habitName: 'Boxing skill work' },
      { kind: 'habit', id: 'h-light-sparring', habitName: 'Light sparring' },
      { kind: 'habit', id: 'h-meal-prep', habitName: 'Sunday meal prep' },
      { kind: 'habit', id: 'h-reading', habitName: 'Reading' },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    items: [
      { kind: 'habit', id: 'h-dinner', habitName: 'Standard dinner' },
      { kind: 'habit', id: 'h-mobility', habitName: 'APT/posture mobility routine' },
      { kind: 'habit', id: 'h-hard-convo', habitName: 'Hard conversation' },
      { kind: 'habit', id: 'h-unstructured', habitName: 'Unstructured hour, no input' },
      { kind: 'reminder', id: 'dim-lights', text: 'Dim lights by 9pm' },
    ],
  },
  {
    id: 'wind-down',
    label: 'Wind-down',
    items: [
      { kind: 'habit', id: 'h-phone-out', habitName: 'Phone out of bedroom' },
      { kind: 'habit', id: 'h-meditation', habitName: 'Meditation' },
      { kind: 'habit', id: 'h-breathing', habitName: 'Diaphragmatic breathing' },
      { kind: 'habit', id: 'h-journal', habitName: 'Nightly journal' },
      { kind: 'habit', id: 'h-weekly-review', habitName: 'Weekly review' },
      { kind: 'habit', id: 'h-supplements', habitName: 'Supplements' },
      { kind: 'reminder', id: 'sleep', text: 'Sleep 11pm' },
    ],
  },
];

export function findHabitByName(habits: Habit[], name: string): Habit | undefined {
  return habits.find((h) => h.name === name);
}

// User-added habits (not present in DAILY_SCHEDULE) get appended to the block
// matching their timeOfDay. Anytime falls into Afternoon since none of the
// form's time-of-day options map there directly.
export const TIME_OF_DAY_TO_BLOCK: Record<TimeOfDay, ScheduleBlock['id']> = {
  Morning: 'morning',
  Midday: 'midday',
  Evening: 'evening',
  Anytime: 'afternoon',
};

export function getScheduledHabitNames(): Set<string> {
  const names = new Set<string>();
  for (const block of DAILY_SCHEDULE) {
    for (const item of block.items) {
      if (item.kind === 'habit') names.add(item.habitName);
    }
  }
  return names;
}
