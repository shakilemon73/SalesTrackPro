/**
 * Cache Manager for improved performance and offline-first experience
 * Enhances the existing Supabase integration with smart caching
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items to store
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes default TTL
    maxSize: 100
  };

  // Set cache with TTL
  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.config.ttl;
    const now = Date.now();
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });

    console.log(`📦 CACHE: Set ${key} (expires in ${ttl/1000}s)`);
  }

  // Get cached data if not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`📦 CACHE: Miss for ${key}`);
      return null;
    }

    if (Date.now() > item.expiresAt) {
      console.log(`📦 CACHE: Expired ${key} - removing`);
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 CACHE: Hit for ${key}`);
    return item.data;
  }

  // Clear specific cache entry
  clear(key: string): void {
    this.cache.delete(key);
    console.log(`📦 CACHE: Cleared ${key}`);
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
    console.log(`📦 CACHE: Cleared all entries`);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // Convert entries to array to avoid iterator issues
    const entries = Array.from(this.cache.entries());
    for (const [key, item] of entries) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`📦 CACHE: Cleaned ${cleaned} expired entries`);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Auto cleanup every 10 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 10 * 60 * 1000);

// Helper function to create cache keys
export function createCacheKey(prefix: string, userId: string, suffix?: string): string {
  return `${prefix}:${userId}${suffix ? `:${suffix}` : ''}`;
}

// Cache-aware query wrapper
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cacheManager.get<T>(key);
  if (cached) {
    return cached;
  }

  // If not in cache, fetch from source
  console.log(`📦 CACHE: Fetching fresh data for ${key}`);
  const data = await queryFn();
  
  // Store in cache
  cacheManager.set(key, data, ttl);
  
  return data;
}