import React, { useState } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { useTaskContext } from '../context/TaskContext';
import { Plus } from 'lucide-react';
import NewTaskForm from './NewTaskForm';

const TaskList = () => {
  const { state } = useTaskContext();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const filteredTasks = state.tasks.filter(task => {
    switch (state.filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'habits':
        return task.isHabit;
      case 'timeBlocked':
        return task.timeBlock && task.timeBlock.start && task.timeBlock.end;
      default:
        return true;
    }
  });

  // Sort tasks: time-blocked first, then active tasks, then completed
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First priority: time-blocked tasks
    const aHasTimeBlock = Boolean(a.timeBlock?.start && a.timeBlock?.end);
    const bHasTimeBlock = Boolean(b.timeBlock?.start && b.timeBlock?.end);
    
    if (aHasTimeBlock && !bHasTimeBlock) return -1;
    if (!aHasTimeBlock && bHasTimeBlock) return 1;
    
    // Second priority: sort by completion status
    if (!a.completed && b.completed) return -1;
    if (a.completed && !b.completed) return 1;
    
    // Finally, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {state.filter === 'all' && 'All Tasks'}
          {state.filter === 'active' && 'Active Tasks'}
          {state.filter === 'completed' && 'Completed Tasks'}
          {state.filter === 'habits' && 'Habits'}
          {state.filter === 'timeBlocked' && 'Time-Blocked Tasks'}
          <span className="ml-2 text-sm font-normal text-gray-500">({sortedTasks.length})</span>
        </h2>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {showNewTaskForm && (
        <div className="mb-6">
          <NewTaskForm onClose={() => setShowNewTaskForm(false)} />
        </div>
      )}

      {sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tasks found</p>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Add your first task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;