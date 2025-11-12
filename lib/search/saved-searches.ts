/**
 * Saved Searches Utilities
 * 
 * Manages user's saved search configurations with a limit of 5 per user.
 */

import { createClient } from '@/lib/supabase/server'

export interface SearchConfig {
  query?: string
  country?: string
  major?: string
  minAcceptanceRate?: number
  maxAcceptanceRate?: number
  filters?: Record<string, any>
}

export interface SavedSearch {
  id: string
  user_id: string
  name: string
  search_config: SearchConfig
  created_at: string
  updated_at: string
}

export interface SaveSearchParams {
  name: string
  searchConfig: SearchConfig
}

export interface SaveSearchResult {
  success: boolean
  data?: SavedSearch
  error?: string
}

/**
 * Save a new search configuration for the authenticated user
 * Enforces maximum of 5 saved searches per user
 */
export async function saveSearch(
  params: SaveSearchParams
): Promise<SaveSearchResult> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Check current count (client-side check before database trigger)
    const { count, error: countError } = await supabase
      .from('saved_searches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      return {
        success: false,
        error: 'Failed to check saved searches limit'
      }
    }

    if (count !== null && count >= 5) {
      return {
        success: false,
        error: 'Maximum of 5 saved searches reached. Please delete one before adding a new search.'
      }
    }

    // Insert new saved search
    const { data, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name: params.name,
        search_config: params.searchConfig
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return {
          success: false,
          error: 'A saved search with this name already exists'
        }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to save search'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error saving search:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

/**
 * Load all saved searches for the authenticated user
 */
export async function loadSavedSearches(): Promise<{
  success: boolean
  data?: SavedSearch[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Fetch all saved searches for user, ordered by creation date (newest first)
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to load saved searches'
      }
    }

    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Error loading saved searches:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

/**
 * Delete a saved search by ID
 */
export async function deleteSavedSearch(searchId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Delete the saved search (RLS ensures only owner can delete)
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', searchId)
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete saved search'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting saved search:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

/**
 * Update a saved search name or configuration
 */
export async function updateSavedSearch(
  searchId: string,
  updates: Partial<Pick<SavedSearch, 'name' | 'search_config'>>
): Promise<SaveSearchResult> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Update the saved search (RLS ensures only owner can update)
    const { data, error } = await supabase
      .from('saved_searches')
      .update(updates)
      .eq('id', searchId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return {
          success: false,
          error: 'A saved search with this name already exists'
        }
      }
      
      return {
        success: false,
        error: error.message || 'Failed to update saved search'
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error updating saved search:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}
