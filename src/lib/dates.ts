import { format, parse } from 'date-fns';

const KEY_FORMAT = 'yyyy-MM-dd';

export function formatKey(date: Date): string {
  return format(date, KEY_FORMAT);
}

export function parseKey(key: string): Date {
  return parse(key, KEY_FORMAT, new Date());
}

export function todayKey(): string {
  return formatKey(new Date());
}
