// src/config/apiconfig.ts

export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const API_PATHS = {
  PUBLIC: '/api/public',
  SONGS: '/api/songs',
  LYRICS: '/api/v1/lyrics',
  HISTORY: '/api/history',
} as const;
