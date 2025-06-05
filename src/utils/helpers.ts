// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format time for display (HH:MM AM/PM)
export const formatTime = (timeString: string): string => {
  const time = new Date(`2000-01-01T${timeString}`);
  return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

// Check if a date is today
export const isToday = (dateString: string): boolean => {
  const today = getCurrentDate();
  return dateString === today;
};

// Calculate completion percentage for habits
export const calculateCompletionRate = (history: { date: string; completed: boolean }[]): number => {
  if (!history || history.length === 0) return 0;
  
  const completed = history.filter(day => day.completed).length;
  return Math.round((completed / history.length) * 100);
};

// Get category color
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'work':
      return 'bg-indigo-500';
    case 'personal':
      return 'bg-pink-500';
    case 'health':
      return 'bg-emerald-500';
    case 'learning':
      return 'bg-amber-500';
    default:
      return 'bg-slate-500';
  }
};

// Get category text color
export const getCategoryTextColor = (category: string): string => {
  switch (category) {
    case 'work':
      return 'text-indigo-500';
    case 'personal':
      return 'text-pink-500';
    case 'health':
      return 'text-emerald-500';
    case 'learning':
      return 'text-amber-500';
    default:
      return 'text-slate-500';
  }
};