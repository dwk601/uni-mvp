/**
 * PostgREST API Client
 * Base configuration for communicating with the PostgREST backend
 */

import type { TableName, ViewName } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request configuration interface
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: any;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

// Response wrapper interface
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Core fetch wrapper with error handling
 */
async function fetchWithTimeout<T>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, signal } = config;
  
  // Create abort controller for timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), API_TIMEOUT);
  
  // Combine signals if provided
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation', // PostgREST preference for mutations
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: combinedSignal,
    });
    
    clearTimeout(timeoutId);
    
    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as any;
    }
    
    // Handle errors
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        data
      );
    }
    
    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout or cancelled');
      }
      throw new ApiError(`Network error: ${error.message}`);
    }
    
    throw new ApiError('Unknown error occurred');
  }
}

/**
 * Create API client instance
 * Main interface for all API operations
 */
export function createApiClient() {
  /**
   * GET request to a table or view
   */
  async function get<T>(
    endpoint: TableName | ViewName | string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const queryString = params ? buildQueryString(params) : '';
    const url = `${API_BASE_URL}/${endpoint}${queryString}`;
    
    const response = await fetchWithTimeout<T>(url, {
      ...config,
      method: 'GET',
    });
    
    return response.data;
  }
  
  /**
   * POST request (RPC calls or inserts)
   */
  async function post<T>(
    endpoint: string,
    body?: any,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<T> {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetchWithTimeout<T>(url, {
      ...config,
      method: 'POST',
      body,
    });
    
    return response.data;
  }
  
  /**
   * PATCH request (updates)
   */
  async function patch<T>(
    endpoint: TableName | string,
    body: any,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<T> {
    const queryString = params ? buildQueryString(params) : '';
    const url = `${API_BASE_URL}/${endpoint}${queryString}`;
    
    const response = await fetchWithTimeout<T>(url, {
      ...config,
      method: 'PATCH',
      body,
    });
    
    return response.data;
  }
  
  /**
   * DELETE request
   */
  async function del<T>(
    endpoint: TableName | string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const queryString = params ? buildQueryString(params) : '';
    const url = `${API_BASE_URL}/${endpoint}${queryString}`;
    
    const response = await fetchWithTimeout<T>(url, {
      ...config,
      method: 'DELETE',
    });
    
    return response.data;
  }
  
  /**
   * Call RPC function
   */
  async function rpc<T>(
    functionName: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<T> {
    return post<T>(`rpc/${functionName}`, params, config);
  }
  
  /**
   * Get with pagination support
   */
  async function getPaginated<T>(
    endpoint: TableName | ViewName | string,
    params?: Record<string, any>,
    page = 1,
    pageSize = 10,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<{ data: T[]; count: number; page: number; pageSize: number; totalPages: number }> {
    // Calculate range for PostgREST
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const queryParams = {
      ...params,
      limit: pageSize,
      offset: from,
    };
    
    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/${endpoint}${queryString}`;
    
    const response = await fetchWithTimeout<T[]>(url, {
      ...config,
      method: 'GET',
      headers: {
        ...config?.headers,
        'Prefer': 'count=exact', // Get total count
        'Range': `${from}-${to}`,
      },
    });
    
    // Extract count from Content-Range header
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : response.data.length;
    const totalPages = Math.ceil(count / pageSize);
    
    return {
      data: response.data,
      count,
      page,
      pageSize,
      totalPages,
    };
  }
  
  return {
    get,
    post,
    patch,
    delete: del,
    rpc,
    getPaginated,
  };
}

// Create and export a singleton instance
export const apiClient = createApiClient();

// Export type for the client
export type ApiClient = ReturnType<typeof createApiClient>;
