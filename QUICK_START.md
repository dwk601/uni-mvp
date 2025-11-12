# Quick Start Guide - Testing Tasks 1 & 2

## Prerequisites
- PostgREST running on `http://localhost:3000`
- Database running on `localhost:5432`
- Node.js and npm installed

## 1. Environment Setup

The `.env.local` file has been created with the PostgREST URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 2. Start the Development Server

```bash
cd /home/dwk1/code/Uni/web
npm run dev
```

## 3. Test the API Client

### Option A: Use the Demo Page
1. Navigate to: `http://localhost:3000/api-test`
2. Click "Get 10 Institutions" to fetch data
3. Click "Search University" to test search
4. Click on any institution to see details

### Option B: Run Programmatic Tests
Create a test file or use the existing test utilities:

```typescript
// In any component or API route
import { runAllTests } from '@/lib/api/tests';

// Run validation suite
await runAllTests();
```

### Option C: Test Individual Functions

```typescript
import { 
  getInstitutions, 
  searchInstitutions,
  getInstitutionDetails,
  advancedSearch 
} from '@/lib/api';

// Test basic fetch
const institutions = await getInstitutions({ limit: 5 });
console.log('Institutions:', institutions);

// Test search
const searchResults = await searchInstitutions('MIT', 1, 10);
console.log('Search results:', searchResults);

// Test detail view
const details = await getInstitutionDetails(123456, 2024);
console.log('Details:', details);

// Test advanced search
const filtered = await advancedSearch({
  state_code: 'CA',
  min_tuition: 10000,
  max_tuition: 50000
}, 1, 20);
console.log('Filtered:', filtered);
```

## 4. Verify Type Safety

Run TypeScript type checking:
```bash
npx tsc --noEmit
```

Should complete with no errors ✓

## 5. Test API Connectivity

### Quick cURL test to PostgREST:
```bash
# Test if PostgREST is running
curl http://localhost:3000/institutions?limit=1

# Test search function
curl -X POST http://localhost:3000/rpc/search_institutions \
  -H "Content-Type: application/json" \
  -d '{"search_term": "University"}'
```

## 6. Common Issues & Solutions

### Issue: "Failed to fetch" error
**Solution:** Ensure PostgREST is running on port 3000
```bash
# Check if PostgREST is running
curl http://localhost:3000/
```

### Issue: "Network timeout"
**Solution:** Check database connection and PostgREST configuration

### Issue: TypeScript errors
**Solution:** Run type checking to see specific errors
```bash
npx tsc --noEmit
```

## 7. What's Working Now

✅ All TypeScript types defined and validated
✅ API client configured and tested
✅ Error handling implemented
✅ Pagination support working
✅ All RPC functions accessible
✅ Type safety enforced
✅ Demo page available at `/api-test`

## 8. Example API Calls

### Get institutions by state
```typescript
import { getInstitutionsByState } from '@/lib/api';

const nySchools = await getInstitutionsByState('NY', 1, 20);
```

### Get institutions by tuition range
```typescript
import { getInstitutionsByTuition } from '@/lib/api';

const affordable = await getInstitutionsByTuition(10000, 30000, 2024, 1, 20);
```

### Get institutions by SAT score
```typescript
import { getInstitutionsBySATScore } from '@/lib/api';

const highSAT = await getInstitutionsBySATScore(1400, 2024, 1, 20);
```

## 9. Next Development Steps

Now that Tasks 1 & 2 are complete, you can:

1. **Install shadcnUI components (Task 3)**
2. **Build the search interface components**
3. **Create institution detail pages**
4. **Implement the filter system**

## 10. Documentation

- **Full API docs:** `/lib/api/README.md`
- **Type definitions:** `/types/database.ts`
- **Implementation summary:** `/IMPLEMENTATION_SUMMARY.md`

## Support

If you encounter issues:
1. Check PostgREST is running: `curl http://localhost:3000/`
2. Verify environment variables in `.env.local`
3. Check browser console for detailed error messages
4. Review API documentation in `/lib/api/README.md`
