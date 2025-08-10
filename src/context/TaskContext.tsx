import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { Task, TaskFilter, AppState, TaskCategory } from '../types';
import { generateId, getCurrentDate } from '../utils/helpers';
import { taskAPI, categoryAPI } from '../services/api';
import { transformBackendTask, transformFrontendTask } from '../utils/dataTransformers';

// Initial state
const initialState: AppState = {
  tasks: [],
  filter: 'all',
  categories: ['work', 'personal', 'health', 'learning', 'other']
};

// Action types
type Action = 
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: Task }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'UPDATE_HABIT_HISTORY'; payload: { id: string; date: string; completed: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Reducer function
function taskReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks]
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
          task.id === action.payload.id ? action.payload : task
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
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  updateHabitHistory: (id: string, date: string, completed: boolean) => Promise<void>;
  refreshTasks: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from API on component mount
  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.getAll();
      if (response.success) {
        const transformedTasks = response.data.map(transformBackendTask);
        dispatch({ type: 'SET_TASKS', payload: transformedTasks });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendTaskData = transformFrontendTask(task);
      const response = await taskAPI.create(backendTaskData);
      
      if (response.success) {
        const newTask = transformBackendTask(response.data);
        dispatch({ type: 'ADD_TASK', payload: newTask });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateTask = async (task: Task) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendTaskData = transformFrontendTask(task);
      const response = await taskAPI.update(task.id, backendTaskData);
      
      if (response.success) {
        const updatedTask = transformBackendTask(response.data);
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.delete(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_TASK', payload: id });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTask = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.toggle(id);
      
      if (response.success) {
        const updatedTask = transformBackendTask(response.data);
        dispatch({ type: 'TOGGLE_TASK', payload: updatedTask });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
      console.error('Error toggling task:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const setFilter = (filter: TaskFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };
  
  const updateHabitHistory = async (id: string, date: string, completed: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll update the local state
      // In the future, you might want to add a specific API endpoint for this
      dispatch({ type: 'UPDATE_HABIT_HISTORY', payload: { id, date, completed } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit history');
      console.error('Error updating habit history:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TaskContext.Provider value={{ 
      state, 
      loading,
      error,
      addTask, 
      updateTask, 
      deleteTask, 
      toggleTask, 
      setFilter,
      updateHabitHistory,
      refreshTasks
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