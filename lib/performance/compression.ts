/**
 * Response Compression Utility for API Routes
 * 
 * Provides Gzip and Brotli compression for Next.js API responses
 * with automatic Accept-Encoding negotiation.
 * 
 * Usage:
 * ```typescript
 * import { compressResponse } from '@/lib/performance/compression';
 * 
 * export async function GET(request: NextRequest) {
 *   const data = { ... };
 *   return compressResponse(request, data);
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import zlib from 'zlib';

export interface CompressionOptions {
  /**
   * Minimum response size (bytes) to compress
   * Responses smaller than this won't be compressed
   * @default 1024 (1KB)
   */
  threshold?: number;

  /**
   * Brotli compression level (0-11)
   * Higher = better compression but slower
   * @default 4 (balanced for dynamic content)
   */
  brotliLevel?: number;

  /**
   * Gzip compression level (0-9)
   * Higher = better compression but slower
   * @default 6 (default zlib level)
   */
  gzipLevel?: number;

  /**
   * Force specific encoding (useful for testing)
   */
  forceEncoding?: 'br' | 'gzip' | 'none';
}

const DEFAULT_OPTIONS: Required<Omit<CompressionOptions, 'forceEncoding'>> = {
  threshold: 1024, // 1KB
  brotliLevel: 4, // Balanced for dynamic content
  gzipLevel: 6, // Default zlib level
};

/**
 * Determine best compression method based on Accept-Encoding header
 */
function getBestEncoding(
  acceptEncoding: string,
  forceEncoding?: 'br' | 'gzip' | 'none'
): 'br' | 'gzip' | 'none' {
  if (forceEncoding) {
    return forceEncoding;
  }

  const encodings = acceptEncoding.toLowerCase();

  // Prefer Brotli if supported (better compression)
  if (encodings.includes('br')) {
    return 'br';
  }

  // Fall back to Gzip if supported
  if (encodings.includes('gzip')) {
    return 'gzip';
  }

  // No compression
  return 'none';
}

/**
 * Compress data with Brotli
 */
function brotliCompress(
  data: Buffer,
  level: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.brotliCompress(
      data,
      {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: level,
        },
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
}

/**
 * Compress data with Gzip
 */
function gzipCompress(
  data: Buffer,
  level: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zlib.gzip(
      data,
      {
        level,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
}

/**
 * Compress API response with Gzip or Brotli
 * 
 * @param request - Next.js request object
 * @param data - Data to send (will be JSON stringified)
 * @param options - Compression options
 * @returns NextResponse with compressed data
 */
export async function compressResponse(
  request: NextRequest,
  data: any,
  options: CompressionOptions = {}
): Promise<NextResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Serialize data to JSON string
  const jsonString = JSON.stringify(data);
  const buffer = Buffer.from(jsonString, 'utf-8');

  // Skip compression for small responses
  if (buffer.length < opts.threshold) {
    return NextResponse.json(data, {
      headers: {
        'Content-Length': buffer.length.toString(),
      },
    });
  }

  // Determine best compression method
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const encoding = getBestEncoding(acceptEncoding, options.forceEncoding);

  try {
    let compressed: Buffer;
    let contentEncoding: string | undefined;

    switch (encoding) {
      case 'br':
        compressed = await brotliCompress(buffer, opts.brotliLevel);
        contentEncoding = 'br';
        break;

      case 'gzip':
        compressed = await gzipCompress(buffer, opts.gzipLevel);
        contentEncoding = 'gzip';
        break;

      case 'none':
      default:
        compressed = buffer;
        contentEncoding = undefined;
        break;
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Content-Length': compressed.length.toString(),
      'Vary': 'Accept-Encoding',
      ...(contentEncoding && { 'Content-Encoding': contentEncoding }),
    });

    // Convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(compressed), { headers });
  } catch (error) {
    console.error('[Compression] Error compressing response:', error);
    // Fall back to uncompressed response
    return NextResponse.json(data);
  }
}

/**
 * Compression statistics for monitoring
 */
export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  encoding: 'br' | 'gzip' | 'none';
  timeTaken: number; // milliseconds
}

/**
 * Compress data and return stats (useful for monitoring/testing)
 */
export async function compressWithStats(
  request: NextRequest,
  data: any,
  options: CompressionOptions = {}
): Promise<{ response: NextResponse; stats: CompressionStats }> {
  const startTime = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const jsonString = JSON.stringify(data);
  const buffer = Buffer.from(jsonString, 'utf-8');
  const originalSize = buffer.length;

  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const encoding = getBestEncoding(acceptEncoding, options.forceEncoding);

  let compressed: Buffer;
  let compressionRatio: number;

  if (buffer.length < opts.threshold || encoding === 'none') {
    compressed = buffer;
    compressionRatio = 1.0;
  } else {
    try {
      switch (encoding) {
        case 'br':
          compressed = await brotliCompress(buffer, opts.brotliLevel);
          break;
        case 'gzip':
          compressed = await gzipCompress(buffer, opts.gzipLevel);
          break;
        default:
          compressed = buffer;
      }
      compressionRatio = originalSize / compressed.length;
    } catch (error) {
      console.error('[Compression] Error:', error);
      compressed = buffer;
      compressionRatio = 1.0;
    }
  }

  const timeTaken = performance.now() - startTime;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Content-Length': compressed.length.toString(),
    'Vary': 'Accept-Encoding',
    ...(encoding !== 'none' && { 'Content-Encoding': encoding }),
  });

  const stats: CompressionStats = {
    originalSize,
    compressedSize: compressed.length,
    compressionRatio,
    encoding,
    timeTaken,
  };

  return {
    response: new NextResponse(new Uint8Array(compressed), { headers }),
    stats,
  };
}

/**
 * Estimate potential compression savings without actually compressing
 * Useful for deciding whether compression is worth it
 */
export function estimateCompressionSavings(
  data: any,
  encoding: 'br' | 'gzip' = 'br'
): { originalSize: number; estimatedRatio: number } {
  const jsonString = JSON.stringify(data);
  const originalSize = Buffer.byteLength(jsonString, 'utf-8');

  // Typical compression ratios for JSON
  const estimatedRatios = {
    br: 4.0, // Brotli typically achieves 4:1 for JSON
    gzip: 3.0, // Gzip typically achieves 3:1 for JSON
  };

  return {
    originalSize,
    estimatedRatio: estimatedRatios[encoding],
  };
}
