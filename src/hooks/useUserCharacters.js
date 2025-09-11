import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Fetch character groups
const fetchCharacterGroups = async (characterId) => {
  if (!characterId) {
    throw new Error('Character ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/characters/${characterId}/groups`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch character groups: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle different response structures
  if (Array.isArray(data)) {
    return data;
  } else if (data && data.groups && Array.isArray(data.groups)) {
    return data.groups;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // If no array found, return empty array
  return [];
};

// Fetch user characters
const fetchUserCharacters = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/users/${userId}/characters`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch user characters: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle different response structures
  if (Array.isArray(data)) {
    return data;
  } else if (data && data.characters && Array.isArray(data.characters)) {
    return data.characters;
  } else if (data && Array.isArray(data.data)) {
    return data.data;
  }
  
  // If no array found, return empty array
  return [];
};

// Update character positions
const updateCharacterPositions = async ({ userId, updates }) => {
  if (!userId || !updates || !Array.isArray(updates)) {
    throw new Error('User ID and updates array are required');
  }
  
  
  const response = await fetch(`${BASE_URL}/users/${userId}/characters/reorder`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ characters: updates }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Failed to update character positions: ${response.status}`);
  }

  const result = await response.json();
  return result;
};

// Hook for fetching user characters
export const useUserCharacters = (userId, options = {}) => {
  return useQuery({
    queryKey: ['user', userId, 'characters'],
    queryFn: () => fetchUserCharacters(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for updating character positions
export const useUpdateCharacterPositions = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCharacterPositions,
    onSuccess: (updatedData, { userId }) => {
      // Invalidate and refetch user characters
      queryClient.invalidateQueries({ 
        queryKey: ['user', userId, 'characters'],
        refetchType: 'active',
      });
      
    },
    onError: (error) => {
      toast.error(`Failed to update character positions: ${error.message}`);
    },
    ...options,
  });
};

// Fetch individual character data
const fetchCharacter = async (characterId) => {
  if (!characterId) {
    throw new Error('Character ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/character/${characterId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch character: ${response.status}`);
  }

  return await response.json();
};

// Hook for fetching individual character
export const useCharacter = (characterId, options = {}) => {
  return useQuery({
    queryKey: ['character', characterId],
    queryFn: () => fetchCharacter(characterId),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Fetch character wallet data
const fetchCharacterWallet = async (characterId) => {
  if (!characterId) {
    throw new Error('Character ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/character/${characterId}/wallet`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch character wallet: ${response.status}`);
  }

  return await response.json();
};

// Hook for fetching character wallet
export const useCharacterWallet = (characterId, options = {}) => {
  return useQuery({
    queryKey: ['character', characterId, 'wallet'],
    queryFn: () => fetchCharacterWallet(characterId),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Fetch character skills data
const fetchCharacterSkills = async (characterId) => {
  if (!characterId) {
    throw new Error('Character ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/character/${characterId}/skills`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch character skills: ${response.status}`);
  }

  return await response.json();
};

// Hook for fetching character skills
export const useCharacterSkills = (characterId, options = {}) => {
  return useQuery({
    queryKey: ['character', characterId, 'skills'],
    queryFn: () => fetchCharacterSkills(characterId),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes (skills change slowly)
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Fetch character clones data
const fetchCharacterClones = async (characterId) => {
  if (!characterId) {
    throw new Error('Character ID is required');
  }
  
  const response = await fetch(`${BASE_URL}/character/${characterId}/clones`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch character clones: ${response.status}`);
  }

  return await response.json();
};

// Hook for fetching character clones
export const useCharacterClones = (characterId, options = {}) => {
  return useQuery({
    queryKey: ['character', characterId, 'clones'],
    queryFn: () => fetchCharacterClones(characterId),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Hook for fetching character groups
export const useCharacterGroups = (characterId, options = {}) => {
  return useQuery({
    queryKey: ['character', characterId, 'groups'],
    queryFn: () => fetchCharacterGroups(characterId),
    enabled: !!characterId,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
};