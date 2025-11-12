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

/**
 * GET /api/search/institutions
 * Search and filter institutions
 */
export async function GET(request: NextRequest) {
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

    // Apply ranking filter
    if (filterQuery.rankingMin !== undefined) {
      params.rank = `gte.${filterQuery.rankingMin}`;
    }
    if (filterQuery.rankingMax !== undefined) {
      params.rank = params.rank
        ? `${params.rank},lte.${filterQuery.rankingMax}`
        : `lte.${filterQuery.rankingMax}`;
    }

    // Apply institution type filter (using level_of_institution)
    if (filterQuery.institutionTypes && filterQuery.institutionTypes.length > 0) {
      params.level_of_institution = `in.(${filterQuery.institutionTypes.join(",")})`;
    }

    // Apply cost filters if provided
    if (filterQuery.costMin !== undefined) {
      params.tuition_and_fees = `gte.${filterQuery.costMin}`;
    }
    if (filterQuery.costMax !== undefined) {
      params.tuition_and_fees = params.tuition_and_fees
        ? `${params.tuition_and_fees},lte.${filterQuery.costMax}`
        : `lte.${filterQuery.costMax}`;
    }

    // Fetch institutions using the search view which includes search_vector for FTS
    // Falls back to v_institutions_complete if no query is provided
    const viewName = query && query.trim() ? "v_institutions_search" : "v_institutions_complete";
    const result = await apiClient.getPaginated<any>(
      viewName,
      params,
      page,
      limit
    );

    // Map the view data to our InstitutionWithFilters format
    const extendedInstitutions: InstitutionWithFilters[] = result.data.map((inst: any) => ({
      unitid: inst.unitid,
      institution_name: inst.institution_name,
      city: inst.city,
      state_code: inst.state_code,
      level_of_institution: inst.level_of_institution,
      control_of_institution: inst.control_of_institution,
      degree_of_urbanization: inst.degree_of_urbanization,
      rank: inst.rank,
      created_at: inst.created_at,
      updated_at: inst.updated_at,
      // Extended fields from the view
      tuition_and_fees: inst.tuition_and_fees,
      language_of_instruction: "English", // Default for now
      world_ranking: inst.rank || null,
      country: inst.state_name || "USA",
      majors: [], // Would need separate query for majors
    }));

    // Apply client-side filters for complex criteria
    // In production, these would be handled by database queries
    const filterState = {
      ...createDefaultFilterState(),
      ...parseFilterQuery(filterQuery),
    };

    const filteredResult = applyFilters(extendedInstitutions, filterState);

    return NextResponse.json({
      institutions: filteredResult.items,
      total: result.count,
      page: result.page,
      limit: result.pageSize,
      totalPages: result.totalPages,
      appliedFilters: filteredResult.appliedFilters,
      matchPercentage: filteredResult.matchPercentage,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
