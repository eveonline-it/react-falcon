import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Email system query hooks
 */

// Type definitions
export interface Email {
  id: string;
  messageId: string;
  subject: string;
  body: string;
  bodyType: 'text' | 'html';
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  folderId: string;
  folderName: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  isDraft: boolean;
  isSent: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  hasReplies: boolean;
  lastReplyAt?: string;
  threadId?: string;
  priority: 'low' | 'normal' | 'high';
  size: number;
  receivedAt: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  isInline: boolean;
  cid?: string;
  downloadUrl: string;
}

export interface EmailFolder {
  id: string;
  name: string;
  displayName: string;
  type: 'system' | 'custom';
  parentId?: string;
  children?: EmailFolder[];
  unreadCount: number;
  totalCount: number;
  isSpecial: boolean;
  specialType?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'starred';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailStats {
  totalEmails: number;
  unreadCount: number;
  starredCount: number;
  importantCount: number;
  draftCount: number;
  sentCount: number;
  trashCount: number;
  spamCount: number;
  storageUsed: number;
  storageLimit: number;
  folderStats: {
    [folderId: string]: {
      totalCount: number;
      unreadCount: number;
    };
  };
}

export interface EmailsResponse {
  emails: Email[];
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EmailFilters {
  folder?: string;
  page?: number;
  limit?: number;
  search?: string;
  unreadOnly?: boolean;
  starredOnly?: boolean;
  hasAttachments?: boolean;
  from?: string;
  to?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SendEmailData {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  bodyType?: 'text' | 'html';
  priority?: 'low' | 'normal' | 'high';
  attachments?: File[];
  isDraft?: boolean;
  scheduleAt?: string;
}

export interface ReplyEmailData {
  emailId: string;
  replyData: {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    body: string;
    bodyType?: 'text' | 'html';
    attachments?: File[];
    replyType: 'reply' | 'reply_all';
  };
}

export interface ForwardEmailData {
  emailId: string;
  forwardData: {
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    body: string;
    bodyType?: 'text' | 'html';
    attachments?: File[];
    includeOriginalAttachments?: boolean;
  };
}

export interface MoveEmailData {
  emailId: string;
  folderId: string;
}

export interface BulkUpdateEmailsData {
  emailIds: string[];
  action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'move' | 'important' | 'not_important';
  data?: {
    folderId?: string;
    [key: string]: any;
  };
}

// API functions
const fetchEmails = async (filters: EmailFilters): Promise<EmailsResponse> => {
  const { folder = 'inbox', page = 1, limit = 20, search = '', unreadOnly = false, ...otherFilters } = filters;
  const params = new URLSearchParams({
    folder,
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(unreadOnly && { unread_only: 'true' }),
  });

  // Add other filters
  Object.entries(otherFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        params.append(key, value.toString());
      } else if (typeof value === 'object' && 'start' in value && 'end' in value) {
        params.append('date_start', value.start);
        params.append('date_end', value.end);
      } else {
        params.append(key, String(value));
      }
    }
  });

  const response = await fetch(`/api/emails?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  return response.json();
};

const fetchEmail = async (emailId: string): Promise<Email> => {
  const response = await fetch(`/api/emails/${emailId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch email');
  }
  return response.json();
};

const fetchEmailFolders = async (): Promise<EmailFolder[]> => {
  const response = await fetch('/api/emails/folders');
  if (!response.ok) {
    throw new Error('Failed to fetch email folders');
  }
  return response.json();
};

const fetchEmailStats = async (): Promise<EmailStats> => {
  const response = await fetch('/api/emails/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch email stats');
  }
  return response.json();
};

const sendEmail = async (emailData: SendEmailData): Promise<Email> => {
  const formData = new FormData();
  
  // Handle basic email data
  formData.append('to', JSON.stringify(emailData.to));
  if (emailData.cc) formData.append('cc', JSON.stringify(emailData.cc));
  if (emailData.bcc) formData.append('bcc', JSON.stringify(emailData.bcc));
  formData.append('subject', emailData.subject);
  formData.append('body', emailData.body);
  formData.append('bodyType', emailData.bodyType || 'html');
  formData.append('priority', emailData.priority || 'normal');
  formData.append('isDraft', String(emailData.isDraft || false));
  
  if (emailData.scheduleAt) {
    formData.append('scheduleAt', emailData.scheduleAt);
  }

  // Handle attachments
  if (emailData.attachments) {
    emailData.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
  }

  const response = await fetch('/api/emails/send', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to send email');
  }
  return response.json();
};

const replyToEmail = async ({ emailId, replyData }: ReplyEmailData): Promise<Email> => {
  const formData = new FormData();
  
  formData.append('to', JSON.stringify(replyData.to));
  if (replyData.cc) formData.append('cc', JSON.stringify(replyData.cc));
  if (replyData.bcc) formData.append('bcc', JSON.stringify(replyData.bcc));
  formData.append('subject', replyData.subject);
  formData.append('body', replyData.body);
  formData.append('bodyType', replyData.bodyType || 'html');
  formData.append('replyType', replyData.replyType);

  if (replyData.attachments) {
    replyData.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
  }

  const response = await fetch(`/api/emails/${emailId}/reply`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to reply to email');
  }
  return response.json();
};

const forwardEmail = async ({ emailId, forwardData }: ForwardEmailData): Promise<Email> => {
  const formData = new FormData();
  
  formData.append('to', JSON.stringify(forwardData.to));
  if (forwardData.cc) formData.append('cc', JSON.stringify(forwardData.cc));
  if (forwardData.bcc) formData.append('bcc', JSON.stringify(forwardData.bcc));
  formData.append('subject', forwardData.subject);
  formData.append('body', forwardData.body);
  formData.append('bodyType', forwardData.bodyType || 'html');
  formData.append('includeOriginalAttachments', String(forwardData.includeOriginalAttachments || false));

  if (forwardData.attachments) {
    forwardData.attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });
  }

  const response = await fetch(`/api/emails/${emailId}/forward`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to forward email');
  }
  return response.json();
};

const markEmailAsRead = async (emailId: string): Promise<{ success: boolean; email: Email }> => {
  const response = await fetch(`/api/emails/${emailId}/read`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark email as read');
  }
  return response.json();
};

const markEmailAsUnread = async (emailId: string): Promise<{ success: boolean; email: Email }> => {
  const response = await fetch(`/api/emails/${emailId}/unread`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to mark email as unread');
  }
  return response.json();
};

const moveEmailToFolder = async ({ emailId, folderId }: MoveEmailData): Promise<Email> => {
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

const deleteEmail = async (emailId: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/emails/${emailId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete email');
  }
  return response.json();
};

const starEmail = async (emailId: string): Promise<{ success: boolean; email: Email }> => {
  const response = await fetch(`/api/emails/${emailId}/star`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to star email');
  }
  return response.json();
};

const unstarEmail = async (emailId: string): Promise<{ success: boolean; email: Email }> => {
  const response = await fetch(`/api/emails/${emailId}/unstar`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to unstar email');
  }
  return response.json();
};

const bulkUpdateEmails = async ({ emailIds, action, data = {} }: BulkUpdateEmailsData): Promise<{ success: boolean; updatedCount: number }> => {
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
export const useEmails = (
  filters: EmailFilters = {},
  options: Omit<UseQueryOptions<EmailsResponse, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['emails', 'list', filters],
    queryFn: () => fetchEmails(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useInfiniteEmails = (
  filters: Omit<EmailFilters, 'page'> = {},
  options: Omit<UseInfiniteQueryOptions<EmailsResponse, Error>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['emails', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchEmails({ ...filters, page: pageParam as number }),
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

export const useEmail = (
  emailId: string | undefined,
  options: Omit<UseQueryOptions<Email, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['emails', emailId],
    queryFn: () => fetchEmail(emailId!),
    enabled: !!emailId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useEmailFolders = (
  options: Omit<UseQueryOptions<EmailFolder[], Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['emails', 'folders'],
    queryFn: fetchEmailFolders,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useEmailStats = (
  options: Omit<UseQueryOptions<EmailStats, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['emails', 'stats'],
    queryFn: fetchEmailStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Mutation hooks
export const useSendEmail = (
  options: Omit<UseMutationOptions<Email, Error, SendEmailData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendEmail,
    onSuccess: (sentEmail) => {
      // Add to sent folder
      queryClient.setQueryData(
        ['emails', 'list', { folder: 'sent' }],
        (oldData: EmailsResponse | undefined) => {
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

export const useReplyToEmail = (
  options: Omit<UseMutationOptions<Email, Error, ReplyEmailData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replyToEmail,
    onSuccess: (sentReply, { emailId }) => {
      // Add to sent folder
      queryClient.setQueryData(
        ['emails', 'list', { folder: 'sent' }],
        (oldData: EmailsResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            emails: [sentReply, ...oldData.emails],
            total: oldData.total + 1,
          };
        }
      );

      // Update the original email's reply status
      queryClient.setQueryData<Email>(['emails', emailId], (oldEmail: Email | undefined) => {
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

export const useForwardEmail = (
  options: Omit<UseMutationOptions<Email, Error, ForwardEmailData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forwardEmail,
    onSuccess: (forwardedEmail) => {
      // Add to sent folder
      queryClient.setQueryData(
        ['emails', 'list', { folder: 'sent' }],
        (oldData: EmailsResponse | undefined) => {
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

export const useMarkEmailAsRead = (
  options: Omit<UseMutationOptions<{ success: boolean; email: Email }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markEmailAsRead,
    onMutate: async (emailId: string) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData<Email>(['emails', emailId]);
      
      if (previousEmail && !previousEmail.isRead) {
        queryClient.setQueryData<Email>(['emails', emailId], { ...previousEmail, isRead: true });
      }
      
      return { previousEmail };
    },
    onError: (_err: Error, emailId: string, context: unknown) => {
      const ctx = context as { previousEmail: Email } | undefined;
      // Roll back on error
      if (ctx?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], ctx.previousEmail);
      }
    },
    onSettled: (_data: { success: boolean; email: Email } | undefined, _error: Error | null, emailId: string) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useMarkEmailAsUnread = (
  options: Omit<UseMutationOptions<{ success: boolean; email: Email }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markEmailAsUnread,
    onMutate: async (emailId: string) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData<Email>(['emails', emailId]);
      
      if (previousEmail && previousEmail.isRead) {
        queryClient.setQueryData<Email>(['emails', emailId], { ...previousEmail, isRead: false });
      }
      
      return { previousEmail };
    },
    onError: (_err: Error, emailId: string, context: unknown) => {
      const ctx = context as { previousEmail: Email } | undefined;
      // Roll back on error
      if (ctx?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], ctx.previousEmail);
      }
    },
    onSettled: (_data: { success: boolean; email: Email } | undefined, _error: Error | null, emailId: string) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
    },
    ...options,
  });
};

export const useMoveEmailToFolder = (
  options: Omit<UseMutationOptions<Email, Error, MoveEmailData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveEmailToFolder,
    onSuccess: (updatedEmail, { emailId }) => {
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

export const useDeleteEmail = (
  options: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmail,
    onSuccess: (_deletedEmail: { success: boolean; message: string }, emailId: string) => {
      // Remove from all email lists
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'stats'] });
      
      // Remove the specific email query
      queryClient.removeQueries({ queryKey: ['emails', emailId] });
    },
    ...options,
  });
};

export const useStarEmail = (
  options: Omit<UseMutationOptions<{ success: boolean; email: Email }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: starEmail,
    onMutate: async (emailId: string) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData<Email>(['emails', emailId]);
      
      if (previousEmail) {
        queryClient.setQueryData<Email>(['emails', emailId], { ...previousEmail, isStarred: true });
      }
      
      return { previousEmail };
    },
    onError: (_err: Error, emailId: string, context: unknown) => {
      const ctx = context as { previousEmail: Email } | undefined;
      // Roll back on error
      if (ctx?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], ctx.previousEmail);
      }
    },
    onSettled: (_data: { success: boolean; email: Email } | undefined, _error: Error | null, emailId: string) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
    },
    ...options,
  });
};

export const useUnstarEmail = (
  options: Omit<UseMutationOptions<{ success: boolean; email: Email }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unstarEmail,
    onMutate: async (emailId: string) => {
      // Optimistically update the email
      await queryClient.cancelQueries({ queryKey: ['emails', emailId] });
      
      const previousEmail = queryClient.getQueryData<Email>(['emails', emailId]);
      
      if (previousEmail) {
        queryClient.setQueryData<Email>(['emails', emailId], { ...previousEmail, isStarred: false });
      }
      
      return { previousEmail };
    },
    onError: (_err: Error, emailId: string, context: unknown) => {
      const ctx = context as { previousEmail: Email } | undefined;
      // Roll back on error
      if (ctx?.previousEmail) {
        queryClient.setQueryData(['emails', emailId], ctx.previousEmail);
      }
    },
    onSettled: (_data: { success: boolean; email: Email } | undefined, _error: Error | null, emailId: string) => {
      // Refetch email and update lists
      queryClient.invalidateQueries({ queryKey: ['emails', emailId] });
      queryClient.invalidateQueries({ queryKey: ['emails', 'list'] });
    },
    ...options,
  });
};

export const useBulkUpdateEmails = (
  options: Omit<UseMutationOptions<{ success: boolean; updatedCount: number }, Error, BulkUpdateEmailsData>, 'mutationFn'> = {}
) => {
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