/**
 * Saved Searches Test Page
 * 
 * Integration page to test saved searches functionality with authentication.
 * This page verifies:
 * - User authentication is working
 * - RLS policies isolate saved searches per user
 * - 5-search limit is enforced
 * - All CRUD operations work correctly
 */

'use client'

import { useState } from 'react'
import SavedSearches from '@/components/search/SavedSearches'
import SaveSearchButton from '@/components/search/SaveSearchButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SearchConfig } from '@/lib/search/saved-searches'

export default function SavedSearchesTestPage() {
  // Sample search configuration for testing
  const [currentSearch, setCurrentSearch] = useState<SearchConfig>({
    query: 'computer science',
    country: 'USA',
    major: 'Computer Science',
    minAcceptanceRate: 20,
    maxAcceptanceRate: 80,
    filters: {
      publicPrivate: 'public',
      urbanRural: 'urban'
    }
  })

  const [loadedSearch, setLoadedSearch] = useState<SearchConfig | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLoadSearch = (searchConfig: SearchConfig) => {
    setLoadedSearch(searchConfig)
    setCurrentSearch(searchConfig)
  }

  const handleSaved = () => {
    // Refresh the saved searches list
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Searches Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test the saved searches functionality with authentication and RLS policies
        </p>
      </div>

      {/* Current Search Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Current Search Configuration</CardTitle>
          <CardDescription>
            This is the search configuration that will be saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(currentSearch, null, 2)}
          </pre>
          <div className="mt-4">
            <SaveSearchButton 
              searchConfig={currentSearch}
              onSaved={handleSaved}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loaded Search Display */}
      {loadedSearch && (
        <Alert>
          <AlertDescription>
            <strong>Loaded Search:</strong> Successfully loaded a saved search configuration.
            The search parameters above have been updated.
          </AlertDescription>
        </Alert>
      )}

      {/* Saved Searches List */}
      <div key={refreshKey}>
        <SavedSearches onLoadSearch={handleLoadSearch} />
      </div>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Authentication Tests:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Verify you must be logged in to view this page</li>
              <li>Try accessing without authentication (should fail)</li>
              <li>Verify only your saved searches are displayed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">CRUD Operation Tests:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Click "Save Search" and save a new search</li>
              <li>Verify the new search appears in the list immediately</li>
              <li>Click "Load" on a saved search to apply its configuration</li>
              <li>Click "Delete" and confirm to remove a saved search</li>
              <li>Verify the search is removed from the list</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Limit Enforcement Tests:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Save searches until you reach 5 total</li>
              <li>Verify the "Maximum reached" alert appears</li>
              <li>Try to save a 6th search (should fail with error)</li>
              <li>Delete one search and verify you can save again</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">RLS Policy Tests:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create a second test user account</li>
              <li>Save searches as User A</li>
              <li>Log out and log in as User B</li>
              <li>Verify User B cannot see User A's saved searches</li>
              <li>Verify User B can create their own 5 saved searches</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Error Handling Tests:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Try saving a search with a duplicate name (should fail)</li>
              <li>Try saving with an empty name (should be disabled)</li>
              <li>Verify error messages are clear and helpful</li>
              <li>Test network failures (disconnect and try operations)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
