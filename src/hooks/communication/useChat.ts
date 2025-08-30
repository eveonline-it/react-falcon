import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Chat system query hooks for real-time messaging features
 */

// Type definitions
interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
}

interface ChatMessage {
  id: string;
  message: string;
  attachments?: ChatAttachment[];
  createdAt: string;
  updatedAt?: string;
  sender: ChatUser;
  isOptimistic?: boolean;
  threadId: string;
}

interface ChatAttachment {
  id?: string;
  name: string;
  type: string;
  url?: string;
  size?: number;
}

interface ChatThread {
  id: string;
  participants: ChatUser[];
  isGroup: boolean;
  groupName?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'away' | 'offline';
  lastSeen?: string;
}

interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  participantCount: number;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ChatThreadsResponse {
  threads: ChatThread[];
  total: number;
  pagination?: PaginationInfo;
}

interface ChatMessagesResponse {
  messages: ChatMessage[];
  totalCount: number;
  pagination?: PaginationInfo;
}

interface ChatThreadFilters {
  page?: number;
  limit?: number;
  search?: string;
}

interface ChatMessageFilters {
  threadId: string;
  page?: number;
  limit?: number;
}

interface SendMessageParams {
  threadId: string;
  message: string;
  attachments?: File[];
}

interface CreateThreadParams {
  participants: string[];
  isGroup?: boolean;
  groupName?: string;
}

interface UpdateMessageParams {
  messageId: string;
  updates: Partial<Pick<ChatMessage, 'message'>>;
}

interface ParticipantParams {
  threadId: string;
  userId: string;
}

interface SearchMessagesParams {
  query: string;
  threadId?: string;
}

// API functions
const fetchChatThreads = async ({ page = 1, limit = 20, search = '' }: ChatThreadFilters): Promise<ChatThreadsResponse> => {
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

const fetchChatThread = async (threadId: string): Promise<ChatThread> => {
  const response = await fetch(`/api/chat/threads/${threadId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch chat thread');
  }
  return response.json();
};

const fetchChatMessages = async ({ threadId, page = 1, limit = 50 }: ChatMessageFilters): Promise<ChatMessagesResponse> => {
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

const fetchChatContacts = async (): Promise<ChatContact[]> => {
  const response = await fetch('/api/chat/contacts');
  if (!response.ok) {
    throw new Error('Failed to fetch chat contacts');
  }
  return response.json();
};

const fetchChatGroups = async (): Promise<ChatGroup[]> => {
  const response = await fetch('/api/chat/groups');
  if (!response.ok) {
    throw new Error('Failed to fetch chat groups');
  }
  return response.json();
};

const sendMessage = async ({ threadId, message, attachments = [] }: SendMessageParams): Promise<ChatMessage> => {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('threadId', threadId);
  
  attachments.forEach((file: File, index: number) => {
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

const createThread = async ({ participants, isGroup = false, groupName = '' }: CreateThreadParams): Promise<ChatThread> => {
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

const markThreadAsRead = async (threadId: string): Promise<ChatThread> => {
  const response = await fetch(`/api/chat/threads/${threadId}/read`, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark thread as read');
  }
  return response.json();
};

const deleteMessage = async (messageId: string): Promise<ChatMessage> => {
  const response = await fetch(`/api/chat/messages/${messageId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete message');
  }
  return response.json();
};

const updateMessage = async ({ messageId, updates }: UpdateMessageParams): Promise<ChatMessage> => {
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

const addParticipantToThread = async ({ threadId, userId }: ParticipantParams): Promise<ChatThread> => {
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

const removeParticipantFromThread = async ({ threadId, userId }: ParticipantParams): Promise<ChatThread> => {
  const response = await fetch(`/api/chat/threads/${threadId}/participants/${userId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove participant');
  }
  return response.json();
};

const searchMessages = async ({ query, threadId }: SearchMessagesParams): Promise<ChatMessage[]> => {
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
export const useChatThreads = (filters: ChatThreadFilters = {}, options?: Omit<UseQueryOptions<ChatThreadsResponse, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['chat', 'threads', filters],
    queryFn: () => fetchChatThreads(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true, // Keep chat threads fresh
    ...(options || {}),
  });
};

export const useChatThread = (threadId: string, options?: Omit<UseQueryOptions<ChatThread, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['chat', 'threads', threadId],
    queryFn: () => fetchChatThread(threadId),
    enabled: !!threadId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useChatMessages = (threadId: string, options?: Omit<UseInfiniteQueryOptions<ChatMessagesResponse, Error>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'>) => {
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

export const useChatContacts = (options?: Omit<UseQueryOptions<ChatContact[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['chat', 'contacts'],
    queryFn: fetchChatContacts,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useChatGroups = (options?: Omit<UseQueryOptions<ChatGroup[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['chat', 'groups'],
    queryFn: fetchChatGroups,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useSearchMessages = (query: string, threadId: string | null = null, options?: Omit<UseQueryOptions<ChatMessage[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['chat', 'search', query, threadId],
    queryFn: () => searchMessages({ query, threadId: threadId || undefined }),
    enabled: !!query && query.length >= 2, // Only search with at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Helper hook to flatten infinite messages
export const useFlattenedChatMessages = (threadId: string, options?: Omit<UseInfiniteQueryOptions<ChatMessagesResponse, Error>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'>) => {
  const messagesQuery = useChatMessages(threadId, options);
  
  return {
    ...messagesQuery,
    messages: messagesQuery.data?.pages?.flatMap(page => page.messages) ?? [],
    totalCount: messagesQuery.data?.pages?.[0]?.totalCount ?? 0,
  };
};

// Mutation hooks
export const useSendMessage = (options?: Omit<UseMutationOptions<ChatMessage, Error, SendMessageParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ threadId, message, attachments }: SendMessageParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', 'messages', threadId] });
      await queryClient.cancelQueries({ queryKey: ['chat', 'threads'] });

      // Snapshot the previous values
      const previousMessages = queryClient.getQueryData(['chat', 'messages', threadId]);
      const previousThreads = queryClient.getQueryData(['chat', 'threads']);

      // Optimistically add the message
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        message,
        attachments: attachments?.map(file => ({ name: file.name, type: file.type })) || [],
        createdAt: new Date().toISOString(),
        sender: { id: 'current-user', name: 'You' }, // Replace with actual user data
        isOptimistic: true,
        threadId: threadId,
      };

      if (previousMessages) {
        queryClient.setQueryData(['chat', 'messages', threadId], {
          ...previousMessages,
          pages: (previousMessages as any).pages.map((page: any, index: number) => {
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
          threads: (previousThreads as ChatThreadsResponse).threads.map(thread => 
            thread.id === threadId 
              ? { ...thread, lastMessage: tempMessage, updatedAt: new Date().toISOString() }
              : thread
          ),
        });
      }

      return { previousMessages, previousThreads, tempMessage };
    },
    onSuccess: (newMessage: ChatMessage, { threadId }: SendMessageParams, context: any) => {
      // Replace the optimistic message with the real one
      queryClient.setQueryData(['chat', 'messages', threadId], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any, index: number) => {
            if (index === 0) {
              return {
                ...page,
                messages: page.messages.map((msg: ChatMessage) => 
                  msg.id === context?.tempMessage.id ? newMessage : msg
                ),
              };
            }
            return page;
          }),
        };
      });

      // Update thread with real message
      queryClient.setQueryData(['chat', 'threads'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          threads: oldData.threads.map((thread: ChatThread) => 
            thread.id === threadId 
              ? { ...thread, lastMessage: newMessage }
              : thread
          ),
        };
      });
    },
    onError: (err: Error, { threadId }: SendMessageParams, context: any) => {
      // Roll back optimistic updates
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', 'messages', threadId], context.previousMessages);
      }
      if (context?.previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], context.previousThreads);
      }
    },
    onSettled: (data: ChatMessage | undefined, error: Error | null, { threadId }: SendMessageParams) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', threadId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};

export const useCreateThread = (options?: Omit<UseMutationOptions<ChatThread, Error, CreateThreadParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createThread,
    onSuccess: (newThread: ChatThread) => {
      // Add to the threads list
      queryClient.setQueryData(['chat', 'threads'], (oldData: any) => {
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

export const useMarkThreadAsRead = (options?: Omit<UseMutationOptions<ChatThread, Error, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markThreadAsRead,
    onMutate: async (threadId: string) => {
      // Optimistically update the thread
      await queryClient.cancelQueries({ queryKey: ['chat', 'threads'] });
      
      const previousThreads = queryClient.getQueryData(['chat', 'threads']);
      
      if (previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], {
          ...previousThreads,
          threads: (previousThreads as ChatThreadsResponse).threads.map(thread => 
            thread.id === threadId 
              ? { ...thread, unreadCount: 0, isRead: true }
              : thread
          ),
        });
      }
      
      return { previousThreads };
    },
    onError: (err: Error, threadId: string, context: any) => {
      // Roll back on error
      if (context?.previousThreads) {
        queryClient.setQueryData(['chat', 'threads'], context.previousThreads);
      }
    },
    onSettled: (data: ChatThread | undefined, error: Error | null, threadId: string) => {
      // Refetch thread data
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads', threadId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};

export const useDeleteMessage = (options?: Omit<UseMutationOptions<ChatMessage, Error, string>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: (deletedMessage: ChatMessage, messageId: string) => {
      // Remove message from all relevant thread message lists
      const queryCache = queryClient.getQueryCache();
      const messageQueries = queryCache.findAll(['chat', 'messages']);
      
      messageQueries.forEach(query => {
        const oldData = query.state.data as any;
        if (oldData?.pages) {
          const updatedData = {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.filter((msg: ChatMessage) => msg.id !== messageId),
            })),
          };
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
    },
    ...options,
  });
};

export const useUpdateMessage = (options?: Omit<UseMutationOptions<ChatMessage, Error, UpdateMessageParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMessage,
    onSuccess: (updatedMessage: ChatMessage, { messageId }: UpdateMessageParams) => {
      // Update message across all relevant thread message lists
      const queryCache = queryClient.getQueryCache();
      const messageQueries = queryCache.findAll(['chat', 'messages']);
      
      messageQueries.forEach(query => {
        const oldData = query.state.data as any;
        if (oldData?.pages) {
          const updatedData = {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((msg: ChatMessage) => 
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

export const useAddParticipant = (options?: Omit<UseMutationOptions<ChatThread, Error, ParticipantParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addParticipantToThread,
    onSuccess: (updatedThread: ChatThread, { threadId }: ParticipantParams) => {
      // Update the thread with new participant
      queryClient.setQueryData(['chat', 'threads', threadId], updatedThread);
      
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};

export const useRemoveParticipant = (options?: Omit<UseMutationOptions<ChatThread, Error, ParticipantParams>, 'mutationFn'>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeParticipantFromThread,
    onSuccess: (updatedThread: ChatThread, { threadId }: ParticipantParams) => {
      // Update the thread with removed participant
      queryClient.setQueryData(['chat', 'threads', threadId], updatedThread);
      
      // Invalidate threads list
      queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
    },
    ...options,
  });
};