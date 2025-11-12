import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    
    // Verify the OTP token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error && data.user) {
      // Update user profile to mark email as verified
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ email_verified: true })
        .eq('id', data.user.id)

      if (updateError) {
        console.error('Error updating email verification status:', updateError)
      }

      // Redirect to the dashboard or specified next URL
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    console.error('Error verifying email:', error)
    // Redirect to error page
    return NextResponse.redirect(
      new URL('/auth/error?message=Email verification failed', requestUrl.origin)
    )
  }

  // Redirect to home if no token
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
