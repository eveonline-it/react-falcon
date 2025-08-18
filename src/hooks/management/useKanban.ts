import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Kanban board query hooks for project management features
 */

// API functions
const fetchKanbanBoards = async () => {
  const response = await fetch('/api/kanban/boards');
  if (!response.ok) {
    throw new Error('Failed to fetch kanban boards');
  }
  return response.json();
};

const fetchKanbanBoard = async (boardId) => {
  const response = await fetch(`/api/kanban/boards/${boardId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch kanban board');
  }
  return response.json();
};

const fetchBoardColumns = async (boardId) => {
  const response = await fetch(`/api/kanban/boards/${boardId}/columns`);
  if (!response.ok) {
    throw new Error('Failed to fetch board columns');
  }
  return response.json();
};

const fetchBoardTasks = async (boardId) => {
  const response = await fetch(`/api/kanban/boards/${boardId}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch board tasks');
  }
  return response.json();
};

const createTask = async ({ boardId, columnId, task }) => {
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

const updateTask = async ({ taskId, updates }) => {
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

const moveTask = async ({ taskId, sourceColumnId, destinationColumnId, position }) => {
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

const deleteTask = async (taskId) => {
  const response = await fetch(`/api/kanban/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  return response.json();
};

const createColumn = async ({ boardId, column }) => {
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

const updateColumn = async ({ columnId, updates }) => {
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

const deleteColumn = async (columnId) => {
  const response = await fetch(`/api/kanban/columns/${columnId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete column');
  }
  return response.json();
};

const fetchBoardMembers = async (boardId) => {
  const response = await fetch(`/api/kanban/boards/${boardId}/members`);
  if (!response.ok) {
    throw new Error('Failed to fetch board members');
  }
  return response.json();
};

const inviteMember = async ({ boardId, email, role = 'member' }) => {
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
export const useKanbanBoards = (options = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards'],
    queryFn: fetchKanbanBoards,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useKanbanBoard = (boardId, options = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId],
    queryFn: () => fetchKanbanBoard(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useBoardColumns = (boardId, options = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId, 'columns'],
    queryFn: () => fetchBoardColumns(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useBoardTasks = (boardId, options = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId, 'tasks'],
    queryFn: () => fetchBoardTasks(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useBoardMembers = (boardId, options = {}) => {
  return useQuery({
    queryKey: ['kanban', 'boards', boardId, 'members'],
    queryFn: () => fetchBoardMembers(boardId),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Combined query for full board data
export const useBoardData = (boardId, options = {}) => {
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
export const useCreateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask, { boardId }) => {
      // Add to the tasks list
      queryClient.setQueryData(
        ['kanban', 'boards', boardId, 'tasks'],
        (oldTasks = []) => [...oldTasks, newTask]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban', 'boards', boardId] });
    },
    ...options,
  });
};

export const useUpdateTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ taskId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['kanban'] });

      // Get all board tasks that might contain this task
      const queryCache = queryClient.getQueryCache();
      const taskQueries = queryCache.findAll(['kanban', 'boards']);
      
      const snapshots = [];

      // Optimistically update the task across all board queries
      taskQueries.forEach(query => {
        if (query.queryKey.includes('tasks')) {
          const oldTasks = query.state.data;
          if (oldTasks) {
            const updatedTasks = oldTasks.map(task => 
              task.id === taskId ? { ...task, ...updates } : task
            );
            queryClient.setQueryData(query.queryKey, updatedTasks);
            snapshots.push({ queryKey: query.queryKey, data: oldTasks });
          }
        }
      });

      return { snapshots };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.snapshots) {
        context.snapshots.forEach(({ queryKey, data }) => {
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

export const useMoveTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveTask,
    onMutate: async ({ taskId, sourceColumnId, destinationColumnId, position }) => {
      // This is complex optimistic update for drag and drop
      // For simplicity, we'll just invalidate queries on success
      return { taskId, sourceColumnId, destinationColumnId, position };
    },
    onSuccess: (updatedTask, variables) => {
      // Find the board ID from the task or get it from context
      const queryCache = queryClient.getQueryCache();
      const boardQueries = queryCache.findAll(['kanban', 'boards']);
      
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

export const useDeleteTask = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (deletedTask, taskId) => {
      // Remove from all board task lists
      const queryCache = queryClient.getQueryCache();
      const taskQueries = queryCache.findAll(['kanban', 'boards']);
      
      taskQueries.forEach(query => {
        if (query.queryKey.includes('tasks')) {
          const oldTasks = query.state.data;
          if (oldTasks) {
            const filteredTasks = oldTasks.filter(task => task.id !== taskId);
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

export const useCreateColumn = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createColumn,
    onSuccess: (newColumn, { boardId }) => {
      // Add to the columns list
      queryClient.setQueryData(
        ['kanban', 'boards', boardId, 'columns'],
        (oldColumns = []) => [...oldColumns, newColumn]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban', 'boards', boardId] });
    },
    ...options,
  });
};

export const useUpdateColumn = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateColumn,
    onSuccess: (updatedColumn, { columnId }) => {
      // Update column across all board queries that contain it
      const queryCache = queryClient.getQueryCache();
      const columnQueries = queryCache.findAll(['kanban', 'boards']);
      
      columnQueries.forEach(query => {
        if (query.queryKey.includes('columns')) {
          const oldColumns = query.state.data;
          if (oldColumns) {
            const updatedColumns = oldColumns.map(column => 
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

export const useDeleteColumn = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteColumn,
    onSuccess: (deletedColumn, columnId) => {
      // Remove from all board column lists
      const queryCache = queryClient.getQueryCache();
      const columnQueries = queryCache.findAll(['kanban', 'boards']);
      
      columnQueries.forEach(query => {
        if (query.queryKey.includes('columns')) {
          const oldColumns = query.state.data;
          if (oldColumns) {
            const filteredColumns = oldColumns.filter(column => column.id !== columnId);
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

export const useInviteMember = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteMember,
    onSuccess: (newMember, { boardId }) => {
      // Add to the members list
      queryClient.setQueryData(
        ['kanban', 'boards', boardId, 'members'],
        (oldMembers = []) => [...oldMembers, newMember]
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['kanban', 'boards', boardId] });
    },
    ...options,
  });
};