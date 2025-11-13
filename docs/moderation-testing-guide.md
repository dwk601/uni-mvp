# Admin Moderation Feature - Testing Guide

## Overview
This document outlines the testing strategy for the admin moderation feature.

## Test Coverage Areas

### 1. UI Component Tests
- [ ] Moderation page renders correctly
- [ ] Contribution list displays all pending items
- [ ] Selection checkboxes work (individual and select-all)
- [ ] Approve/Reject dialogs open and close properly
- [ ] Reason input validation (required field)
- [ ] Loading states display correctly
- [ ] Error messages show appropriately
- [ ] Audit trail component renders
- [ ] Contribution detail dialog displays all information

### 2. API Integration Tests
- [ ] GET /api/admin/moderation/contributions fetches data
- [ ] POST /api/admin/moderation/approve updates status
- [ ] POST /api/admin/moderation/reject updates status
- [ ] GET /api/admin/moderation/audit/[id] fetches history
- [ ] Error handling for network failures
- [ ] Proper HTTP status codes returned
- [ ] Data transformation (snake_case <-> camelCase)

### 3. Database Tests
- [ ] user_contributions table schema correct
- [ ] moderation_actions table schema correct
- [ ] Enum types work correctly
- [ ] Foreign key constraints enforced
- [ ] Indexes improve query performance
- [ ] Timestamps auto-update correctly
- [ ] Cascade deletes work properly

### 4. Workflow Tests

#### Approve Workflow
```typescript
// Test: Approve single contribution
1. Create pending contribution
2. Select contribution
3. Click "Approve" button
4. Enter reason "Data verified"
5. Submit
6. Verify contribution status = APPROVED
7. Verify audit trail entry created
8. Verify UI updates correctly
```

#### Reject Workflow
```typescript
// Test: Reject multiple contributions
1. Create 3 pending contributions
2. Select all 3
3. Click "Reject" button
4. Enter reason "Insufficient evidence"
5. Submit
6. Verify all 3 contributions status = REJECTED
7. Verify 3 audit trail entries created
8. Verify UI clears selection
```

#### Audit Trail
```typescript
// Test: Audit trail accuracy
1. Create contribution
2. Approve with reason A
3. Verify audit entry 1 exists
4. Change status to rejected with reason B
5. Verify audit entry 2 exists
6. Verify chronological order (newest first)
7. Verify all details recorded correctly
```

### 5. Access Control Tests (TODO: When auth is implemented)
- [ ] Non-authenticated users redirected to login
- [ ] Non-admin users cannot access /admin routes
- [ ] Non-admin users cannot call /api/admin endpoints
- [ ] Admin users have full access
- [ ] Session expiration handled correctly

### 6. Edge Cases & Error Handling
- [ ] Empty contribution list displays message
- [ ] No contributions selected shows appropriate state
- [ ] Reason field empty shows validation error
- [ ] Network timeout handled gracefully
- [ ] Database connection error handled
- [ ] Concurrent updates handled correctly
- [ ] Very long reasons truncated or handled
- [ ] Special characters in reason text handled

## Manual Testing Checklist

### Setup
1. Ensure database is running (Docker)
2. Ensure PostgREST is running (port 3000)
3. Start Next.js dev server (npm run dev)
4. Navigate to http://localhost:3002/admin/moderation

### Test Scenarios

#### Scenario 1: Approve Single Contribution
1. Insert test contribution via curl or API
2. Refresh moderation page
3. Select the contribution checkbox
4. Click "Approve (1)" button
5. Enter reason: "Verified against official source"
6. Click "Approve"
7. Verify contribution disappears from pending list
8. Click "View Details" on approved contribution
9. Verify audit trail shows approval action

#### Scenario 2: Reject Multiple Contributions
1. Insert 3 test contributions
2. Click "Select All" checkbox
3. Click "Reject (3)" button
4. Enter reason: "Data contradicts official records"
5. Click "Reject"
6. Verify all contributions move to rejected
7. Verify selection cleared

#### Scenario 3: View Audit Trail
1. Create contribution
2. Approve it
3. Find it in the list (filter by approved)
4. Click "View Details"
5. Verify audit trail displays:
   - Action type (APPROVE)
   - Moderator name
   - Timestamp
   - Reason
   - Proper formatting

#### Scenario 4: Error Handling
1. Stop PostgREST container
2. Try to load contributions
3. Verify error message displays
4. Click "Try Again" button
5. Start PostgREST
6. Verify data loads

## Automated Test Examples

### Example: API Route Test
```typescript
// __tests__/api/admin/moderation/approve.test.ts
describe('POST /api/admin/moderation/approve', () => {
  it('should approve contributions with valid data', async () => {
    const response = await fetch('/api/admin/moderation/approve', {
      method: 'POST',
      body: JSON.stringify({
        ids: ['test-id-1'],
        reason: 'Verified',
        moderatorId: 'mod-1',
        moderatorName: 'Admin User',
      }),
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
  });

  it('should return 400 without reason', async () => {
    const response = await fetch('/api/admin/moderation/approve', {
      method: 'POST',
      body: JSON.stringify({
        ids: ['test-id-1'],
        reason: '',
        moderatorId: 'mod-1',
        moderatorName: 'Admin User',
      }),
    });
    
    expect(response.status).toBe(400);
  });
});
```

### Example: Component Test
```typescript
// __tests__/components/moderation/audit-trail.test.tsx
describe('AuditTrail', () => {
  it('renders loading state initially', () => {
    render(<AuditTrail contributionId="test-id" />);
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('displays audit actions when loaded', async () => {
    // Mock API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            action: 'APPROVE',
            reason: 'Test reason',
            moderatorName: 'Admin',
            timestamp: new Date().toISOString(),
          },
        ]),
      })
    );

    render(<AuditTrail contributionId="test-id" />);
    
    await waitFor(() => {
      expect(screen.getByText('APPROVE')).toBeInTheDocument();
      expect(screen.getByText('Test reason')).toBeInTheDocument();
    });
  });
});
```

## Performance Tests
- [ ] Page loads in < 2 seconds with 100 contributions
- [ ] Filtering/search performs well
- [ ] Batch operations (50+ items) complete reasonably
- [ ] Database queries use indexes efficiently
- [ ] API responses cached appropriately

## Security Tests (TODO: When auth implemented)
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF protection working
- [ ] Rate limiting on API endpoints
- [ ] Proper CORS configuration

## Next Steps
1. Set up testing framework (Jest, React Testing Library)
2. Write unit tests for components
3. Write integration tests for API routes
4. Set up E2E testing (Playwright/Cypress)
5. Add CI/CD pipeline for automated testing
6. Implement proper authentication
7. Add admin role checks
8. Create staging environment for testing

## Notes
- Access control is currently a placeholder (allows all access)
- Tests should be written before auth is implemented
- Consider adding test database separate from development
- Mock Supabase auth in tests until it's implemented
