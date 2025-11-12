/**
 * Sorting utilities for institution lists
 */

import type { Institution } from "@/types/database";

export type SortField = 
  | "name"
  | "city"
  | "state"
  | "rank"
  | "level"
  | "control"
  | "created"
  | "updated";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

/**
 * Sort institutions by a given field and direction
 */
export function sortInstitutions(
  institutions: Institution[],
  config: SortConfig
): Institution[] {
  const { field, direction } = config;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...institutions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (field) {
      case "name":
        aValue = a.institution_name?.toLowerCase() || "";
        bValue = b.institution_name?.toLowerCase() || "";
        break;
      case "city":
        aValue = a.city?.toLowerCase() || "";
        bValue = b.city?.toLowerCase() || "";
        break;
      case "state":
        aValue = a.state_code || "";
        bValue = b.state_code || "";
        break;
      case "rank":
        aValue = a.rank || Number.MAX_SAFE_INTEGER;
        bValue = b.rank || Number.MAX_SAFE_INTEGER;
        break;
      case "level":
        aValue = a.level_of_institution?.toLowerCase() || "";
        bValue = b.level_of_institution?.toLowerCase() || "";
        break;
      case "control":
        aValue = a.control_of_institution?.toLowerCase() || "";
        bValue = b.control_of_institution?.toLowerCase() || "";
        break;
      case "created":
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case "updated":
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return -1 * multiplier;
    if (aValue > bValue) return 1 * multiplier;
    return 0;
  });
}

/**
 * Toggle sort direction
 */
export function toggleSortDirection(current: SortDirection): SortDirection {
  return current === "asc" ? "desc" : "asc";
}
