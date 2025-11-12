/**
 * Search Filters Store
 * Zustand store for managing search filters
 */

"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { FilterState, CostRange, LanguageRequirement, RankingRange } from "@/types/filters";
import { createDefaultFilterState, hasActiveFilters, countActiveFilters } from "@/types/filters";

interface SearchFiltersStore extends FilterState {
  // Actions
  setCountries: (countries: string[]) => void;
  setMajors: (majors: string[]) => void;
  setCostRange: (range: CostRange) => void;
  setLanguages: (languages: LanguageRequirement[]) => void;
  setInstitutionTypes: (types: string[]) => void;
  setRankings: (range: RankingRange) => void;
  clearAllFilters: () => void;
  clearFilter: (filterType: keyof FilterState) => void;
  
  // Derived state
  hasActiveFilters: () => boolean;
  activeFilterCount: () => number;
}

export const useSearchFilters = create<SearchFiltersStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...createDefaultFilterState(),

        // Actions
        setCountries: (countries) =>
          set((state) => ({
            countries: {
              ...state.countries,
              values: countries,
              enabled: countries.length > 0,
            },
          })),

        setMajors: (majors) =>
          set((state) => ({
            majors: {
              ...state.majors,
              values: majors,
              enabled: majors.length > 0,
            },
          })),

        setCostRange: (range) =>
          set((state) => ({
            costRange: {
              ...state.costRange,
              values: [range],
              enabled: true,
            },
          })),

        setLanguages: (languages) =>
          set((state) => ({
            languages: {
              ...state.languages,
              values: languages,
              enabled: languages.length > 0,
            },
          })),

        setInstitutionTypes: (types) =>
          set((state) => ({
            institutionTypes: {
              ...state.institutionTypes,
              values: types as any,
              enabled: types.length > 0,
            },
          })),

        setRankings: (range) =>
          set((state) => ({
            rankings: {
              ...state.rankings,
              values: [range],
              enabled: true,
            },
          })),

        clearAllFilters: () => set(createDefaultFilterState()),

        clearFilter: (filterType) =>
          set((state) => ({
            [filterType]: {
              ...state[filterType],
              values: [],
              enabled: false,
            },
          })),

        // Derived state
        hasActiveFilters: () => hasActiveFilters(get()),
        activeFilterCount: () => countActiveFilters(get()),
      }),
      {
        name: "search-filters-storage",
      }
    ),
    {
      name: "SearchFilters",
    }
  )
);
