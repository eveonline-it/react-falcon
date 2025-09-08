import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

const fetchCharacterAssets = async (characterId) => {
  const response = await fetch(`${BASE_URL}/assets/character/${characterId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch assets: ${response.status}`);
  }

  return response.json();
};

export const useCharacterAssets = (characterId) => {
  return useQuery({
    queryKey: ['assets', 'character', characterId],
    queryFn: () => fetchCharacterAssets(characterId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!characterId,
    retry: 1,
  });
};

export const useInvalidateAssets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (characterId) => {
      await queryClient.invalidateQueries(['assets', 'character', characterId]);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Assets refreshed successfully!');
    },
    onError: (err) => {
      toast.error(`Failed to refresh assets: ${err.message}`);
    },
  });
};