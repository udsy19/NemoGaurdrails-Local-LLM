import toast from 'react-hot-toast';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws/chat';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.listeners = new Map();
    this.isConnecting = false;
    this.isManuallyDisconnected = false;
  }
  
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    this.isManuallyDisconnected = false;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Send queued messages
          this.flushMessageQueue();
          
          // Notify listeners
          this.emit('connected');
          
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Attempt to reconnect if not manually disconnected
          if (!this.isManuallyDisconnected && event.code !== 1000) {
            this.attemptReconnect();
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          this.emit('error', error);
          
          reject(error);
        };
        
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  disconnect() {
    this.isManuallyDisconnected = true;
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    // Clear message queue
    this.messageQueue = [];
    
    console.log('WebSocket manually disconnected');
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Unable to establish connection. Please refresh the page.');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }
  
  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      
      // Attempt to connect if not already connecting
      if (!this.isConnecting && !this.isManuallyDisconnected) {
        this.connect().catch((error) => {
          console.error('Failed to connect for queued message:', error);
        });
      }
      
      return false;
    }
  }
  
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }
  
  handleMessage(data) {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'chat_response':
        this.emit('chatResponse', data);
        break;
      case 'detection_result':
        this.emit('detectionResult', data);
        break;
      case 'error':
        this.emit('error', data);
        toast.error(data.message || 'An error occurred');
        break;
      case 'status_update':
        this.emit('statusUpdate', data);
        break;
      default:
        this.emit('message', data);
    }
  }
  
  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }
  
  // Chat-specific methods
  sendChatMessage(message, sessionId, detectorConfig = null) {
    return this.send({
      type: 'chat_message',
      message,
      session_id: sessionId,
      detector_config: detectorConfig,
      timestamp: new Date().toISOString()
    });
  }
  
  requestDetection(text, detectors = null) {
    return this.send({
      type: 'detection_request',
      text,
      detectors,
      timestamp: new Date().toISOString()
    });
  }
  
  // Connection status
  getConnectionStatus() {
    if (!this.ws) {
      return 'disconnected';
    }
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
  
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  // Health check
  ping() {
    if (this.isConnected()) {
      this.send({
        type: 'ping',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Cleanup
  destroy() {
    this.disconnect();
    this.listeners.clear();
    this.messageQueue = [];
  }
}

// Create singleton instance
const wsService = new WebSocketService();

// Auto-connect when service is imported
if (typeof window !== 'undefined') {
  // Connect when the page loads
  window.addEventListener('load', () => {
    wsService.connect().catch(error => {
      console.error('Initial WebSocket connection failed:', error);
    });
  });
  
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !wsService.isConnected()) {
      wsService.connect().catch(error => {
        console.error('Reconnection on visibility change failed:', error);
      });
    }
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    wsService.destroy();
  });
}

export default wsService;