import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { TagIcon as TaskIcon, CheckCircleIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { calculateCompletionRate } from '../utils/helpers';

const Dashboard = () => {
  const { state } = useTaskContext();
  const { tasks } = state;
  
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Habit statistics
  const habits = tasks.filter(task => task.isHabit);
  const habitCompletionRates = habits.map(habit => ({
    id: habit.id,
    title: habit.title,
    completionRate: calculateCompletionRate(habit.habitHistory || [])
  }));
  
  // Time-blocked tasks
  const timeBlockedTasks = tasks.filter(task => task.timeBlock);
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard</h2>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-full mr-3">
              <TaskIcon size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-indigo-800">{totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-emerald-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-full mr-3">
              <CheckCircleIcon size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-emerald-800">{completedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-full mr-3">
              <CalendarIcon size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Habits</p>
              <p className="text-2xl font-bold text-amber-800">{habits.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <ClockIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Time Blocked</p>
              <p className="text-2xl font-bold text-blue-800">{timeBlockedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Completion progress */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Overall Progress</h3>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{completedTasks} completed</span>
          <span className="text-xs text-gray-500">{completionRate}%</span>
        </div>
      </div>
      
      {/* Habit progress (if habits exist) */}
      {habits.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Habit Consistency</h3>
          <div className="space-y-3">
            {habitCompletionRates.map(habit => (
              <div key={habit.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">{habit.title}</p>
                  <p className="text-sm text-gray-500">{habit.completionRate}%</p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500 ease-out"
                    style={{ width: `${habit.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;