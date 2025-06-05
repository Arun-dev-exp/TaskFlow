import React, { useState } from 'react';
import { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { Check, Clock, Trash2, Edit2, Calendar, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { getCategoryColor, getCategoryTextColor, formatTime, getCurrentDate } from '../utils/helpers';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask, updateHabitHistory } = useTaskContext();
  const [showOptions, setShowOptions] = useState(false);
  const [showHabitHistory, setShowHabitHistory] = useState(false);

  const handleToggle = () => {
    toggleTask(task.id);
    
    // If it's a habit, also update today's history
    if (task.isHabit) {
      updateHabitHistory(task.id, getCurrentDate(), !task.completed);
    }
  };

  return (
    <div className={`
      p-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow 
      ${task.completed ? 'bg-gray-50 border border-gray-100' : 'bg-white border border-gray-200'} 
      ${task.timeBlock ? 'border-l-4 border-l-indigo-500' : ''}
    `}>
      <div className="flex items-start">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 h-6 w-6 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center
            ${task.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-gray-300 hover:border-indigo-500 transition-colors'}
          `}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <Check size={14} />}
        </button>
        
        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            
            {/* Category badge */}
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getCategoryColor(task.category)} text-white`}>
              {task.category}
            </span>
            
            {/* Habit indicator */}
            {task.isHabit && (
              <button 
                className="ml-2 text-amber-500 hover:text-amber-600"
                onClick={() => setShowHabitHistory(!showHabitHistory)}
              >
                <Calendar size={16} />
              </button>
            )}
          </div>
          
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          {/* Time block info */}
          {task.timeBlock && task.timeBlock.start && task.timeBlock.end && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Clock size={14} className="mr-1" />
              <span>{formatTime(task.timeBlock.start)} - {formatTime(task.timeBlock.end)}</span>
            </div>
          )}
          
          {/* Habit history visualization (conditionally shown) */}
          {task.isHabit && showHabitHistory && task.habitHistory && task.habitHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Habit History:</p>
              <div className="flex flex-wrap gap-1">
                {task.habitHistory.map((day, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs
                      ${day.completed 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-500'}`}
                    title={`${day.date}: ${day.completed ? 'Completed' : 'Missed'}`}
                    onClick={() => updateHabitHistory(task.id, day.date, !day.completed)}
                  >
                    {day.completed ? <CheckCircle2 size={14} /> : <span>·</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="ml-2 relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {/* Dropdown menu */}
          {showOptions && (
            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 w-32 z-10">
              <button 
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => {
                  setShowOptions(false);
                  // Open edit modal (you'd need to implement this)
                }}
              >
                <Edit2 size={14} className="mr-2" />
                Edit
              </button>
              <button 
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                onClick={() => {
                  deleteTask(task.id);
                  setShowOptions(false);
                }}
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;