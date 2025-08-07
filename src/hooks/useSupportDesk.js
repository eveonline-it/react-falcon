import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

/**
 * Support Desk specific query hooks
 */

// API functions
const fetchTickets = async ({ status, priority, page = 1, limit = 20, search = '' }) => {
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

const fetchTicketById = async (ticketId) => {
  const response = await fetch(`/api/support/tickets/${ticketId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ticket');
  }
  return response.json();
};

const fetchTicketStats = async () => {
  const response = await fetch('/api/support/tickets/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch ticket stats');
  }
  return response.json();
};

const fetchContacts = async ({ page = 1, limit = 20, search = '' }) => {
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

const fetchContactById = async (contactId) => {
  const response = await fetch(`/api/support/contacts/${contactId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch contact');
  }
  return response.json();
};

const fetchReports = async (type = 'overview') => {
  const response = await fetch(`/api/support/reports/${type}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
};

const createTicket = async (ticketData) => {
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

const updateTicket = async ({ ticketId, updates }) => {
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

const addTicketComment = async ({ ticketId, comment }) => {
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
export const useTickets = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['support', 'tickets', filters],
    queryFn: () => fetchTickets(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useInfiniteTickets = (filters = {}, options = {}) => {
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

export const useTicket = (ticketId, options = {}) => {
  return useQuery({
    queryKey: ['support', 'tickets', ticketId],
    queryFn: () => fetchTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};

export const useTicketStats = (options = {}) => {
  return useQuery({
    queryKey: ['support', 'tickets', 'stats'],
    queryFn: fetchTicketStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useContacts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['support', 'contacts', filters],
    queryFn: () => fetchContacts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useInfiniteContacts = (filters = {}, options = {}) => {
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

export const useContact = (contactId, options = {}) => {
  return useQuery({
    queryKey: ['support', 'contacts', contactId],
    queryFn: () => fetchContactById(contactId),
    enabled: !!contactId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useReports = (type = 'overview', options = {}) => {
  return useQuery({
    queryKey: ['support', 'reports', type],
    queryFn: () => fetchReports(type),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// Mutation hooks
export const useCreateTicket = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: (newTicket) => {
      // Add to the tickets list
      queryClient.setQueryData(
        ['support', 'tickets', {}],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            tickets: [newTicket, ...oldData.tickets],
            total: oldData.total + 1,
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

export const useUpdateTicket = (options = {}) => {
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
    onError: (err, { ticketId }, context) => {
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

export const useAddTicketComment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTicketComment,
    onSuccess: (updatedTicket, { ticketId }) => {
      // Update the ticket with the new comment
      queryClient.setQueryData(['support', 'tickets', ticketId], updatedTicket);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets', ticketId] });
    },
    ...options,
  });
};