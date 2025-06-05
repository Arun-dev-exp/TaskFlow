import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { ListChecks, CheckCircle2, Clock, Calendar } from 'lucide-react';

const FilterBar = () => {
  const { state, setFilter } = useTaskContext();
  
  const filters = [
    { id: 'all', label: 'All', icon: <ListChecks size={18} /> },
    { id: 'active', label: 'Active', icon: <Clock size={18} /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={18} /> },
    { id: 'habits', label: 'Habits', icon: <Calendar size={18} /> },
    { id: 'timeBlocked', label: 'Time Blocked', icon: <Clock size={18} /> }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex overflow-x-auto">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setFilter(filter.id as any)}
            className={`
              flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${state.filter === filter.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
            `}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
            
            {/* Count badges */}
            {filter.id === 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {state.tasks.length}
              </span>
            )}
            {filter.id === 'active' && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {state.tasks.filter(t => !t.completed).length}
              </span>
            )}
            {filter.id === 'completed' && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {state.tasks.filter(t => t.completed).length}
              </span>
            )}
            {filter.id === 'habits' && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {state.tasks.filter(t => t.isHabit).length}
              </span>
            )}
            {filter.id === 'timeBlocked' && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {state.tasks.filter(t => t.timeBlock && t.timeBlock.start && t.timeBlock.end).length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;