/**
 * useInstitutionSearch Hook
 * Custom hook for searching and filtering institutions with real-time updates
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Institution } from "@/types/database";
import type { FilterState } from "@/types/filters";
import { buildFilterQuery } from "@/lib/search/filters";

export interface SearchResult {
  institutions: Institution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  appliedFilters: Partial<FilterState>;
  matchPercentage?: number;
}

export interface UseInstitutionSearchOptions {
  query?: string;
  filters?: FilterState;
  page?: number;
  limit?: number;
  autoSearch?: boolean;
  debounceMs?: number; // Debounce delay for real-time search
}

export interface UseInstitutionSearchReturn {
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  search: (options?: Partial<UseInstitutionSearchOptions>) => Promise<void>;
  reset: () => void;
  searchCount: number; // Track number of searches performed
}

/**
 * Hook for searching institutions with filters
 */
export function useInstitutionSearch(
  initialOptions: UseInstitutionSearchOptions = {}
): UseInstitutionSearchReturn {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [options, setOptions] = useState<UseInstitutionSearchOptions>({
    query: "",
    page: 1,
    limit: 20,
    autoSearch: false,
    debounceMs: 300,
    ...initialOptions,
  });
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (newOptions?: Partial<UseInstitutionSearchOptions>) => {
      // Cancel any pending searches
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Abort any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const searchOptions = {
        ...options,
        ...newOptions,
      };

      setOptions(searchOptions);
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this search
      abortControllerRef.current = new AbortController();

      try {
        // Build URL with query parameters
        const params = new URLSearchParams();

        if (searchOptions.query) {
          params.append("q", searchOptions.query);
        }

        if (searchOptions.page) {
          params.append("page", searchOptions.page.toString());
        }

        if (searchOptions.limit) {
          params.append("limit", searchOptions.limit.toString());
        }

        // Add filter parameters
        if (searchOptions.filters) {
          const filterQuery = buildFilterQuery(searchOptions.filters);

          if (filterQuery.countries && filterQuery.countries.length > 0) {
            params.append("countries", filterQuery.countries.join(","));
          }

          if (filterQuery.majors && filterQuery.majors.length > 0) {
            params.append("majors", filterQuery.majors.join(","));
          }

          if (filterQuery.costMin !== undefined) {
            params.append("costMin", filterQuery.costMin.toString());
          }

          if (filterQuery.costMax !== undefined) {
            params.append("costMax", filterQuery.costMax.toString());
          }

          if (filterQuery.languages && filterQuery.languages.length > 0) {
            params.append("languages", filterQuery.languages.join(","));
          }

          if (filterQuery.institutionTypes && filterQuery.institutionTypes.length > 0) {
            params.append("institutionTypes", filterQuery.institutionTypes.join(","));
          }

          if (filterQuery.rankingMin !== undefined) {
            params.append("rankingMin", filterQuery.rankingMin.toString());
          }

          if (filterQuery.rankingMax !== undefined) {
            params.append("rankingMax", filterQuery.rankingMax.toString());
          }

          if (filterQuery.deadlineAfter) {
            params.append("deadlineAfter", filterQuery.deadlineAfter);
          }

          if (filterQuery.deadlineBefore) {
            params.append("deadlineBefore", filterQuery.deadlineBefore);
          }
        }

        const response = await fetch(`/api/search/institutions?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to search institutions");
        }

        const data = await response.json();
        setResults(data);
        setSearchCount((prev) => prev + 1);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setSearchCount(0);
    setOptions({
      query: "",
      page: 1,
      limit: 20,
      autoSearch: false,
      debounceMs: 300,
    });
    
    // Cancel any pending operations
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Auto-search on mount if enabled
  useEffect(() => {
    if (options.autoSearch) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    reset,
    searchCount,
  };
}
