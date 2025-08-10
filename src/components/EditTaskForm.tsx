import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types';
import { X, Loader2 } from 'lucide-react';

interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onClose }) => {
  const { updateTask, state, loading } = useTaskContext();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState(task.category);
  const [isHabit, setIsHabit] = useState(task.isHabit);
  const [hasTimeBlock, setHasTimeBlock] = useState(Boolean(task.timeBlock));
  const [startTime, setStartTime] = useState(task.timeBlock?.start || '09:00');
  const [endTime, setEndTime] = useState(task.timeBlock?.end || '10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Focus the title input when the form opens
    const titleInput = document.getElementById('edit-title');
    if (titleInput) {
      titleInput.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      await updateTask({
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        isHabit,
        timeBlock: hasTimeBlock ? { start: startTime, end: endTime } : undefined,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      // Error is already handled by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleIsHabitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHabit(e.target.checked);
  };

  const handleHasTimeBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasTimeBlock(e.target.checked);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  const isFormDisabled = loading || isSubmitting;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Edit Task</h3>
        <button 
          onClick={onClose}
          disabled={isFormDisabled}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Title*
            </label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400"
              placeholder="Enter task title"
              required
              autoFocus
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 resize-vertical"
              placeholder="Add details about this task"
              rows={3}
            />
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="edit-category"
              value={category}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
            >
              {state.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Is Habit checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-isHabit"
              checked={isHabit}
              onChange={handleIsHabitChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="edit-isHabit" className="ml-3 block text-sm text-gray-700 cursor-pointer">
              This is a recurring habit
            </label>
          </div>
          
          {/* Time block toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-hasTimeBlock"
              checked={hasTimeBlock}
              onChange={handleHasTimeBlockChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="edit-hasTimeBlock" className="ml-3 block text-sm text-gray-700 cursor-pointer">
              Add time block
            </label>
          </div>
          
          {/* Time block inputs */}
          {hasTimeBlock && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label htmlFor="edit-startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  id="edit-startTime"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="edit-endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  id="edit-endTime"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                />
              </div>
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isFormDisabled}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isFormDisabled || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTaskForm;

