import { getDate, getDay } from 'date-fns';
import type { Habit } from '@/types';

export function isExpectedOn(habit: Habit, date: Date): boolean {
  const day = getDay(date); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  switch (habit.frequency) {
    case 'Daily':
      return true;
    case 'Weekday':
      return day >= 1 && day <= 5;
    case '6x/week':
      return day !== 0;
    case 'Weekly':
      return day === 0;
    case 'Monthly':
      return getDate(date) === 1;
  }
}
