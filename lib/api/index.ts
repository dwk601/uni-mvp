/**
 * API Module Exports
 * Central export point for all API functions
 */

// Core client
export { apiClient, createApiClient, ApiError } from './client';
export type { ApiClient, RequestConfig, ApiResponse } from './client';

// Institution API
export {
  getInstitutions,
  getInstitutionsPaginated,
  getInstitutionById,
  getInstitutionDetails,
  getInstitutionTestScores,
  getInstitutionMajors,
  getEnrollmentStats,
  getAdmissionStats,
  getCosts,
  getInternationalRequirements,
  getTestScoreRanges,
} from './institutions';

// Search API
export {
  searchInstitutions,
  getInstitutionsByState,
  getInstitutionsByAcceptanceRate,
  getInstitutionsByTuition,
  getInstitutionsBySATScore,
  getInstitutionsByMajor,
  advancedSearch,
  getSearchSuggestions,
} from './search';
