// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/chat',
  TIMEOUT: 30000,
};

// Application Constants
export const APP_CONFIG = {
  NAME: 'AI Safety System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Local AI Safety System with NeMo Guardrails',
};

// Chat Configuration
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_HISTORY_LENGTH: 100,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  TYPING_INDICATOR_DELAY: 500, // ms
  MESSAGE_RETRY_ATTEMPTS: 3,
};

// Detector Types and Configurations
export const DETECTOR_TYPES = {
  TOXICITY: 'toxicity',
  PII: 'pii',
  PROMPT_INJECTION: 'prompt_injection',
  TOPIC: 'topic',
  FACT_CHECK: 'fact_check',
  SPAM: 'spam',
};

export const DETECTOR_CONFIG = {
  [DETECTOR_TYPES.TOXICITY]: {
    name: 'Toxicity Detection',
    description: 'Detects toxic, harmful, or inappropriate content',
    icon: '⚠️',
    color: 'danger',
    defaultThreshold: 0.7,
    thresholdRange: [0.1, 1.0],
    enabled: true,
  },
  [DETECTOR_TYPES.PII]: {
    name: 'PII Detection',
    description: 'Identifies personally identifiable information',
    icon: '🔒',
    color: 'warning',
    defaultSensitivity: 0.8,
    sensitivityRange: [0.1, 1.0],
    enabled: true,
  },
  [DETECTOR_TYPES.PROMPT_INJECTION]: {
    name: 'Prompt Injection',
    description: 'Detects attempts to manipulate or inject malicious prompts',
    icon: '🛡️',
    color: 'danger',
    defaultThreshold: 0.5,
    thresholdRange: [0.1, 1.0],
    enabled: true,
  },
  [DETECTOR_TYPES.TOPIC]: {
    name: 'Topic Classification',
    description: 'Identifies restricted topics and subject matter',
    icon: '📝',
    color: 'primary',
    defaultThreshold: 0.7,
    thresholdRange: [0.1, 1.0],
    enabled: true,
  },
  [DETECTOR_TYPES.FACT_CHECK]: {
    name: 'Fact Checking',
    description: 'Identifies claims that may need fact-checking',
    icon: '✓',
    color: 'success',
    defaultThreshold: 0.5,
    thresholdRange: [0.1, 1.0],
    enabled: true,
  },
  [DETECTOR_TYPES.SPAM]: {
    name: 'Spam Detection',
    description: 'Detects spam and low-quality content',
    icon: '🚫',
    color: 'warning',
    defaultThreshold: 0.6,
    thresholdRange: [0.1, 1.0],
    enabled: true,
  },
};

// Preset Configurations
export const DETECTOR_PRESETS = {
  STRICT: {
    name: 'Strict',
    description: 'Maximum safety with low tolerance for risk',
    icon: '🔒',
    config: {
      [DETECTOR_TYPES.TOXICITY]: { threshold: 0.5, enabled: true },
      [DETECTOR_TYPES.PII]: { sensitivity: 0.9, enabled: true },
      [DETECTOR_TYPES.PROMPT_INJECTION]: { threshold: 0.3, enabled: true },
      [DETECTOR_TYPES.TOPIC]: { threshold: 0.6, enabled: true },
      [DETECTOR_TYPES.FACT_CHECK]: { threshold: 0.4, enabled: true },
      [DETECTOR_TYPES.SPAM]: { threshold: 0.4, enabled: true },
    },
  },
  BALANCED: {
    name: 'Balanced',
    description: 'Balanced approach between safety and usability',
    icon: '⚖️',
    config: {
      [DETECTOR_TYPES.TOXICITY]: { threshold: 0.7, enabled: true },
      [DETECTOR_TYPES.PII]: { sensitivity: 0.8, enabled: true },
      [DETECTOR_TYPES.PROMPT_INJECTION]: { threshold: 0.5, enabled: true },
      [DETECTOR_TYPES.TOPIC]: { threshold: 0.7, enabled: true },
      [DETECTOR_TYPES.FACT_CHECK]: { threshold: 0.5, enabled: true },
      [DETECTOR_TYPES.SPAM]: { threshold: 0.6, enabled: true },
    },
  },
  PERMISSIVE: {
    name: 'Permissive',
    description: 'More lenient settings for open conversation',
    icon: '🔓',
    config: {
      [DETECTOR_TYPES.TOXICITY]: { threshold: 0.8, enabled: true },
      [DETECTOR_TYPES.PII]: { sensitivity: 0.7, enabled: true },
      [DETECTOR_TYPES.PROMPT_INJECTION]: { threshold: 0.7, enabled: true },
      [DETECTOR_TYPES.TOPIC]: { threshold: 0.8, enabled: true },
      [DETECTOR_TYPES.FACT_CHECK]: { threshold: 0.6, enabled: false },
      [DETECTOR_TYPES.SPAM]: { threshold: 0.7, enabled: true },
    },
  },
  CUSTOM: {
    name: 'Custom',
    description: 'User-defined configuration',
    icon: '⚙️',
    config: {},
  },
};

// Message Types
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error',
};

// Message Status
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  BLOCKED: 'blocked',
  ERROR: 'error',
  PROCESSING: 'processing',
};

// Status Indicators
export const STATUS_TYPES = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  ERROR: 'error',
  INACTIVE: 'inactive',
  LOADING: 'loading',
};

// Color Mappings
export const COLOR_MAP = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-800',
    button: 'btn-primary',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    border: 'border-success-200 dark:border-success-800',
    button: 'btn-success',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    border: 'border-warning-200 dark:border-warning-800',
    button: 'btn-warning',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-danger-900/20',
    text: 'text-danger-600 dark:text-danger-400',
    border: 'border-danger-200 dark:border-danger-800',
    button: 'btn-danger',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    button: 'btn-secondary',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'ai-safety-theme',
  CHAT_HISTORY: 'ai-safety-chat-history',
  USER_PREFERENCES: 'ai-safety-user-preferences',
  DETECTOR_CONFIG: 'ai-safety-detector-config',
  SESSION_ID: 'ai-safety-session-id',
  LAST_ACTIVE: 'ai-safety-last-active',
};

// Theme Configuration
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully',
  CONFIG_UPDATED: 'Configuration updated successfully',
  HISTORY_CLEARED: 'Chat history cleared',
  DETECTOR_UPDATED: 'Detector settings updated',
  PRESET_APPLIED: 'Preset configuration applied',
  EXPORT_COMPLETE: 'Export completed successfully',
  IMPORT_COMPLETE: 'Import completed successfully',
};

// Feature Flags
export const FEATURES = {
  WEBSOCKET_ENABLED: true,
  EXPORT_ENABLED: true,
  IMPORT_ENABLED: true,
  BATCH_PROCESSING: true,
  REAL_TIME_DETECTION: true,
  DARK_MODE: true,
  DEVELOPER_MODE: process.env.NODE_ENV === 'development',
};

// Routes
export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  DETECTORS: '/detectors',
  CONFIG: '/config',
  DASHBOARD: '/dashboard',
  HELP: '/help',
  ABOUT: '/about',
};

// Default Values
export const DEFAULTS = {
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  MESSAGE_LIMIT: 1000,
  DETECTOR_THRESHOLD: 0.7,
  DETECTOR_SENSITIVITY: 0.8,
  THEME: THEME.DARK,
  ANIMATION_ENABLED: true,
  SOUND_ENABLED: false,
  NOTIFICATIONS_ENABLED: true,
};

const constants = {
  API_CONFIG,
  APP_CONFIG,
  CHAT_CONFIG,
  DETECTOR_TYPES,
  DETECTOR_CONFIG,
  DETECTOR_PRESETS,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  STATUS_TYPES,
  COLOR_MAP,
  STORAGE_KEYS,
  THEME,
  ANIMATION,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  ROUTES,
  DEFAULTS,
};

export default constants;