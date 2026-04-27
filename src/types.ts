export type Category =
  | 'Body'
  | 'Mind'
  | 'Sleep'
  | 'Spiritual'
  | 'Emotional Regulation'
  | 'Appearance'
  | 'Custom';

export type Frequency = 'Daily' | 'Weekday' | '6x/week' | 'Weekly' | 'Monthly';

export type TimeOfDay = 'Morning' | 'Midday' | 'Evening' | 'Anytime';

export type MediaType = 'Book' | 'Movie' | 'YouTube' | 'Podcast' | 'Article';

export type Habit = {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  timeOfDay: TimeOfDay;
  milestoneId?: string;
  active: boolean;
  createdAt: string;
};

export type AdHocTask = {
  id: string;
  name: string;
  forDate: string; // 'YYYY-MM-DD'
  milestoneId?: string;
  completed: boolean;
  createdAt: string;
};

export type Milestone = {
  id: string;
  name: string;
  target: number;
  count: number;
  createdAt: string;
};

export type MediaEntry = {
  id: string;
  title: string;
  type: MediaType;
  createdAt: string;
};

export type DayEntry = {
  date: string; // 'YYYY-MM-DD'
  completedHabits: string[];
};

export type AppState = {
  version: 1;
  habits: Habit[];
  adHocTasks: AdHocTask[];
  milestones: Milestone[];
  media: MediaEntry[];
  entries: Record<string, DayEntry>;
};
