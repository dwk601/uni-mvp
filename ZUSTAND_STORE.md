# Zustand Moderation Store

## Overview

The moderation store manages all state related to user contributions and moderation workflows. Built with Zustand, it provides a centralized, type-safe state management solution with built-in persistence and devtools support.

## Store Location

`/lib/stores/moderation-store.ts`

## Type Definitions

`/types/moderation.ts`

### ContributionType
- `NEW_INSTITUTION` - User submits a new institution
- `EDIT_INSTITUTION` - User edits existing institution data
- `NEW_MAJOR` - User adds a new major
- `EDIT_DATA` - Generic data edit
- `CORRECTION` - User corrects an error

### ContributionStatus
- `PENDING` - Awaiting moderation
- `APPROVED` - Accepted by moderator
- `REJECTED` - Rejected by moderator
- `IN_REVIEW` - Currently being reviewed

## State Structure

```typescript
interface ModerationState {
  contributions: UserContribution[];
  selectedContributions: Set<string>;
  filters: ModerationFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  recentActions: ModerationAction[];
}
```

## Usage

### Basic Usage

```typescript
"use client";
import { useModerationStore } from "@/lib/stores/moderation-store";

function ModerationComponent() {
  const contributions = useModerationStore((state) => state.contributions);
  const isLoading = useModerationStore((state) => state.isLoading);
  const fetchContributions = useModerationStore((state) => state.fetchContributions);
  
  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);
  
  return <div>{/* Render contributions */}</div>;
}
```

### Selection Management

```typescript
const selectedContributions = useModerationStore((state) => state.selectedContributions);
const toggleSelection = useModerationStore((state) => state.toggleSelection);
const selectAll = useModerationStore((state) => state.selectAll);
const deselectAll = useModerationStore((state) => state.deselectAll);

// Toggle single contribution
<Checkbox
  checked={selectedContributions.has(contribution.id)}
  onCheckedChange={() => toggleSelection(contribution.id)}
/>

// Select/deselect all
<Button onClick={selectAll}>Select All</Button>
<Button onClick={deselectAll}>Deselect All</Button>
```

### Moderation Actions

```typescript
const approveContributions = useModerationStore((state) => state.approveContributions);
const rejectContributions = useModerationStore((state) => state.rejectContributions);
const selectedIds = Array.from(useModerationStore((state) => state.selectedContributions));

// Approve selected contributions
await approveContributions(
  selectedIds,
  "Data verified and accurate",
  "moderator-123",
  "Admin User"
);

// Reject selected contributions
await rejectContributions(
  selectedIds,
  "Insufficient evidence provided",
  "moderator-123",
  "Admin User"
);
```

### Filtering

```typescript
const setFilters = useModerationStore((state) => state.setFilters);
const clearFilters = useModerationStore((state) => state.clearFilters);

// Apply filters
setFilters({
  type: "EDIT_INSTITUTION",
  status: "PENDING",
  dateFrom: new Date("2024-01-01"),
});

// Clear all filters
clearFilters();
```

### Using Selectors

```typescript
import {
  selectPendingContributions,
  selectFilteredContributions,
  selectSelectedCount,
  selectHasSelection,
} from "@/lib/stores/moderation-store";

// Get only pending contributions
const pending = useModerationStore(selectPendingContributions);

// Get filtered contributions
const filtered = useModerationStore(selectFilteredContributions);

// Get selection count
const count = useModerationStore(selectSelectedCount);

// Check if any selected
const hasSelection = useModerationStore(selectHasSelection);
```

## Store Actions

### Data Management

| Action | Description | Parameters |
|--------|-------------|------------|
| `setContributions` | Replace all contributions | `contributions: UserContribution[]` |
| `addContribution` | Add single contribution | `contribution: UserContribution` |
| `updateContribution` | Update existing contribution | `id: string, updates: Partial<UserContribution>` |
| `removeContribution` | Remove contribution | `id: string` |

### Selection Management

| Action | Description | Parameters |
|--------|-------------|------------|
| `selectContribution` | Select single contribution | `id: string` |
| `deselectContribution` | Deselect single contribution | `id: string` |
| `selectAll` | Select all pending contributions | none |
| `deselectAll` | Clear all selections | none |
| `toggleSelection` | Toggle selection state | `id: string` |

### Filtering

| Action | Description | Parameters |
|--------|-------------|------------|
| `setFilters` | Apply or update filters | `filters: Partial<ModerationFilters>` |
| `clearFilters` | Remove all filters | none |

### Moderation Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `approveContributions` | Approve selected contributions | `ids, reason, moderatorId, moderatorName` |
| `rejectContributions` | Reject selected contributions | `ids, reason, moderatorId, moderatorName` |

### Data Fetching

| Action | Description | Parameters |
|--------|-------------|------------|
| `fetchContributions` | Fetch contributions from API | none |
| `refreshContributions` | Refresh contributions data | none |

## Features

### 1. Persistence
The store uses `zustand/middleware/persist` to save state to localStorage:
- Filters are persisted across sessions
- Last 20 recent actions are saved
- Contributions are fetched fresh on load

### 2. DevTools
Integration with Redux DevTools for debugging:
- Track state changes
- Time-travel debugging
- Action history

### 3. Mock Data
Current implementation includes mock data for development:
- 3 sample contributions
- Simulated API delays (500ms fetch, 1000ms actions)
- Replace with actual API calls in production

### 4. Error Handling
Comprehensive error handling:
- Loading states (`isLoading`, `isSubmitting`)
- Error messages stored in state
- Try-catch blocks around async operations

### 5. Optimistic Updates
Actions update local state immediately:
- Instant UI feedback
- Background API sync
- Rollback on error (to be implemented)

## Testing

### Manual Testing

```typescript
// In browser console with Redux DevTools installed:

// 1. Fetch contributions
useModerationStore.getState().fetchContributions();

// 2. Select contributions
useModerationStore.getState().selectAll();

// 3. Approve selections
useModerationStore.getState().approveContributions(
  ["contrib-1", "contrib-2"],
  "Test approval",
  "mod-1",
  "Test Moderator"
);

// 4. Check state
console.log(useModerationStore.getState());
```

### Unit Testing (Jest + React Testing Library)

```typescript
import { renderHook, act } from "@testing-library/react";
import { useModerationStore } from "@/lib/stores/moderation-store";

describe("ModerationStore", () => {
  it("should select and deselect contributions", () => {
    const { result } = renderHook(() => useModerationStore());
    
    act(() => {
      result.current.selectContribution("contrib-1");
    });
    
    expect(result.current.selectedContributions.has("contrib-1")).toBe(true);
    
    act(() => {
      result.current.deselectContribution("contrib-1");
    });
    
    expect(result.current.selectedContributions.has("contrib-1")).toBe(false);
  });
  
  it("should filter contributions by type", () => {
    const { result } = renderHook(() => useModerationStore());
    
    act(() => {
      result.current.setFilters({ type: "EDIT_INSTITUTION" });
    });
    
    const filtered = selectFilteredContributions(result.current);
    expect(filtered.every(c => c.type === "EDIT_INSTITUTION")).toBe(true);
  });
});
```

## Production Implementation

### Replace Mock Data

```typescript
// In moderation-store.ts, replace:
fetchContributions: async () => {
  set({ isLoading: true, error: null });
  
  try {
    const response = await fetch('/api/admin/moderation/contributions');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    set({ contributions: data, isLoading: false });
  } catch (error) {
    set({
      isLoading: false,
      error: error instanceof Error ? error.message : "Failed to fetch contributions",
    });
  }
},
```

### Add API Endpoints

1. **GET `/api/admin/moderation/contributions`**
   - Returns list of contributions
   - Supports pagination and filtering

2. **POST `/api/admin/moderation/approve`**
   - Approves contributions
   - Stores moderation action in audit log

3. **POST `/api/admin/moderation/reject`**
   - Rejects contributions
   - Stores rejection reason and moderator info

### Add Rollback Support

```typescript
approveContributions: async (ids, reason, moderatorId, moderatorName) => {
  const previousState = get().contributions;
  
  // Optimistic update
  set((state) => ({ /* ... update state ... */ }));
  
  try {
    const response = await fetch('/api/admin/moderation/approve', {
      method: 'POST',
      body: JSON.stringify({ ids, reason, moderatorId }),
    });
    
    if (!response.ok) throw new Error('Failed to approve');
  } catch (error) {
    // Rollback on error
    set({ contributions: previousState });
    set({ error: error.message });
  }
},
```

## Best Practices

1. **Use Selectors**: Create computed selectors for derived state
2. **Minimize Re-renders**: Select only needed state slices
3. **Batch Updates**: Use `set` once per action when possible
4. **Error Boundaries**: Wrap components using store with error boundaries
5. **Loading States**: Always show loading indicators during async operations
6. **Type Safety**: Leverage TypeScript for compile-time safety

## Dependencies

```json
{
  "zustand": "^4.4.7"
}
```

## Files Created

- `/lib/stores/moderation-store.ts` - Main store implementation
- `/types/moderation.ts` - TypeScript type definitions
- `/ZUSTAND_STORE.md` - This documentation

## Next Steps

1. Create UI components that consume this store (Subtask 4.3)
2. Implement approve/reject actions in UI (Subtask 4.4)
3. Build audit trail display (Subtask 4.5)
4. Replace mock data with actual API calls
5. Add comprehensive test suite
6. Implement real-time updates (WebSocket/polling)
