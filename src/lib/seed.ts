import type { Category, Frequency, Habit, MediaEntry, MediaType, TimeOfDay } from '@/types';

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
  { name: 'Boxing skill work', category: 'Body', frequency: 'Tue/Thu', timeOfDay: 'Anytime' },
  { name: 'APT/posture mobility routine', category: 'Body', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Cold shower (60s)', category: 'Body', frequency: 'Daily', timeOfDay: 'Morning' },
  { name: 'Sunday meal prep', category: 'Body', frequency: 'Weekly', timeOfDay: 'Anytime' },
  { name: 'Standard breakfast', category: 'Body', frequency: 'Daily', timeOfDay: 'Morning' },
  { name: 'Protein shake', category: 'Body', frequency: 'Daily', timeOfDay: 'Midday' },
  { name: 'Standard dinner', category: 'Body', frequency: 'Daily', timeOfDay: 'Evening' },
  { name: 'Supplements', category: 'Body', frequency: 'Daily', timeOfDay: 'Evening' },

  // Mind
  { name: 'Reading', category: 'Mind', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Unstructured hour, no input', category: 'Mind', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Weekly review', category: 'Mind', frequency: 'Weekly', timeOfDay: 'Anytime' },

  // Sleep
  { name: 'Bright light exposure', category: 'Sleep', frequency: 'Daily', timeOfDay: 'Morning' },
  { name: 'Diaphragmatic breathing', category: 'Sleep', frequency: 'Daily', timeOfDay: 'Anytime' },
  { name: 'Phone out of bedroom', category: 'Sleep', frequency: 'Daily', timeOfDay: 'Evening' },

  // Spiritual
  { name: 'Tefillin', category: 'Spiritual', frequency: 'Weekday', timeOfDay: 'Morning' },
  { name: 'Meditation', category: 'Spiritual', frequency: 'Daily', timeOfDay: 'Anytime' },

  // Emotional Regulation
  { name: 'Nightly journal', category: 'Emotional Regulation', frequency: 'Daily', timeOfDay: 'Evening' },
  { name: 'Hard conversation', category: 'Emotional Regulation', frequency: 'Weekly', timeOfDay: 'Anytime' },
];

type SeedMedia = { title: string; type: MediaType };

const SEED_MEDIA: SeedMedia[] = [
  // Books (18)
  { title: 'Crime and Punishment', type: 'Book' },
  { title: 'All Quiet on the Western Front', type: 'Book' },
  { title: 'The Strange Case of Dr. Jekyll and Mr. Hyde', type: 'Book' },
  { title: 'East of Eden', type: 'Book' },
  { title: 'The Call of the Wild', type: 'Book' },
  { title: 'The Time Machine', type: 'Book' },
  { title: 'The Clash of Civilizations', type: 'Book' },
  { title: 'The Invisible Man', type: 'Book' },
  { title: 'The Revenge of Geography', type: 'Book' },
  { title: 'The Geographical Pivot of History', type: 'Book' },
  { title: 'The Count of Monte Cristo', type: 'Book' },
  { title: 'The Influence of Sea Power Upon History', type: 'Book' },
  { title: 'Confessions', type: 'Book' },
  { title: 'Diplomacy', type: 'Book' },
  { title: 'Dune', type: 'Book' },
  { title: 'Silence', type: 'Book' },
  { title: 'Dracula', type: 'Book' },
  { title: 'Prisoners of Geography', type: 'Book' },

  // Movies (13) — films, series, and documentaries collapsed under Movie
  { title: 'Se7en', type: 'Movie' },
  { title: 'The Boy in the Striped Pajamas', type: 'Movie' },
  { title: 'Beautiful Boy', type: 'Movie' },
  { title: 'The Shawshank Redemption', type: 'Movie' },
  { title: 'Saving Private Ryan', type: 'Movie' },
  { title: 'Marty Supreme', type: 'Movie' },
  { title: 'The Grand Budapest Hotel', type: 'Movie' },
  { title: 'Fight Club', type: 'Movie' },
  { title: 'The Green Mile', type: 'Movie' },
  { title: 'War Machine', type: 'Movie' },
  { title: 'Taxi Driver', type: 'Movie' },
  { title: 'Dead Poets Society', type: 'Movie' },
  { title: 'Suits', type: 'Movie' },

  // YouTube (12)
  { title: "I'm Begging You to Write Essays", type: 'YouTube' },
  { title: 'Motivation is Garbage', type: 'YouTube' },
  { title: 'Make It Work — Mark Rober', type: 'YouTube' },
  { title: 'These Tools Win 2026', type: 'YouTube' },
  { title: 'er Go Too Far', type: 'YouTube' },
  { title: "Why You Can't Surrender", type: 'YouTube' },
  { title: 'A Dopamine Detox to Reset Your Life in 30 Days', type: 'YouTube' },
  { title: "Why You're Smarter Than You Think", type: 'YouTube' },
  { title: 'The Power of Delusional Self Belief', type: 'YouTube' },
  { title: 'You Are Not Who You Think You Are', type: 'YouTube' },
  { title: 'The Danger of Becoming What You Do', type: 'YouTube' },
  { title: 'Resist the Hustle Culture / Become a Renaissance Man', type: 'YouTube' },

  // Podcasts (3)
  { title: 'Andrew Huberman on the Joe Rogan Podcast', type: 'Podcast' },
  { title: 'Gymshark — Ben Francis', type: 'Podcast' },
  { title: 'Open / Tortured into Greatness: The Life of Andre Agassi', type: 'Podcast' },

  // Articles (3)
  { title: 'The Bookends of Time', type: 'Article' },
  { title: 'The Fear of Becoming Yourself', type: 'Article' },
  { title: 'The Pain of Becoming Yourself', type: 'Article' },
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

export function buildSeedMedia(): MediaEntry[] {
  const now = new Date().toISOString();
  return SEED_MEDIA.map((m) => ({
    id: crypto.randomUUID(),
    title: m.title,
    type: m.type,
    createdAt: now,
  }));
}
