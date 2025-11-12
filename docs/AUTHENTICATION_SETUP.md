# Supabase Authentication Setup

## Overview
This project uses Supabase Auth for user authentication with email verification.

## Configuration

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://rbtizxmfrmtckwuqqpvc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
```

## Implementation Details

### Files Structure
```
lib/supabase/
  └── client.ts              # Supabase client singleton

app/api/auth/
  └── signup/
      └── route.ts           # User registration endpoint

app/auth/
  ├── callback/
  │   └── route.ts          # Email verification callback
  └── error/
      └── page.tsx          # Authentication error page

app/(auth)/
  ├── layout.tsx            # Auth pages layout
  └── signup/
      └── page.tsx          # Signup form
```

### User Registration Flow

1. **User submits signup form** (`/signup`)
   - Email, password, country, intended major
   - Client-side validation with Zod

2. **API creates user** (`POST /api/auth/signup`)
   - Calls `supabase.auth.signUp()`
   - Stores metadata: `{ country, intended_major }`
   - Returns success with `needsEmailConfirmation: true`

3. **Supabase sends verification email**
   - Automatic via Supabase Auth
   - Email contains verification link

4. **User clicks verification link**
   - Link format: `/auth/callback?token_hash=...&type=email`
   - Callback verifies token via `supabase.auth.verifyOtp()`
   - Creates authenticated session
   - Redirects to dashboard (or home)

5. **Error handling**
   - Failed verification → `/auth/error?message=...`
   - Duplicate email → Inline form error
   - Weak password → Inline form error

## User Metadata Storage

User profiles are stored in Supabase's `auth.users` table:
- `email`: User's email address
- `raw_user_meta_data`: JSON object with custom fields
  - `country`: Selected country
  - `intended_major`: Academic interest

No separate user profile table needed at this stage.

## Testing the Flow

### Manual Testing Steps

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to signup page**
   ```
   http://localhost:3002/signup
   ```

3. **Fill out the form**
   - Enter a valid email address
   - Create a password (min 8 characters)
   - Select country and major
   - Submit

4. **Check response**
   - Success: "Check Your Email" message
   - Error: Inline error message

5. **Check email inbox**
   - Look for Supabase verification email
   - Click verification link

6. **Verify callback**
   - Should redirect to homepage or dashboard
   - Session should be created

### Testing Error Cases

**Duplicate Email:**
```bash
# Try signing up with same email twice
# Expected: "An account with this email already exists"
```

**Weak Password:**
```bash
# Try password with <8 characters
# Expected: Client-side validation error
```

**Invalid Email:**
```bash
# Try invalid email format
# Expected: Client-side validation error
```

## Email Verification Configuration

Supabase email verification is configured in the Supabase Dashboard:
- **Authentication → Email Templates → Confirm signup**
- Default template includes `{{ .ConfirmationURL }}`
- Links redirect to `/auth/callback`

### Customizing Email Templates

To customize the verification email:
1. Go to Supabase Dashboard
2. Authentication → Email Templates
3. Edit "Confirm signup" template
4. Use variables:
   - `{{ .ConfirmationURL }}`: Verification link
   - `{{ .Token }}`: 6-digit OTP (alternative)
   - `{{ .Email }}`: User's email
   - `{{ .SiteURL }}`: Your site URL

## Security Notes

- Anonymous key is safe to expose (NEXT_PUBLIC_*)
- All operations are protected by Row Level Security (RLS)
- Email verification required before full access
- Session management handled by Supabase SDK
- Auto-refresh tokens enabled

## API Endpoints

### POST /api/auth/signup
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "country": "United States",
  "intendedMajor": "Computer Science"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": { "id": "...", "email": "..." },
  "session": null,
  "needsEmailConfirmation": true,
  "message": "Account created! Please check your email to verify your account."
}
```

**Error Response (400):**
```json
{
  "error": "An account with this email already exists"
}
```

### GET /auth/callback
**Query Parameters:**
- `token_hash`: Email verification token
- `type`: "email"
- `next`: Optional redirect path

**Success:** Redirects to `/dashboard` or specified `next` path
**Error:** Redirects to `/auth/error?message=Email verification failed`

## Next Steps

- [x] Subtask 32.1: Signup form with validation
- [x] Subtask 32.2: Authentication and email verification
- [ ] Subtask 32.3: User profile database schema (may skip, using metadata)
- [ ] Subtask 32.4: Form submission handling improvements
- [ ] Subtask 32.5: Performance optimization

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Restart Next.js dev server after adding variables

### Email not received
- Check spam folder
- Verify email configuration in Supabase Dashboard
- Check Supabase logs for email delivery issues

### Verification link doesn't work
- Ensure callback route is correctly implemented
- Check console for errors
- Verify token hasn't expired (default: 24 hours)

### Session not persisting
- Check browser cookies are enabled
- Verify `persistSession: true` in client config
- Check for errors in browser console
