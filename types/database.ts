/**
 * Database Type Definitions
 * Generated from SCHEMA_DIAGRAM.md
 * These types represent the PostgreSQL database schema
 */

// ============================================================================
// DIMENSION TABLES
// ============================================================================

export interface State {
  state_code: string;
  state_name: string;
}

export interface Institution {
  unitid: number;
  institution_name: string;
  city: string;
  state_code: string;
  level_of_institution: string | null;
  control_of_institution: string | null;
  degree_of_urbanization: string | null;
  rank: number | null;
  created_at: string;
  updated_at: string;
}

export interface Major {
  major_id: number;
  major_name: string;
  created_at: string;
}

// ============================================================================
// FACT TABLES (Time-Series)
// ============================================================================

export interface EnrollmentStats {
  enrollment_id: number;
  unitid: number;
  year: number;
  undergraduate_headcount: number | null;
  percent_us_nonresident: number | null;
  associate_degrees: number | null;
  bachelor_degrees: number | null;
  created_at: string;
}

export interface AdmissionStats {
  admission_id: number;
  unitid: number;
  year: number;
  applicants_total: number | null;
  percent_admitted: number | null;
  created_at: string;
}

export interface TestScoreRanges {
  score_id: number;
  unitid: number;
  year: number;
  sat_ebrw_25th: number | null;
  sat_ebrw_75th: number | null;
  sat_math_25th: number | null;
  sat_math_75th: number | null;
  act_composite_25th: number | null;
  act_composite_75th: number | null;
  created_at: string;
}

export interface Costs {
  cost_id: number;
  unitid: number;
  year: number;
  tuition_and_fees: number | null;
  total_price_out_of_state_on_campus: number | null;
  total_price_out_of_state_off_campus: number | null;
  out_of_state_tuition_intl: number | null;
  created_at: string;
}

export interface AdmissionRequirements {
  requirement_id: number;
  unitid: number;
  year: number;
  secondary_school_gpa: string | null;
  secondary_school_rank: string | null;
  secondary_school_record: string | null;
  college_preparatory_program: string | null;
  recommendations: string | null;
  formal_demonstration_competencies: string | null;
  work_experience: string | null;
  personal_statement_essay: string | null;
  legacy_status: string | null;
  admission_test_scores: string | null;
  english_proficiency_test: string | null;
  open_admission_policy: string | null;
  other_test: string | null;
  created_at: string;
}

export interface InternationalRequirements {
  intl_req_id: number;
  unitid: number;
  year: number;
  toefl_minimum: number | null;
  toefl_section_requirements: string | null;
  ielts_minimum: number | null;
  ielts_section_requirements: string | null;
  english_exemptions: string | null;
  admission_documents: AdmissionDocuments | null;
  created_at: string;
}

// JSONB structure for admission_documents
export interface AdmissionDocuments {
  transcript?: string;
  financial_proof?: string;
  passport_copy?: string;
  recommendation_letters?: number;
  statement_of_purpose?: boolean;
  other?: string[];
  [key: string]: any; // Allow additional fields
}

// ============================================================================
// JUNCTION TABLES
// ============================================================================

export interface InstitutionMajor {
  institution_major_id: number;
  unitid: number;
  major_id: number;
  year: number;
  created_at: string;
}

// ============================================================================
// PROVENANCE METADATA (for data verification)
// ============================================================================

export interface ProvenanceMetadata {
  source_url: string;
  source_type: 'official_website' | 'ipeds' | 'csv_import' | 'third_party' | 'user_contribution';
  last_verified_at: string;
  verified_by: string | null;
  verification_status: 'verified' | 'pending' | 'rejected' | 'outdated';
}

// ============================================================================
// MATERIALIZED VIEWS
// ============================================================================

export interface InstitutionComplete extends Institution {
  // State information
  state_name: string;
  
  // Enrollment data
  undergraduate_headcount: number | null;
  percent_us_nonresident: number | null;
  associate_degrees: number | null;
  bachelor_degrees: number | null;
  
  // Admission data
  applicants_total: number | null;
  percent_admitted: number | null;
  
  // Cost data
  tuition_and_fees: number | null;
  total_price_out_of_state_on_campus: number | null;
  total_price_out_of_state_off_campus: number | null;
  out_of_state_tuition_intl: number | null;
  
  // International requirements
  toefl_minimum: number | null;
  toefl_section_requirements: string | null;
  ielts_minimum: number | null;
  ielts_section_requirements: string | null;
  english_exemptions: string | null;
  admission_documents: AdmissionDocuments | null;
  
  // Year for time-series data
  year: number;
}

export interface InstitutionTestScores extends Institution {
  year: number;
  sat_ebrw_25th: number | null;
  sat_ebrw_75th: number | null;
  sat_math_25th: number | null;
  sat_math_75th: number | null;
  act_composite_25th: number | null;
  act_composite_75th: number | null;
}

export interface InstitutionMajors extends Institution {
  year: number;
  major_id: number;
  major_name: string;
}

export interface InternationalRequirementsView extends Institution {
  year: number;
  toefl_minimum: number | null;
  toefl_section_requirements: string | null;
  ielts_minimum: number | null;
  ielts_section_requirements: string | null;
  english_exemptions: string | null;
  admission_documents: AdmissionDocuments | null;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface SearchInstitutionsParams {
  search_term?: string;
  state_code?: string;
  min_acceptance_rate?: number;
  max_acceptance_rate?: number;
  min_tuition?: number;
  max_tuition?: number;
  min_sat?: number;
  major_search?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type TableName =
  | 'institutions'
  | 'states'
  | 'majors'
  | 'enrollment_stats'
  | 'admission_stats'
  | 'test_score_ranges'
  | 'costs'
  | 'admission_requirements'
  | 'international_requirements'
  | 'institution_majors';

export type ViewName =
  | 'v_institutions_complete'
  | 'v_institutions_test_scores'
  | 'v_institutions_majors'
  | 'v_international_requirements';

export type FunctionName =
  | 'search_institutions'
  | 'institutions_by_state'
  | 'institutions_by_acceptance_rate'
  | 'institutions_by_tuition'
  | 'institutions_by_sat_score'
  | 'institutions_by_major';
