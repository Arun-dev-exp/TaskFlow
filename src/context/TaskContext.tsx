import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Task, TaskFilter, AppState, TaskCategory } from '../types';
import { generateId, getCurrentDate } from '../utils/helpers';

// Initial state
const initialState: AppState = {
  tasks: [],
  filter: 'all',
  categories: ['work', 'personal', 'health', 'learning', 'other']
};

// Action types
type Action = 
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'UPDATE_HABIT_HISTORY'; payload: { id: string; date: string; completed: boolean } };

// Reducer function
function taskReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            ...action.payload,
            id: generateId(),
            createdAt: new Date().toISOString(),
            habitHistory: action.payload.isHabit ? [{ date: getCurrentDate(), completed: false }] : undefined
          }
        ]
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, completed: !task.completed }
            : task
        )
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    
    case 'UPDATE_HABIT_HISTORY':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id && task.isHabit) {
            const existingEntry = task.habitHistory?.find(h => h.date === action.payload.date);
            
            // If entry exists, update it; otherwise add new entry
            const updatedHistory = existingEntry 
              ? task.habitHistory?.map(h => 
                  h.date === action.payload.date 
                    ? { ...h, completed: action.payload.completed }
                    : h
                )
              : [...(task.habitHistory || []), { date: action.payload.date, completed: action.payload.completed }];
            
            return {
              ...task,
              habitHistory: updatedHistory
            };
          }
          return task;
        })
      };
    
    default:
      return state;
  }
}

// Context
type TaskContextType = {
  state: AppState;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
  updateHabitHistory: (id: string, date: string, completed: boolean) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState, () => {
    const savedState = localStorage.getItem('taskState');
    return savedState ? JSON.parse(savedState) : initialState;
  });
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('taskState', JSON.stringify(state));
  }, [state]);
  
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };
  
  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };
  
  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };
  
  const toggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  };
  
  const setFilter = (filter: TaskFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };
  
  const updateHabitHistory = (id: string, date: string, completed: boolean) => {
    dispatch({ type: 'UPDATE_HABIT_HISTORY', payload: { id, date, completed } });
  };
  
  return (
    <TaskContext.Provider value={{ 
      state, 
      addTask, 
      updateTask, 
      deleteTask, 
      toggleTask, 
      setFilter,
      updateHabitHistory 
    }}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook to use the context
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}