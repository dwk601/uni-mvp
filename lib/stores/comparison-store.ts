/**
 * Comparison Store
 * Manages school selection for side-by-side comparison (max 3 schools)
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Institution } from '@/types/database';

interface ComparisonStore {
  selectedInstitutions: Institution[];
  maxSelections: number;
  
  // Actions
  addInstitution: (institution: Institution) => boolean;
  removeInstitution: (unitid: number) => void;
  clearAll: () => void;
  isSelected: (unitid: number) => boolean;
  canAddMore: () => boolean;
  getSelectionCount: () => number;
}

export const useComparisonStore = create<ComparisonStore>()(
  devtools(
    persist(
      (set, get) => ({
        selectedInstitutions: [],
        maxSelections: 3,

        addInstitution: (institution) => {
          const state = get();
          
          // Check if already selected
          if (state.selectedInstitutions.some(inst => inst.unitid === institution.unitid)) {
            return false;
          }
          
          // Check if max limit reached
          if (state.selectedInstitutions.length >= state.maxSelections) {
            return false;
          }
          
          set({
            selectedInstitutions: [...state.selectedInstitutions, institution]
          });
          
          return true;
        },

        removeInstitution: (unitid) => {
          set((state) => ({
            selectedInstitutions: state.selectedInstitutions.filter(
              inst => inst.unitid !== unitid
            )
          }));
        },

        clearAll: () => {
          set({ selectedInstitutions: [] });
        },

        isSelected: (unitid) => {
          return get().selectedInstitutions.some(inst => inst.unitid === unitid);
        },

        canAddMore: () => {
          return get().selectedInstitutions.length < get().maxSelections;
        },

        getSelectionCount: () => {
          return get().selectedInstitutions.length;
        },
      }),
      {
        name: 'comparison-store',
      }
    ),
    {
      name: 'ComparisonStore',
    }
  )
);
