import React from 'react';

const Header = ({ onToggleSidebar, onToggleTheme, currentTheme, systemStatus }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            AI Safety System
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="status-indicator healthy">
            {systemStatus?.detectors?.status === 'healthy' ? '🟢' : '🔴'} System
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {currentTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;