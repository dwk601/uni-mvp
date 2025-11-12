-- Full-Text Search Enhancement for University Database
-- Adds tsvector columns and GIN indexes for fast full-text search

-- Add tsvector column to institutions table for searchable text
ALTER TABLE institutions
ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION institutions_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.institution_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.level_of_institution, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.control_of_institution, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector
CREATE TRIGGER institutions_search_vector_trigger
BEFORE INSERT OR UPDATE ON institutions
FOR EACH ROW
EXECUTE FUNCTION institutions_search_vector_update();

-- Populate search_vector for existing rows
UPDATE institutions
SET search_vector = 
  setweight(to_tsvector('english', coalesce(institution_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(level_of_institution, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(control_of_institution, '')), 'D');

-- Create GIN index for fast full-text search
CREATE INDEX idx_institutions_search_vector ON institutions USING GIN(search_vector);

-- Create enhanced search view with ranking
CREATE OR REPLACE VIEW v_institutions_search AS
SELECT 
    i.unitid,
    i.institution_name,
    i.city,
    s.state_name,
    i.state_code,
    i.level_of_institution,
    i.control_of_institution,
    i.degree_of_urbanization,
    i.rank,
    i.search_vector,
    -- Join with latest enrollment data
    e.year as enrollment_year,
    e.undergraduate_headcount,
    e.percent_us_nonresident,
    -- Join with latest costs
    c.tuition_and_fees,
    c.total_price_out_of_state_on_campus,
    c.out_of_state_tuition_intl,
    -- Join with latest international requirements
    ir.toefl_minimum,
    ir.ielts_minimum
FROM institutions i
LEFT JOIN states s ON i.state_code = s.state_code
LEFT JOIN LATERAL (
    SELECT * FROM enrollment_stats
    WHERE unitid = i.unitid
    ORDER BY year DESC
    LIMIT 1
) e ON true
LEFT JOIN LATERAL (
    SELECT * FROM costs
    WHERE unitid = i.unitid
    ORDER BY year DESC
    LIMIT 1
) c ON true
LEFT JOIN LATERAL (
    SELECT * FROM international_requirements
    WHERE unitid = i.unitid
    ORDER BY year DESC
    LIMIT 1
) ir ON true;

-- Create synonym dictionary for common university search terms
CREATE TEXT SEARCH DICTIONARY university_synonyms (
    TEMPLATE = synonym,
    SYNONYMS = university_synonyms
);

-- Create synonym file content (to be added to PostgreSQL's tsearch_data directory)
-- This would typically be placed in: /usr/share/postgresql/<version>/tsearch_data/university_synonyms.syn
COMMENT ON TEXT SEARCH DICTIONARY university_synonyms IS '
Synonym mappings for university search:
university : college, uni, school, institution
college : university, school, institution
state : public
private : independent
technical : tech, technological
community : cc, junior
';

-- Grant permissions for PostgREST
GRANT SELECT ON v_institutions_search TO anon;
GRANT SELECT ON v_institutions_search TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN institutions.search_vector IS 'Full-text search vector with weighted fields: A=name, B=city, C=level, D=control';
COMMENT ON INDEX idx_institutions_search_vector IS 'GIN index for fast full-text search on institutions';
COMMENT ON VIEW v_institutions_search IS 'Optimized view for full-text search with latest enrollment, costs, and requirements data';
