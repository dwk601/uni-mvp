/**
 * Save Search Button Component
 * 
 * Allows users to save their current search configuration.
 * Shows dialog for naming the search and handles the save operation.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SearchConfig } from '@/lib/search/saved-searches'

interface SaveSearchButtonProps {
  searchConfig: SearchConfig
  onSaved?: () => void
  disabled?: boolean
}

export default function SaveSearchButton({ 
  searchConfig, 
  onSaved,
  disabled = false 
}: SaveSearchButtonProps) {
  const [open, setOpen] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!searchName.trim()) {
      setError('Please enter a name for this search')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: searchName.trim(),
          searchConfig
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to save search')
      }

      setSuccess(true)
      setSearchName('')
      
      // Close dialog after short delay
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        if (onSaved) {
          onSaved()
        }
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save search')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closing
      setSearchName('')
      setError(null)
      setSuccess(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Give this search a name to quickly access it later. You can save up to 5 searches.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>Search saved successfully!</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., CS Programs in USA"
              className="col-span-3"
              maxLength={100}
              disabled={loading || success}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={loading || success || !searchName.trim()}
          >
            {loading ? 'Saving...' : success ? 'Saved!' : 'Save Search'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
