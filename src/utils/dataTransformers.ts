import { Task } from '../types';

// Transform backend task data to frontend format
export const transformBackendTask = (backendTask: any): Task => {
  return {
    id: backendTask.id,
    title: backendTask.title,
    description: backendTask.description || '',
    completed: backendTask.completed,
    isHabit: backendTask.is_habit,
    category: backendTask.category || 'other',
    createdAt: new Date(backendTask.created_at).toISOString(),
    timeBlock: backendTask.time_blocks && backendTask.time_blocks.length > 0 ? {
      start: backendTask.time_blocks[0].start_time,
      end: backendTask.time_blocks[0].end_time,
    } : undefined,
    habitHistory: backendTask.habit_history ? backendTask.habit_history.map((hh: any) => ({
      date: hh.date,
      completed: hh.completed,
    })) : [],
  };
};

// Transform frontend task data to backend format
export const transformFrontendTask = (frontendTask: Partial<Task>): any => {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    title: frontendTask.title,
    description: frontendTask.description,
    completed: frontendTask.completed || false,
    isHabit: frontendTask.isHabit || false,
    category: frontendTask.category || 'other',
    timeBlock: frontendTask.timeBlock ? {
      start: frontendTask.timeBlock.start,
      end: frontendTask.timeBlock.end,
      date: today // Add the missing date field
    } : undefined,
  };
};

// Transform backend category data to frontend format
export const transformBackendCategory = (backendCategory: any): { id: string; name: string; color: string; textColor: string } => {
  return {
    id: backendCategory.id,
    name: backendCategory.name,
    color: backendCategory.color,
    textColor: backendCategory.text_color,
  };
};

// Transform frontend category data to backend format
export const transformFrontendCategory = (frontendCategory: { name: string; color: string; textColor: string }): any => {
  return {
    name: frontendCategory.name,
    color: frontendCategory.color,
    text_color: frontendCategory.textColor,
  };
};

// Transform backend habit history data to frontend format
export const transformBackendHabitHistory = (backendHistory: any): { date: string; completed: boolean } => {
  return {
    date: backendHistory.date,
    completed: backendHistory.completed,
  };
};

// Transform frontend habit history data to backend format
export const transformFrontendHabitHistory = (frontendHistory: { date: string; completed: boolean }): any => {
  return {
    date: frontendHistory.date,
    completed: frontendHistory.completed,
  };
};

// Transform backend time block data to frontend format
export const transformBackendTimeBlock = (backendTimeBlock: any): { start: string; end: string } => {
  return {
    start: backendTimeBlock.start_time,
    end: backendTimeBlock.end_time,
  };
};

// Transform frontend time block data to backend format
export const transformFrontendTimeBlock = (frontendTimeBlock: { start: string; end: string }): any => {
  return {
    start_time: frontendTimeBlock.start,
    end_time: frontendTimeBlock.end,
  };
};
