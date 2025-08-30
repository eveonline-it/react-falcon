import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Kanban board query hooks for project management features
 */

// Type definitions
export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  labels?: string[];
  assignedTo?: string[];
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  boardId: string;
  position: number;
  color?: string;
  wipLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanMember {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface CreateTaskData {
  boardId: string;
  columnId: string;
  task: Omit<KanbanTask, 'id' | 'columnId' | 'position' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateTaskData {
  taskId: string;
  updates: Partial<Omit<KanbanTask, 'id'>>;
}

export interface MoveTaskData {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  position: number;
}

export interface CreateColumnData {
  boardId: string;
  column: Omit<KanbanColumn, 'id' | 'boardId' | 'position' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateColumnData {
  columnId: string;
  updates: Partial<Omit<KanbanColumn, 'id'>>;
}

export interface InviteMemberData {
  boardId: string;
  email: string;
  role?: KanbanMember['role'];
}

export interface BoardData {
  board: KanbanBoard | undefined;
  columns: KanbanColumn[] | undefined;
  tasks: KanbanTask[] | undefined;
  members: KanbanMember[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// API functions
const fetchKanbanBoards = async (): Promise<KanbanBoard[]> => {
  const response = await fetch('/api/kanban/boards');
  if (!response.ok) {
    throw new Error('Failed to fetch kanban boards');
  }
  return response.json();
};

const fetchKanbanBoard = async (boardId: string): Promise<KanbanBoard> => {
  const response = await fetch(`/api/kanban/boards/${boardId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch kanban board');
  }
  return response.json();
};

const fetchBoardColumns = async (boardId: string): Promise<KanbanColumn[]> => {
  const response = await fetch(`/api/kanban/boards/${boardId}/columns`);
  if (!response.ok) {
    throw new Error('Failed to fetch board columns');
  }
  return response.json();
};

const fetchBoardTasks = async (boardId: string): Promise<KanbanTask[]> => {
  const response = await fetch(`/api/kanban/boards/${boardId}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch board tasks');
  }
  return response.json();
};

const createTask = async ({ boardId, columnId, task }: CreateTaskData): Promise<KanbanTask> => {
  const response = await fetch(`/api/kanban/boards/${boardId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...task, columnId }),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
};

const updateTask = async ({ taskId, updates }: UpdateTaskData): Promise<KanbanTask> => {
  const response = await fetch(`/api/kanban/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
};

const moveTask = async ({ taskId, sourceColumnId, destinationColumnId, position }: MoveTaskData): Promise<KanbanTask> => {
  const response = await fetch(`/api/kanban/tasks/${taskId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceColumnId,
      destinationColumnId,
      position,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to move task');
  }
  return response.json();
};

const deleteTask = async (taskId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/kanban/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  return response.json();
};

const createColumn = async ({ boardId, column }: CreateColumnData): Promise<KanbanColumn> => {
  const response = await fetch(`/api/kanban/boards/${boardId}/columns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(column),
  });
  if (!response.ok) {
    throw new Error('Failed to create column');
  }
  return response.json();
};

const updateColumn = async ({ columnId, updates }: UpdateColumnData): Promise<KanbanColumn> => {
  const response = await fetch(`/api/kanban/columns/${columnId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update column');
  }
  return response.json();
};

const deleteColumn = async (columnId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/kanban/columns/${columnId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete column');
  }
  return response.json();
};

const fetchBoardMembers = async (boardId: string): Promise<KanbanMember[]> => {
  const response = await fetch(`/api/kanban/boards/${boardId}/members`);
  if (!response.ok) {
    throw new Error('Failed to fetch board members');
  }
  return response.json();
};

const inviteMember = async ({ boardId, email, role = 'member' }: InviteMemberData): Promise<KanbanMember> => {
  const response = await fetch(`/api/kanban/boards/${boardId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, role }),
  });
  if (!response.ok) {
    throw new Error('Failed to invite member');
  }
  return response.json();
};

// Query hooks
export const useKanbanBoards = (options: Omit<UseQueryOptions<KanbanBoard[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards'],
    queryFn: fetchKanbanBoards,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useKanbanBoard = (boardId: string | undefined, options: Omit<UseQueryOptions<KanbanBoard, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId],
    queryFn: () => fetchKanbanBoard(boardId!),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useBoardColumns = (boardId: string | undefined, options: Omit<UseQueryOptions<KanbanColumn[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId, 'columns'],
    queryFn: () => fetchBoardColumns(boardId!),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useBoardTasks = (boardId: string | undefined, options: Omit<UseQueryOptions<KanbanTask[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId, 'tasks'],
    queryFn: () => fetchBoardTasks(boardId!),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useBoardMembers = (boardId: string | undefined, options: Omit<UseQueryOptions<KanbanMember[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId, 'members'],
    queryFn: () => fetchBoardMembers(boardId!),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Combined query for full board data
export const useBoardData = (boardId: string | undefined, options: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'> = {}): BoardData => {
  const boardQuery = useKanbanBoard(boardId, options);
  const columnsQuery = useBoardColumns(boardId, options);
  const tasksQuery = useBoardTasks(boardId, options);
  const membersQuery = useBoardMembers(boardId, options);

  return {
    board: boardQuery.data,
    columns: columnsQuery.data,
    tasks: tasksQuery.data,
    members: membersQuery.data,
    isLoading: boardQuery.isLoading || columnsQuery.isLoading || tasksQuery.isLoading || membersQuery.isLoading,
    error: boardQuery.error || columnsQuery.error || tasksQuery.error || membersQuery.error,
    refetch: () => {
      boardQuery.refetch();
      columnsQuery.refetch();
      tasksQuery.refetch();
      membersQuery.refetch();
    },
  };
};

// Mutation hooks
export const useCreateTask = (options: Omit<UseMutationOptions<KanbanTask, Error, CreateTaskData>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask: KanbanTask, { boardId }: CreateTaskData) => {
      // Add to the tasks list
      queryClient.setQueryData(
        ['kanban', 'boards', boardId, 'tasks'],
        (oldTasks: KanbanTask[] = []) => [...oldTasks, newTask]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban', 'boards', boardId] });
    },
    ...options,
  });
};

export const useUpdateTask = (options: Omit<UseMutationOptions<KanbanTask, Error, UpdateTaskData>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ taskId, updates }: UpdateTaskData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['kanban'] });

      // Get all board tasks that might contain this task
      const queryCache = queryClient.getQueryCache();
      const taskQueries = queryCache.findAll({ queryKey: ['kanban', 'boards'] });
      
      const snapshots: Array<{ queryKey: readonly unknown[]; data: any }> = [];

      // Optimistically update the task across all board queries
      taskQueries.forEach(query => {
        if (query.queryKey.includes('tasks')) {
          const oldTasks = query.state.data as KanbanTask[] | undefined;
          if (oldTasks) {
            const updatedTasks = oldTasks.map((task: KanbanTask) => 
              task.id === taskId ? { ...task, ...updates } : task
            );
            queryClient.setQueryData(query.queryKey, updatedTasks);
            snapshots.push({ queryKey: [...query.queryKey], data: oldTasks });
          }
        }
      });

      return { snapshots };
    },
    onError: (_err: Error, _variables: UpdateTaskData, context: any) => {
      // Roll back on error
      if (context?.snapshots) {
        context.snapshots.forEach(({ queryKey, data }: { queryKey: readonly unknown[]; data: any }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch all kanban queries
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
    },
    ...options,
  });
};

export const useMoveTask = (options: Omit<UseMutationOptions<KanbanTask, Error, MoveTaskData>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveTask,
    onMutate: async ({ taskId, sourceColumnId, destinationColumnId, position }: MoveTaskData) => {
      // This is complex optimistic update for drag and drop
      // For simplicity, we'll just invalidate queries on success
      return { taskId, sourceColumnId, destinationColumnId, position };
    },
    onSuccess: (_updatedTask: KanbanTask, _variables: MoveTaskData) => {
      // Find the board ID from the task or get it from context
      const queryCache = queryClient.getQueryCache();
      const boardQueries = queryCache.findAll({ queryKey: ['kanban', 'boards'] });
      
      // Invalidate all board-related queries to refresh the state
      boardQueries.forEach(query => {
        if (query.queryKey.includes('tasks') || query.queryKey.includes('columns')) {
          queryClient.invalidateQueries({ queryKey: query.queryKey });
        }
      });
    },
    ...options,
  });
};

export const useDeleteTask = (options: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_deletedTask: { success: boolean }, taskId: string) => {
      // Remove from all board task lists
      const queryCache = queryClient.getQueryCache();
      const taskQueries = queryCache.findAll({ queryKey: ['kanban', 'boards'] });
      
      taskQueries.forEach(query => {
        if (query.queryKey.includes('tasks')) {
          const oldTasks = query.state.data as KanbanTask[] | undefined;
          if (oldTasks) {
            const filteredTasks = oldTasks.filter((task: KanbanTask) => task.id !== taskId);
            queryClient.setQueryData(query.queryKey, filteredTasks);
          }
        }
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
    },
    ...options,
  });
};

export const useCreateColumn = (options: Omit<UseMutationOptions<KanbanColumn, Error, CreateColumnData>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createColumn,
    onSuccess: (newColumn: KanbanColumn, { boardId }: CreateColumnData) => {
      // Add to the columns list
      queryClient.setQueryData(
        ['kanban', 'boards', boardId, 'columns'],
        (oldColumns: KanbanColumn[] = []) => [...oldColumns, newColumn]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban', 'boards', boardId] });
    },
    ...options,
  });
};

export const useUpdateColumn = (options: Omit<UseMutationOptions<KanbanColumn, Error, UpdateColumnData>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateColumn,
    onSuccess: (updatedColumn: KanbanColumn, { columnId }: UpdateColumnData) => {
      // Update column across all board queries that contain it
      const queryCache = queryClient.getQueryCache();
      const columnQueries = queryCache.findAll({ queryKey: ['kanban', 'boards'] });
      
      columnQueries.forEach(query => {
        if (query.queryKey.includes('columns')) {
          const oldColumns = query.state.data as KanbanColumn[] | undefined;
          if (oldColumns) {
            const updatedColumns = oldColumns.map((column: KanbanColumn) => 
              column.id === columnId ? updatedColumn : column
            );
            queryClient.setQueryData(query.queryKey, updatedColumns);
          }
        }
      });
    },
    ...options,
  });
};

export const useDeleteColumn = (options: Omit<UseMutationOptions<{ success: boolean }, Error, string>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteColumn,
    onSuccess: (_deletedColumn: { success: boolean }, columnId: string) => {
      // Remove from all board column lists
      const queryCache = queryClient.getQueryCache();
      const columnQueries = queryCache.findAll({ queryKey: ['kanban', 'boards'] });
      
      columnQueries.forEach(query => {
        if (query.queryKey.includes('columns')) {
          const oldColumns = query.state.data as KanbanColumn[] | undefined;
          if (oldColumns) {
            const filteredColumns = oldColumns.filter((column: KanbanColumn) => column.id !== columnId);
            queryClient.setQueryData(query.queryKey, filteredColumns);
          }
        }
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban'] });
    },
    ...options,
  });
};

export const useInviteMember = (options: Omit<UseMutationOptions<KanbanMember, Error, InviteMemberData>, 'mutationFn'> = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteMember,
    onSuccess: (newMember: KanbanMember, { boardId }: InviteMemberData) => {
      // Add to the members list
      queryClient.setQueryData(
        ['kanban', 'boards', boardId, 'members'],
        (oldMembers: KanbanMember[] = []) => [...oldMembers, newMember]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban', 'boards', boardId] });
    },
    ...options,
  });
};