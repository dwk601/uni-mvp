/**
 * API Route: Delete or Update Saved Search by ID
 * DELETE /api/saved-searches/[id]
 * PUT /api/saved-searches/[id]
 * 
 * Manages individual saved search operations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { deleteSavedSearch, updateSavedSearch, SearchConfig } from '@/lib/search/saved-searches'

// Validation schema for search configuration
const searchConfigSchema = z.object({
  query: z.string().optional(),
  country: z.string().optional(),
  major: z.string().optional(),
  minAcceptanceRate: z.number().min(0).max(100).optional(),
  maxAcceptanceRate: z.number().min(0).max(100).optional(),
  filters: z.record(z.string(), z.any()).optional()
}) satisfies z.ZodType<SearchConfig>

// Update request body schema
const updateSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(100, 'Name too long').optional(),
  searchConfig: searchConfigSchema.optional()
}).refine(
  (data) => data.name !== undefined || data.searchConfig !== undefined,
  { message: 'At least one field (name or searchConfig) must be provided' }
)

/**
 * DELETE endpoint - Remove a saved search
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Search ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteSavedSearch(id)

    if (!result.success) {
      const statusCode = result.error?.includes('Authentication') ? 401 : 500

      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Saved search deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/saved-searches/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT endpoint - Update a saved search
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Search ID is required' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate with Zod
    const validationResult = updateSearchSchema.safeParse(body)
    
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

    const updates = validationResult.data

    // Update the search
    const result = await updateSavedSearch(id, updates)

    if (!result.success) {
      const statusCode = result.error?.includes('Authentication') ? 401 
        : result.error?.includes('already exists') ? 409
        : 500

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
    console.error('Error in PUT /api/saved-searches/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
