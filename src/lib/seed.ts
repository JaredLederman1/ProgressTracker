import type { Category, Frequency, Habit, TimeOfDay } from '@/types';

type SeedHabit = {
  name: string;
  category: Category;
  frequency: Frequency;
  timeOfDay: TimeOfDay;
};

const SEED_HABITS: SeedHabit[] = [
  // Body
  { name: 'Lift', category: 'Body', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Functional/prehab session', category: 'Body', frequency: '6x/week', timeOfDay: 'Anytime' },
  { name: 'Light sparring', category: 'Body', frequency: 'Weekly', timeOfDay: 'Anytime' },
  { name: 'Boxing skill work', category: 'Body', frequency: '6x/week', timeOfDay: 'Anytime' },
  { name: 'APT/posture mobility routine', category: 'Body', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Cold shower (60s)', category: 'Body', frequency: 'Daily', timeOfDay: 'Morning' },
  { name: 'Sunday meal prep', category: 'Body', frequency: 'Weekly', timeOfDay: 'Anytime' },

  // Mind
  { name: 'Reading', category: 'Mind', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Unstructured hour, no input', category: 'Mind', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Weekly review', category: 'Mind', frequency: 'Weekly', timeOfDay: 'Anytime' },

  // Sleep
  { name: 'Bright light exposure', category: 'Sleep', frequency: 'Daily', timeOfDay: 'Morning' },
  { name: 'Diaphragmatic breathing', category: 'Sleep', frequency: 'Daily', timeOfDay: 'Anytime' },

  // Spiritual
  { name: 'Tefillin', category: 'Spiritual', frequency: 'Weekday', timeOfDay: 'Morning' },
  { name: 'Meditation', category: 'Spiritual', frequency: 'Daily', timeOfDay: 'Anytime' },

  // Emotional Regulation
  { name: 'Nightly journal', category: 'Emotional Regulation', frequency: 'Daily', timeOfDay: 'Evening' },
  { name: 'Hard conversation', category: 'Emotional Regulation', frequency: 'Weekly', timeOfDay: 'Anytime' },

  // Appearance
  { name: 'Tinted SPF', category: 'Appearance', frequency: 'Daily', timeOfDay: 'Morning' },
  { name: 'Tongue scraper', category: 'Appearance', frequency: 'Daily', timeOfDay: 'Morning' },
];

export function buildSeedHabits(): Habit[] {
  const now = new Date().toISOString();
  return SEED_HABITS.map((h) => ({
    id: crypto.randomUUID(),
    name: h.name,
    category: h.category,
    frequency: h.frequency,
    timeOfDay: h.timeOfDay,
    active: true,
    createdAt: now,
  }));
}
