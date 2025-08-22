import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

const fetcher = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.response = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

export const useGroups = (filters = {}) => {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      return fetcher(`/groups?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useGroup = (id) => {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => fetcher(`/groups/${id}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => fetcher(`/groups/${groupId}/members`),
    staleTime: 1000 * 60 * 5,
    enabled: !!groupId,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return fetcher('/groups', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to create group';
      toast.error(message);
      throw error;
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      return fetcher(`/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast.success('Group updated successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to update group';
      toast.error(message);
      throw error;
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      return fetcher(`/groups/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      toast.success('Group deleted successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to delete group';
      toast.error(message);
      throw error;
    },
  });
};

export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, characterId }) => {
      return fetcher(`/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ character_id: characterId }),
      });
    },
    onSuccess: (data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      toast.success('Member added to group successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to add member to group';
      toast.error(message);
      throw error;
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, characterId }) => {
      return fetcher(`/groups/${groupId}/members/${characterId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      toast.success('Member removed from group successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to remove member from group';
      toast.error(message);
      throw error;
    },
  });
};

export const useCheckGroupMembership = (groupId, characterId) => {
  return useQuery({
    queryKey: ['groups', groupId, 'members', characterId],
    queryFn: () => fetcher(`/groups/${groupId}/members/${characterId}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!(groupId && characterId),
  });
};

export const useGroupsHealth = () => {
  return useQuery({
    queryKey: ['groups', 'health'],
    queryFn: () => fetcher('/groups/health'),
    staleTime: 1000 * 60,
  });
};

export const useGroupsStatus = () => {
  return useQuery({
    queryKey: ['groups', 'status'],
    queryFn: () => fetcher('/groups/status'),
    staleTime: 1000 * 60,
  });
};