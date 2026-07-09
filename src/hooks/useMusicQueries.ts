import { useQuery } from '@tanstack/react-query';
import {
  getTrendingSongs,
  getAllPublicSongs,
  getUserHistory,
  getAllCategories,
  getSongsByCategory
} from '../../api/apiclient';
import { getPublicPlaylists } from '../../api/playlistapi';
import { getAllArtists } from '../../api/artistApi';
import type { Song } from '../../api/apiclient';
import type { Artist } from '../../api/artistApi';

// 1. Hook for trending songs (Top Songs)
export function useTrendingSongs(limit: number = 18) {
  return useQuery({
    queryKey: ['songs', 'trending', limit],
    queryFn: async () => {
      const res = await getTrendingSongs(limit);
      return Array.isArray(res.data) ? res.data : (res as any);
    },
  });
}

// 2. Hook for all artists (Popular Artists)
export function useAllArtists() {
  return useQuery({
    queryKey: ['artists', 'all'],
    queryFn: async () => {
      const res = await getAllArtists();
      return Array.isArray(res.data) ? res.data : (res as any);
    },
  });
}

// 3. Hook for featured/public playlists
export function usePublicPlaylists() {
  return useQuery({
    queryKey: ['playlists', 'public'],
    queryFn: async () => {
      const res = await getPublicPlaylists();
      return Array.isArray(res.data) ? res.data : (res as any);
    },
  });
}

// 4. Hook for all public songs (New Releases)
export function useAllPublicSongs() {
  return useQuery({
    queryKey: ['songs', 'all-public'],
    queryFn: async () => {
      const res = await getAllPublicSongs();
      return Array.isArray(res.data) ? res.data : (res as any);
    },
  });
}

// 5. Hook for user listening history (Recently Played)
export function useUserHistory(userId: string | null) {
  return useQuery({
    queryKey: ['user-history', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const res = await getUserHistory(userId);
      return Array.isArray(res.data) ? res.data : (res as any);
    },
    enabled: !!userId,
  });
}

// 6. Hook for all categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await getAllCategories();
      return Array.isArray(res.data) ? res.data : (res as any);
    },
  });
}

// 7. Hook for songs by category
export function useSongsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ['songs', 'category', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await getSongsByCategory(categoryId);
      return Array.isArray(res.data) ? res.data : (res as any);
    },
    enabled: !!categoryId,
  });
}
