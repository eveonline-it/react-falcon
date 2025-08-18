import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions, InfiniteData, QueryKey } from '@tanstack/react-query';

/**
 * Support Desk specific query hooks
 */

// Types
export interface Ticket {
  id: string | number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerId: string | number;
  customerName: string;
  customerEmail: string;
  assignedTo?: {
    id: string | number;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags?: string[];
  attachments?: {
    id: string | number;
    name: string;
    url: string;
    size: number;
  }[];
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string | number;
  ticketId: string | number;
  content: string;
  authorId: string | number;
  authorName: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: {
    id: string | number;
    name: string;
    url: string;
  }[];
}

export interface TicketFilters {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  page?: number;
  limit?: number;
  search?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  averageResolutionTime: number;
  satisfactionScore: number;
}

export interface Contact {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  department?: string;
  totalTickets: number;
  openTickets: number;
  lastContactDate: string;
  satisfactionScore?: number;
  tags?: string[];
}

export interface ContactFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Report {
  type: 'overview' | 'performance' | 'satisfaction' | 'trends';
  data: any;
  generatedAt: string;
  period: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerId: string | number;
  tags?: string[];
  attachments?: File[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string | number;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  data?: T[];
  items?: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    total: number;
  };
  total?: number;
}

// API functions
const fetchTickets = async (filters: TicketFilters): Promise<PaginatedResponse<Ticket>> => {
  const { status, priority, page = 1, limit = 20, search = '' } = filters;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && { search }),
  });

  const response = await fetch(`/api/support/tickets?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }
  return response.json();
};

const fetchTicketById = async (ticketId: string | number): Promise<Ticket> => {
  const response = await fetch(`/api/support/tickets/${ticketId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ticket');
  }
  return response.json();
};

const fetchTicketStats = async (): Promise<TicketStats> => {
  const response = await fetch('/api/support/tickets/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch ticket stats');
  }
  return response.json();
};

const fetchContacts = async (filters: ContactFilters): Promise<PaginatedResponse<Contact>> => {
  const { page = 1, limit = 20, search = '' } = filters;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await fetch(`/api/support/contacts?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }
  return response.json();
};

const fetchContactById = async (contactId: string | number): Promise<Contact> => {
  const response = await fetch(`/api/support/contacts/${contactId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch contact');
  }
  return response.json();
};

const fetchReports = async (type: Report['type'] = 'overview'): Promise<Report> => {
  const response = await fetch(`/api/support/reports/${type}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
};

const createTicket = async (ticketData: CreateTicketData): Promise<Ticket> => {
  const response = await fetch('/api/support/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketData),
  });
  if (!response.ok) {
    throw new Error('Failed to create ticket');
  }
  return response.json();
};

const updateTicket = async ({ ticketId, updates }: { ticketId: string | number; updates: UpdateTicketData }): Promise<Ticket> => {
  const response = await fetch(`/api/support/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update ticket');
  }
  return response.json();
};

const addTicketComment = async ({ ticketId, comment }: { ticketId: string | number; comment: string }): Promise<Ticket> => {
  const response = await fetch(`/api/support/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
  });
  if (!response.ok) {
    throw new Error('Failed to add comment');
  }
  return response.json();
};

// Query hooks
export const useTickets = (
  filters: TicketFilters = {},
  options: Omit<UseQueryOptions<PaginatedResponse<Ticket>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['support', 'tickets', filters],
    queryFn: () => fetchTickets(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useInfiniteTickets = (
  filters: TicketFilters = {},
  options: Omit<UseInfiniteQueryOptions<PaginatedResponse<Ticket>, Error, InfiniteData<PaginatedResponse<Ticket>>, PaginatedResponse<Ticket>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['support', 'tickets', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchTickets({ ...filters, page: pageParam }),
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

export const useTicket = (
  ticketId: string | number | undefined,
  options: Omit<UseQueryOptions<Ticket, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['support', 'tickets', ticketId],
    queryFn: () => fetchTicketById(ticketId!),
    enabled: !!ticketId,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

export const useTicketStats = (options: Omit<UseQueryOptions<TicketStats, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['support', 'tickets', 'stats'],
    queryFn: fetchTicketStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useContacts = (
  filters: ContactFilters = {},
  options: Omit<UseQueryOptions<PaginatedResponse<Contact>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['support', 'contacts', filters],
    queryFn: () => fetchContacts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useInfiniteContacts = (
  filters: ContactFilters = {},
  options: Omit<UseInfiniteQueryOptions<PaginatedResponse<Contact>, Error, InfiniteData<PaginatedResponse<Contact>>, PaginatedResponse<Contact>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['support', 'contacts', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchContacts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useContact = (
  contactId: string | number | undefined,
  options: Omit<UseQueryOptions<Contact, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['support', 'contacts', contactId],
    queryFn: () => fetchContactById(contactId!),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useReports = (
  type: Report['type'] = 'overview',
  options: Omit<UseQueryOptions<Report, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['support', 'reports', type],
    queryFn: () => fetchReports(type),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// Mutation hooks
export const useCreateTicket = (
  options: Omit<UseMutationOptions<Ticket, Error, CreateTicketData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: (newTicket: Ticket) => {
      // Add to the tickets list
      queryClient.setQueryData(
        ['support', 'tickets', {}],
        (oldData: PaginatedResponse<Ticket> | undefined) => {
          if (!oldData) return oldData;
          const tickets = oldData.data || oldData.items || [];
          return {
            ...oldData,
            ...(oldData.data ? { data: [newTicket, ...tickets] } : { items: [newTicket, ...tickets] }),
            total: (oldData.total || 0) + 1,
          };
        }
      );

      // Invalidate tickets queries to refetch
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets', 'stats'] });
    },
    ...options,
  });
};

export const useUpdateTicket = (
  options: Omit<UseMutationOptions<Ticket, Error, { ticketId: string | number; updates: UpdateTicketData }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicket,
    onMutate: async ({ ticketId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['support', 'tickets', ticketId] });

      // Snapshot the previous value
      const previousTicket = queryClient.getQueryData(['support', 'tickets', ticketId]);

      // Optimistically update to the new value
      if (previousTicket) {
        queryClient.setQueryData(
          ['support', 'tickets', ticketId],
          { ...previousTicket, ...updates }
        );
      }

      return { previousTicket, ticketId };
    },
    onError: (err: Error, { ticketId }, context) => {
      // Roll back on error
      if (context?.previousTicket) {
        queryClient.setQueryData(['support', 'tickets', ticketId], context.previousTicket);
      }
    },
    onSettled: (data, error, { ticketId }) => {
      // Refetch the ticket
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets', 'stats'] });
    },
    ...options,
  });
};

export const useAddTicketComment = (
  options: Omit<UseMutationOptions<Ticket, Error, { ticketId: string | number; comment: string }>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTicketComment,
    onSuccess: (updatedTicket: Ticket, { ticketId }) => {
      // Update the ticket with the new comment
      queryClient.setQueryData(['support', 'tickets', ticketId], updatedTicket);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets', ticketId] });
    },
    ...options,
  });
};