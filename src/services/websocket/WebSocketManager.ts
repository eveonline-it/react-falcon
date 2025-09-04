import { EventEmitter } from 'events';

export interface WSMessage {
  type: 'message' | 'presence' | 'notification' | 'system' | 'room_update' | 'error' | 
        'user_profile_update' | 'group_membership_change' | 'system_notification' | 
        'custom_event' | 'heartbeat' | 'room_joined' | 'room_left' |
        'backend_status' | 'critical_alert' | 'service_recovery';  // Broadcast message types
  room?: string;
  from?: string;
  to?: string;
  data: any;
  timestamp?: number;
  id?: string;
}

interface WSConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
}

interface RoomSubscription {
  room: string;
  joinedAt: number;
  lastActivity?: number;
}

export enum ConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

class WebSocketManager extends EventEmitter {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private config: WSConfig;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectTimer: number | null = null;
  private reconnectDelay: number = 1000;
  private heartbeatTimer: number | null = null;
  private messageQueue: WSMessage[] = [];
  private rooms: Map<string, RoomSubscription> = new Map();
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timeout: number }> = new Map();
  private userId: string | null = null;

  private constructor(config: WSConfig) {
    super();
    this.config = {
      reconnectInterval: 1000,
      maxReconnectDelay: 30000,
      heartbeatInterval: 30000,
      messageTimeout: 10000,
      ...config
    };
  }

  public static getInstance(config?: WSConfig): WebSocketManager {
    if (!WebSocketManager.instance && config) {
      WebSocketManager.instance = new WebSocketManager(config);
    }
    if (!WebSocketManager.instance) {
      throw new Error('WebSocketManager must be initialized with config first');
    }
    return WebSocketManager.instance;
  }

  public connect(userId?: string): Promise<void> {
    if (userId) {
      this.userId = userId;
    }

    return new Promise((resolve, reject) => {
      if (this.state === ConnectionState.CONNECTED) {
        resolve();
        return;
      }

      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        this.once('connected', resolve);
        this.once('error', reject);
        return;
      }

      this.disconnect();
      
      try {
        // Create WebSocket connection
        // Browser automatically sends cookies (including falcon_auth_token)
        // Backend should authenticate using the secure HttpOnly cookie
        this.ws = new WebSocket(this.config.url);
        
        this.state = ConnectionState.CONNECTING;
        this.emit('stateChange', this.state);

        this.ws.onopen = () => {
          console.log('🚀 WebSocket connection established successfully:', this.config.url);
          
          this.state = ConnectionState.CONNECTED;
          this.reconnectDelay = this.config.reconnectInterval || 1000;
          this.emit('stateChange', this.state);
          this.emit('connected');
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Rejoin rooms
          this.rejoinRooms();
          
          // Process queued messages
          this.processMessageQueue();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          this.state = ConnectionState.ERROR;
          this.emit('stateChange', this.state);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.state = ConnectionState.DISCONNECTED;
          this.emit('stateChange', this.state);
          this.emit('disconnected');
          this.stopHeartbeat();
          this.scheduleReconnect();
        };
      } catch (error) {
        this.state = ConnectionState.ERROR;
        this.emit('stateChange', this.state);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    
    this.state = ConnectionState.DISCONNECTED;
    this.emit('stateChange', this.state);
    
    // Clear pending messages
    this.pendingMessages.forEach(({ reject }) => {
      reject(new Error('Connection closed'));
    });
    this.pendingMessages.clear();
  }

  public joinRoom(room: string): Promise<void> {
    return this.sendMessage({
      type: 'system',
      data: { action: 'join', room }
    }).then(() => {
      this.rooms.set(room, {
        room,
        joinedAt: Date.now()
      });
      this.emit('roomJoined', room);
    });
  }

  public leaveRoom(room: string): Promise<void> {
    return this.sendMessage({
      type: 'system',
      data: { action: 'leave', room }
    }).then(() => {
      this.rooms.delete(room);
      this.emit('roomLeft', room);
    });
  }

  public sendMessage(message: WSMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      const fullMessage: WSMessage = {
        ...message,
        id: messageId,
        timestamp: Date.now()
      };

      if (this.state !== ConnectionState.CONNECTED) {
        this.messageQueue.push(fullMessage);
        this.once('connected', () => {
          this.sendMessage(message).then(resolve).catch(reject);
        });
        return;
      }

      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.messageQueue.push(fullMessage);
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        this.ws.send(JSON.stringify(fullMessage));
        
        // Set up response timeout
        const timeout = window.setTimeout(() => {
          this.pendingMessages.delete(messageId);
          reject(new Error('Message timeout'));
        }, this.config.messageTimeout);

        this.pendingMessages.set(messageId, { resolve, reject, timeout });
      } catch (error) {
        reject(error);
      }
    });
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  public isInRoom(room: string): boolean {
    return this.rooms.has(room);
  }

  private handleMessage(message: WSMessage): void {
    // Handle acknowledgments
    if (message.id && this.pendingMessages.has(message.id)) {
      const { resolve, timeout } = this.pendingMessages.get(message.id)!;
      clearTimeout(timeout);
      this.pendingMessages.delete(message.id);
      resolve(message);
      return;
    }

    // Handle heartbeat
    if (message.type === 'system' && message.data?.action === 'pong') {
      return;
    }

    // Emit message to appropriate room listeners
    if (message.room) {
      this.emit(`room:${message.room}`, message);
    }

    // Emit general message event
    this.emit('message', message);

    // Handle specific message types
    switch (message.type) {
      case 'presence':
        this.emit('presence', message);
        break;
      case 'notification':
        this.emit('notification', message);
        break;
      case 'error':
        this.emit('error', message.data);
        break;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        this.sendMessage({
          type: 'system',
          data: { action: 'ping' }
        }).catch(() => {
          // Connection lost, will trigger reconnect
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.state = ConnectionState.RECONNECTING;
    this.emit('stateChange', this.state);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => {
        // Reconnect failed, will retry
      });
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 1.5,
      this.config.maxReconnectDelay || 30000
    );
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private rejoinRooms(): void {
    // Backend automatically assigns rooms on connection:
    // - Personal room: user:{user_id}  
    // - Group rooms: group:{group_id} based on user's group memberships
    // No manual room joining required - backend handles this automatically
    console.log('[WebSocket] Connected - backend will auto-assign rooms based on user permissions');
  }

  private processMessageQueue(): void {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(message => {
      this.sendMessage(message).catch(error => {
        console.error('[WebSocket] Failed to send queued message:', error);
      });
    });
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default WebSocketManager;