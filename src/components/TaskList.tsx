import { useState } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { useTaskContext } from '../context/TaskContext';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import NewTaskForm from './NewTaskForm';
import EditTaskForm from './EditTaskForm';

const TaskList = () => {
  const { state, loading, error, refreshTasks } = useTaskContext();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  console.log('TaskList render - showNewTaskForm:', showNewTaskForm, 'editingTask:', editingTask);

  const handleShowNewTaskForm = () => {
    console.log('Opening new task form');
    setShowNewTaskForm(true);
  };

  const handleCloseNewTaskForm = () => {
    console.log('Closing new task form');
    setShowNewTaskForm(false);
  };

  const handleEditTask = (task: Task) => {
    console.log('Opening edit task form for:', task);
    setEditingTask(task);
  };

  const handleCloseEditTaskForm = () => {
    console.log('Closing edit task form');
    setEditingTask(null);
  };

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

  const handleRefresh = async () => {
    await refreshTasks();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {state.filter === 'all' && 'All Tasks'}
            {state.filter === 'active' && 'Active Tasks'}
            {state.filter === 'completed' && 'Completed Tasks'}
            {state.filter === 'habits' && 'Habits'}
            {state.filter === 'timeBlocked' && 'Time-Blocked Tasks'}
            <span className="ml-2 text-sm font-normal text-gray-500">({sortedTasks.length})</span>
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh tasks"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <button
          onClick={handleShowNewTaskForm}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-6 text-center py-8">
          <RefreshCw size={32} className="animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      )}

      {/* New task form */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <NewTaskForm onClose={handleCloseNewTaskForm} />
          </div>
        </div>
      )}

      {/* Edit task form */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <EditTaskForm task={editingTask} onClose={handleCloseEditTaskForm} />
          </div>
        </div>
      )}

      {/* Tasks list */}
      {!loading && sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tasks found</p>
          <button
            onClick={handleShowNewTaskForm}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Add your first task
          </button>
        </div>
      ) : (
        !loading && (
          <div className="space-y-3">
            {sortedTasks.map(task => (
              <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default TaskList;