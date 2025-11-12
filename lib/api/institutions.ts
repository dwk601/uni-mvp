/**
 * Institution API Functions
 * API calls related to institution data
 */

import { apiClient } from './client';
import type {
  Institution,
  InstitutionComplete,
  InstitutionTestScores,
  InstitutionMajors,
  EnrollmentStats,
  AdmissionStats,
  Costs,
  InternationalRequirements,
  TestScoreRanges,
  PaginatedResponse,
} from '@/types';

/**
 * Get all institutions with optional filtering
 */
export async function getInstitutions(params?: {
  state_code?: string;
  level_of_institution?: string;
  control_of_institution?: string;
  limit?: number;
  offset?: number;
}): Promise<Institution[]> {
  return apiClient.get<Institution[]>('institutions', params);
}

/**
 * Get institutions with pagination
 */
export async function getInstitutionsPaginated(
  page = 1,
  pageSize = 20,
  filters?: {
    state_code?: string;
    level_of_institution?: string;
    control_of_institution?: string;
  }
): Promise<PaginatedResponse<Institution>> {
  return apiClient.getPaginated<Institution>(
    'institutions',
    filters,
    page,
    pageSize
  );
}

/**
 * Get a single institution by ID
 */
export async function getInstitutionById(unitid: number): Promise<Institution | null> {
  const results = await apiClient.get<Institution[]>('institutions', {
    unitid: `eq.${unitid}`,
  });
  
  return results[0] || null;
}

/**
 * Get complete institution details (from materialized view)
 */
export async function getInstitutionDetails(
  unitid: number,
  year?: number
): Promise<InstitutionComplete | null> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  const results = await apiClient.get<InstitutionComplete[]>(
    'v_institutions_complete',
    params
  );
  
  return results[0] || null;
}

/**
 * Get institution test scores
 */
export async function getInstitutionTestScores(
  unitid: number,
  year?: number
): Promise<InstitutionTestScores | null> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  const results = await apiClient.get<InstitutionTestScores[]>(
    'v_institutions_test_scores',
    params
  );
  
  return results[0] || null;
}

/**
 * Get institution majors
 */
export async function getInstitutionMajors(
  unitid: number,
  year?: number
): Promise<InstitutionMajors[]> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  return apiClient.get<InstitutionMajors[]>('v_institutions_majors', params);
}

/**
 * Get enrollment statistics
 */
export async function getEnrollmentStats(
  unitid: number,
  year?: number
): Promise<EnrollmentStats[]> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  return apiClient.get<EnrollmentStats[]>('enrollment_stats', params);
}

/**
 * Get admission statistics
 */
export async function getAdmissionStats(
  unitid: number,
  year?: number
): Promise<AdmissionStats[]> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  return apiClient.get<AdmissionStats[]>('admission_stats', params);
}

/**
 * Get cost information
 */
export async function getCosts(
  unitid: number,
  year?: number
): Promise<Costs[]> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  return apiClient.get<Costs[]>('costs', params);
}

/**
 * Get international requirements
 */
export async function getInternationalRequirements(
  unitid: number,
  year?: number
): Promise<InternationalRequirements[]> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  return apiClient.get<InternationalRequirements[]>(
    'international_requirements',
    params
  );
}

/**
 * Get test score ranges
 */
export async function getTestScoreRanges(
  unitid: number,
  year?: number
): Promise<TestScoreRanges[]> {
  const params: Record<string, any> = {
    unitid: `eq.${unitid}`,
  };
  
  if (year) {
    params.year = `eq.${year}`;
  }
  
  return apiClient.get<TestScoreRanges[]>('test_score_ranges', params);
}
