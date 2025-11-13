/**
 * Performance Monitoring and Metrics
 * 
 * Tracks cache performance, API response times, and other metrics
 * for performance optimization and debugging.
 */

import { getCacheStats } from './cache-utils';

export interface PerformanceMetric {
  timestamp: number;
  endpoint: string;
  method: string;
  duration: number; // milliseconds
  statusCode: number;
  cached: boolean;
  compressed: boolean;
  compressionRatio?: number;
  cacheHit?: boolean;
  errorMessage?: string;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number; // percentage
  size: number;
  type: 'redis' | 'memory';
}

export interface PerformanceSummary {
  totalRequests: number;
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate: number;
  compressionRate: number;
  errorRate: number;
  slowestEndpoints: Array<{
    endpoint: string;
    avgDuration: number;
    count: number;
  }>;
}

// In-memory storage for metrics (consider using Redis for production)
const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 10000; // Keep last 10k requests

/**
 * Record a performance metric
 */
export function recordMetric(metric: PerformanceMetric): void {
  metrics.push(metric);

  // Keep only recent metrics
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }

  // Log slow requests (>1 second)
  if (metric.duration > 1000) {
    console.warn(
      `[Performance] Slow request detected: ${metric.method} ${metric.endpoint} took ${metric.duration.toFixed(2)}ms`
    );
  }

  // Log errors
  if (metric.errorMessage) {
    console.error(
      `[Performance] Request error: ${metric.method} ${metric.endpoint} - ${metric.errorMessage}`
    );
  }
}

/**
 * Get performance metrics for a specific endpoint
 */
export function getEndpointMetrics(
  endpoint: string,
  limit: number = 100
): PerformanceMetric[] {
  return metrics
    .filter((m) => m.endpoint === endpoint)
    .slice(-limit);
}

/**
 * Get all metrics within a time range
 */
export function getMetricsByTimeRange(
  startTime: number,
  endTime: number
): PerformanceMetric[] {
  return metrics.filter(
    (m) => m.timestamp >= startTime && m.timestamp <= endTime
  );
}

/**
 * Calculate cache metrics
 */
export async function calculateCacheMetrics(): Promise<CacheMetrics> {
  try {
    const stats = await getCacheStats();
    const hitRate = stats.hits + stats.misses > 0
      ? (stats.hits / (stats.hits + stats.misses)) * 100
      : 0;

    return {
      hits: stats.hits,
      misses: stats.misses,
      hitRate,
      size: stats.size,
      type: stats.type as 'redis' | 'memory',
    };
  } catch (error) {
    console.error('[Monitoring] Error calculating cache metrics:', error);
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      type: 'memory',
    };
  }
}

/**
 * Calculate performance summary for recent requests
 */
export function calculatePerformanceSummary(
  minutes: number = 60
): PerformanceSummary {
  const cutoffTime = Date.now() - minutes * 60 * 1000;
  const recentMetrics = metrics.filter((m) => m.timestamp >= cutoffTime);

  if (recentMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      medianResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      cacheHitRate: 0,
      compressionRate: 0,
      errorRate: 0,
      slowestEndpoints: [],
    };
  }

  // Calculate response times
  const sortedDurations = recentMetrics
    .map((m) => m.duration)
    .sort((a, b) => a - b);

  const sum = sortedDurations.reduce((acc, d) => acc + d, 0);
  const avgResponseTime = sum / sortedDurations.length;

  const medianIndex = Math.floor(sortedDurations.length / 2);
  const medianResponseTime = sortedDurations[medianIndex];

  const p95Index = Math.floor(sortedDurations.length * 0.95);
  const p95ResponseTime = sortedDurations[p95Index];

  const p99Index = Math.floor(sortedDurations.length * 0.99);
  const p99ResponseTime = sortedDurations[p99Index];

  // Calculate cache hit rate
  const cachedRequests = recentMetrics.filter((m) => m.cached);
  const cacheHitRate = (cachedRequests.length / recentMetrics.length) * 100;

  // Calculate compression rate
  const compressedRequests = recentMetrics.filter((m) => m.compressed);
  const compressionRate = (compressedRequests.length / recentMetrics.length) * 100;

  // Calculate error rate
  const errorRequests = recentMetrics.filter((m) => m.errorMessage);
  const errorRate = (errorRequests.length / recentMetrics.length) * 100;

  // Find slowest endpoints
  const endpointStats = new Map<string, { totalDuration: number; count: number }>();

  recentMetrics.forEach((m) => {
    const stats = endpointStats.get(m.endpoint) || { totalDuration: 0, count: 0 };
    stats.totalDuration += m.duration;
    stats.count += 1;
    endpointStats.set(m.endpoint, stats);
  });

  const slowestEndpoints = Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      avgDuration: stats.totalDuration / stats.count,
      count: stats.count,
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 5);

  return {
    totalRequests: recentMetrics.length,
    averageResponseTime: avgResponseTime,
    medianResponseTime,
    p95ResponseTime,
    p99ResponseTime,
    cacheHitRate,
    compressionRate,
    errorRate,
    slowestEndpoints,
  };
}

/**
 * Format metrics for display
 */
export function formatMetricsSummary(summary: PerformanceSummary): string {
  const lines = [
    '=== Performance Summary ===',
    `Total Requests: ${summary.totalRequests}`,
    '',
    'Response Times:',
    `  Average: ${summary.averageResponseTime.toFixed(2)}ms`,
    `  Median: ${summary.medianResponseTime.toFixed(2)}ms`,
    `  P95: ${summary.p95ResponseTime.toFixed(2)}ms`,
    `  P99: ${summary.p99ResponseTime.toFixed(2)}ms`,
    '',
    'Optimization Rates:',
    `  Cache Hit Rate: ${summary.cacheHitRate.toFixed(2)}%`,
    `  Compression Rate: ${summary.compressionRate.toFixed(2)}%`,
    `  Error Rate: ${summary.errorRate.toFixed(2)}%`,
    '',
    'Slowest Endpoints:',
    ...summary.slowestEndpoints.map(
      (e) => `  ${e.endpoint}: ${e.avgDuration.toFixed(2)}ms (${e.count} requests)`
    ),
  ];

  return lines.join('\n');
}

/**
 * Clear all stored metrics (useful for testing)
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Get metric count
 */
export function getMetricCount(): number {
  return metrics.length;
}
