import React from 'react';
import { TaskProvider } from './context/TaskContext';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import { ClipboardList } from 'lucide-react';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
              </div>
              
              <div className="text-sm text-gray-500">Your Habit Tracking Assistant</div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard with stats */}
          <Dashboard />
          
          {/* Filter bar */}
          <FilterBar />
          
          {/* Task list */}
          <TaskList />
        </main>
      </div>
    </TaskProvider>
  );
}

export default App;