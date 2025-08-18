import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Chat system query hooks for real-time messaging features
 */

// API functions
const fetchChatThreads = async ({ page = 1, limit = 20, search = '' }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await fetch(`/api/chat/threads?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chat threads');
  }
  return response.json();
};

const fetchChatThread = async (threadId) => {
  const response = await fetch(`/api/chat/threads/${threadId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chat thread');
  }
  return response.json();
};

const fetchChatMessages = async ({ threadId, page = 1, limit = 50 }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/chat/threads/${threadId}/messages?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chat messages');
  }
  return response.json();
};

const fetchChatContacts = async () => {
  const response = await fetch('/api/chat/contacts');
  if (!response.ok) {
    throw new Error('Failed to fetch chat contacts');
  }
  return response.json();
};

const fetchChatGroups = async () => {
  const response = await fetch('/api/chat/groups');
  if (!response.ok) {
    throw new Error('Failed to fetch chat groups');
  }
  return response.json();
};

const sendMessage = async ({ threadId, message, attachments = [] }) => {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('threadId', threadId);
  
  attachments.forEach((file, index) => {
    formData.append(`attachments[${index}]`, file);
  });

  const response = await fetch('/api/chat/messages', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  return response.json();
};

const createThread = async ({ participants, isGroup = false, groupName = '' }) => {
  const response = await fetch('/api/chat/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ participants, isGroup, groupName }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create thread');
  }
  return response.json();
};

const markThreadAsRead = async (threadId) => {
  const response = await fetch(`/api/chat/threads/${threadId}/read`, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark thread as read');
  }
  return response.json();
};

const deleteMessage = async (messageId) => {
  const response = await fetch(`/api/chat/messages/${messageId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete message');
  }
  return response.json();
};

const updateMessage = async ({ messageId, updates }) => {
  const response = await fetch(`/api/chat/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update message');
  }
  return response.json();
};

const addParticipantToThread = async ({ threadId, userId }) => {
  const response = await fetch(`/api/chat/threads/${threadId}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add participant');
  }
  return response.json();
};

const removeParticipantFromThread = async ({ threadId, userId }) => {
  const response = await fetch(`/api/chat/threads/${threadId}/participants/${userId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove participant');
  }
  return response.json();
};

const searchMessages = async ({ query, threadId }) => {
  const params = new URLSearchParams({
    query,
    ...(threadId && { threadId }),
  });

  const response = await fetch(`/api/chat/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search messages');
  }
  return response.json();
};

// Query hooks
export const useChatThreads = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['chat', 'threads', filters],
    queryFn: () => fetchChatThreads(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true, // Keep chat threads fresh
    ...options,
  });
};

export const useChatThread = (threadId, options = {}) => {
  return useQuery({
    queryKey: ['chat', 'threads', threadId],
    queryFn: () => fetchChatThread(threadId),
    enabled: !!threadId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useChatMessages = (threadId, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['chat', 'messages', threadId],
    queryFn: ({ pageParam = 1 }) => fetchChatMessages({ threadId, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.pagination?.hasPreviousPage) {
        return firstPage.pagination.currentPage - 1;
      }
      return undefined;
    },
    enabled: !!threadId,
    staleTime: 1000 * 30, // 30 seconds - chat messages should be fresh
    refetchOnWindowFocus: true,
    ...options,
  });
};

export const useChatContacts = (options = {}) => {
  return useQuery({
    queryKey: ['chat', 'contacts'],
    queryFn: fetchChatContacts,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useChatGroups = (options = {}) => {
  return useQuery({
    queryKey: ['chat', 'groups'],
    queryFn: fetchChatGroups,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useSearchMessages = (query, threadId = null, options = {}) => {
  return useQuery({
    queryKey: ['chat', 'search', query, threadId],
    queryFn: () => searchMessages({ query, threadId }),
    enabled: !!query && query.length >= 2, // Only search with at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Helper hook to flatten infinite messages
export const useFlattenedChatMessages = (threadId, options = {}) => {
  const messagesQuery = useChatMessages(threadId, options);
  
  return {
    ...messagesQuery,
    messages: messagesQuery.data?.pages?.flatMap(page => page.messages) ?? [],
    totalCount: messagesQuery.data?.pages?.[0]?.totalCount ?? 0,
  };
};

// Mutation hooks
export const useSendMessage = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ threadId, message, attachments }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', 'messages', threadId] });
      await queryClient.cancelQueries({ queryKey: ['chat', 'threads'] });

      // Snapshot the previous values
      const previousMessages = queryClient.getQueryData(['chat', 'messages', threadId]);
      const previousThreads = queryClient.getQueryData(['chat', 'threads']);

      // Optimistically add the message
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message,
        attachments: attachments?.map(file => ({ name: file.name, type: file.type })) || [],
        createdAt: new Date().toISOString(),
        sender: { id: 'current-user', name: 'You' }, // Replace with actual user data
        isOptimistic: true,
      };

      if (previousMessages) {
        queryClient.setQueryData(['chat', 'messages', threadId], {
          ...previousMessages,
          pages: previousMessages.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                messages: [tempMessage, ...page.messages],
              };
            }
            return page;
          }),
        });
      }

      // Update thread's last message
      if (previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], {
          ...previousThreads,
          threads: previousThreads.threads.map(thread => 
            thread.id === threadId 
              ? { ...thread, lastMessage: tempMessage, updatedAt: new Date().toISOString() }
              : thread
          ),
        });
      }

      return { previousMessages, previousThreads, tempMessage };
    },
    onSuccess: (newMessage, { threadId }, context) => {
      // Replace the optimistic message with the real one
      queryClient.setQueryData(['chat', 'messages', threadId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                messages: page.messages.map(msg => 
                  msg.id === context.tempMessage.id ? newMessage : msg
                ),
              };
            }
            return page;
          }),
        };
      });

      // Update thread with real message
      queryClient.setQueryData(['chat', 'threads'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          threads: oldData.threads.map(thread => 
            thread.id === threadId 
              ? { ...thread, lastMessage: newMessage }
              : thread
          ),
        };
      });
    },
    onError: (err, { threadId }, context) => {
      // Roll back optimistic updates
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', 'messages', threadId], context.previousMessages);
      }
      if (context?.previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], context.previousThreads);
      }
    },
    onSettled: (data, error, { threadId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};

export const useCreateThread = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createThread,
    onSuccess: (newThread) => {
      // Add to the threads list
      queryClient.setQueryData(['chat', 'threads'], (oldData) => {
        if (!oldData) return { threads: [newThread], total: 1 };
        return {
          ...oldData,
          threads: [newThread, ...oldData.threads],
          total: oldData.total + 1,
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['chat', 'groups'] });
    },
    ...options,
  });
};

export const useMarkThreadAsRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markThreadAsRead,
    onMutate: async (threadId) => {
      // Optimistically update the thread
      await queryClient.cancelQueries({ queryKey: ['chat', 'threads'] });
      
      const previousThreads = queryClient.getQueryData(['chat', 'threads']);
      
      if (previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], {
          ...previousThreads,
          threads: previousThreads.threads.map(thread => 
            thread.id === threadId 
              ? { ...thread, unreadCount: 0, isRead: true }
              : thread
          ),
        });
      }
      
      return { previousThreads };
    },
    onError: (err, threadId, context) => {
      // Roll back on error
      if (context?.previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], context.previousThreads);
      }
    },
    onSettled: (data, error, threadId) => {
      // Refetch thread data
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads', threadId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};

export const useDeleteMessage = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: (deletedMessage, messageId) => {
      // Remove message from all relevant thread message lists
      const queryCache = queryClient.getQueryCache();
      const messageQueries = queryCache.findAll(['chat', 'messages']);
      
      messageQueries.forEach(query => {
        const oldData = query.state.data;
        if (oldData?.pages) {
          const updatedData = {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              messages: page.messages.filter(msg => msg.id !== messageId),
            })),
          };
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
    },
    ...options,
  });
};

export const useUpdateMessage = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMessage,
    onSuccess: (updatedMessage, { messageId }) => {
      // Update message across all relevant thread message lists
      const queryCache = queryClient.getQueryCache();
      const messageQueries = queryCache.findAll(['chat', 'messages']);
      
      messageQueries.forEach(query => {
        const oldData = query.state.data;
        if (oldData?.pages) {
          const updatedData = {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              messages: page.messages.map(msg => 
                msg.id === messageId ? updatedMessage : msg
              ),
            })),
          };
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
    },
    ...options,
  });
};

export const useAddParticipant = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addParticipantToThread,
    onSuccess: (updatedThread, { threadId }) => {
      // Update the thread with new participant
      queryClient.setQueryData(['chat', 'threads', threadId], updatedThread);
      
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};

export const useRemoveParticipant = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeParticipantFromThread,
    onSuccess: (updatedThread, { threadId }) => {
      // Update the thread with removed participant
      queryClient.setQueryData(['chat', 'threads', threadId], updatedThread);
      
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};