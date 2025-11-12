/**
 * Filter Types and Data Models
 * Defines the schema for multi-criteria filtering of institutions
 */

/**
 * Supported filter criteria types
 */
export type FilterType = 
  | "country"
  | "major"
  | "costRange"
  | "language"
  | "institutionType"
  | "ranking"
  | "applicationDeadline";

/**
 * Cost range brackets for tuition filtering
 */
export interface CostRange {
  min: number;
  max: number;
  currency: string;
}

/**
 * Language requirement levels
 */
export type LanguageLevel = 
  | "beginner"
  | "intermediate"
  | "advanced"
  | "native";

/**
 * Language requirement with proficiency level
 */
export interface LanguageRequirement {
  language: string;
  level: LanguageLevel;
  testRequired?: boolean;
  minimumScore?: string;
}

/**
 * Institution type categories
 */
export type InstitutionType = 
  | "university"
  | "college"
  | "technical"
  | "vocational"
  | "research";

/**
 * Ranking range for filtering
 */
export interface RankingRange {
  min: number;
  max: number;
  rankingSystem?: string;
}

/**
 * Application deadline filtering
 */
export interface DeadlineFilter {
  startDate: Date;
  endDate: Date;
  season?: "fall" | "spring" | "summer" | "winter";
}

/**
 * Individual filter criterion
 */
export interface FilterCriterion<T = any> {
  type: FilterType;
  values: T[];
  operator: "AND" | "OR";
  enabled: boolean;
}

/**
 * Complete filter state
 * Supports multiple criteria with different operators
 */
export interface FilterState {
  countries: FilterCriterion<string>;
  majors: FilterCriterion<string>;
  costRange: FilterCriterion<CostRange>;
  languages: FilterCriterion<LanguageRequirement>;
  institutionTypes: FilterCriterion<InstitutionType>;
  rankings: FilterCriterion<RankingRange>;
  deadlines: FilterCriterion<DeadlineFilter>;
}

/**
 * Filter options available to users
 */
export interface FilterOptions {
  countries: Array<{ code: string; name: string }>;
  majors: Array<{ id: string; name: string; category: string }>;
  languages: Array<{ code: string; name: string }>;
  institutionTypes: InstitutionType[];
  costRanges: Array<{ label: string; range: CostRange }>;
}

/**
 * Filter query parameters for API requests
 */
export interface FilterQuery {
  countries?: string[];
  majors?: string[];
  costMin?: number;
  costMax?: number;
  languages?: string[];
  institutionTypes?: InstitutionType[];
  rankingMin?: number;
  rankingMax?: number;
  deadlineAfter?: string;
  deadlineBefore?: string;
}

/**
 * Filter result metadata
 */
export interface FilterResult<T> {
  items: T[];
  totalCount: number;
  appliedFilters: Partial<FilterState>;
  matchPercentage?: number;
}

/**
 * Default filter state factory
 */
export const createDefaultFilterState = (): FilterState => ({
  countries: {
    type: "country",
    values: [],
    operator: "OR",
    enabled: false,
  },
  majors: {
    type: "major",
    values: [],
    operator: "OR",
    enabled: false,
  },
  costRange: {
    type: "costRange",
    values: [],
    operator: "AND",
    enabled: false,
  },
  languages: {
    type: "language",
    values: [],
    operator: "OR",
    enabled: false,
  },
  institutionTypes: {
    type: "institutionType",
    values: [],
    operator: "OR",
    enabled: false,
  },
  rankings: {
    type: "ranking",
    values: [],
    operator: "AND",
    enabled: false,
  },
  deadlines: {
    type: "applicationDeadline",
    values: [],
    operator: "AND",
    enabled: false,
  },
});

/**
 * Helper to check if any filters are active
 */
export const hasActiveFilters = (state: FilterState): boolean => {
  return Object.values(state).some((criterion) => criterion.enabled && criterion.values.length > 0);
};

/**
 * Helper to count active filters
 */
export const countActiveFilters = (state: FilterState): number => {
  return Object.values(state).filter(
    (criterion) => criterion.enabled && criterion.values.length > 0
  ).length;
};
