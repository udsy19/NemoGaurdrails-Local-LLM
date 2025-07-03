import React, { useState, useRef, useEffect } from 'react';

const InputBox = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="input-field resize-none min-h-[44px] max-h-[120px]"
          rows={1}
        />
      </div>
      
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="btn-primary flex items-center justify-center min-w-[44px] h-[44px]"
      >
        {disabled ? (
          <div className="loading-spinner h-4 w-4"></div>
        ) : (
          <span className="text-lg">➤</span>
        )}
      </button>
    </form>
  );
};

export default InputBox;