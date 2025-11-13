/**
 * Performance Metrics API
 * GET /api/admin/metrics
 * 
 * Returns cache and performance metrics for monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateCacheMetrics,
  calculatePerformanceSummary,
  formatMetricsSummary,
  getMetricCount,
} from '@/lib/performance/monitoring';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minutes = Number(searchParams.get('minutes') || '60');
    const format = searchParams.get('format') || 'json'; // 'json' or 'text'

    // Get cache metrics
    const cacheMetrics = await calculateCacheMetrics();

    // Get performance summary
    const performanceSummary = calculatePerformanceSummary(minutes);

    const data = {
      cache: cacheMetrics,
      performance: performanceSummary,
      metricCount: getMetricCount(),
      timeRange: `Last ${minutes} minutes`,
      timestamp: new Date().toISOString(),
    };

    if (format === 'text') {
      const text = [
        `=== Cache Metrics ===`,
        `Type: ${cacheMetrics.type}`,
        `Hits: ${cacheMetrics.hits}`,
        `Misses: ${cacheMetrics.misses}`,
        `Hit Rate: ${cacheMetrics.hitRate.toFixed(2)}%`,
        `Size: ${cacheMetrics.size} entries`,
        '',
        formatMetricsSummary(performanceSummary),
        '',
        `Total Metrics Stored: ${data.metricCount}`,
        `Time Range: ${data.timeRange}`,
        `Generated: ${data.timestamp}`,
      ].join('\n');

      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Metrics API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
