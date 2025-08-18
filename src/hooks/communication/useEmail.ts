import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Email system query hooks
 */

// API functions
const fetchEmails = async ({ folder = 'inbox', page = 1, limit = 20, search = '', unreadOnly = false }) => {
  const params = new URLSearchParams({
    folder,
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(unreadOnly && { unread_only: 'true' }),
  });

  const response = await fetch(`/api/emails?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  return response.json();
};

const fetchEmail = async (emailId) => {
  const response = await fetch(`/api/emails/${emailId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch email');
  }
  return response.json();
};

const fetchEmailFolders = async () => {
  const response = await fetch('/api/emails/folders');
  if (!response.ok) {
    throw new Error('Failed to fetch email folders');
  }
  return response.json();
};

const fetchEmailStats = async () => {
  const response = await fetch('/api/emails/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch email stats');
  }
  return response.json();
};

const sendEmail = async (emailData) => {
  const response = await fetch('/api/emails/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });
  if (!response.ok) {
    throw new Error('Failed to send email');
  }
  return response.json();
};

const replyToEmail = async ({ emailId, replyData }) => {
  const response = await fetch(`/api/emails/${emailId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(replyData),
  });
  if (!response.ok) {
    throw new Error('Failed to reply to email');
  }
  return response.json();
};

const forwardEmail = async ({ emailId, forwardData }) => {
  const response = await fetch(`/api/emails/${emailId}/forward`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(forwardData),
  });
  if (!response.ok) {
    throw new Error('Failed to forward email');
  }
  return response.json();
};

const markEmailAsRead = async (emailId) => {
  const response = await fetch(`/api/emails/${emailId}/read`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark email as read');
  }
  return response.json();
};

const markEmailAsUnread = async (emailId) => {
  const response = await fetch(`/api/emails/${emailId}/unread`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark email as unread');
  }
  return response.json();
};

const moveEmailToFolder = async ({ emailId, folderId }) => {
  const response = await fetch(`/api/emails/${emailId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folderId }),
  });
  if (!response.ok) {
    throw new Error('Failed to move email');
  }
  return response.json();
};

const deleteEmail = async (emailId) => {
  const response = await fetch(`/api/emails/${emailId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete email');
  }
  return response.json();
};

const starEmail = async (emailId) => {
  const response = await fetch(`/api/emails/${emailId}/star`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to star email');
  }
  return response.json();
};

const unstarEmail = async (emailId) => {
  const response = await fetch(`/api/emails/${emailId}/unstar`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to unstar email');
  }
  return response.json();
};

const bulkUpdateEmails = async ({ emailIds, action, data = {} }) => {
  const response = await fetch('/api/emails/bulk', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailIds, action, data }),
  });
  if (!response.ok) {
    throw new Error('Failed to bulk update emails');
  }
  return response.json();
};

// Query hooks
export const useEmails = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['emails', 'list', filters],
    queryFn: () => fetchEmails(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useInfiniteEmails = (filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['emails', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchEmails({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useEmail = (emailId, options = {}) => {
  return useQuery({
    queryKey: ['emails', emailId],
    queryFn: () => fetchEmail(emailId),
    enabled: !!emailId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useEmailFolders = (options = {}) => {
  return useQuery({
    queryKey: ['emails', 'folders'],
    queryFn: fetchEmailFolders,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useEmailStats = (options = {}) => {
  return useQuery({
    queryKey: ['emails', 'stats'],
    queryFn: fetchEmailStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Mutation hooks
export const useSendEmail = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendEmail,
    onSuccess: (sentEmail) => {
      // Add to sent folder
      queryClient.setQueryData(
        ['emails', 'list', { folder: 'sent' }],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            emails: [sentEmail, ...oldData.emails],
            total: oldData.total + 1,
          };
        }
      );

      // Invalidate email stats and folders
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'folders'] });
    },
    ...options,
  });
};

export const useReplyToEmail = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replyToEmail,
    onSuccess: (sentReply, { emailId }) => {
      // Add to sent folder
      queryClient.setQueryData(
        ['emails', 'list', { folder: 'sent' }],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            emails: [sentReply, ...oldData.emails],
            total: oldData.total + 1,
          };
        }
      );

      // Update the original email's reply status
      queryClient.setQueryData(['emails', emailId], (oldEmail) => {
        if (!oldEmail) return oldEmail;
        return {
          ...oldEmail,
          hasReplies: true,
          lastReplyAt: new Date().toISOString(),
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useForwardEmail = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forwardEmail,
    onSuccess: (forwardedEmail) => {
      // Add to sent folder
      queryClient.setQueryData(
        ['emails', 'list', { folder: 'sent' }],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            emails: [forwardedEmail, ...oldData.emails],
            total: oldData.total + 1,
          };
        }
      );

      // Invalidate email stats
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useMarkEmailAsRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markEmailAsRead,
    onMutate: async (emailId) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData(['emails', emailId]);
      
      if (previousEmail && !previousEmail.isRead) {
        queryClient.setQueryData(['emails', emailId], { ...previousEmail, isRead: true });
      }
      
      return { previousEmail };
    },
    onError: (err, emailId, context) => {
      // Roll back on error
      if (context?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], context.previousEmail);
      }
    },
    onSettled: (data, error, emailId) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useMarkEmailAsUnread = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markEmailAsUnread,
    onMutate: async (emailId) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData(['emails', emailId]);
      
      if (previousEmail && previousEmail.isRead) {
        queryClient.setQueryData(['emails', emailId], { ...previousEmail, isRead: false });
      }
      
      return { previousEmail };
    },
    onError: (err, emailId, context) => {
      // Roll back on error
      if (context?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], context.previousEmail);
      }
    },
    onSettled: (data, error, emailId) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useMoveEmailToFolder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveEmailToFolder,
    onSuccess: (updatedEmail, { emailId, folderId }) => {
      // Update the email
      queryClient.setQueryData(['emails', emailId], updatedEmail);
      
      // Remove from old folder lists and add to new folder list
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'folders'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useDeleteEmail = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmail,
    onSuccess: (deletedEmail, emailId) => {
      // Remove from all email lists
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
      
      // Remove the specific email query
      queryClient.removeQueries({ queryKey: ['emails', emailId] });
    },
    ...options,
  });
};

export const useStarEmail = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: starEmail,
    onMutate: async (emailId) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData(['emails', emailId]);
      
      if (previousEmail) {
        queryClient.setQueryData(['emails', emailId], { ...previousEmail, isStarred: true });
      }
      
      return { previousEmail };
    },
    onError: (err, emailId, context) => {
      // Roll back on error
      if (context?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], context.previousEmail);
      }
    },
    onSettled: (data, error, emailId) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
    },
    ...options,
  });
};

export const useUnstarEmail = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unstarEmail,
    onMutate: async (emailId) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData(['emails', emailId]);
      
      if (previousEmail) {
        queryClient.setQueryData(['emails', emailId], { ...previousEmail, isStarred: false });
      }
      
      return { previousEmail };
    },
    onError: (err, emailId, context) => {
      // Roll back on error
      if (context?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], context.previousEmail);
      }
    },
    onSettled: (data, error, emailId) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
    },
    ...options,
  });
};

export const useBulkUpdateEmails = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateEmails,
    onSuccess: () => {
      // Invalidate all email-related queries since bulk updates can affect many emails
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    ...options,
  });
};