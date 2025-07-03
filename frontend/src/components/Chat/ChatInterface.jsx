import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../../services/api';
import { STORAGE_KEYS } from '../../utils/constants';
import { uiUtils } from '../../utils/helpers';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';
import LoadingSpinner from '../Common/LoadingSpinner';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadChatHistory = useCallback(async (sessionId) => {
    try {
      const response = await chatAPI.getHistory(sessionId, 50);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  const initializeChat = useCallback(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, storedSessionId);
    }
    setSessionId(storedSessionId);

    // Load chat history
    loadChatHistory(storedSessionId);
  }, [loadChatHistory]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    uiUtils.scrollToBottom(messagesEndRef.current);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;

    setLoading(true);

    // Add user message to UI
    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message through API
      const response = await chatAPI.sendMessage({
        message: messageText,
        session_id: sessionId,
        detector_config: {}
      });

      // Add assistant response
      const assistantMessage = {
        id: response.message_id || `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp,
        blocked: response.blocked,
        blocking_reasons: response.blocking_reasons || [],
        warnings: response.warnings || [],
        analysis: response.output_analysis
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        blocked: true,
        blocking_reasons: ['System error']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await chatAPI.clearHistory(sessionId);
      setMessages([]);
      
      // Generate new session ID
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const exportHistory = async () => {
    try {
      const response = await chatAPI.exportHistory(sessionId, 'json');
      const filename = `chat_history_${sessionId}.json`;
      uiUtils.downloadFile(JSON.stringify(response, null, 2), filename, 'application/json');
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            AI Safety Chat
          </h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportHistory}
              className="btn-outline btn-sm"
              title="Export chat history"
            >
              📤 Export
            </button>
            <button
              onClick={clearHistory}
              className="btn-outline btn-sm"
              title="Clear chat history"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        
        {sessionId && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Session: {sessionId}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-medium mb-2">Welcome to AI Safety Chat</h3>
            <p>Start a conversation! Your messages will be processed through safety detectors.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {loading && (
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <LoadingSpinner size="small" text="Processing..." />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <InputBox
          onSendMessage={sendMessage}
          disabled={loading}
          placeholder={loading ? "Processing your message..." : "Type your message here..."}
        />
      </div>
    </div>
  );
};

export default ChatInterface;