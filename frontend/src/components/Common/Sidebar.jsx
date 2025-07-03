import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose, systemStatus }) => {
  const location = useLocation();
  
  const navItems = [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { path: ROUTES.CHAT, label: 'Chat', icon: '💬' },
    { path: ROUTES.DETECTORS, label: 'Detectors', icon: '🛡️' },
    { path: ROUTES.CONFIG, label: 'Configuration', icon: '⚙️' },
  ];

  return (
    <aside className={`fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-30 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;