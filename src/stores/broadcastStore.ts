import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createDevToolsConfig, createActionLogger, createPerformanceTracker } from './devtools';

// Type definitions
export interface SystemMetrics {
  memory_usage: number;
  cpu_usage: number;
  active_connections: number;
  uptime_formatted: string;
}

export interface ServiceStatus {
  module: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  response_time: string;
  message?: string;
  last_checked: string;
}

export interface Services {
  [serviceName: string]: ServiceStatus;
}

export interface BackendStatusMessage {
  type: 'backend_status';
  overall_status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  system_metrics: SystemMetrics;
  services: Services;
  alerts: string[];
}

export interface CriticalAlertMessage {
  type: 'critical_alert';
  message: string;
}

export interface ServiceRecoveryMessage {
  type: 'service_recovery';
  service: string;
}

export type BroadcastMessage = BackendStatusMessage | CriticalAlertMessage | ServiceRecoveryMessage;

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'recovery';
  message: string;
  timestamp: Date;
}

export interface BroadcastState {
  // Connection state
  isConnected: boolean;
  reconnectAttempts: number;
  lastConnectionTime: Date | null;
  
  // System status
  overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  systemMetrics: SystemMetrics | null;
  services: Services;
  alerts: string[];
  
  // UI state
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export interface BroadcastActions {
  // Connection management
  setConnected: (connected: boolean) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setLastConnectionTime: (time: Date) => void;
  
  // Message handlers
  handleBackendStatus: (data: BackendStatusMessage) => void;
  handleCriticalAlert: (data: CriticalAlertMessage) => void;
  handleServiceRecovery: (data: ServiceRecoveryMessage) => void;
  
  // Notification management
  addNotification: (type: 'info' | 'warning' | 'critical' | 'recovery', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetBroadcastState: () => void;
  
  // Selectors
  getNotificationCount: () => number;
  getCriticalNotifications: () => Notification[];
  getHealthyServicesCount: () => number;
  getUnhealthyServicesCount: () => number;
}

export type BroadcastStore = BroadcastState & BroadcastActions;

const initialState: BroadcastState = {
  // Connection state
  isConnected: false,
  reconnectAttempts: 0,
  lastConnectionTime: null,
  
  // System status
  overallStatus: 'unknown',
  systemMetrics: null,
  services: {},
  alerts: [],
  
  // UI state
  notifications: [],
  isLoading: false,
  error: null,
};

// Development helpers
const actionLogger = createActionLogger('Broadcast Store');
const performanceTracker = createPerformanceTracker('Broadcast Store');

export const useBroadcastStore = create<BroadcastStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Connection management
      setConnected: (connected) => {
        const prevState = get();
        set(
          (state) => ({
            isConnected: connected,
            lastConnectionTime: connected ? new Date() : state.lastConnectionTime,
            error: connected ? null : state.error
          }),
          false,
          'setConnected'
        );
        actionLogger('setConnected', prevState, get());
      },

      incrementReconnectAttempts: () =>
        set(
          (state) => ({
            reconnectAttempts: state.reconnectAttempts + 1
          }),
          false,
          'incrementReconnectAttempts'
        ),

      resetReconnectAttempts: () =>
        set(
          { reconnectAttempts: 0 },
          false,
          'resetReconnectAttempts'
        ),

      setLastConnectionTime: (time) =>
        set(
          { lastConnectionTime: time },
          false,
          'setLastConnectionTime'
        ),

      // Message handlers
      handleBackendStatus: (data) => {
        performanceTracker.start('handleBackendStatus');
        const prevState = get();
        
        set(
          () => ({
            overallStatus: data.overall_status,
            systemMetrics: data.system_metrics,
            services: data.services,
            alerts: data.alerts,
            isLoading: false,
            error: null
          }),
          false,
          'handleBackendStatus'
        );

        // Add notification for status changes (outside the set function to avoid circular calls)
        const currentStatus = data.overall_status;
        if (currentStatus !== 'healthy') {
          setTimeout(() => {
            useBroadcastStore.getState().addNotification('warning', `Backend status: ${currentStatus}`);
          }, 0);
        }

        performanceTracker.end('handleBackendStatus');
        actionLogger('handleBackendStatus', prevState, get());
      },

      handleCriticalAlert: (data) => {
        performanceTracker.start('handleCriticalAlert');
        const prevState = get();
        
        // Add critical notification (outside to avoid circular calls)
        const message = data.message;
        setTimeout(() => {
          useBroadcastStore.getState().addNotification('critical', `CRITICAL: ${message}`);
        }, 0);

        performanceTracker.end('handleCriticalAlert');
        actionLogger('handleCriticalAlert', prevState, get());
      },

      handleServiceRecovery: (data) => {
        performanceTracker.start('handleServiceRecovery');
        const prevState = get();
        
        // Add recovery notification (outside to avoid circular calls)
        const serviceName = data.service;
        setTimeout(() => {
          useBroadcastStore.getState().addNotification('recovery', `${serviceName} service has recovered`);
        }, 0);

        performanceTracker.end('handleServiceRecovery');
        actionLogger('handleServiceRecovery', prevState, get());
      },

      // Notification management
      addNotification: (type, message) => {
        const notification: Notification = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type,
          message,
          timestamp: new Date()
        };

        set(
          (state) => ({
            notifications: [...state.notifications, notification]
          }),
          false,
          'addNotification'
        );

        // Auto-remove notification after 10 seconds
        setTimeout(() => {
          // Use the store directly instead of get() to avoid circular dependencies
          useBroadcastStore.getState().removeNotification(notification.id);
        }, 10000);
      },

      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter(notification => notification.id !== id)
          }),
          false,
          'removeNotification'
        ),

      clearNotifications: () =>
        set(
          { notifications: [] },
          false,
          'clearNotifications'
        ),

      // Utility actions
      setLoading: (loading) =>
        set(
          { isLoading: loading },
          false,
          'setLoading'
        ),

      setError: (error) =>
        set(
          { error, isLoading: false },
          false,
          'setError'
        ),

      clearError: () =>
        set(
          { error: null },
          false,
          'clearError'
        ),

      resetBroadcastState: () =>
        set(
          initialState,
          false,
          'resetBroadcastState'
        ),

      // Selectors (derived state)
      getNotificationCount: () => {
        const state = get();
        return state.notifications.length;
      },

      getCriticalNotifications: () => {
        const state = get();
        return state.notifications.filter(notification => notification.type === 'critical');
      },

      getHealthyServicesCount: () => {
        const state = get();
        return Object.values(state.services).filter(service => service.status === 'healthy').length;
      },

      getUnhealthyServicesCount: () => {
        const state = get();
        return Object.values(state.services).filter(service => 
          service.status === 'unhealthy' || service.status === 'degraded'
        ).length;
      }
    }),
    createDevToolsConfig('broadcast-store')
  )
);

// Export individual action creators for easier testing and usage
export const broadcastActions = {
  setConnected: (connected: boolean) => useBroadcastStore.getState().setConnected(connected),
  incrementReconnectAttempts: () => useBroadcastStore.getState().incrementReconnectAttempts(),
  resetReconnectAttempts: () => useBroadcastStore.getState().resetReconnectAttempts(),
  setLastConnectionTime: (time: Date) => useBroadcastStore.getState().setLastConnectionTime(time),
  handleBackendStatus: (data: BackendStatusMessage) => useBroadcastStore.getState().handleBackendStatus(data),
  handleCriticalAlert: (data: CriticalAlertMessage) => useBroadcastStore.getState().handleCriticalAlert(data),
  handleServiceRecovery: (data: ServiceRecoveryMessage) => useBroadcastStore.getState().handleServiceRecovery(data),
  addNotification: (type: 'info' | 'warning' | 'critical' | 'recovery', message: string) => 
    useBroadcastStore.getState().addNotification(type, message),
  removeNotification: (id: string) => useBroadcastStore.getState().removeNotification(id),
  clearNotifications: () => useBroadcastStore.getState().clearNotifications(),
  setLoading: (loading: boolean) => useBroadcastStore.getState().setLoading(loading),
  setError: (error: string | null) => useBroadcastStore.getState().setError(error),
  clearError: () => useBroadcastStore.getState().clearError(),
  resetBroadcastState: () => useBroadcastStore.getState().resetBroadcastState()
};

// Export selector hooks for easier component usage - simplified to avoid getSnapshot caching issues
export const useBroadcast = () => useBroadcastStore();

// Individual property selectors to avoid object recreation
export const useBroadcastIsConnected = () => useBroadcastStore(state => state.isConnected);
export const useBroadcastReconnectAttempts = () => useBroadcastStore(state => state.reconnectAttempts);
export const useBroadcastLastConnectionTime = () => useBroadcastStore(state => state.lastConnectionTime);
export const useBroadcastOverallStatus = () => useBroadcastStore(state => state.overallStatus);
export const useBroadcastSystemMetrics = () => useBroadcastStore(state => state.systemMetrics);
export const useBroadcastServices = () => useBroadcastStore(state => state.services);
export const useBroadcastAlerts = () => useBroadcastStore(state => state.alerts);
export const useBroadcastNotifications = () => useBroadcastStore(state => state.notifications);
export const useBroadcastLoading = () => useBroadcastStore(state => state.isLoading);
export const useBroadcastError = () => useBroadcastStore(state => state.error);

// Composite selectors using individual selectors
export const useBroadcastConnection = () => ({
  isConnected: useBroadcastIsConnected(),
  reconnectAttempts: useBroadcastReconnectAttempts(),
  lastConnectionTime: useBroadcastLastConnectionTime()
});

export const useBroadcastStatus = () => ({
  overallStatus: useBroadcastOverallStatus(),
  systemMetrics: useBroadcastSystemMetrics(),
  services: useBroadcastServices(),
  alerts: useBroadcastAlerts()
});