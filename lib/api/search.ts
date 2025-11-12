/**
 * Search API Functions
 * Advanced search and filtering for institutions
 */

import { apiClient } from './client';
import type {
  Institution,
  InstitutionComplete,
  SearchInstitutionsParams,
  PaginatedResponse,
} from '@/types';

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
