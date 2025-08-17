import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

/**
 * Events system query hooks for event management features
 */

// API functions
const fetchEvents = async ({ page = 1, limit = 20, category, location, dateRange, search = '' }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
    ...(location && { location }),
    ...(dateRange?.start && { startDate: dateRange.start }),
    ...(dateRange?.end && { endDate: dateRange.end }),
    ...(search && { search }),
  });

  const response = await fetch(`/api/events?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

const fetchEvent = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

const fetchEventCategories = async () => {
  const response = await fetch('/api/events/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch event categories');
  }
  return response.json();
};

const fetchEventLocations = async () => {
  const response = await fetch('/api/events/locations');
  if (!response.ok) {
    throw new Error('Failed to fetch event locations');
  }
  return response.json();
};

const fetchEventAttendees = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/attendees`);
  if (!response.ok) {
    throw new Error('Failed to fetch event attendees');
  }
  return response.json();
};

const fetchUserEvents = async ({ userId, status = 'all', page = 1, limit = 20 }) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
  });

  const response = await fetch(`/api/users/${userId}/events?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user events');
  }
  return response.json();
};

const createEvent = async (eventData) => {
  const formData = new FormData();
  
  // Handle basic event data
  Object.keys(eventData).forEach(key => {
    if (key === 'banner' && eventData[key] instanceof File) {
      formData.append('banner', eventData[key]);
    } else if (key === 'tickets') {
      formData.append('tickets', JSON.stringify(eventData[key]));
    } else if (key === 'schedule') {
      formData.append('schedule', JSON.stringify(eventData[key]));
    } else {
      formData.append(key, eventData[key]);
    }
  });

  const response = await fetch('/api/events', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  return response.json();
};

const updateEvent = async ({ eventId, updates }) => {
  const formData = new FormData();
  
  Object.keys(updates).forEach(key => {
    if (key === 'banner' && updates[key] instanceof File) {
      formData.append('banner', updates[key]);
    } else if (typeof updates[key] === 'object') {
      formData.append(key, JSON.stringify(updates[key]));
    } else {
      formData.append(key, updates[key]);
    }
  });

  const response = await fetch(`/api/events/${eventId}`, {
    method: 'PATCH',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to update event');
  }
  return response.json();
};

const deleteEvent = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
  return response.json();
};

const joinEvent = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/join`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to join event');
  }
  return response.json();
};

const leaveEvent = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/leave`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to leave event');
  }
  return response.json();
};

const rsvpToEvent = async ({ eventId, status, message = '' }) => {
  const response = await fetch(`/api/events/${eventId}/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, message }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to RSVP to event');
  }
  return response.json();
};

const purchaseTicket = async ({ eventId, ticketTypeId, quantity = 1 }) => {
  const response = await fetch(`/api/events/${eventId}/tickets/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticketTypeId, quantity }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to purchase ticket');
  }
  return response.json();
};

const fetchEventStats = async (eventId) => {
  const response = await fetch(`/api/events/${eventId}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch event stats');
  }
  return response.json();
};

// Query hooks
export const useEvents = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['events', 'list', filters],
    queryFn: () => fetchEvents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useInfiniteEvents = (filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchEvents({ ...filters, page: pageParam }),
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

export const useEvent = (eventId, options = {}) => {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => fetchEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useEventCategories = (options = {}) => {
  return useQuery({
    queryKey: ['events', 'categories'],
    queryFn: fetchEventCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
    ...options,
  });
};

export const useEventLocations = (options = {}) => {
  return useQuery({
    queryKey: ['events', 'locations'],
    queryFn: fetchEventLocations,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useEventAttendees = (eventId, options = {}) => {
  return useQuery({
    queryKey: ['events', eventId, 'attendees'],
    queryFn: () => fetchEventAttendees(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useUserEvents = (userId, status = 'all', options = {}) => {
  return useQuery({
    queryKey: ['users', userId, 'events', status],
    queryFn: () => fetchUserEvents({ userId, status }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useEventStats = (eventId, options = {}) => {
  return useQuery({
    queryKey: ['events', eventId, 'stats'],
    queryFn: () => fetchEventStats(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Combined hook for event detail page
export const useEventDetail = (eventId, options = {}) => {
  const eventQuery = useEvent(eventId, options);
  const attendeesQuery = useEventAttendees(eventId, options);
  const statsQuery = useEventStats(eventId, options);

  return {
    event: eventQuery.data,
    attendees: attendeesQuery.data,
    stats: statsQuery.data,
    isLoading: eventQuery.isLoading || attendeesQuery.isLoading || statsQuery.isLoading,
    error: eventQuery.error || attendeesQuery.error || statsQuery.error,
    refetch: () => {
      eventQuery.refetch();
      attendeesQuery.refetch();
      statsQuery.refetch();
    },
  };
};

// Mutation hooks
export const useCreateEvent = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (newEvent) => {
      // Add to events list
      queryClient.setQueryData(['events', 'list', {}], (oldData) => {
        if (!oldData) return { events: [newEvent], total: 1 };
        return {
          ...oldData,
          events: [newEvent, ...oldData.events],
          total: oldData.total + 1,
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'infinite'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events might be affected
    },
    ...options,
  });
};

export const useUpdateEvent = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ eventId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events', eventId] });

      // Snapshot the previous value
      const previousEvent = queryClient.getQueryData(['events', eventId]);

      // Optimistically update to the new value
      if (previousEvent) {
        queryClient.setQueryData(['events', eventId], { ...previousEvent, ...updates });
      }

      return { previousEvent, eventId };
    },
    onError: (err, { eventId }, context) => {
      // Roll back on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['events', eventId], context.previousEvent);
      }
    },
    onSettled: (data, error, { eventId }) => {
      // Refetch the event and related queries
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'infinite'] });
    },
    ...options,
  });
};

export const useDeleteEvent = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (deletedEvent, eventId) => {
      // Remove from all event lists
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'infinite'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events might be affected
      
      // Remove the specific event query
      queryClient.removeQueries({ queryKey: ['events', eventId] });
    },
    ...options,
  });
};

export const useJoinEvent = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinEvent,
    onMutate: async (eventId) => {
      // Optimistically update event attendee count
      await queryClient.cancelQueries({ queryKey: ['events', eventId] });
      
      const previousEvent = queryClient.getQueryData(['events', eventId]);
      
      if (previousEvent) {
        queryClient.setQueryData(['events', eventId], {
          ...previousEvent,
          attendeeCount: (previousEvent.attendeeCount || 0) + 1,
          userAttendanceStatus: 'attending',
        });
      }
      
      return { previousEvent };
    },
    onError: (err, eventId, context) => {
      // Roll back on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['events', eventId], context.previousEvent);
      }
    },
    onSettled: (data, error, eventId) => {
      // Refetch related data
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events
    },
    ...options,
  });
};

export const useLeaveEvent = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveEvent,
    onMutate: async (eventId) => {
      // Optimistically update event attendee count
      await queryClient.cancelQueries({ queryKey: ['events', eventId] });
      
      const previousEvent = queryClient.getQueryData(['events', eventId]);
      
      if (previousEvent) {
        queryClient.setQueryData(['events', eventId], {
          ...previousEvent,
          attendeeCount: Math.max((previousEvent.attendeeCount || 1) - 1, 0),
          userAttendanceStatus: 'not_attending',
        });
      }
      
      return { previousEvent };
    },
    onError: (err, eventId, context) => {
      // Roll back on error
      if (context?.previousEvent) {
        queryClient.setQueryData(['events', eventId], context.previousEvent);
      }
    },
    onSettled: (data, error, eventId) => {
      // Refetch related data
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events
    },
    ...options,
  });
};

export const useRsvpToEvent = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rsvpToEvent,
    onSuccess: (rsvpResponse, { eventId }) => {
      // Update event with new RSVP status
      queryClient.setQueryData(['events', eventId], (oldEvent) => {
        if (!oldEvent) return oldEvent;
        return {
          ...oldEvent,
          userRsvpStatus: rsvpResponse.status,
          rsvpCount: rsvpResponse.eventRsvpCount,
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events
    },
    ...options,
  });
};

export const usePurchaseTicket = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseTicket,
    onSuccess: (purchaseResult, { eventId }) => {
      // Update event with new ticket purchase info
      queryClient.setQueryData(['events', eventId], (oldEvent) => {
        if (!oldEvent) return oldEvent;
        return {
          ...oldEvent,
          userTickets: [...(oldEvent.userTickets || []), purchaseResult.ticket],
          availableTickets: oldEvent.availableTickets - purchaseResult.quantity,
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's tickets/events
    },
    ...options,
  });
};