import React, { useState } from 'react';
import { formatUtils } from '../../utils/helpers';

const MessageBubble = ({ message }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isUser = message.role === 'user';
  const isBlocked = message.blocked;
  const hasWarnings = message.warnings && message.warnings.length > 0;

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${isBlocked ? 'blocked' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {isUser ? '👤 You' : '🤖 Assistant'}
          </span>
          {isBlocked && (
            <span className="status-indicator error">Blocked</span>
          )}
          {hasWarnings && (
            <span className="status-indicator warning">Warnings</span>
          )}
        </div>
        
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatUtils.timeAgo(message.timestamp)}
        </span>
      </div>

      {/* Content */}
      <div className="text-gray-900 dark:text-gray-100 mb-2">
        {message.content}
      </div>

      {/* Blocking reasons */}
      {isBlocked && message.blocking_reasons && (
        <div className="mt-3 p-3 bg-danger-50 dark:bg-danger-900/20 border-l-4 border-danger-500 rounded">
          <div className="text-sm font-medium text-danger-800 dark:text-danger-300 mb-1">
            Message blocked:
          </div>
          <ul className="text-sm text-danger-700 dark:text-danger-400 space-y-1">
            {message.blocking_reasons.map((reason, index) => (
              <li key={index}>• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings && (
        <div className="mt-3 p-3 bg-warning-50 dark:bg-warning-900/20 border-l-4 border-warning-500 rounded">
          <div className="text-sm font-medium text-warning-800 dark:text-warning-300 mb-1">
            Warnings:
          </div>
          <ul className="text-sm text-warning-700 dark:text-warning-400 space-y-1">
            {message.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis details */}
      {message.analysis && (
        <div className="mt-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {showDetails ? '🔽 Hide details' : '▶️ Show analysis details'}
          </button>
          
          {showDetails && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(message.analysis, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;