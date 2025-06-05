export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  timeBlock?: {
    start: string;
    end: string;
  };
  isHabit: boolean;
  habitHistory?: {
    date: string;
    completed: boolean;
  }[];
  createdAt: string;
}

export type TaskFilter = 'all' | 'active' | 'completed' | 'habits' | 'timeBlocked';
export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'other';

export interface AppState {
  tasks: Task[];
  filter: TaskFilter;
  categories: TaskCategory[];
}