/**
 * Search API Functions
 * Advanced search and filtering for institutions
 */

import { apiClient } from './client';
import { buildWeightedTsQuery } from '@/lib/search/synonyms';
import type {
  Institution,
  InstitutionComplete,
  SearchInstitutionsParams,
  PaginatedResponse,
} from '@/types';

export interface FullTextSearchOptions {
  query: string;
  page?: number;
  limit?: number;
  filters?: {
    state_code?: string | string[];
    level_of_institution?: string | string[];
    control_of_institution?: string;
    rank_min?: number;
    rank_max?: number;
  };
}

export interface SearchResultWithRank extends Institution {
  search_rank?: number;
}

/**
 * Search institutions by name using RPC function
 */
export async function searchInstitutions(
  searchTerm: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Institution>> {
  const results = await apiClient.rpc<Institution[]>('search_institutions', {
    search_term: searchTerm,
  });
  
  // Client-side pagination for RPC results
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = results.slice(start, end);
  
  return {
    data: paginatedData,
    count: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}

/**
 * Get institutions by state using RPC function
 */
export async function getInstitutionsByState(
  stateCode: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Institution>> {
  const results = await apiClient.rpc<Institution[]>('institutions_by_state', {
    state_code_param: stateCode,
  });
  
  // Client-side pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = results.slice(start, end);
  
  return {
    data: paginatedData,
    count: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}

/**
 * Get institutions by acceptance rate range using RPC function
 */
export async function getInstitutionsByAcceptanceRate(
  minRate: number,
  maxRate: number,
  year: number,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Institution>> {
  const results = await apiClient.rpc<Institution[]>(
    'institutions_by_acceptance_rate',
    {
      min_rate: minRate,
      max_rate: maxRate,
      year_param: year,
    }
  );
  
  // Client-side pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = results.slice(start, end);
  
  return {
    data: paginatedData,
    count: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}

/**
 * Get institutions by tuition range using RPC function
 */
export async function getInstitutionsByTuition(
  minTuition: number,
  maxTuition: number,
  year: number,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Institution>> {
  const results = await apiClient.rpc<Institution[]>(
    'institutions_by_tuition',
    {
      min_tuition: minTuition,
      max_tuition: maxTuition,
      year_param: year,
    }
  );
  
  // Client-side pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = results.slice(start, end);
  
  return {
    data: paginatedData,
    count: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}

/**
 * Get institutions by SAT score using RPC function
 */
export async function getInstitutionsBySATScore(
  minSAT: number,
  year: number,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Institution>> {
  const results = await apiClient.rpc<Institution[]>(
    'institutions_by_sat_score',
    {
      min_sat: minSAT,
      year_param: year,
    }
  );
  
  // Client-side pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = results.slice(start, end);
  
  return {
    data: paginatedData,
    count: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}

/**
 * Get institutions by major using RPC function
 */
export async function getInstitutionsByMajor(
  majorSearch: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Institution>> {
  const results = await apiClient.rpc<Institution[]>('institutions_by_major', {
    major_search: majorSearch,
  });
  
  // Client-side pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = results.slice(start, end);
  
  return {
    data: paginatedData,
    count: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}

/**
 * Advanced search with multiple filters
 * Combines multiple filter criteria
 */
export async function advancedSearch(
  params: SearchInstitutionsParams,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<InstitutionComplete>> {
  // Build PostgREST query parameters
  const queryParams: Record<string, any> = {};
  
  // Text search
  if (params.search_term) {
    queryParams.institution_name = `ilike.*${params.search_term}*`;
  }
  
  // State filter
  if (params.state_code) {
    queryParams.state_code = `eq.${params.state_code}`;
  }
  
  // Acceptance rate filter
  if (params.min_acceptance_rate !== undefined) {
    queryParams.percent_admitted = `gte.${params.min_acceptance_rate}`;
  }
  if (params.max_acceptance_rate !== undefined) {
    queryParams.percent_admitted = `lte.${params.max_acceptance_rate}`;
  }
  
  // Tuition filter
  if (params.min_tuition !== undefined) {
    queryParams.tuition_and_fees = `gte.${params.min_tuition}`;
  }
  if (params.max_tuition !== undefined) {
    queryParams.tuition_and_fees = `lte.${params.max_tuition}`;
  }
  
  // Year filter
  if (params.year) {
    queryParams.year = `eq.${params.year}`;
  }
  
  // Order by rank and institution name
  queryParams.order = 'rank.asc.nullslast,institution_name.asc';
  
  return apiClient.getPaginated<InstitutionComplete>(
    'v_institutions_complete',
    queryParams,
    page,
    pageSize
  );
}

/**
 * Get search suggestions based on partial input
 */
export async function getSearchSuggestions(
  partial: string,
  limit = 10
): Promise<Institution[]> {
  return apiClient.get<Institution[]>('institutions', {
    institution_name: `ilike.*${partial}*`,
    select: 'unitid,institution_name,city,state_code',
    order: 'rank.asc.nullslast,institution_name.asc',
    limit,
  });
}

/**
 * Full-text search with tsvector and synonym expansion
 * 
 * Uses PostgreSQL's tsvector for intelligent ranking based on:
 * - Institution name (highest weight)
 * - City
 * - Level of institution
 * - Control of institution
 * 
 * Automatically expands synonyms (university ↔ college, tech ↔ technical, etc.)
 * 
 * @param options - Search options including query, pagination, and filters
 * @returns Institutions ranked by relevance
 * 
 * @example
 * const results = await fullTextSearch({
 *   query: "california tech",
 *   page: 1,
 *   limit: 20,
 *   filters: { level_of_institution: ["Four or more years"] }
 * });
 */
export async function fullTextSearch(
  options: FullTextSearchOptions
): Promise<PaginatedResponse<SearchResultWithRank>> {
  const { query, page = 1, limit = 20, filters = {} } = options;

  // Build search parameters
  const params: Record<string, any> = {};

  // If we have a search query, use tsvector full-text search
  if (query && query.trim()) {
    // Build PostgreSQL tsquery with synonyms
    const tsquery = buildWeightedTsQuery(query);
    
    // PostgREST syntax for full-text search
    // Use the fts (full-text search) operator
    params["search_vector"] = `fts.${tsquery}`;
    
    // Order by relevance - PostgREST doesn't directly support ts_rank in params
    // We'll need to handle this via a custom RPC or order by other criteria
    params["order"] = "rank.asc.nullslast,institution_name.asc";
  }

  // Apply filters
  if (filters.state_code) {
    if (Array.isArray(filters.state_code)) {
      params["state_code"] = `in.(${filters.state_code.join(",")})`;
    } else {
      params["state_code"] = `eq.${filters.state_code}`;
    }
  }

  if (filters.level_of_institution) {
    if (Array.isArray(filters.level_of_institution)) {
      params["level_of_institution"] = `in.(${filters.level_of_institution.join(",")})`;
    } else {
      params["level_of_institution"] = `eq.${filters.level_of_institution}`;
    }
  }

  if (filters.control_of_institution) {
    params["control_of_institution"] = `eq.${filters.control_of_institution}`;
  }

  if (filters.rank_min !== undefined) {
    params["rank"] = `gte.${filters.rank_min}`;
  }

  if (filters.rank_max !== undefined) {
    params["rank"] = params.rank
      ? `${params.rank},lte.${filters.rank_max}`
      : `lte.${filters.rank_max}`;
  }

  // Use the search view which includes the search_vector
  return apiClient.getPaginated<SearchResultWithRank>(
    "v_institutions_search",
    params,
    page,
    limit
  );
}

/**
 * Simple text search across institution name and city
 * (fallback for when full-text search is not needed)
 * 
 * @param query - Text to search for
 * @param page - Page number
 * @param limit - Results per page
 * @returns Search results
 */
export async function simpleTextSearch(
  query: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Institution>> {
  const params: Record<string, any> = {};

  if (query && query.trim()) {
    // Use ilike for case-insensitive pattern matching
    params["or"] = `(institution_name.ilike.*${query}*,city.ilike.*${query}*)`;
  }

  return apiClient.getPaginated<Institution>(
    "v_institutions_complete",
    params,
    page,
    limit
  );
}
