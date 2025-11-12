/**
 * Search Synonyms for University/Institution Searches
 * 
 * Maps common search terms to their equivalents to improve search results.
 * Used to expand user queries to match more institutions.
 */

export interface SynonymMapping {
  term: string;
  synonyms: string[];
}

/**
 * University and college related synonyms
 */
export const institutionSynonyms: SynonymMapping[] = [
  {
    term: "university",
    synonyms: ["college", "uni", "school", "institution", "academy"],
  },
  {
    term: "college",
    synonyms: ["university", "school", "institution", "academy"],
  },
  {
    term: "tech",
    synonyms: ["technical", "technology", "technological", "polytechnic"],
  },
  {
    term: "state",
    synonyms: ["public"],
  },
  {
    term: "private",
    synonyms: ["independent"],
  },
  {
    term: "community",
    synonyms: ["cc", "junior"],
  },
  {
    term: "cal",
    synonyms: ["california"],
  },
  {
    term: "california",
    synonyms: ["cal"],
  },
];

/**
 * US state abbreviation to single-word mappings for tsquery compatibility
 * Multi-word state names are not included as they cause tsquery syntax errors
 */
export const stateAbbreviations: Record<string, string> = {
  al: "alabama",
  ak: "alaska",
  az: "arizona",
  ar: "arkansas",
  ca: "california",
  co: "colorado",
  ct: "connecticut",
  de: "delaware",
  fl: "florida",
  ga: "georgia",
  hi: "hawaii",
  id: "idaho",
  il: "illinois",
  in: "indiana",
  ia: "iowa",
  ks: "kansas",
  ky: "kentucky",
  la: "louisiana",
  me: "maine",
  md: "maryland",
  ma: "massachusetts",
  mi: "michigan",
  mn: "minnesota",
  ms: "mississippi",
  mo: "missouri",
  mt: "montana",
  ne: "nebraska",
  nv: "nevada",
  // nh: "new hampshire", // Multi-word - excluded
  // nj: "new jersey",    // Multi-word - excluded
  // nm: "new mexico",    // Multi-word - excluded
  ny: "york", // Use single word for NY
  // nc: "north carolina", // Multi-word - excluded
  // nd: "north dakota",   // Multi-word - excluded
  oh: "ohio",
  ok: "oklahoma",
  or: "oregon",
  pa: "pennsylvania",
  // ri: "rhode island",   // Multi-word - excluded
  // sc: "south carolina", // Multi-word - excluded
  // sd: "south dakota",   // Multi-word - excluded
  tn: "tennessee",
  tx: "texas",
  ut: "utah",
  vt: "vermont",
  va: "virginia",
  wa: "washington",
  // wv: "west virginia",  // Multi-word - excluded
  wi: "wisconsin",
  wy: "wyoming",
  // dc: "district of columbia", // Multi-word - excluded
};

/**
 * Expand a search query with synonyms
 * 
 * @param query - Original search query
 * @returns Array of query terms including synonyms
 * 
 * @example
 * expandQueryWithSynonyms("state university") 
 * // Returns: ["state", "public", "university", "college", "uni", "school", "institution", "academy"]
 */
export function expandQueryWithSynonyms(query: string): string[] {
  const terms = query.toLowerCase().trim().split(/\s+/);
  const expandedTerms = new Set<string>();

  for (const term of terms) {
    // Add the original term
    expandedTerms.add(term);

    // Check if it's a state abbreviation
    if (stateAbbreviations[term]) {
      expandedTerms.add(stateAbbreviations[term]);
    }

    // Add synonyms
    for (const mapping of institutionSynonyms) {
      if (mapping.term === term) {
        mapping.synonyms.forEach((syn) => expandedTerms.add(syn));
      }
      // Also check if term is a synonym itself
      if (mapping.synonyms.includes(term)) {
        expandedTerms.add(mapping.term);
        mapping.synonyms
          .filter((s) => s !== term)
          .forEach((syn) => expandedTerms.add(syn));
      }
    }
  }

  return Array.from(expandedTerms);
}

/**
 * Build a PostgreSQL tsquery string with synonyms using OR logic
 * 
 * @param query - Original search query
 * @returns PostgreSQL tsquery formatted string
 * 
 * @example
 * buildTsQueryWithSynonyms("state university")
 * // Returns: "state | public | university | college | uni | school | institution | academy"
 */
export function buildTsQueryWithSynonyms(query: string): string {
  const expandedTerms = expandQueryWithSynonyms(query);
  return expandedTerms.join(" | ");
}

/**
 * Build a more specific tsquery that requires at least one term from the original query
 * plus allows synonyms
 * 
 * @param query - Original search query
 * @returns PostgreSQL tsquery formatted string with AND/OR logic
 * 
 * @example
 * buildWeightedTsQuery("california tech")
 * // Returns: "(california | ca) & (tech | technical | technology | technological | polytechnic)"
 */
export function buildWeightedTsQuery(query: string): string {
  const terms = query.toLowerCase().trim().split(/\s+/);
  const termGroups: string[] = [];

  for (const term of terms) {
    const synonymGroup = new Set<string>();
    synonymGroup.add(term);

    // Add state full name if it's an abbreviation
    if (stateAbbreviations[term]) {
      synonymGroup.add(stateAbbreviations[term]);
    }

    // Check if full state name matches and add abbreviation
    const stateCode = Object.keys(stateAbbreviations).find(
      (code) => stateAbbreviations[code] === term
    );
    if (stateCode) {
      synonymGroup.add(stateCode);
    }

    // Add institution synonyms
    for (const mapping of institutionSynonyms) {
      if (mapping.term === term || mapping.synonyms.includes(term)) {
        synonymGroup.add(mapping.term);
        mapping.synonyms.forEach((syn) => synonymGroup.add(syn));
      }
    }

    // Create OR group for this term
    if (synonymGroup.size > 1) {
      termGroups.push(`(${Array.from(synonymGroup).join(" | ")})`);
    } else {
      termGroups.push(term);
    }
  }

  // Join term groups with AND to require all terms (or their synonyms)
  return termGroups.join(" & ");
}
