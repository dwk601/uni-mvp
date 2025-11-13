/**
 * Search API with Advanced Filtering
 * GET /api/search/institutions
 */

import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
import { buildWeightedTsQuery } from "@/lib/search/synonyms";
import type { Institution } from "@/types/database";
import type { FilterQuery } from "@/types/filters";
import {
  applyFilters,
  parseFilterQuery,
  InstitutionWithFilters,
} from "@/lib/search/filters";
import { createDefaultFilterState } from "@/types/filters";
import {
  initializeCache,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/lib/performance/cache-utils";
import { cacheKey } from "@/lib/performance/caching";
import { compressResponse } from "@/lib/performance/compression";
import { recordMetric } from "@/lib/performance/monitoring";

// Enable compression for API responses (set to false to disable)
const COMPRESSION_ENABLED = process.env.COMPRESSION_ENABLED !== 'false';

/**
 * GET /api/search/institutions
 * Search and filter institutions
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  let isCached = false;
  let isCompressed = false;

  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    const filterQuery: FilterQuery = {
      countries: searchParams.get("countries")?.split(",").filter(Boolean),
      majors: searchParams.get("majors")?.split(",").filter(Boolean),
      costMin: searchParams.get("costMin") ? Number(searchParams.get("costMin")) : undefined,
      costMax: searchParams.get("costMax") ? Number(searchParams.get("costMax")) : undefined,
      languages: searchParams.get("languages")?.split(",").filter(Boolean),
      institutionTypes: searchParams.get("institutionTypes")?.split(",").filter(Boolean) as any,
      rankingMin: searchParams.get("rankingMin")
        ? Number(searchParams.get("rankingMin"))
        : undefined,
      rankingMax: searchParams.get("rankingMax")
        ? Number(searchParams.get("rankingMax"))
        : undefined,
      deadlineAfter: searchParams.get("deadlineAfter") || undefined,
      deadlineBefore: searchParams.get("deadlineBefore") || undefined,
    };

    // Extract pagination parameters
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");

    // Extract search query
    const query = searchParams.get("q") || "";

    // Generate cache key based on all query parameters
    const cache = await initializeCache();
    const searchCacheKey = cacheKey(
      CACHE_KEYS.SEARCH_RESULTS,
      query,
      JSON.stringify(filterQuery),
      page,
      limit
    );

    // Try to get from cache
    const cached = await cache.get(searchCacheKey);
    if (cached) {
      isCached = true;
      const cachedResponse = {
        ...cached,
        cached: true,
      };
      
      // Compress cached responses if enabled
      if (COMPRESSION_ENABLED) {
        isCompressed = true;
        const response = await compressResponse(request, cachedResponse);
        
        // Record metric
        const duration = performance.now() - startTime;
        recordMetric({
          timestamp: Date.now(),
          endpoint: '/api/search/institutions',
          method: 'GET',
          duration,
          statusCode: 200,
          cached: true,
          compressed: true,
          cacheHit: true,
        });
        
        return response;
      }
      
      // Record metric for uncompressed cached response
      const duration = performance.now() - startTime;
      recordMetric({
        timestamp: Date.now(),
        endpoint: '/api/search/institutions',
        method: 'GET',
        duration,
        statusCode: 200,
        cached: true,
        compressed: false,
        cacheHit: true,
      });
      
      return NextResponse.json(cachedResponse);
    }

    // Build PostgREST query parameters
    const params: Record<string, any> = {};

    // Apply full-text search if query provided (with synonym expansion)
    if (query && query.trim()) {
      // Build PostgreSQL tsquery with synonyms
      const tsquery = buildWeightedTsQuery(query);
      // Use full-text search on search_vector
      params.search_vector = `fts.${tsquery}`;
    }

    // Apply state/country filter
    if (filterQuery.countries && filterQuery.countries.length > 0) {
      params.state_code = `in.(${filterQuery.countries.join(",")})`;
    }

    // Apply ranking filter - only if rank column exists
    // Note: Commenting out until we verify the column exists
    // if (filterQuery.rankingMin !== undefined) {
    //   params.rank = `gte.${filterQuery.rankingMin}`;
    // }
    // if (filterQuery.rankingMax !== undefined) {
    //   params.rank = params.rank
    //     ? `${params.rank},lte.${filterQuery.rankingMax}`
    //     : `lte.${filterQuery.rankingMax}`;
    // }

    // Apply institution type filter (using level_of_institution)
    if (filterQuery.institutionTypes && filterQuery.institutionTypes.length > 0) {
      params.level_of_institution = `in.(${filterQuery.institutionTypes.join(",")})`;
    }

    // Apply cost filters if provided - only if tuition_and_fees column exists
    // Note: Commenting out until we verify the column exists
    // if (filterQuery.costMin !== undefined) {
    //   params.tuition_and_fees = `gte.${filterQuery.costMin}`;
    // }
    // if (filterQuery.costMax !== undefined) {
    //   params.tuition_and_fees = params.tuition_and_fees
    //     ? `${params.tuition_and_fees},lte.${filterQuery.costMax}`
    //     : `lte.${filterQuery.costMax}`;
    // }

    // Fetch institutions using the search view which includes search_vector for FTS
    // Falls back to v_institutions_complete if no query is provided
    // For now, use institutions table directly until views are created
    const viewName = "institutions";
    const result = await apiClient.getPaginated<any>(
      viewName,
      params,
      page,
      limit
    );

    // Map the database data to our InstitutionWithFilters format
    // Only use fields that exist in the institutions table
    const extendedInstitutions: InstitutionWithFilters[] = result.data.map((inst: any) => ({
      unitid: inst.unitid,
      institution_name: inst.institution_name,
      city: inst.city || "",
      state_code: inst.state_code || "",
      level_of_institution: inst.level_of_institution || "4-year",
      control_of_institution: inst.control_of_institution || "Public",
      degree_of_urbanization: inst.degree_of_urbanization || "City",
      rank: inst.rank || null,
      created_at: inst.created_at,
      updated_at: inst.updated_at,
      // Extended fields - use defaults if not available
      tuition_and_fees: inst.tuition_and_fees || null,
      language_of_instruction: "English",
      world_ranking: inst.rank || null,
      country: "USA",
      majors: [],
    }));

    // Apply client-side filters for complex criteria
    // In production, these would be handled by database queries
    const filterState = {
      ...createDefaultFilterState(),
      ...parseFilterQuery(filterQuery),
    };

    const filteredResult = applyFilters(extendedInstitutions, filterState);

    const responseData = {
      institutions: filteredResult.items,
      total: result.count,
      page: result.page,
      limit: result.pageSize,
      totalPages: result.totalPages,
      appliedFilters: filteredResult.appliedFilters,
      matchPercentage: filteredResult.matchPercentage,
    };

    // Cache the result
    await cache.set(searchCacheKey, responseData, CACHE_TTL.SEARCH_RESULTS);

    const freshResponse = {
      ...responseData,
      cached: false,
    };

    // Compress fresh responses if enabled
    if (COMPRESSION_ENABLED) {
      isCompressed = true;
      const response = await compressResponse(request, freshResponse);
      
      // Record metric
      const duration = performance.now() - startTime;
      recordMetric({
        timestamp: Date.now(),
        endpoint: '/api/search/institutions',
        method: 'GET',
        duration,
        statusCode: 200,
        cached: false,
        compressed: true,
        cacheHit: false,
      });
      
      return response;
    }

    // Record metric for uncompressed fresh response
    const duration = performance.now() - startTime;
    recordMetric({
      timestamp: Date.now(),
      endpoint: '/api/search/institutions',
      method: 'GET',
      duration,
      statusCode: 200,
      cached: false,
      compressed: false,
      cacheHit: false,
    });

    return NextResponse.json(freshResponse);
  } catch (error) {
    // Record error metric
    const duration = performance.now() - startTime;
    recordMetric({
      timestamp: Date.now(),
      endpoint: '/api/search/institutions',
      method: 'GET',
      duration,
      statusCode: 500,
      cached: isCached,
      compressed: isCompressed,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error("Search API error:", error);
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = (error as any)?.details || null;
    
    console.error("Error details:", {
      message: errorMessage,
      details: errorDetails,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: "Internal server error",
      message: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}
