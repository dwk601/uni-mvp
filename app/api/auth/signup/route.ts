import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/auth/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod schema
    const validatedData = signupSchema.parse(body)
    const { email, password, country, intendedMajor, testType, testScore } = validatedData

    const supabase = await createClient()

    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
        data: {
          country,
          intended_major: intendedMajor,
          test_type: testType,
          test_score: testScore,
        },
      },
    })

    if (authError) {
      // Handle specific error cases
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('Password')) {
        return NextResponse.json(
          { error: 'Password does not meet security requirements' },
          { status: 400 }
        )
      }

      console.error('Signup error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    // Create user profile in database if user was created
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          country,
          intended_major: intendedMajor,
          test_type: testType === 'None' ? null : testType,
          test_score: testType === 'None' ? null : testScore,
          email_verified: false,
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Note: User account was created but profile creation failed
        // This should be handled by a background job or retry mechanism
      }
    }

    // Check if email confirmation is required
    const needsEmailConfirmation = authData.user && !authData.session

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
      needsEmailConfirmation,
      message: needsEmailConfirmation
        ? 'Account created! Please check your email to verify your account.'
        : 'Account created successfully!',
    })
  } catch (error) {
    console.error('Unexpected error during signup:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
