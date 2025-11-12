/**
 * Search API with Advanced Filtering
 * GET /api/search/institutions
 */

import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/client";
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

    // Apply text search if query provided
    if (query) {
      params.institution_name = `ilike.*${query}*`;
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

    // Fetch institutions using the API client
    const result = await apiClient.getPaginated<Institution>(
      "institution",
      params,
      page,
      limit
    );

    // For filters that require joined data (costs, languages, majors),
    // we would need to fetch related data and extend the institutions
    // For now, return basic filtered data
    const extendedInstitutions: InstitutionWithFilters[] = result.data.map((inst: Institution) => ({
      ...inst,
      // These would be populated from joined queries in production
      tuition_and_fees: null,
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
