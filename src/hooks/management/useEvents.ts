import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Events system query hooks for event management features
 */

// Type definitions
export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  banner?: string;
  organizerId: string;
  organizerName: string;
  attendeeCount: number;
  maxAttendees?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  userAttendanceStatus?: 'attending' | 'not_attending' | 'maybe';
  userRsvpStatus?: 'yes' | 'no' | 'maybe';
  rsvpCount?: {
    yes: number;
    no: number;
    maybe: number;
  };
  userTickets?: EventTicket[];
  availableTickets: number;
  ticketTypes: TicketType[];
  schedule?: ScheduleItem[];
  tags: string[];
  isPublic: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventTicket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ticketType: TicketType;
  userId: string;
  quantity: number;
  purchaseDate: string;
  status: 'active' | 'used' | 'cancelled';
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  maxQuantity: number;
  availableQuantity: number;
  saleStartDate?: string;
  saleEndDate?: string;
  isActive: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  speakerId?: string;
  speakerName?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface EventLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  isActive: boolean;
}

export interface EventAttendee {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  status: 'confirmed' | 'pending' | 'declined';
  joinedAt: string;
  rsvpStatus?: 'yes' | 'no' | 'maybe';
  ticketsCount: number;
}

export interface EventStats {
  totalAttendees: number;
  confirmedAttendees: number;
  pendingAttendees: number;
  ticketsSold: number;
  totalRevenue: number;
  viewCount: number;
  shareCount: number;
  rsvpStats: {
    yes: number;
    no: number;
    maybe: number;
  };
}

export interface EventsResponse {
  events: Event[];
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EventFilters {
  page?: number;
  limit?: number;
  category?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface UserEventsFilters {
  userId: string;
  status?: 'all' | 'attending' | 'organizing' | 'past' | 'upcoming';
  page?: number;
  limit?: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  banner?: File;
  maxAttendees?: number;
  isPublic: boolean;
  requiresApproval: boolean;
  tags: string[];
  ticketTypes?: Omit<TicketType, 'id' | 'availableQuantity'>[];
  schedule?: Omit<ScheduleItem, 'id'>[];
}

export interface UpdateEventData {
  eventId: string;
  updates: Partial<CreateEventData>;
}

export interface RsvpData {
  eventId: string;
  status: 'yes' | 'no' | 'maybe';
  message?: string;
}

export interface PurchaseTicketData {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export interface PurchaseTicketResult {
  ticket: EventTicket;
  quantity: number;
  totalCost: number;
  paymentId?: string;
}

// API functions
const fetchEvents = async (filters: EventFilters): Promise<EventsResponse> => {
  const { page = 1, limit = 20, category, location, dateRange, search = '' } = filters;
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

const fetchEvent = async (eventId: string): Promise<Event> => {
  const response = await fetch(`/api/events/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
};

const fetchEventCategories = async (): Promise<EventCategory[]> => {
  const response = await fetch('/api/events/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch event categories');
  }
  return response.json();
};

const fetchEventLocations = async (): Promise<EventLocation[]> => {
  const response = await fetch('/api/events/locations');
  if (!response.ok) {
    throw new Error('Failed to fetch event locations');
  }
  return response.json();
};

const fetchEventAttendees = async (eventId: string): Promise<EventAttendee[]> => {
  const response = await fetch(`/api/events/${eventId}/attendees`);
  if (!response.ok) {
    throw new Error('Failed to fetch event attendees');
  }
  return response.json();
};

const fetchUserEvents = async (filters: UserEventsFilters): Promise<EventsResponse> => {
  const { userId, status = 'all', page = 1, limit = 20 } = filters;
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

const createEvent = async (eventData: CreateEventData): Promise<Event> => {
  const formData = new FormData();
  
  // Handle basic event data
  Object.entries(eventData).forEach(([key, value]) => {
    if (key === 'banner' && value instanceof File) {
      formData.append('banner', value);
    } else if (key === 'ticketTypes' || key === 'schedule') {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
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

const updateEvent = async ({ eventId, updates }: UpdateEventData): Promise<Event> => {
  const formData = new FormData();
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'banner' && value instanceof File) {
      formData.append('banner', value);
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, typeof value === 'string' ? value : String(value));
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

const deleteEvent = async (eventId: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
  return response.json();
};

const joinEvent = async (eventId: string): Promise<{ success: boolean; attendeeCount: number }> => {
  const response = await fetch(`/api/events/${eventId}/join`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to join event');
  }
  return response.json();
};

const leaveEvent = async (eventId: string): Promise<{ success: boolean; attendeeCount: number }> => {
  const response = await fetch(`/api/events/${eventId}/leave`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to leave event');
  }
  return response.json();
};

const rsvpToEvent = async ({ eventId, status, message = '' }: RsvpData): Promise<{ status: string; eventRsvpCount: EventStats['rsvpStats'] }> => {
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

const purchaseTicket = async ({ eventId, ticketTypeId, quantity = 1 }: PurchaseTicketData): Promise<PurchaseTicketResult> => {
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

const fetchEventStats = async (eventId: string): Promise<EventStats> => {
  const response = await fetch(`/api/events/${eventId}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch event stats');
  }
  return response.json();
};

// Query hooks
export const useEvents = (
  filters: EventFilters = {},
  options: Omit<UseQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['events', 'list', filters],
    queryFn: () => fetchEvents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useInfiniteEvents = (
  filters: Omit<EventFilters, 'page'> = {},
  options: Omit<UseInfiniteQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['events', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchEvents({ ...filters, page: pageParam as number }),
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

export const useEvent = (
  eventId: string | undefined,
  options: Omit<UseQueryOptions<Event, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => fetchEvent(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useEventCategories = (
  options: Omit<UseQueryOptions<EventCategory[], Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['events', 'categories'],
    queryFn: fetchEventCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes - categories don't change often
    ...options,
  });
};

export const useEventLocations = (
  options: Omit<UseQueryOptions<EventLocation[], Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['events', 'locations'],
    queryFn: fetchEventLocations,
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useEventAttendees = (
  eventId: string | undefined,
  options: Omit<UseQueryOptions<EventAttendee[], Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['events', eventId, 'attendees'],
    queryFn: () => fetchEventAttendees(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useUserEvents = (
  userId: string | undefined,
  status: UserEventsFilters['status'] = 'all',
  options: Omit<UseQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['users', userId, 'events', status],
    queryFn: () => fetchUserEvents({ userId: userId!, status }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useEventStats = (
  eventId: string | undefined,
  options: Omit<UseQueryOptions<EventStats, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['events', eventId, 'stats'],
    queryFn: () => fetchEventStats(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Combined hook for event detail page
export const useEventDetail = (
  eventId: string | undefined,
  options: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'> = {}
) => {
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
export const useCreateEvent = (
  options: Omit<UseMutationOptions<Event, Error, CreateEventData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (newEvent) => {
      // Add to events list
      queryClient.setQueryData(['events', 'list', {}], (oldData: EventsResponse | undefined) => {
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

export const useUpdateEvent = (
  options: Omit<UseMutationOptions<Event, Error, UpdateEventData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ eventId, updates }: UpdateEventData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events', eventId] });

      // Snapshot the previous value
      const previousEvent = queryClient.getQueryData<Event>(['events', eventId]);

      // Optimistically update to the new value
      if (previousEvent) {
        queryClient.setQueryData(['events', eventId], { ...previousEvent, ...updates });
      }

      return { previousEvent, eventId };
    },
    onError: (_err: Error, { eventId }: UpdateEventData, context: unknown) => {
      const ctx = context as { previousEvent: Event; eventId: string } | undefined;
      // Roll back on error
      if (ctx?.previousEvent) {
        queryClient.setQueryData(['events', eventId], ctx.previousEvent);
      }
    },
    onSettled: (_data: Event | undefined, _error: Error | null, { eventId }: UpdateEventData) => {
      // Refetch the event and related queries
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['events', 'infinite'] });
    },
    ...options,
  });
};

export const useDeleteEvent = (
  options: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (_deletedEvent: { success: boolean; message: string }, eventId: string) => {
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

export const useJoinEvent = (
  options: Omit<UseMutationOptions<{ success: boolean; attendeeCount: number }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinEvent,
    onMutate: async (eventId: string) => {
      // Optimistically update event attendee count
      await queryClient.cancelQueries({ queryKey: ['events', eventId] });
      
      const previousEvent = queryClient.getQueryData<Event>(['events', eventId]);
      
      if (previousEvent) {
        queryClient.setQueryData<Event>(['events', eventId], {
          ...previousEvent,
          attendeeCount: (previousEvent.attendeeCount || 0) + 1,
          userAttendanceStatus: 'attending',
        });
      }
      
      return { previousEvent };
    },
    onError: (_err: Error, eventId: string, context: unknown) => {
      const ctx = context as { previousEvent: Event } | undefined;
      // Roll back on error
      if (ctx?.previousEvent) {
        queryClient.setQueryData(['events', eventId], ctx.previousEvent);
      }
    },
    onSettled: (_data: { success: boolean; attendeeCount: number } | undefined, _error: Error | null, eventId: string) => {
      // Refetch related data
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events
    },
    ...options,
  });
};

export const useLeaveEvent = (
  options: Omit<UseMutationOptions<{ success: boolean; attendeeCount: number }, Error, string>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveEvent,
    onMutate: async (eventId: string) => {
      // Optimistically update event attendee count
      await queryClient.cancelQueries({ queryKey: ['events', eventId] });
      
      const previousEvent = queryClient.getQueryData<Event>(['events', eventId]);
      
      if (previousEvent) {
        queryClient.setQueryData<Event>(['events', eventId], {
          ...previousEvent,
          attendeeCount: Math.max((previousEvent.attendeeCount || 1) - 1, 0),
          userAttendanceStatus: 'not_attending',
        });
      }
      
      return { previousEvent };
    },
    onError: (_err: Error, eventId: string, context: unknown) => {
      const ctx = context as { previousEvent: Event } | undefined;
      // Roll back on error
      if (ctx?.previousEvent) {
        queryClient.setQueryData(['events', eventId], ctx.previousEvent);
      }
    },
    onSettled: (_data: { success: boolean; attendeeCount: number } | undefined, _error: Error | null, eventId: string) => {
      // Refetch related data
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'attendees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // User's events
    },
    ...options,
  });
};

export const useRsvpToEvent = (
  options: Omit<UseMutationOptions<{ status: string; eventRsvpCount: EventStats['rsvpStats'] }, Error, RsvpData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rsvpToEvent,
    onSuccess: (rsvpResponse: { status: string; eventRsvpCount: EventStats['rsvpStats'] }, { eventId }: RsvpData) => {
      // Update event with new RSVP status
      queryClient.setQueryData<Event>(['events', eventId], (oldEvent: Event | undefined) => {
        if (!oldEvent) return oldEvent;
        return {
          ...oldEvent,
          userRsvpStatus: rsvpResponse.status as 'yes' | 'no' | 'maybe',
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

export const usePurchaseTicket = (
  options: Omit<UseMutationOptions<PurchaseTicketResult, Error, PurchaseTicketData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseTicket,
    onSuccess: (purchaseResult: PurchaseTicketResult, { eventId }: PurchaseTicketData) => {
      // Update event with new ticket purchase info
      queryClient.setQueryData<Event>(['events', eventId], (oldEvent: Event | undefined) => {
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