import React, { useState, useEffect } from 'react';
import { configAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ConfigurationPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState('yaml');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await configAPI.getSystemConfig();
      setConfig(response.config || {});
    } catch (error) {
      console.error('Failed to load configuration:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const exportConfiguration = async () => {
    try {
      const response = await configAPI.exportConfig(exportFormat, true);
      const filename = `ai_safety_config.${exportFormat}`;
      
      // Create and download file
      const blob = new Blob([response.export_data.content], { 
        type: exportFormat === 'yaml' ? 'text/yaml' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Configuration exported successfully');
    } catch (error) {
      console.error('Failed to export configuration:', error);
      toast.error('Failed to export configuration');
    }
  };

  const resetConfiguration = async () => {
    if (window.confirm('Are you sure you want to reset to default configuration? This cannot be undone.')) {
      try {
        await configAPI.resetToDefaults();
        await loadConfiguration();
        toast.success('Configuration reset to defaults');
      } catch (error) {
        console.error('Failed to reset configuration:', error);
        toast.error('Failed to reset configuration');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading configuration..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          System Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage system settings and export configuration
        </p>
      </div>

      {/* Configuration Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Configuration Management
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input-field w-auto"
            >
              <option value="yaml">YAML</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={exportConfiguration}
              className="btn-primary"
            >
              📤 Export Config
            </button>
          </div>
          
          <button
            onClick={resetConfiguration}
            className="btn-danger"
          >
            🔄 Reset to Defaults
          </button>
          
          <button
            onClick={loadConfiguration}
            className="btn-outline"
          >
            🔄 Reload
          </button>
        </div>
      </div>

      {/* Configuration Display */}
      {config && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Current Configuration
          </h2>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Note:</strong> Configuration changes require system restart to take full effect.
              Some settings can be modified through the Detector Panel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationPage;