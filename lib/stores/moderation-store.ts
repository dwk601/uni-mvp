import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  UserContribution,
  ModerationAction,
  ModerationFilters,
} from "@/types/moderation";

interface ModerationState {
  // Contributions data
  contributions: UserContribution[];
  selectedContributions: Set<string>;
  filters: ModerationFilters;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions history
  recentActions: ModerationAction[];
  
  // Actions
  setContributions: (contributions: UserContribution[]) => void;
  addContribution: (contribution: UserContribution) => void;
  updateContribution: (id: string, updates: Partial<UserContribution>) => void;
  removeContribution: (id: string) => void;
  
  // Selection management
  selectContribution: (id: string) => void;
  deselectContribution: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelection: (id: string) => void;
  
  // Filtering
  setFilters: (filters: Partial<ModerationFilters>) => void;
  clearFilters: () => void;
  
  // Moderation actions
  approveContributions: (
    ids: string[],
    reason: string,
    moderatorId: string,
    moderatorName: string
  ) => Promise<void>;
  rejectContributions: (
    ids: string[],
    reason: string,
    moderatorId: string,
    moderatorName: string
  ) => Promise<void>;
  
  // Actions history
  addAction: (action: ModerationAction) => void;
  clearActions: () => void;
  
  // Loading and error states
  setLoading: (isLoading: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  
  // Fetch data
  fetchContributions: () => Promise<void>;
  refreshContributions: () => Promise<void>;
}

export const useModerationStore = create<ModerationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        contributions: [],
        selectedContributions: new Set(),
        filters: {},
        isLoading: false,
        isSubmitting: false,
        error: null,
        recentActions: [],

        // Contributions management
        setContributions: (contributions) =>
          set({ contributions, error: null }),

        addContribution: (contribution) =>
          set((state) => ({
            contributions: [contribution, ...state.contributions],
          })),

        updateContribution: (id, updates) =>
          set((state) => ({
            contributions: state.contributions.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          })),

        removeContribution: (id) =>
          set((state) => ({
            contributions: state.contributions.filter((c) => c.id !== id),
            selectedContributions: new Set(
              Array.from(state.selectedContributions).filter((cid) => cid !== id)
            ),
          })),

        // Selection management
        selectContribution: (id) =>
          set((state) => {
            const newSelected = new Set(state.selectedContributions);
            newSelected.add(id);
            return { selectedContributions: newSelected };
          }),

        deselectContribution: (id) =>
          set((state) => {
            const newSelected = new Set(state.selectedContributions);
            newSelected.delete(id);
            return { selectedContributions: newSelected };
          }),

        selectAll: () =>
          set((state) => ({
            selectedContributions: new Set(
              state.contributions
                .filter((c) => c.status === "PENDING")
                .map((c) => c.id)
            ),
          })),

        deselectAll: () =>
          set({ selectedContributions: new Set() }),

        toggleSelection: (id) =>
          set((state) => {
            const newSelected = new Set(state.selectedContributions);
            if (newSelected.has(id)) {
              newSelected.delete(id);
            } else {
              newSelected.add(id);
            }
            return { selectedContributions: newSelected };
          }),

        // Filtering
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        clearFilters: () =>
          set({ filters: {} }),

        // Moderation actions
        approveContributions: async (ids, reason, moderatorId, moderatorName) => {
          set({ isSubmitting: true, error: null });
          
          try {
            // TODO: Replace with actual API call
            // await fetch('/api/admin/moderation/approve', {
            //   method: 'POST',
            //   body: JSON.stringify({ ids, reason, moderatorId }),
            // });
            
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            const now = new Date();
            
            // Update contributions
            set((state) => ({
              contributions: state.contributions.map((c) =>
                ids.includes(c.id)
                  ? {
                      ...c,
                      status: "APPROVED" as const,
                      reviewedAt: now,
                      reviewedBy: moderatorId,
                      reason,
                    }
                  : c
              ),
              selectedContributions: new Set(),
            }));
            
            // Add actions to history
            ids.forEach((id) => {
              get().addAction({
                id: `action-${Date.now()}-${id}`,
                contributionId: id,
                action: "APPROVE",
                reason,
                moderatorId,
                moderatorName,
                timestamp: now,
              });
            });
            
            set({ isSubmitting: false });
          } catch (error) {
            set({
              isSubmitting: false,
              error: error instanceof Error ? error.message : "Failed to approve contributions",
            });
          }
        },

        rejectContributions: async (ids, reason, moderatorId, moderatorName) => {
          set({ isSubmitting: true, error: null });
          
          try {
            // TODO: Replace with actual API call
            // await fetch('/api/admin/moderation/reject', {
            //   method: 'POST',
            //   body: JSON.stringify({ ids, reason, moderatorId }),
            // });
            
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            const now = new Date();
            
            // Update contributions
            set((state) => ({
              contributions: state.contributions.map((c) =>
                ids.includes(c.id)
                  ? {
                      ...c,
                      status: "REJECTED" as const,
                      reviewedAt: now,
                      reviewedBy: moderatorId,
                      reason,
                    }
                  : c
              ),
              selectedContributions: new Set(),
            }));
            
            // Add actions to history
            ids.forEach((id) => {
              get().addAction({
                id: `action-${Date.now()}-${id}`,
                contributionId: id,
                action: "REJECT",
                reason,
                moderatorId,
                moderatorName,
                timestamp: now,
              });
            });
            
            set({ isSubmitting: false });
          } catch (error) {
            set({
              isSubmitting: false,
              error: error instanceof Error ? error.message : "Failed to reject contributions",
            });
          }
        },

        // Actions history
        addAction: (action) =>
          set((state) => ({
            recentActions: [action, ...state.recentActions].slice(0, 100), // Keep last 100 actions
          })),

        clearActions: () =>
          set({ recentActions: [] }),

        // Loading and error states
        setLoading: (isLoading) =>
          set({ isLoading }),

        setSubmitting: (isSubmitting) =>
          set({ isSubmitting }),

        setError: (error) =>
          set({ error }),

        // Fetch data
        fetchContributions: async () => {
          set({ isLoading: true, error: null });
          
          try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/admin/moderation/contributions');
            // const data = await response.json();
            
            // Simulate API call with mock data
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            const mockContributions: UserContribution[] = [
              {
                id: "contrib-1",
                userId: "user-1",
                userName: "John Doe",
                userEmail: "john@example.com",
                type: "EDIT_INSTITUTION",
                status: "PENDING",
                submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                data: {
                  institutionId: 1,
                  institutionName: "MIT",
                  field: "acceptance_rate",
                  oldValue: "3.5%",
                  newValue: "3.2%",
                  description: "Updated acceptance rate for 2024",
                },
              },
              {
                id: "contrib-2",
                userId: "user-2",
                userName: "Jane Smith",
                userEmail: "jane@example.com",
                type: "CORRECTION",
                status: "PENDING",
                submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                data: {
                  institutionId: 5,
                  institutionName: "Stanford University",
                  field: "tuition",
                  oldValue: "$61,000",
                  newValue: "$61,731",
                  description: "Corrected tuition amount",
                },
              },
              {
                id: "contrib-3",
                userId: "user-3",
                userName: "Bob Johnson",
                userEmail: "bob@example.com",
                type: "NEW_MAJOR",
                status: "PENDING",
                submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                data: {
                  institutionId: 10,
                  institutionName: "Harvard University",
                  description: "Add new AI and Machine Learning major",
                },
              },
            ];
            
            set({ contributions: mockContributions, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : "Failed to fetch contributions",
            });
          }
        },

        refreshContributions: async () => {
          await get().fetchContributions();
        },
      }),
      {
        name: "moderation-storage",
        partialize: (state) => ({
          // Only persist filters and recent actions
          filters: state.filters,
          recentActions: state.recentActions.slice(0, 20), // Persist only last 20 actions
        }),
      }
    ),
    { name: "ModerationStore" }
  )
);

// Selectors for computed values
export const selectPendingContributions = (state: ModerationState) =>
  state.contributions.filter((c) => c.status === "PENDING");

export const selectFilteredContributions = (state: ModerationState) => {
  let filtered = state.contributions;
  const { type, status, dateFrom, dateTo, searchQuery } = state.filters;

  if (type) {
    filtered = filtered.filter((c) => c.type === type);
  }

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (dateFrom) {
    filtered = filtered.filter((c) => c.submittedAt >= dateFrom);
  }

  if (dateTo) {
    filtered = filtered.filter((c) => c.submittedAt <= dateTo);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.userName.toLowerCase().includes(query) ||
        c.userEmail.toLowerCase().includes(query) ||
        c.data.institutionName?.toLowerCase().includes(query) ||
        c.data.description?.toLowerCase().includes(query)
    );
  }

  return filtered;
};

export const selectSelectedCount = (state: ModerationState) =>
  state.selectedContributions.size;

export const selectHasSelection = (state: ModerationState) =>
  state.selectedContributions.size > 0;
