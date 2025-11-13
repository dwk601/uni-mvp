/**
 * Cache utility usage examples and helper functions
 */

import { createCache, cacheKey, getCache, CacheClient } from './caching';

// Cache key namespaces
export const CACHE_KEYS = {
  INSTITUTIONS: 'institutions',
  INSTITUTION_DETAIL: 'institution',
  SEARCH_RESULTS: 'search',
  FILTERS: 'filters',
} as const;

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  INSTITUTION_LIST: 300, // 5 minutes
  INSTITUTION_DETAIL: 3600, // 1 hour
  SEARCH_RESULTS: 180, // 3 minutes
  FILTERS: 1800, // 30 minutes
} as const;

let cacheInitialized = false;

/**
 * Initialize cache (call once at app startup)
 */
export async function initializeCache(): Promise<CacheClient> {
  if (cacheInitialized) {
    return getCache();
  }

  const cache = await createCache({
    keyPrefix: 'university:',
  });

  cacheInitialized = true;
  
  const stats = await cache.stats();
  console.log(`[Cache] Initialized: ${stats.type} cache`);
  
  return cache;
}

/**
 * Cache institution list
 */
export async function cacheInstitutionList(
  institutions: any[],
  filters?: Record<string, any>
): Promise<void> {
  const cache = await initializeCache();
  const key = filters
    ? cacheKey(CACHE_KEYS.INSTITUTIONS, JSON.stringify(filters))
    : cacheKey(CACHE_KEYS.INSTITUTIONS, 'all');
  
  await cache.set(key, institutions, CACHE_TTL.INSTITUTION_LIST);
}

/**
 * Get cached institution list
 */
export async function getCachedInstitutionList(
  filters?: Record<string, any>
): Promise<any[] | null> {
  const cache = await initializeCache();
  const key = filters
    ? cacheKey(CACHE_KEYS.INSTITUTIONS, JSON.stringify(filters))
    : cacheKey(CACHE_KEYS.INSTITUTIONS, 'all');
  
  return cache.get(key);
}

/**
 * Cache individual institution detail
 */
export async function cacheInstitutionDetail(
  institutionId: number,
  data: any
): Promise<void> {
  const cache = await initializeCache();
  const key = cacheKey(CACHE_KEYS.INSTITUTION_DETAIL, institutionId);
  await cache.set(key, data, CACHE_TTL.INSTITUTION_DETAIL);
}

/**
 * Get cached institution detail
 */
export async function getCachedInstitutionDetail(
  institutionId: number
): Promise<any | null> {
  const cache = await initializeCache();
  const key = cacheKey(CACHE_KEYS.INSTITUTION_DETAIL, institutionId);
  return cache.get(key);
}

/**
 * Invalidate institution cache (call after updates)
 */
export async function invalidateInstitutionCache(
  institutionId?: number
): Promise<void> {
  const cache = await initializeCache();
  
  if (institutionId) {
    // Invalidate specific institution
    const key = cacheKey(CACHE_KEYS.INSTITUTION_DETAIL, institutionId);
    await cache.delete(key);
  }
  
  // Invalidate all institution lists
  await cache.deletePattern(`university:${CACHE_KEYS.INSTITUTIONS}:*`);
}

/**
 * Cache search results
 */
export async function cacheSearchResults(
  query: string,
  results: any[]
): Promise<void> {
  const cache = await initializeCache();
  const key = cacheKey(CACHE_KEYS.SEARCH_RESULTS, query.toLowerCase());
  await cache.set(key, results, CACHE_TTL.SEARCH_RESULTS);
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(
  query: string
): Promise<any[] | null> {
  const cache = await initializeCache();
  const key = cacheKey(CACHE_KEYS.SEARCH_RESULTS, query.toLowerCase());
  return cache.get(key);
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const cache = await initializeCache();
    return await cache.stats();
  } catch (error) {
    console.error('[Cache] Error getting stats:', error);
    return {
      hits: 0,
      misses: 0,
      size: 0,
      type: 'error' as const,
    };
  }
}
