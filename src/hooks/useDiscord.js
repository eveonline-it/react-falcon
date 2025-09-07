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

  // Handle successful responses, including 204 No Content for DELETE
  if (response.status === 204) {
    return {}; // No content to parse
  }

  return response.json();
};

// ===============================
// Discord Status/Health
// ===============================

export const useDiscordStatus = () => {
  return useQuery({
    queryKey: ['discord', 'status'],
    queryFn: () => fetcher('/discord/status'),
    staleTime: 1000 * 60, // 1 minute
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

// ===============================
// Discord Guild Configuration
// ===============================

export const useDiscordGuilds = (filters = {}) => {
  return useQuery({
    queryKey: ['discord', 'guilds', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
      
      return fetcher(`/discord/guilds?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useDiscordGuild = (guildId) => {
  return useQuery({
    queryKey: ['discord', 'guilds', guildId],
    queryFn: () => fetcher(`/discord/guilds/${guildId}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!guildId,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useDiscordGuildRoles = (guildId) => {
  return useQuery({
    queryKey: ['discord', 'guilds', guildId, 'roles'],
    queryFn: () => fetcher(`/discord/guilds/${guildId}/roles`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!guildId,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useCreateDiscordGuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return fetcher('/discord/guilds', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'guilds'] });
      toast.success('Discord guild configured successfully');
      return data;
    },
    onError: (error) => {
      const errorMessage = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to configure Discord guild';
      toast.error(errorMessage);
      throw error;
    },
  });
};

export const useUpdateDiscordGuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guildId, data }) => {
      return fetcher(`/discord/guilds/${guildId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, { guildId }) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'guilds'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'guilds', guildId] });
      toast.success('Discord guild updated successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to update Discord guild';
      toast.error(message);
      throw error;
    },
  });
};

export const useDeleteDiscordGuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guildId) => {
      return await fetcher(`/discord/guilds/${guildId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, guildId) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'guilds'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'guilds', guildId] });
      toast.success('Discord guild removed successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to remove Discord guild';
      toast.error(message);
      throw error;
    },
  });
};

// ===============================
// Discord Role Mappings
// ===============================

export const useDiscordRoleMappings = (filters = {}) => {
  return useQuery({
    queryKey: ['discord', 'role-mappings', filters],
    queryFn: async () => {
      // If we have a guild_id, use the nested endpoint
      if (filters.guild_id) {
        return fetcher(`/discord/guilds/${filters.guild_id}/role-mappings`);
      }
      
      // For general role mappings, we might need to fetch from all guilds and aggregate
      // This is a fallback - check if the server supports a general role mappings endpoint
      try {
        const params = new URLSearchParams();
        if (filters.group_id) params.append('group_id', filters.group_id);
        if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        return await fetcher(`/discord/role-mappings?${params.toString()}`);
      } catch (error) {
        // If general endpoint doesn't exist, return empty structure
        if (error.status === 404) {
          return { role_mappings: [], total: 0, total_pages: 1 };
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

// Specific hook for guild role mappings
export const useDiscordGuildRoleMappings = (guildId) => {
  return useQuery({
    queryKey: ['discord', 'guilds', guildId, 'role-mappings'],
    queryFn: () => fetcher(`/discord/guilds/${guildId}/role-mappings`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!guildId,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useDiscordRoleMapping = (mappingId) => {
  return useQuery({
    queryKey: ['discord', 'role-mappings', mappingId],
    queryFn: () => fetcher(`/discord/role-mappings/${mappingId}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!mappingId,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useCreateDiscordRoleMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      // Role mappings are created for specific guilds
      const { guild_id, group_id, discord_role_id, discord_role_name } = data;
      const mappingData = {
        group_id,
        discord_role_id,
        discord_role_name
      };
      return fetcher(`/discord/guilds/${guild_id}/role-mappings`, {
        method: 'POST',
        body: JSON.stringify(mappingData),
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'role-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'guilds', variables.guild_id, 'role-mappings'] });
      toast.success('Discord role mapping created successfully');
      return data;
    },
    onError: (error) => {
      const errorMessage = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to create Discord role mapping';
      toast.error(errorMessage);
      throw error;
    },
  });
};

export const useUpdateDiscordRoleMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mappingId, data }) => {
      const { discord_role_id, discord_role_name, is_active } = data;
      const mappingData = {
        discord_role_id,
        discord_role_name,
        is_active
      };
      return fetcher(`/discord/role-mappings/${mappingId}`, {
        method: 'PUT',
        body: JSON.stringify(mappingData),
      });
    },
    onSuccess: (data, { mappingId }) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'role-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'role-mappings', mappingId] });
      toast.success('Discord role mapping updated successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to update Discord role mapping';
      toast.error(message);
      throw error;
    },
  });
};

export const useDeleteDiscordRoleMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mappingId) => {
      return await fetcher(`/discord/role-mappings/${mappingId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, mappingId) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'role-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'role-mappings', mappingId] });
      toast.success('Discord role mapping deleted successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to delete Discord role mapping';
      toast.error(message);
      throw error;
    },
  });
};

// ===============================
// Discord Synchronization
// ===============================

export const useDiscordSyncStatus = () => {
  return useQuery({
    queryKey: ['discord', 'sync', 'status'],
    queryFn: () => fetcher('/discord/sync/status'),
    staleTime: 1000 * 30, // 30 seconds - sync status changes frequently
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useSyncDiscordUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => {
      return fetcher(`/discord/sync/user/${userId}`, {
        method: 'POST',
      });
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'sync', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'users'] });
      toast.success(`Discord roles synced for user successfully`);
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to sync user Discord roles';
      toast.error(message);
      throw error;
    },
  });
};

// Note: Individual guild and role mapping sync are handled through the manual sync endpoint
// with appropriate filters/parameters in the request body

export const useManualDiscordSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return fetcher('/discord/sync/manual', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'sync', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'users'] });
      toast.success('Discord manual sync initiated successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to initiate Discord sync';
      toast.error(message);
      throw error;
    },
  });
};

// ===============================
// Discord Users & Authentication
// ===============================

export const useDiscordUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['discord', 'users', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.guild_id) params.append('guild_id', filters.guild_id);
      
      return fetcher(`/discord/users?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useDiscordUserProfile = (userId) => {
  return useQuery({
    queryKey: ['discord', 'user', 'profile', userId],
    queryFn: () => fetcher('/discord/auth/status'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

// Hook for checking current user's Discord auth status (doesn't need userId)
export const useDiscordAuthStatus = () => {
  return useQuery({
    queryKey: ['discord', 'auth', 'status'],
    queryFn: () => fetcher('/discord/auth/status'),
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter cache for auth status
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useDiscordAuthUrl = () => {
  return useQuery({
    queryKey: ['discord', 'auth', 'url'],
    queryFn: () => fetcher('/discord/auth/login'),
    staleTime: 1000 * 60 * 10, // 10 minutes - auth URLs don't change frequently
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const useLinkDiscordAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return fetcher('/discord/link', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'users'] });
      toast.success('Discord account linked successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to link Discord account';
      toast.error(message);
      throw error;
    },
  });
};

export const useUnlinkDiscordAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discordId) => {
      return fetcher(`/discord/auth/unlink/${discordId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['discord', 'user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['discord', 'users'] });
      toast.success('Discord account unlinked successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.errors?.[0]?.message || error.response?.error || 'Failed to unlink Discord account';
      toast.error(message);
      throw error;
    },
  });
};

// ===============================
// Utility Hooks
// ===============================

export const useDiscordGuildStats = () => {
  const { data: guilds, isLoading: guildsLoading } = useDiscordGuilds();
  const { data: roleMappings, isLoading: mappingsLoading } = useDiscordRoleMappings();
  const { data: users, isLoading: usersLoading } = useDiscordUsers();

  return useQuery({
    queryKey: ['discord', 'stats'],
    queryFn: () => {
      const stats = {
        total_guilds: guilds?.guilds?.length || 0,
        active_guilds: guilds?.guilds?.filter(g => g.enabled)?.length || 0,
        inactive_guilds: guilds?.guilds?.filter(g => !g.enabled)?.length || 0,
        total_role_mappings: roleMappings?.role_mappings?.length || 0,
        active_role_mappings: roleMappings?.role_mappings?.filter(rm => rm.enabled)?.length || 0,
        inactive_role_mappings: roleMappings?.role_mappings?.filter(rm => !rm.enabled)?.length || 0,
        total_discord_users: users?.users?.length || 0,
        linked_users: users?.users?.filter(u => u.discord_id || u.discord_user_id)?.length || 0,
      };
      return stats;
    },
    enabled: !guildsLoading && !mappingsLoading && !usersLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};