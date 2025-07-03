import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Authentication required');
          // Handle logout
          localStorage.removeItem('auth_token');
          break;
        case 403:
          toast.error('Access forbidden');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again.');
          break;
        default:
          toast.error(data?.detail || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Chat API
export const chatAPI = {
  sendMessage: async (messageData) => {
    const response = await api.post('/chat/message', messageData);
    return response.data;
  },
  
  getHistory: async (sessionId, limit = 50) => {
    const response = await api.get('/chat/history', {
      params: { session_id: sessionId, limit }
    });
    return response.data;
  },
  
  clearHistory: async (sessionId) => {
    const response = await api.delete(`/chat/history/${sessionId}`);
    return response.data;
  },
  
  updateConfig: async (sessionId, config) => {
    const response = await api.post('/chat/config', {
      session_id: sessionId,
      detector_config: config
    });
    return response.data;
  },
  
  getSessionConfig: async (sessionId) => {
    const response = await api.get(`/chat/config/${sessionId}`);
    return response.data;
  },
  
  getActiveSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },
  
  getSessionStats: async (sessionId) => {
    const response = await api.get(`/chat/stats/${sessionId}`);
    return response.data;
  },
  
  exportHistory: async (sessionId, format = 'json') => {
    const response = await api.post('/chat/export', {
      session_id: sessionId,
      format
    });
    return response.data;
  },
  
  testMessage: async (messageData) => {
    const response = await api.post('/chat/test', messageData);
    return response.data;
  },
  
  processBatch: async (messages, detectorConfig = null) => {
    const response = await api.post('/chat/batch', {
      messages,
      detector_config: detectorConfig
    });
    return response.data;
  },
  
  getHealth: async () => {
    const response = await api.get('/chat/health');
    return response.data;
  }
};

// Detectors API
export const detectorsAPI = {
  listDetectors: async () => {
    const response = await api.get('/detectors/');
    return response.data;
  },
  
  runDetection: async (text, detectors = null, config = null) => {
    const response = await api.post('/detectors/detect', {
      text,
      detectors,
      config
    });
    return response.data;
  },
  
  testDetector: async (detectorName, testText, config = null) => {
    const response = await api.post('/detectors/test', {
      detector_name: detectorName,
      test_text: testText,
      config
    });
    return response.data;
  },
  
  batchDetection: async (texts, detectors = null, config = null) => {
    const response = await api.post('/detectors/batch', {
      texts,
      detectors,
      config
    });
    return response.data;
  },
  
  getActiveDetectors: async () => {
    const response = await api.get('/detectors/active');
    return response.data;
  },
  
  setActiveDetectors: async (detectorNames) => {
    const response = await api.post('/detectors/active', detectorNames);
    return response.data;
  },
  
  updateDetectorConfig: async (detectorName, config) => {
    const response = await api.put('/detectors/config', {
      detector_name: detectorName,
      config
    });
    return response.data;
  },
  
  getDetectorConfig: async (detectorName) => {
    const response = await api.get(`/detectors/config/${detectorName}`);
    return response.data;
  },
  
  reloadDetector: async (detectorName) => {
    const response = await api.post(`/detectors/reload/${detectorName}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/detectors/stats');
    return response.data;
  },
  
  getHealth: async () => {
    const response = await api.get('/detectors/health');
    return response.data;
  },
  
  getPresets: async () => {
    const response = await api.get('/detectors/presets');
    return response.data;
  },
  
  applyPreset: async (presetName) => {
    const response = await api.post(`/detectors/presets/${presetName}`);
    return response.data;
  }
};

// Configuration API
export const configAPI = {
  getSystemConfig: async () => {
    const response = await api.get('/config/');
    return response.data;
  },
  
  updateSystemConfig: async (config) => {
    const response = await api.put('/config/', { config });
    return response.data;
  },
  
  getDetectorConfigs: async () => {
    const response = await api.get('/config/detectors');
    return response.data;
  },
  
  updateDetectorConfig: async (detectorName, config) => {
    const response = await api.put('/config/detectors', {
      detector_name: detectorName,
      config
    });
    return response.data;
  },
  
  getDetectorConfig: async (detectorName) => {
    const response = await api.get(`/config/detectors/${detectorName}`);
    return response.data;
  },
  
  getModelInfo: async () => {
    const response = await api.get('/config/models');
    return response.data;
  },
  
  resetToDefaults: async () => {
    const response = await api.post('/config/reset');
    return response.data;
  },
  
  exportConfig: async (format = 'yaml', includeUserConfigs = true) => {
    const response = await api.post('/config/export', {
      format,
      include_user_configs: includeUserConfigs
    });
    return response.data;
  },
  
  importConfig: async (configData, format = 'yaml') => {
    const response = await api.post('/config/import', {
      config_data: configData,
      format
    });
    return response.data;
  },
  
  importConfigFile: async (file, format = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (format) {
      formData.append('format', format);
    }
    
    const response = await api.post('/config/import/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getSchema: async () => {
    const response = await api.get('/config/schema');
    return response.data;
  },
  
  getHealth: async () => {
    const response = await api.get('/config/health');
    return response.data;
  },
  
  reloadConfig: async () => {
    const response = await api.post('/config/reload');
    return response.data;
  },
  
  getUserConfig: async (userId) => {
    const response = await api.get(`/config/users/${userId}`);
    return response.data;
  },
  
  setUserConfig: async (userId, config) => {
    const response = await api.put(`/config/users/${userId}`, { config });
    return response.data;
  }
};

// System API
export const systemAPI = {
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  
  getOverallStatus: async () => {
    // Get status from all services
    const [chatHealth, detectorsHealth, configHealth] = await Promise.allSettled([
      chatAPI.getHealth(),
      detectorsAPI.getHealth(),
      configAPI.getHealth()
    ]);
    
    return {
      chat: chatHealth.status === 'fulfilled' ? chatHealth.value : { status: 'error', error: chatHealth.reason },
      detectors: detectorsHealth.status === 'fulfilled' ? detectorsHealth.value : { status: 'error', error: detectorsHealth.reason },
      config: configHealth.status === 'fulfilled' ? configHealth.value : { status: 'error', error: configHealth.reason },
      timestamp: new Date().toISOString()
    };
  }
};

// Utility functions
export const apiUtils = {
  handleError: (error, defaultMessage = 'An error occurred') => {
    const message = error.response?.data?.detail || error.message || defaultMessage;
    toast.error(message);
    console.error('API Error:', error);
    return message;
  },
  
  withLoading: async (apiCall, loadingMessage = 'Processing...') => {
    const loadingToast = toast.loading(loadingMessage);
    try {
      const result = await apiCall();
      toast.dismiss(loadingToast);
      return result;
    } catch (error) {
      toast.dismiss(loadingToast);
      throw error;
    }
  },
  
  retryRequest: async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
};

export default api;