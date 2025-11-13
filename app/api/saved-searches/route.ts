/**
 * API Route: Save New Search
 * POST /api/saved-searches
 * 
 * Saves a new search configuration for the authenticated user.
 * Maximum of 5 saved searches per user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { saveSearch, loadSavedSearches, SearchConfig } from '@/lib/search/saved-searches'

// Validation schema for search configuration
const searchConfigSchema = z.object({
  query: z.string().optional(),
  country: z.string().optional(),
  major: z.string().optional(),
  minAcceptanceRate: z.number().min(0).max(100).optional(),
  maxAcceptanceRate: z.number().min(0).max(100).optional(),
  filters: z.record(z.string(), z.any()).optional()
}) satisfies z.ZodType<SearchConfig>

// Request body schema
const saveSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(100, 'Name too long'),
  searchConfig: searchConfigSchema
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate with Zod
    const validationResult = saveSearchSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { name, searchConfig } = validationResult.data

    // Save the search
    const result = await saveSearch({ name, searchConfig })

    if (!result.success) {
      const statusCode = result.error?.includes('Authentication') ? 401 
        : result.error?.includes('Maximum') ? 409 
        : result.error?.includes('already exists') ? 409
        : 500

      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/saved-searches:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * API Route: Get All Saved Searches
 * GET /api/saved-searches
 * 
 * Retrieves all saved searches for the authenticated user.
 */
export async function GET() {
  try {
    const result = await loadSavedSearches()

    if (!result.success) {
      const statusCode = result.error?.includes('Authentication') ? 401 : 500

      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/saved-searches:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
