/**
 * Advanced Filter System
 * Multi-criteria filtering logic for institutions
 */

import type { Institution } from "@/types/database";
import type {
  FilterState,
  FilterCriterion,
  FilterResult,
  FilterQuery,
  CostRange,
  LanguageRequirement,
  RankingRange,
  DeadlineFilter,
} from "@/types/filters";

/**
 * Extended institution type with joined data for filtering
 * In production, this would be populated from API joins
 */
export interface InstitutionWithFilters extends Institution {
  tuition_and_fees?: number | null;
  language_of_instruction?: string | null;
  world_ranking?: number | null;
  country?: string | null;
  majors?: string[] | null;
}

/**
 * Apply country filter
 * Uses OR logic: match any of the selected countries
 */
export const filterByCountry = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<string>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    // Note: Current schema uses state_code, not country
    // For international filtering, this would need to be extended
    const stateMatch = criterion.values.includes(institution.state_code);
    return criterion.operator === "OR" ? stateMatch : stateMatch;
  });
};

/**
 * Apply major filter
 * Uses OR logic: match any of the selected majors
 */
export const filterByMajor = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<string>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    // Check if institution name contains any of the selected majors
    // In a real implementation, this would join with InstitutionMajor table
    const majorMatch = criterion.values.some((major) =>
      institution.institution_name?.toLowerCase().includes(major.toLowerCase())
    );
    return criterion.operator === "OR" ? majorMatch : majorMatch;
  });
};

/**
 * Apply cost range filter
 * Uses AND logic: must fall within ALL specified ranges
 */
export const filterByCostRange = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<CostRange>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    const tuition = institution.tuition_and_fees || 0;

    if (criterion.operator === "AND") {
      // Must fall within ALL ranges (intersection)
      return criterion.values.every((range) => tuition >= range.min && tuition <= range.max);
    } else {
      // Must fall within ANY range (union)
      return criterion.values.some((range) => tuition >= range.min && tuition <= range.max);
    }
  });
};

/**
 * Apply language requirement filter
 * Uses OR logic: match any of the accepted languages
 */
export const filterByLanguage = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<LanguageRequirement>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    // Check if institution supports any of the selected languages
    const languages = criterion.values.map((req) => req.language.toLowerCase());
    const institutionLanguage = institution.language_of_instruction?.toLowerCase() || "english";

    return languages.includes(institutionLanguage);
  });
};

/**
 * Apply institution type filter
 * Uses OR logic: match any of the selected types
 */
export const filterByInstitutionType = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<string>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    // Map institution type to our filter categories using level_of_institution
    const institutionType = institution.level_of_institution?.toLowerCase() || "university";
    return criterion.values.some((type) => type.toLowerCase() === institutionType);
  });
};

/**
 * Apply ranking filter
 * Uses AND logic: must fall within ALL specified ranges
 */
export const filterByRanking = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<RankingRange>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    const ranking = institution.rank || institution.world_ranking || Number.MAX_SAFE_INTEGER;

    if (criterion.operator === "AND") {
      return criterion.values.every((range) => ranking >= range.min && ranking <= range.max);
    } else {
      return criterion.values.some((range) => ranking >= range.min && ranking <= range.max);
    }
  });
};

/**
 * Apply deadline filter
 * Uses AND logic: deadline must fall within ALL specified ranges
 */
export const filterByDeadline = (
  institutions: InstitutionWithFilters[],
  criterion: FilterCriterion<DeadlineFilter>
): InstitutionWithFilters[] => {
  if (!criterion.enabled || criterion.values.length === 0) {
    return institutions;
  }

  return institutions.filter((institution) => {
    // This would need actual deadline data from the institution
    // For now, returning all institutions if enabled
    // TODO: Implement when deadline data is available
    return true;
  });
};

/**
 * Apply all filters to institutions
 * Uses AND logic between different filter types
 * Uses OR logic within the same filter type (configurable)
 */
export const applyFilters = (
  institutions: InstitutionWithFilters[],
  filterState: FilterState
): FilterResult<InstitutionWithFilters> => {
  const startTime = performance.now();

  // Apply filters sequentially (AND between types)
  let filtered = institutions;

  filtered = filterByCountry(filtered, filterState.countries);
  filtered = filterByMajor(filtered, filterState.majors);
  filtered = filterByCostRange(filtered, filterState.costRange);
  filtered = filterByLanguage(filtered, filterState.languages);
  filtered = filterByInstitutionType(filtered, filterState.institutionTypes);
  filtered = filterByRanking(filtered, filterState.rankings);
  filtered = filterByDeadline(filtered, filterState.deadlines);

  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`Filter execution time: ${duration.toFixed(2)}ms`);

  return {
    items: filtered,
    totalCount: filtered.length,
    appliedFilters: filterState,
    matchPercentage:
      institutions.length > 0 ? (filtered.length / institutions.length) * 100 : 0,
  };
};

/**
 * Build filter query for API requests
 * Converts FilterState to API query parameters
 */
export const buildFilterQuery = (filterState: FilterState): FilterQuery => {
  const query: FilterQuery = {};

  if (filterState.countries.enabled && filterState.countries.values.length > 0) {
    query.countries = filterState.countries.values;
  }

  if (filterState.majors.enabled && filterState.majors.values.length > 0) {
    query.majors = filterState.majors.values;
  }

  if (filterState.costRange.enabled && filterState.costRange.values.length > 0) {
    const ranges = filterState.costRange.values;
    query.costMin = Math.min(...ranges.map((r) => r.min));
    query.costMax = Math.max(...ranges.map((r) => r.max));
  }

  if (filterState.languages.enabled && filterState.languages.values.length > 0) {
    query.languages = filterState.languages.values.map((req) => req.language);
  }

  if (filterState.institutionTypes.enabled && filterState.institutionTypes.values.length > 0) {
    query.institutionTypes = filterState.institutionTypes.values;
  }

  if (filterState.rankings.enabled && filterState.rankings.values.length > 0) {
    const ranges = filterState.rankings.values;
    query.rankingMin = Math.min(...ranges.map((r) => r.min));
    query.rankingMax = Math.max(...ranges.map((r) => r.max));
  }

  if (filterState.deadlines.enabled && filterState.deadlines.values.length > 0) {
    const ranges = filterState.deadlines.values;
    query.deadlineAfter = new Date(
      Math.min(...ranges.map((r) => r.startDate.getTime()))
    ).toISOString();
    query.deadlineBefore = new Date(
      Math.max(...ranges.map((r) => r.endDate.getTime()))
    ).toISOString();
  }

  return query;
};

/**
 * Parse URL query parameters into FilterState
 * Useful for deep linking and bookmarking searches
 */
export const parseFilterQuery = (query: FilterQuery): Partial<FilterState> => {
  const filterState: Partial<FilterState> = {};

  if (query.countries && query.countries.length > 0) {
    filterState.countries = {
      type: "country",
      values: query.countries,
      operator: "OR",
      enabled: true,
    };
  }

  if (query.majors && query.majors.length > 0) {
    filterState.majors = {
      type: "major",
      values: query.majors,
      operator: "OR",
      enabled: true,
    };
  }

  if (query.costMin !== undefined && query.costMax !== undefined) {
    filterState.costRange = {
      type: "costRange",
      values: [{ min: query.costMin, max: query.costMax, currency: "USD" }],
      operator: "AND",
      enabled: true,
    };
  }

  if (query.languages && query.languages.length > 0) {
    filterState.languages = {
      type: "language",
      values: query.languages.map((lang) => ({
        language: lang,
        level: "intermediate" as const,
      })),
      operator: "OR",
      enabled: true,
    };
  }

  if (query.institutionTypes && query.institutionTypes.length > 0) {
    filterState.institutionTypes = {
      type: "institutionType",
      values: query.institutionTypes,
      operator: "OR",
      enabled: true,
    };
  }

  if (query.rankingMin !== undefined && query.rankingMax !== undefined) {
    filterState.rankings = {
      type: "ranking",
      values: [{ min: query.rankingMin, max: query.rankingMax }],
      operator: "AND",
      enabled: true,
    };
  }

  return filterState;
};

/**
 * Optimize filter execution for large datasets
 * Uses memoization and early exits
 */
export const optimizedApplyFilters = (
  institutions: InstitutionWithFilters[],
  filterState: FilterState,
  cache?: Map<string, FilterResult<InstitutionWithFilters>>
): FilterResult<InstitutionWithFilters> => {
  // Generate cache key from filter state
  const cacheKey = JSON.stringify(filterState);

  if (cache?.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const result = applyFilters(institutions, filterState);

  if (cache) {
    cache.set(cacheKey, result);
  }

  return result;
};
