import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: true, // Refetch when window gains focus
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't cache anything (v5 syntax)
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});

// Clear all cache on startup to force fresh data
queryClient.clear();
console.log('🔥 QUERY CLIENT: All cache cleared - forcing fresh data fetch');
