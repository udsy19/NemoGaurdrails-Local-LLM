import React, { useState, useEffect } from 'react';
import { detectorsAPI, systemAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const Dashboard = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [detectors, setDetectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statusResponse, detectorsResponse] = await Promise.all([
        systemAPI.getOverallStatus(),
        detectorsAPI.listDetectors()
      ]);
      
      setSystemStatus(statusResponse);
      setDetectors(detectorsResponse.detectors || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const activeDetectors = detectors.filter(d => d.active).length;
  const healthyDetectors = detectors.filter(d => d.loaded).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          AI Safety Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor system status and detector performance
        </p>
      </div>

      {/* Status Cards */}
      <div className="metrics-grid mb-8">
        <div className="metric-card">
          <div className="metric-value">{detectors.length}</div>
          <div className="metric-label">Total Detectors</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value text-success-600">{activeDetectors}</div>
          <div className="metric-label">Active Detectors</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value text-primary-600">{healthyDetectors}</div>
          <div className="metric-label">Healthy Detectors</div>
        </div>
        
        <div className="metric-card">
          <div className={`metric-value ${systemStatus?.chat?.status === 'healthy' ? 'text-success-600' : 'text-danger-600'}`}>
            {systemStatus?.chat?.status === 'healthy' ? '✓' : '✗'}
          </div>
          <div className="metric-label">Chat Service</div>
        </div>
      </div>

      {/* Detector Status */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Detector Status
        </h2>
        
        <div className="space-y-3">
          {detectors.map((detector) => (
            <div key={detector.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {detector.name === 'toxicity' && '⚠️'}
                  {detector.name === 'pii' && '🔒'}
                  {detector.name === 'prompt_injection' && '🛡️'}
                  {detector.name === 'topic' && '📝'}
                  {detector.name === 'fact_check' && '✓'}
                  {detector.name === 'spam' && '🚫'}
                </span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {detector.description}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {detector.name}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`status-indicator ${detector.loaded ? 'healthy' : 'error'}`}>
                  {detector.loaded ? 'Loaded' : 'Error'}
                </span>
                <span className={`status-indicator ${detector.active ? 'healthy' : 'inactive'}`}>
                  {detector.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;