/**
 * Scheduler API Response Types
 * Based on OpenAPI specification from https://go.eveonline.it/openapi.json
 */

// Base response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Scheduler Status Response
export interface SchedulerStatusResponse {
  status: 'running' | 'stopped' | 'error';
  engine: boolean;
  version?: string;
  uptime?: number;
  last_heartbeat?: string;
}

// Scheduler Stats Response
export interface SchedulerStatsResponse {
  active_tasks: number;
  total_tasks: number;
  total_executions: number;
  failed_tasks: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time?: number;
  last_execution?: string;
}

// Task Response Schema
export interface TaskResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  schedule: string;
  status: 'running' | 'paused' | 'disabled' | 'failed' | 'completed';
  enabled: boolean;
  parameters: Record<string, any>;
  max_retries: number;
  timeout: number;
  priority: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_run?: string;
  next_run?: string;
  last_execution_status?: 'success' | 'failed' | 'timeout' | 'cancelled';
  error_message?: string;
}

// Task Create Request
export interface TaskCreateRequest {
  name: string;
  description?: string;
  type: string;
  schedule: string;
  parameters?: Record<string, any>;
  enabled?: boolean;
  max_retries?: number;
  timeout?: number;
  priority?: number;
  tags?: string[];
}

// Task Update Request
export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  // All fields from TaskCreateRequest are optional for updates
}

// Task List Response
export interface TaskListResponse {
  tasks: TaskResponse[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
  filters_applied: {
    status?: string;
    type?: string;
    enabled?: boolean;
    tags?: string[];
  };
}

// Task Control Request
export interface TaskControlRequest {
  action: 'enable' | 'disable' | 'pause' | 'resume' | 'execute';
  parameters?: Record<string, any>;
}

// Execution Response
export interface ExecutionResponse {
  id: string;
  task_id: string;
  status: 'success' | 'failed' | 'running' | 'timeout' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration?: number;
  result?: any;
  error_message?: string;
  retry_count: number;
  parameters_used?: Record<string, any>;
}

// Execution List Response
export interface ExecutionListResponse {
  executions: ExecutionResponse[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
  filters_applied: {
    status?: string;
    task_id?: string;
    start_date?: string;
    end_date?: string;
  };
}

// Bulk Operation Request
export interface BulkOperationRequest {
  operation: 'enable' | 'disable' | 'pause' | 'resume' | 'delete';
  task_ids: string[];
  parameters?: Record<string, any>;
}

// Bulk Operation Response
export interface BulkOperationResponse {
  operation: string;
  total_requested: number;
  successful_count: number;
  failed_count: number;
  results: Array<{
    task_id: string;
    success: boolean;
    error?: string;
  }>;
}

// Import Tasks Request
export interface ImportTasksRequest {
  tasks: TaskCreateRequest[];
  replace_existing?: boolean;
  dry_run?: boolean;
}

// Import Tasks Response
export interface ImportTasksResponse {
  imported_count: number;
  skipped_count: number;
  error_count: number;
  results: Array<{
    task_name: string;
    status: 'imported' | 'skipped' | 'error';
    task_id?: string;
    error?: string;
  }>;
}

// Query Parameters
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  enabled?: boolean;
  tags?: string[];
  search?: string;
}

export interface ExecutionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  task_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface TaskHistoryQueryParams extends ExecutionQueryParams {
  // Same as ExecutionQueryParams but used specifically for task history
}

// Error Response
export interface SchedulerErrorResponse {
  detail: string;
  error_code?: string;
  validation_errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Task Types Enum
export type TaskType = 
  | 'data_sync'
  | 'cleanup' 
  | 'backup'
  | 'report'
  | 'maintenance'
  | 'notification'
  | 'custom';

// Task Status Enum
export type TaskStatus = 
  | 'running'
  | 'paused'
  | 'disabled'
  | 'failed'
  | 'completed';

// Execution Status Enum  
export type ExecutionStatus = 
  | 'success'
  | 'failed'
  | 'running'
  | 'timeout'
  | 'cancelled';

// Task Control Actions Enum
export type TaskControlAction = 
  | 'enable'
  | 'disable'
  | 'pause'
  | 'resume'
  | 'execute';