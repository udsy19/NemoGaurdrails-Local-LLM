import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Pages
import Dashboard from './components/Dashboard/Dashboard';
import ChatInterface from './components/Chat/ChatInterface';
import DetectorPanel from './components/Detectors/DetectorPanel';
import ConfigurationPage from './components/Configuration/ConfigurationPage';

// Utilities
import { themeUtils } from './utils/helpers';
import { ROUTES, STORAGE_KEYS } from './utils/constants';
import { systemAPI } from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(themeUtils.getTheme());

  useEffect(() => {
    // Initialize theme
    themeUtils.initTheme();
    
    // Initialize application
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Try to check system health, but don't fail if backend is not running
      try {
        const status = await systemAPI.getOverallStatus();
        setSystemStatus(status);
      } catch (error) {
        console.warn('Backend not available yet:', error);
        setSystemStatus({ backend_available: false });
      }
      
      // Restore user preferences
      const preferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}');
      if (preferences.sidebarOpen !== undefined) {
        setSidebarOpen(preferences.sidebarOpen);
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = themeUtils.toggleTheme();
    setCurrentTheme(newTheme);
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Save preference
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}');
    preferences.sidebarOpen = newState;
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Initializing AI Safety System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-gray-100',
            success: {
              className: 'dark:bg-green-800 dark:text-green-100',
            },
            error: {
              className: 'dark:bg-red-800 dark:text-red-100',
            },
          }}
        />

        {/* Header */}
        <Header
          onToggleSidebar={toggleSidebar}
          onToggleTheme={toggleTheme}
          currentTheme={currentTheme}
          systemStatus={systemStatus}
        />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            systemStatus={systemStatus}
          />

          {/* Main content */}
          <main 
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? 'ml-64' : 'ml-0'
            } pt-16`}
          >
            <div className="min-h-screen">
              <Routes>
                <Route path={ROUTES.HOME} element={<Dashboard />} />
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.CHAT} element={<ChatInterface />} />
                <Route path={ROUTES.DETECTORS} element={<DetectorPanel />} />
                <Route path={ROUTES.CONFIG} element={<ConfigurationPage />} />
                
                {/* Fallback route */}
                <Route 
                  path="*" 
                  element={
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Page Not Found
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        The page you're looking for doesn't exist.
                      </p>
                    </div>
                  } 
                />
              </Routes>
            </div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </Router>
  );
}

export default App;