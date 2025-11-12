/**
 * Institution Search Page
 * Advanced search with multi-criteria filtering
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchFilterPanel } from "@/components/search/search-filter-panel";
import { SearchResults } from "@/components/search/search-results";
import { useInstitutionSearch } from "@/hooks/use-institution-search";
import { useSearchFilters } from "@/lib/stores/search-filters-store";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchDuration, setSearchDuration] = useState<number | null>(null);
  const filters = useSearchFilters();
  const { results, isLoading, error, search, searchCount } = useInstitutionSearch();

  const handleSearch = () => {
    setSearchStartTime(Date.now());
    search({
      query,
      filters,
      page: 1,
      limit: 20,
    });
  };
  
  // Track search duration for performance monitoring
  useEffect(() => {
    if (!isLoading && searchStartTime) {
      const duration = Date.now() - searchStartTime;
      setSearchDuration(duration);
      setSearchStartTime(null);
      
      // Log performance for monitoring
      console.log(`Search completed in ${duration}ms`);
    }
  }, [isLoading, searchStartTime]);

  const handlePageChange = (page: number) => {
    search({
      query,
      filters,
      page,
      limit: 20,
    });
  };

  const handleApplyFilters = () => {
    handleSearch();
  };

  // Auto-search on mount
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Find Your Perfect Institution</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Search and filter universities by location, major, cost, and more
          </p>
          {searchDuration !== null && (
            <p className="text-sm text-muted-foreground">
              Search #{searchCount} completed in {searchDuration}ms
            </p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Search institutions by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilterPanel onApplyFilters={handleApplyFilters} />
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p>{error}</p>
            </div>
          ) : (
            <SearchResults
              institutions={results?.institutions || []}
              total={results?.total || 0}
              isLoading={isLoading}
              page={results?.page || 1}
              totalPages={results?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
