// Editing this file changes the daily schedule. Habit lines must match Habit.name exactly.

import type { Habit } from '@/types';

export type ReminderItem = { kind: 'reminder'; id: string; text: string };
export type HabitItem = { kind: 'habit'; id: string; habitName: string };
export type ScheduleItem = ReminderItem | HabitItem;

export type ScheduleBlock = {
  id: 'morning' | 'midday' | 'afternoon' | 'evening' | 'wind-down';
  label: string;
  items: ScheduleItem[];
};

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'morning',
    label: 'Morning',
    items: [
      { kind: 'reminder', id: 'wake', text: 'Wake 7am' },
      { kind: 'habit', id: 'h-bright-light', habitName: 'Bright light exposure' },
      { kind: 'habit', id: 'h-tefillin', habitName: 'Tefillin' },
      { kind: 'habit', id: 'h-lift', habitName: 'Lift' },
      { kind: 'habit', id: 'h-cold-shower', habitName: 'Cold shower (60s)' },
      { kind: 'reminder', id: 'breakfast', text: 'Breakfast' },
    ],
  },
  {
    id: 'midday',
    label: 'Midday',
    items: [
      { kind: 'reminder', id: 'midday-work', text: 'Class / work / Illumin' },
      { kind: 'reminder', id: 'lunch', text: 'Lunch (track macros)' },
      { kind: 'habit', id: 'h-meditation', habitName: 'Meditation' },
      { kind: 'reminder', id: 'caffeine-cutoff', text: 'Caffeine cutoff: noon' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    items: [
      { kind: 'reminder', id: 'afternoon-work', text: 'Class / work / Illumin' },
      { kind: 'habit', id: 'h-reading', habitName: 'Reading' },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    items: [
      { kind: 'reminder', id: 'dinner', text: 'Dinner (last meal by 8pm)' },
      {
        kind: 'reminder',
        id: 'social',
        text: 'Social / friends / girlfriend / boxing or sparring on assigned days',
      },
      { kind: 'habit', id: 'h-mobility', habitName: 'APT/posture mobility routine' },
      { kind: 'reminder', id: 'dim-lights', text: 'Dim lights by 9pm' },
    ],
  },
  {
    id: 'wind-down',
    label: 'Wind-down',
    items: [
      { kind: 'reminder', id: 'phone-out', text: 'Phone out of bedroom by 10:30pm' },
      { kind: 'habit', id: 'h-journal', habitName: 'Nightly journal' },
      {
        kind: 'reminder',
        id: 'supplements',
        text: 'Supplements: magnesium glycinate, glycine, L-theanine, ashwagandha',
      },
      { kind: 'reminder', id: 'sleep', text: 'Sleep 11pm' },
    ],
  },
];

export const SCHEDULED_HABIT_NAMES: ReadonlySet<string> = new Set(
  DAILY_SCHEDULE.flatMap((b) => b.items)
    .filter((i): i is HabitItem => i.kind === 'habit')
    .map((i) => i.habitName),
);

export function findHabitByName(habits: Habit[], name: string): Habit | undefined {
  return habits.find((h) => h.name === name);
}
