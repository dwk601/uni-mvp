# Admin Dashboard Authentication Setup

## Current Implementation

### Route Structure
- `/app/(dashboard)/admin/layout.tsx` - Admin layout with auth check
- `/app/(dashboard)/admin/page.tsx` - Dashboard home
- `/app/(dashboard)/admin/moderation/page.tsx` - Moderation queue
- `/app/(dashboard)/admin/audit/page.tsx` - Audit trail
- `/app/unauthorized/page.tsx` - Unauthorized access page

### Authentication Flow

**Current (Development Mode):**
The admin dashboard uses a simple environment variable for access control:

```bash
# .env.local
NEXT_PUBLIC_ADMIN_MODE=true
```

**How it Works:**
1. User attempts to access `/admin/*` route
2. `layout.tsx` checks `NEXT_PUBLIC_ADMIN_MODE` environment variable
3. If `true`: User sees admin dashboard
4. If `false` or unset: User is redirected to home page

**To Enable Admin Access:**
```bash
# Add to .env.local
NEXT_PUBLIC_ADMIN_MODE=true
```

**To Disable Admin Access:**
```bash
# Remove from .env.local or set to false
NEXT_PUBLIC_ADMIN_MODE=false
```

### Testing Authentication

**Test Scenario 1: Authorized Access**
```bash
# In .env.local
NEXT_PUBLIC_ADMIN_MODE=true

# Start dev server
npm run dev

# Navigate to http://localhost:3001/admin
# Expected: Admin dashboard loads successfully
```

**Test Scenario 2: Unauthorized Access**
```bash
# In .env.local - remove or set to false
NEXT_PUBLIC_ADMIN_MODE=false

# Start dev server  
npm run dev

# Navigate to http://localhost:3001/admin
# Expected: Redirected to home page
```

## Future Implementation (Production)

For production use, replace the placeholder auth with a proper authentication system:

### Recommended Approach

```typescript
// app/(dashboard)/admin/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return false; // Not logged in
  }
  
  // Check user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === "ADMIN";
}
```

### Production Checklist

- [ ] Install and configure authentication provider (NextAuth.js, Clerk, Auth0, etc.)
- [ ] Create `users` table with role field (USER, ADMIN, MODERATOR)
- [ ] Implement session management
- [ ] Add JWT/session tokens
- [ ] Create login/logout pages
- [ ] Add middleware for route protection
- [ ] Implement proper error handling for auth failures
- [ ] Add audit logging for authentication attempts
- [ ] Set up rate limiting for login attempts
- [ ] Configure RBAC (Role-Based Access Control)

### NextAuth.js Example

```bash
npm install next-auth @auth/prisma-adapter
```

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.role = user.role;
      return session;
    },
  },
};
```

## Admin Dashboard Features

### Dashboard Home (`/admin`)
- Overview cards showing pending contributions, recent actions, system status
- Quick action buttons for common tasks
- Links to moderation queue and audit trail

### Moderation Queue (`/admin/moderation`)
- List of pending user contributions (to be implemented in Subtask 4.3)
- Filtering and sorting options
- Bulk selection capabilities
- Approve/reject actions (to be implemented in Subtask 4.4)

### Audit Trail (`/admin/audit`)
- Chronological log of moderation actions (to be implemented in Subtask 4.5)
- Filterable by moderator, date, action type
- Detailed view of each action with reasons

## Security Considerations

### Current Limitations
⚠️ **WARNING:** The current implementation is for development only!

- No actual user authentication
- No session management
- No rate limiting
- No audit logging for access attempts
- Environment variable can be easily changed

### Production Requirements

1. **Authentication**: Implement proper user authentication
2. **Authorization**: Role-based access control (RBAC)
3. **Session Management**: Secure session handling with expiration
4. **Audit Logging**: Log all admin access attempts
5. **Rate Limiting**: Prevent brute force attacks
6. **HTTPS Only**: Enforce secure connections
7. **CSRF Protection**: Prevent cross-site request forgery
8. **Input Validation**: Validate all user inputs
9. **Error Handling**: Don't leak sensitive info in errors
10. **Monitoring**: Track unusual admin activity

## Environment Variables

```bash
# .env.local (Development)
NEXT_PUBLIC_ADMIN_MODE=true    # Enable admin access

# .env.production (Production - NOT recommended)
# DO NOT use NEXT_PUBLIC_ADMIN_MODE in production!
# Use proper authentication instead
```

## Testing

```bash
# Run TypeScript checks
npm run build

# Test authentication scenarios manually:
# 1. Set NEXT_PUBLIC_ADMIN_MODE=true, access /admin - should work
# 2. Set NEXT_PUBLIC_ADMIN_MODE=false, access /admin - should redirect
# 3. Remove variable entirely, access /admin - should redirect
```

## Next Steps

After implementing proper authentication:
1. Remove `NEXT_PUBLIC_ADMIN_MODE` environment variable
2. Update `checkAdminAuth()` function in layout.tsx
3. Add proper session checks
4. Implement role-based permissions
5. Add audit logging for admin access
6. Create admin user management interface
