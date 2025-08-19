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
  TaskControlAction
} from '../types/scheduler';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// API utility functions
const schedulerApi = {
  // Status and stats
  getStatus: async (): Promise<SchedulerStatusResponse> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/status`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
    }
  },

  executeTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/scheduler/tasks/${taskId}/execute`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
    }
  },

  getTaskHistory: async (taskId: string, params: ExecutionQueryParams = {}): Promise<ExecutionListResponse> => {
    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    const url = queryParams 
      ? `${API_BASE_URL}/scheduler/tasks/${taskId}/history?${queryParams}`
      : `${API_BASE_URL}/scheduler/tasks/${taskId}/history`;
    
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
    }
    
    return res.json();
  },

  // Executions
  getExecutions: async (params: ExecutionQueryParams = {}): Promise<ExecutionListResponse> => {
    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    const url = queryParams 
      ? `${API_BASE_URL}/scheduler/executions?${queryParams}`
      : `${API_BASE_URL}/scheduler/executions`;
    
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      const error = new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
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
      if ((error as any)?.status === 403) return false;
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
      if ((error as any)?.status === 403) return false;
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

export const useTaskHistory = (taskId: string, params: ExecutionQueryParams = {}) => {
  return useQuery<ExecutionListResponse, Error>({
    queryKey: ['scheduler', 'task', taskId, 'history', params],
    queryFn: () => schedulerApi.getTaskHistory(taskId, params),
    enabled: !!taskId,
    staleTime: 30000 // 30 seconds
  });
};

export const useSchedulerExecutions = (params: ExecutionQueryParams = {}) => {
  return useQuery<ExecutionListResponse, Error>({
    queryKey: ['scheduler', 'executions', params],
    queryFn: () => schedulerApi.getExecutions(params),
    staleTime: 30000 // 30 seconds
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
  
  return useMutation<void, Error, { action: TaskControlAction; taskId: string }>({
    mutationFn: ({ action, taskId }) => {
      switch (action) {
        case 'enable':
          return schedulerApi.enableTask(taskId);
        case 'disable':
          return schedulerApi.disableTask(taskId);
        case 'pause':
          return schedulerApi.pauseTask(taskId);
        case 'resume':
          return schedulerApi.resumeTask(taskId);
        case 'execute':
          return schedulerApi.executeTask(taskId);
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