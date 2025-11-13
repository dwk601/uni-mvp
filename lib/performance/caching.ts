/**
 * Unified caching interface supporting both Redis and in-memory fallback
 * 
 * Usage:
 * ```typescript
 * const cache = createCache();
 * await cache.set('key', { data: 'value' }, 3600); // TTL in seconds
 * const data = await cache.get('key');
 * await cache.delete('key');
 * ```
 */

import { createClient } from 'redis';
import type { RedisClientType as RedisClient } from 'redis';

export interface CacheOptions {
  ttl?: number; // Default TTL in seconds
  keyPrefix?: string;
}

export interface CacheClient {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
  stats(): Promise<CacheStats>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  type: 'redis' | 'memory';
}

// In-memory cache implementation
class InMemoryCache implements CacheClient {
  private cache = new Map<string, { value: any; expires: number }>();
  private hits = 0;
  private misses = 0;
  private keyPrefix: string;

  constructor(options: CacheOptions = {}) {
    this.keyPrefix = options.keyPrefix || 'cache:';
  }

  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private isExpired(entry: { expires: number }): boolean {
    return Date.now() > entry.expires;
  }

  async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const entry = this.cache.get(fullKey);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(fullKey);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const fullKey = this.getFullKey(key);
    const expires = Date.now() + ttl * 1000;
    this.cache.set(fullKey, { value, expires });
  }

  async delete(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    this.cache.delete(fullKey);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async stats(): Promise<CacheStats> {
    // Clean up expired entries before reporting size
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }

    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      type: 'memory',
    };
  }
}

// Redis cache implementation
class RedisCache implements CacheClient {
  private client: any; // RedisClient type
  private hits = 0;
  private misses = 0;
  private keyPrefix: string;
  private connected = false;

  constructor(client: any, options: CacheOptions = {}) {
    this.client = client;
    this.keyPrefix = options.keyPrefix || 'cache:';
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const value = await this.client.get(fullKey);

      if (value === null) {
        this.misses++;
        return null;
      }

      this.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      this.misses++;
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);
      await this.client.setEx(fullKey, ttl, serialized);
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await this.client.del(fullKey);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.client.keys(fullPattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis deletePattern error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const pattern = this.getFullKey('*');
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      this.hits = 0;
      this.misses = 0;
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async stats(): Promise<CacheStats> {
    try {
      const pattern = this.getFullKey('*');
      const keys = await this.client.keys(pattern);
      return {
        hits: this.hits,
        misses: this.misses,
        size: keys.length,
        type: 'redis',
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return {
        hits: this.hits,
        misses: this.misses,
        size: 0,
        type: 'redis',
      };
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }
}

// Singleton instance
let cacheInstance: CacheClient | null = null;

/**
 * Creates or returns existing cache client
 * Attempts Redis connection first, falls back to in-memory cache
 */
export async function createCache(options: CacheOptions = {}): Promise<CacheClient> {
  if (cacheInstance) {
    return cacheInstance;
  }

  // Try Redis first if URL is configured
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    try {
      console.log('[Cache] Attempting Redis connection...');
      const client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries: number) => {
            if (retries > 3) {
              console.warn('[Cache] Redis reconnection failed, falling back to in-memory cache');
              return false; // Stop retrying
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      client.on('error', (err: Error) => {
        console.error('[Cache] Redis client error:', err);
      });

      const redisCache = new RedisCache(client, options);
      await redisCache.connect();

      // Test connection with a ping
      await client.ping();
      
      console.log('[Cache] ✓ Redis connected successfully');
      cacheInstance = redisCache;
      return redisCache;
    } catch (error) {
      console.warn('[Cache] Redis connection failed, using in-memory cache:', error);
    }
  } else {
    console.log('[Cache] No REDIS_URL configured, using in-memory cache');
  }

  // Fallback to in-memory cache
  cacheInstance = new InMemoryCache(options);
  return cacheInstance;
}

/**
 * Get the current cache instance (must call createCache first)
 */
export function getCache(): CacheClient {
  if (!cacheInstance) {
    throw new Error('Cache not initialized. Call createCache() first.');
  }
  return cacheInstance;
}

/**
 * Clear and reset cache instance
 */
export async function resetCache(): Promise<void> {
  if (cacheInstance) {
    await cacheInstance.clear();
    if (cacheInstance instanceof RedisCache) {
      await (cacheInstance as any).disconnect();
    }
    cacheInstance = null;
  }
}

/**
 * Generate cache key with namespace
 */
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}
