import { STORAGE_KEYS, THEME, DETECTOR_TYPES, DETECTOR_CONFIG } from './constants';

// Theme utilities
export const themeUtils = {
  getTheme: () => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || THEME.DARK;
  },
  
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.toggle('dark', theme === THEME.DARK);
  },
  
  initTheme: () => {
    const savedTheme = themeUtils.getTheme();
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME.DARK : THEME.LIGHT;
    const actualTheme = savedTheme === THEME.SYSTEM ? systemTheme : savedTheme;
    
    document.documentElement.classList.toggle('dark', actualTheme === THEME.DARK);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (themeUtils.getTheme() === THEME.SYSTEM) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    });
  },
  
  toggleTheme: () => {
    const currentTheme = themeUtils.getTheme();
    const newTheme = currentTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    themeUtils.setTheme(newTheme);
    return newTheme;
  }
};

// Local storage utilities
export const storageUtils = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Format utilities
export const formatUtils = {
  timestamp: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  },
  
  timeAgo: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatUtils.timestamp(date, { year: 'numeric', month: 'short', day: 'numeric' });
  },
  
  number: (num, options = {}) => {
    const defaultOptions = {
      maximumFractionDigits: 2,
      ...options
    };
    
    return new Intl.NumberFormat('en-US', defaultOptions).format(num);
  },
  
  percentage: (num, options = {}) => {
    const defaultOptions = {
      style: 'percent',
      maximumFractionDigits: 1,
      ...options
    };
    
    return new Intl.NumberFormat('en-US', defaultOptions).format(num);
  },
  
  bytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },
  
  truncateText: (text, maxLength = 100, suffix = '...') => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },
  
  capitalizeFirst: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  camelToTitle: (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
};

// Validation utilities
export const validationUtils = {
  isEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  isJson: (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  },
  
  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
  
  isInRange: (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }
};

// Detector utilities
export const detectorUtils = {
  getDetectorInfo: (detectorType) => {
    return DETECTOR_CONFIG[detectorType] || null;
  },
  
  formatDetectorName: (detectorType) => {
    const info = detectorUtils.getDetectorInfo(detectorType);
    return info ? info.name : formatUtils.camelToTitle(detectorType);
  },
  
  getDetectorIcon: (detectorType) => {
    const info = detectorUtils.getDetectorInfo(detectorType);
    return info ? info.icon : '🔍';
  },
  
  getDetectorColor: (detectorType) => {
    const info = detectorUtils.getDetectorInfo(detectorType);
    return info ? info.color : 'gray';
  },
  
  parseDetectionResult: (result) => {
    if (!result || !result.result) return null;
    
    const { detector, result: detectionData } = result;
    
    switch (detector) {
      case DETECTOR_TYPES.TOXICITY:
        return {
          type: 'toxicity',
          blocked: detectionData.is_toxic,
          score: detectionData.confidence,
          details: detectionData.scores
        };
      
      case DETECTOR_TYPES.PII:
        return {
          type: 'pii',
          blocked: detectionData.has_pii,
          score: detectionData.has_pii ? 1 : 0,
          details: {
            entities: detectionData.entities,
            patterns: detectionData.patterns
          }
        };
      
      case DETECTOR_TYPES.PROMPT_INJECTION:
        return {
          type: 'prompt_injection',
          blocked: detectionData.is_injection,
          score: detectionData.confidence,
          details: detectionData.matched_patterns
        };
      
      case DETECTOR_TYPES.TOPIC:
        return {
          type: 'topic',
          blocked: detectionData.has_restricted_topic,
          score: detectionData.max_similarity,
          details: detectionData.similarities
        };
      
      case DETECTOR_TYPES.FACT_CHECK:
        return {
          type: 'fact_check',
          blocked: false, // Fact check doesn't block, just warns
          score: detectionData.confidence,
          needsFactCheck: detectionData.needs_fact_check,
          details: detectionData.factual_claims
        };
      
      case DETECTOR_TYPES.SPAM:
        return {
          type: 'spam',
          blocked: detectionData.is_spam,
          score: detectionData.confidence,
          details: detectionData.spam_indicators
        };
      
      default:
        return {
          type: 'unknown',
          blocked: false,
          score: 0,
          details: detectionData
        };
    }
  },
  
  summarizeResults: (results) => {
    if (!results) return { blocked: false, issues: [], warnings: [] };
    
    const issues = [];
    const warnings = [];
    let anyBlocked = false;
    
    Object.values(results).forEach(result => {
      const parsed = detectorUtils.parseDetectionResult(result);
      if (!parsed) return;
      
      if (parsed.blocked) {
        anyBlocked = true;
        issues.push({
          type: parsed.type,
          score: parsed.score,
          message: `${detectorUtils.formatDetectorName(parsed.type)} detected`
        });
      } else if (parsed.needsFactCheck) {
        warnings.push({
          type: parsed.type,
          score: parsed.score,
          message: 'Content may need fact-checking'
        });
      } else if (parsed.score > 0.5) {
        warnings.push({
          type: parsed.type,
          score: parsed.score,
          message: `Potential ${parsed.type} detected`
        });
      }
    });
    
    return { blocked: anyBlocked, issues, warnings };
  }
};

// UI utilities
export const uiUtils = {
  classNames: (...classes) => {
    return classes.filter(Boolean).join(' ');
  },
  
  getStatusClass: (status) => {
    const statusMap = {
      healthy: 'status-indicator healthy',
      warning: 'status-indicator warning',
      error: 'status-indicator error',
      inactive: 'status-indicator inactive'
    };
    
    return statusMap[status] || statusMap.inactive;
  },
  
  getButtonClass: (variant = 'primary', size = 'normal') => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      success: 'btn-success',
      warning: 'btn-warning',
      danger: 'btn-danger'
    };
    
    const sizes = {
      small: 'px-3 py-1 text-sm',
      normal: 'px-4 py-2',
      large: 'px-6 py-3 text-lg'
    };
    
    return `${variants[variant]} ${sizes[size]}`;
  },
  
  scrollToBottom: (element) => {
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  },
  
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },
  
  downloadFile: (content, filename, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
  
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },
  
  isImageFile: (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(uiUtils.getFileExtension(filename));
  }
};

// Async utilities
export const asyncUtils = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  retry: async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await asyncUtils.delay(delay * (i + 1));
      }
    }
  },
  
  timeout: (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), ms)
      )
    ]);
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// URL utilities
export const urlUtils = {
  getQueryParams: () => {
    return new URLSearchParams(window.location.search);
  },
  
  setQueryParam: (key, value) => {
    const params = urlUtils.getQueryParams();
    params.set(key, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  },
  
  removeQueryParam: (key) => {
    const params = urlUtils.getQueryParams();
    params.delete(key);
    const search = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
  },
  
  buildUrl: (base, params = {}) => {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }
};

// Export all utilities
const helpers = {
  themeUtils,
  storageUtils,
  formatUtils,
  validationUtils,
  detectorUtils,
  uiUtils,
  asyncUtils,
  urlUtils
};

export default helpers;