/**
 * Multi-layer caching system for optimal performance
 */

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'lfu'; // Eviction strategy
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * In-memory cache with configurable eviction strategies
 */
class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item has expired
    if (Date.now() - item.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access tracking
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.value;
  }

  set(key: string, value: T): void {
    // Evict items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evict(): void {
    const entries = Array.from(this.cache.entries());
    
    switch (this.config.strategy) {
      case 'lru':
        // Least Recently Used
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case 'lfu':
        // Least Frequently Used
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'fifo':
        // First In, First Out
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
    }

    // Remove the first (oldest/least used) entry
    const [keyToRemove] = entries[0];
    this.cache.delete(keyToRemove);
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * Browser storage cache (localStorage/sessionStorage)
 */
class BrowserStorageCache<T> {
  private storage: Storage;
  private prefix: string;

  constructor(useSessionStorage = false, prefix = 'cache_') {
    this.storage = useSessionStorage ? sessionStorage : localStorage;
    this.prefix = prefix;
  }

  get(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const { value, timestamp, ttl } = JSON.parse(item);
      
      // Check if item has expired
      if (Date.now() - timestamp > ttl) {
        this.delete(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error('Error reading from browser storage:', error);
      return null;
    }
  }

  set(key: string, value: T, ttl: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      this.storage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Error writing to browser storage:', error);
    }
  }

  delete(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }
}

/**
 * Multi-layer cache manager
 */
export class CacheManager {
  private memoryCache: MemoryCache<any>;
  private browserCache: BrowserStorageCache<any>;
  private static instance: CacheManager;

  constructor() {
    this.memoryCache = new MemoryCache({
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      strategy: 'lru',
    });

    this.browserCache = new BrowserStorageCache(false, 'ai_news_');
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get value from cache (checks memory first, then browser storage)
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue !== null) {
      return memoryValue;
    }

    // Try browser storage
    const browserValue = this.browserCache.get(key);
    if (browserValue !== null) {
      // Promote to memory cache
      this.memoryCache.set(key, browserValue);
      return browserValue;
    }

    return null;
  }

  /**
   * Set value in both caches
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const cacheTtl = ttl || 15 * 60 * 1000; // Default 15 minutes

    // Set in memory cache
    this.memoryCache.set(key, value);

    // Set in browser storage with longer TTL
    this.browserCache.set(key, value, cacheTtl);
  }

  /**
   * Delete value from both caches
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.browserCache.delete(key);
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryCache.clear();
    this.browserCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memory: { size: number; keys: string[] };
    browser: { size: number };
  } {
    return {
      memory: {
        size: this.memoryCache.size(),
        keys: this.memoryCache.keys(),
      },
      browser: {
        size: Object.keys(this.browserCache).length,
      },
    };
  }

  /**
   * Cache with automatic key generation
   */
  cacheFunction<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl?: number
  ): (...args: Parameters<T>) => ReturnType<T> {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `fn_${fn.name}_${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = this.get<ReturnType<T>>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.then((resolved) => {
          this.set(key, resolved, ttl);
          return resolved;
        });
      }

      this.set(key, result, ttl);
      return result;
    }) as (...args: Parameters<T>) => ReturnType<T>;
  }

  /**
   * Preload data into cache
   */
  async preload<T>(
    key: string,
    dataFetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await dataFetcher();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    const memoryKeys = this.memoryCache.keys();
    
    memoryKeys.forEach(key => {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    });

    // Clear browser cache entries that match pattern
    const keys = Object.keys(this.browserCache);
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.browserCache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const cache = CacheManager.getInstance();

// Utility functions for common caching patterns
export const cacheUtils = {
  /**
   * Cache API responses
   */
  cacheApiResponse<T>(
    url: string,
    fetcher: () => Promise<T>,
    ttl = 5 * 60 * 1000
  ): Promise<T> {
    const key = `api_${url}`;
    return cache.preload(key, fetcher, ttl);
  },

  /**
   * Cache component data
   */
  cacheComponentData<T>(
    componentName: string,
    params: Record<string, any>,
    fetcher: () => Promise<T>,
    ttl = 10 * 60 * 1000
  ): Promise<T> {
    const key = `component_${componentName}_${JSON.stringify(params)}`;
    return cache.preload(key, fetcher, ttl);
  },

  /**
   * Cache user preferences
   */
  cacheUserPreferences<T>(
    userId: string,
    fetcher: () => Promise<T>,
    ttl = 30 * 60 * 1000
  ): Promise<T> {
    const key = `user_prefs_${userId}`;
    return cache.preload(key, fetcher, ttl);
  },
};
