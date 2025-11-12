# API Client Documentation

This directory contains the PostgREST API client implementation for the University Discovery Platform.

## Overview

The API client provides a type-safe interface for communicating with the PostgREST backend. It includes:

- **Type definitions** for all database tables and views
- **Core client** with error handling and request management
- **Institution API** for fetching institution data
- **Search API** for advanced search and filtering

## Configuration

Set the API URL in your environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Usage Examples

### Basic Institution Query

```typescript
import { getInstitutions } from '@/lib/api';

// Get all institutions
const institutions = await getInstitutions();

// Get institutions with filters
const californiaSchools = await getInstitutions({
  state_code: 'CA',
  limit: 10
});
```

### Paginated Results

```typescript
import { getInstitutionsPaginated } from '@/lib/api';

const result = await getInstitutionsPaginated(1, 20, {
  state_code: 'NY'
});

console.log(result.data); // Array of institutions
console.log(result.count); // Total count
console.log(result.totalPages); // Total pages
```

### Get Institution Details

```typescript
import { getInstitutionDetails } from '@/lib/api';

const institution = await getInstitutionDetails(123456, 2024);

// Access all data in one object
console.log(institution.institution_name);
console.log(institution.tuition_and_fees);
console.log(institution.toefl_minimum);
```

### Search Functions

```typescript
import { 
  searchInstitutions,
  getInstitutionsByState,
  advancedSearch 
} from '@/lib/api';

// Simple search
const results = await searchInstitutions('Harvard', 1, 20);

// Search by state
const nySchools = await getInstitutionsByState('NY', 1, 20);

// Advanced search with multiple filters
const filtered = await advancedSearch({
  search_term: 'University',
  state_code: 'CA',
  min_tuition: 10000,
  max_tuition: 50000,
  year: 2024
}, 1, 20);
```

### Direct API Client Usage

```typescript
import { apiClient } from '@/lib/api';

// GET request
const institutions = await apiClient.get('institutions', {
  state_code: 'eq.CA',
  limit: 10
});

// RPC call
const results = await apiClient.rpc('search_institutions', {
  search_term: 'MIT'
});

// Paginated request
const paginated = await apiClient.getPaginated(
  'institutions',
  { state_code: 'eq.NY' },
  1,
  20
);
```

## Error Handling

All API calls throw `ApiError` on failure:

```typescript
import { getInstitutions, ApiError } from '@/lib/api';

try {
  const institutions = await getInstitutions();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
  }
}
```

## Type Safety

All functions are fully typed using TypeScript interfaces:

```typescript
import type { Institution, InstitutionComplete } from '@/types';

const institution: Institution = await getInstitutionById(123456);
const complete: InstitutionComplete = await getInstitutionDetails(123456);
```

## Testing

Run the test suite to validate API connectivity:

```typescript
import { runAllTests } from '@/lib/api/tests';

await runAllTests();
```

## PostgREST Query Syntax

The API client uses PostgREST query syntax for filtering:

- `eq.value` - Equal to
- `neq.value` - Not equal to
- `gt.value` - Greater than
- `gte.value` - Greater than or equal
- `lt.value` - Less than
- `lte.value` - Less than or equal
- `like.*pattern*` - Pattern matching
- `ilike.*pattern*` - Case-insensitive pattern matching
- `in.(val1,val2)` - In list

Example:
```typescript
const institutions = await apiClient.get('institutions', {
  state_code: 'eq.CA',
  tuition_and_fees: 'gte.20000',
  institution_name: 'ilike.*University*'
});
```

## Available RPC Functions

- `search_institutions(search_term)` - Full-text search
- `institutions_by_state(state_code_param)` - Filter by state
- `institutions_by_acceptance_rate(min_rate, max_rate, year_param)` - Filter by acceptance rate
- `institutions_by_tuition(min_tuition, max_tuition, year_param)` - Filter by tuition
- `institutions_by_sat_score(min_sat, year_param)` - Filter by SAT scores
- `institutions_by_major(major_search)` - Filter by major

## Architecture

```
lib/api/
├── client.ts           # Core API client with fetch wrapper
├── institutions.ts     # Institution-specific API calls
├── search.ts           # Search and filtering functions
├── tests.ts           # Validation tests
├── index.ts           # Public exports
└── README.md          # This file

types/
├── database.ts        # TypeScript type definitions
└── index.ts          # Type exports
```
