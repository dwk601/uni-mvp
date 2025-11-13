/**
 * Saved Searches Component
 * 
 * Displays user's saved searches with options to load, rename, delete.
 * Shows visual feedback for the 5-search limit.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SavedSearch } from '@/lib/search/saved-searches'

interface SavedSearchesProps {
  onLoadSearch?: (searchConfig: SavedSearch['search_config']) => void
}

export default function SavedSearches({ onLoadSearch }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  // Load saved searches on mount
  useEffect(() => {
    loadSearches()
  }, [])

  const loadSearches = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/saved-searches')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load saved searches')
      }

      setSearches(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return
    }

    try {
      setDeletingId(searchId)
      setError(null)

      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete saved search')
      }

      // Remove from local state
      setSearches(prev => prev.filter(s => s.id !== searchId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete search')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLoad = (search: SavedSearch) => {
    if (onLoadSearch) {
      onLoadSearch(search.search_config)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Searches</CardTitle>
          <CardDescription>Loading your saved searches...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const searchCount = searches.length
  const isAtLimit = searchCount >= 5

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Searches</CardTitle>
        <CardDescription>
          You have {searchCount} of 5 saved searches
          {isAtLimit && ' (Maximum reached)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAtLimit && (
          <Alert>
            <AlertDescription>
              You've reached the maximum of 5 saved searches. Delete one to save a new search.
            </AlertDescription>
          </Alert>
        )}

        {searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved searches yet. Perform a search and save it for quick access later.
          </p>
        ) : (
          <div className="space-y-2">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{search.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLoad(search)}
                  >
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(search.id)}
                    disabled={deletingId === search.id}
                  >
                    {deletingId === search.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
