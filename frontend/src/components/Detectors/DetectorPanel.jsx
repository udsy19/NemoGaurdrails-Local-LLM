import React, { useState, useEffect } from 'react';
import { detectorsAPI } from '../../services/api';
import { DETECTOR_PRESETS, DETECTOR_CONFIG } from '../../utils/constants';
import { formatUtils } from '../../utils/helpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const DetectorPanel = () => {
  const [detectors, setDetectors] = useState([]);
  const [activeDetectors, setActiveDetectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadDetectors();
  }, []);

  const loadDetectors = async () => {
    try {
      setLoading(true);
      const [detectorsResponse, activeResponse] = await Promise.all([
        detectorsAPI.listDetectors(),
        detectorsAPI.getActiveDetectors()
      ]);
      
      setDetectors(detectorsResponse.detectors || []);
      setActiveDetectors(activeResponse.active_detectors || []);
    } catch (error) {
      console.error('Failed to load detectors:', error);
      toast.error('Failed to load detectors');
    } finally {
      setLoading(false);
    }
  };

  const toggleDetector = async (detectorName) => {
    try {
      const newActiveDetectors = activeDetectors.includes(detectorName)
        ? activeDetectors.filter(name => name !== detectorName)
        : [...activeDetectors, detectorName];
      
      await detectorsAPI.setActiveDetectors(newActiveDetectors);
      setActiveDetectors(newActiveDetectors);
      toast.success(`Detector ${detectorName} ${newActiveDetectors.includes(detectorName) ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle detector:', error);
      toast.error('Failed to update detector');
    }
  };

  const applyPreset = async (presetName) => {
    try {
      await detectorsAPI.applyPreset(presetName);
      await loadDetectors();
      toast.success(`Applied ${presetName} preset`);
    } catch (error) {
      console.error('Failed to apply preset:', error);
      toast.error('Failed to apply preset');
    }
  };

  const runTest = async () => {
    if (!testText.trim()) {
      toast.error('Please enter test text');
      return;
    }

    try {
      setTestLoading(true);
      const response = await detectorsAPI.runDetection(testText, activeDetectors);
      setTestResults(response);
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading detectors..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Detector Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure and test AI safety detectors
        </p>
      </div>

      {/* Presets */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Presets
        </h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(DETECTOR_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key.toLowerCase())}
              className="btn-outline flex items-center space-x-2"
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detector Controls */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Individual Detectors
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detectors.map((detector) => {
            const isActive = activeDetectors.includes(detector.name);
            const config = DETECTOR_CONFIG[detector.name];
            
            return (
              <div
                key={detector.name}
                className={`detector-card ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {config?.icon || '🔍'}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {config?.name || formatUtils.camelToTitle(detector.name)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {detector.name}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleDetector(detector.name)}
                    className={`toggle ${isActive ? 'enabled' : 'disabled'}`}
                  >
                    <span className="toggle-button"></span>
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {config?.description || detector.description}
                </p>
                
                <div className="flex items-center space-x-2">
                  <span className={`status-indicator ${detector.loaded ? 'healthy' : 'error'}`}>
                    {detector.loaded ? 'Loaded' : 'Error'}
                  </span>
                  <span className={`status-indicator ${isActive ? 'healthy' : 'inactive'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Interface */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Test Detectors
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Text
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test against active detectors..."
              className="input-field h-24"
            />
          </div>
          
          <button
            onClick={runTest}
            disabled={testLoading || !testText.trim()}
            className="btn-primary"
          >
            {testLoading ? 'Testing...' : 'Run Test'}
          </button>
          
          {testResults && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Test Results
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`status-indicator ${testResults.blocked ? 'error' : 'healthy'}`}>
                    {testResults.blocked ? 'Blocked' : 'Allowed'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {testResults.summary}
                  </span>
                </div>
                
                {testResults.blocking_reasons && testResults.blocking_reasons.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Blocking Reasons:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {testResults.blocking_reasons.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectorPanel;