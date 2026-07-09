import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes TTL
      gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection time
      refetchOnWindowFocus: false, // Avoid refetching when window gains focus
      refetchOnReconnect: true,
      retry: 1, // Retry once before failing
    },
  },
});
