import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SchedulerStatusResponse,
  SchedulerStatsResponse,
  TaskListResponse,
  TaskResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  ExecutionListResponse,
  BulkOperationRequest,
  BulkOperationResponse,
  ImportTasksRequest,
  ImportTasksResponse,
  TaskQueryParams,
  ExecutionQueryParams,
  TaskControlAction,
  ManualExecutionRequest,
  TaskExecutionResponse
} from 'types/scheduler';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Custom error interface for API errors
interface ApiError extends Error {
  status?: number;
  data?: any;
}

const createApiError = (message: string, status?: number, data?: any): ApiError => {
  const error = new Error(message) as ApiError;
  if (status) error.status = status;
  if (data) error.data = data;
  return error;
};

// API utility functions
const schedulerApi = {
  // Status and stats
  getStatus: async (): Promise<SchedulerStatusResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/scheduler-status`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  getStats: async (): Promise<SchedulerStatsResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/stats`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  // Tasks
  getTasks: async (params: TaskQueryParams = {}): Promise<TaskListResponse> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    const url = queryParams.toString() ? `${API_BASE_URL}/scheduler/tasks?${queryParams.toString()}` : `${API_BASE_URL}/scheduler/tasks`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  createTask: async (taskData: TaskCreateRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  getTask: async (taskId: string): Promise<TaskResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  updateTask: async (taskId: string, taskData: TaskUpdateRequest): Promise<TaskResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
  },

  // Task controls
  enableTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/enable`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
  },

  disableTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/disable`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
  },

  pauseTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/pause`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
  },

  resumeTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/resume`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
  },

  stopTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/stop`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
  },

  executeTask: async (taskId: string, executeParams?: ManualExecutionRequest): Promise<TaskExecutionResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/execute`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(executeParams || {})
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Execute task failed:', {
        taskId,
        status: res.status,
        statusText: res.statusText,
        errorData,
        executeParams: executeParams || {}
      });
      throw createApiError(
        errorData.detail || errorData.message || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },


  // Bulk operations
  bulkOperation: async (operation: BulkOperationRequest): Promise<BulkOperationResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/bulk`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  },

  // Import tasks
  importTasks: async (importData: ImportTasksRequest): Promise<ImportTasksResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/import`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importData)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw createApiError(
        errorData.detail || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        errorData
      );
    }
    
    return res.json();
  }
};

// Query hooks
export const useSchedulerStatus = () => {
  return useQuery<SchedulerStatusResponse, Error>({
    queryKey: ['scheduler', 'status'],
    queryFn: schedulerApi.getStatus,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    retry: (failureCount, error) => {
      // Don't retry on permission errors
      if ((error as ApiError)?.status === 403) return false;
      return failureCount < 3;
    }
  });
};

export const useSchedulerStats = () => {
  return useQuery<SchedulerStatsResponse, Error>({
    queryKey: ['scheduler', 'stats'],
    queryFn: schedulerApi.getStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on permission errors
      if ((error as ApiError)?.status === 403) return false;
      return failureCount < 3;
    }
  });
};

export const useSchedulerTasks = (params: TaskQueryParams = {}) => {
  return useQuery<TaskListResponse, Error>({
    queryKey: ['scheduler', 'tasks', params],
    queryFn: () => schedulerApi.getTasks(params),
    staleTime: 30000 // 30 seconds
  });
};

export const useSchedulerTask = (taskId: string) => {
  return useQuery<TaskResponse, Error>({
    queryKey: ['scheduler', 'task', taskId],
    queryFn: () => schedulerApi.getTask(taskId),
    enabled: !!taskId,
    staleTime: 60000 // 1 minute
  });
};


// Mutation hooks
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TaskResponse, Error, TaskCreateRequest>({
    mutationFn: schedulerApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'stats'] });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TaskResponse, Error, { taskId: string; taskData: TaskUpdateRequest }>({
    mutationFn: ({ taskId, taskData }) => schedulerApi.updateTask(taskId, taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'task', variables.taskId] });
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: schedulerApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'stats'] });
    }
  });
};

export const useTaskControl = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TaskExecutionResponse | void, Error, { action: TaskControlAction; taskId: string; executeParams?: ManualExecutionRequest }>({
    mutationFn: ({ action, taskId, executeParams }) => {
      switch (action) {
        case 'enable':
          return schedulerApi.enableTask(taskId);
        case 'disable':
          return schedulerApi.disableTask(taskId);
        case 'pause':
          return schedulerApi.pauseTask(taskId);
        case 'resume':
          return schedulerApi.resumeTask(taskId);
        case 'stop':
          return schedulerApi.stopTask(taskId);
        case 'execute':
          return schedulerApi.executeTask(taskId, executeParams);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'stats'] });
      if (variables.action === 'execute') {
        queryClient.invalidateQueries({ queryKey: ['scheduler', 'executions'] });
      }
    }
  });
};

export const useBulkTaskOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BulkOperationResponse, Error, BulkOperationRequest>({
    mutationFn: schedulerApi.bulkOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'stats'] });
    }
  });
};

export const useImportTasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ImportTasksResponse, Error, ImportTasksRequest>({
    mutationFn: schedulerApi.importTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'stats'] });
    }
  });
};